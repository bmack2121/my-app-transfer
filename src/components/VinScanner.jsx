import React, { useState, useEffect } from "react";
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import * as OCRPlugin from '@pantrist/capacitor-plugin-ml-kit-text-recognition';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const VinScanner = ({ onDetected }) => {
  const [status, setStatus] = useState("Ready to scan");
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Proactively install the ML Kit module on component mount (Android Only)
    const initModule = async () => {
      if (Capacitor.getPlatform() === 'android') {
        try {
          const isModuleAvailable = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
          if (!isModuleAvailable.available) {
            await BarcodeScanner.installGoogleBarcodeScannerModule();
          }
        } catch (e) {
          console.warn("ML Kit module check failed", e);
        }
      }
    };
    initModule();

    return () => {
      stopAutoScan(); // Ensure clean up on unmount
    };
  }, []);

  const cleanAndExtractVIN = (rawString) => {
    if (!rawString) return null;
    let clean = rawString.toUpperCase().replace(/[^A-Z0-9]/g, '');
    clean = clean.replace(/I/g, '1').replace(/[OQ]/g, '0');
    const vin = clean.length >= 17 ? clean.slice(-17) : clean;
    return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin) ? vin : null;
  };

  const fetchVehicleDetails = async (vin) => {
    try {
      setStatus("Querying NHTSA...");
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`);
      const json = await response.json();
      const data = json?.Results?.[0];
      if (!data) return { vin };
      return {
        vin: vin,
        year: data.ModelYear,
        make: data.Make,
        model: data.Model,
        trim: data.Trim,
        driveTrain: data.DriveType,
        fuelType: data.FuelPrimary,
        bodyClass: data.BodyClass,
        engine: data.DisplacementL
          ? `${data.DisplacementL}L ${data.EngineConfiguration || ''}${data.EngineCylinders || ''}`.trim()
          : data.MotorKW ? `${data.MotorKW}kW Electric` : "Standard Powertrain"
      };
    } catch (error) {
      console.error("NHTSA Lookup failed:", error);
      return { vin };
    }
  };

  const finalizeScan = async (vin) => {
    // Only fire native haptics if on a physical device
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
    const vehicleData = await fetchVehicleDetails(vin);
    setStatus(`Verified: ${vehicleData.year || ''} ${vehicleData.make || ''}`);
    if (onDetected) onDetected(vehicleData);
  };

  const handleAutoScan = async () => {
    if (!Capacitor.isNativePlatform()) {
      setStatus("Scanner unavailable on web.");
      return;
    }

    setLoading(true);
    setStatus("Waking Scanner...");

    try {
      // 1. Check/Request Camera Permissions
      const perm = await BarcodeScanner.checkPermissions();
      if (perm.camera !== 'granted') {
        const req = await BarcodeScanner.requestPermissions();
        if (req.camera !== 'granted') throw new Error("Permission denied");
      }

      // 2. Setup the Listener
      const listener = await BarcodeScanner.addListener('barcodeScanned', async (result) => {
        const rawVal = result.barcode?.displayValue || result.barcode?.rawValue || "";
        const validVin = cleanAndExtractVIN(rawVal);
        
        if (validVin) {
          await listener.remove();
          await stopAutoScan();
          await finalizeScan(validVin);
        }
      });

      // 3. Trigger the CSS hole punch
      document.body.classList.add('scanner-active');
      setIsScanning(true);
      setStatus("Focus on the Barcode");
      setLoading(false);
      
      await BarcodeScanner.startScan({
        formats: [BarcodeFormat.Code39, BarcodeFormat.DataMatrix, BarcodeFormat.Code128]
      });

    } catch (error) {
      console.error("Auto-scan native error:", error);
      setStatus("Scanner encountered an error");
      setLoading(false);
      stopAutoScan();
    }
  };

  const stopAutoScan = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await BarcodeScanner.stopScan();
        await BarcodeScanner.removeAllListeners();
      } catch (e) {}
    }
    // Remove the CSS hole punch class
    document.body.classList.remove('scanner-active');
    setIsScanning(false);
    setStatus("Ready to scan");
  };

  const handleManualScan = async () => {
    if (!Capacitor.isNativePlatform()) {
      setStatus("Manual snap unavailable on web.");
      return;
    }

    setLoading(true);
    setStatus("Opening Camera...");
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        width: 1600,
        source: CameraSource.Camera,
        resultType: CameraResultType.Base64,
      });

      const base64Data = image.base64String;
      setStatus("Processing image...");

      // Attempt Barcode Read from Image
      const barcodeResult = await BarcodeScanner.readBarcodesFromImage({
        base64Image: base64Data,
        formats: [BarcodeFormat.Code128, BarcodeFormat.Code39, BarcodeFormat.DataMatrix],
      }).catch(() => null);

      if (barcodeResult?.barcodes?.length > 0) {
        for (const b of barcodeResult.barcodes) {
          const validVin = cleanAndExtractVIN(b.displayValue || b.rawValue);
          if (validVin) return await finalizeScan(validVin);
        }
      }

      // Fallback to OCR
      setStatus("Running OCR...");
      const TextRecognition = Object.values(OCRPlugin).find(v => v && typeof v.detectText === 'function');
      if (TextRecognition) {
        const ocrResult = await TextRecognition.detectText({ base64Image: base64Data }).catch(() => null);
        const matches = ocrResult?.text?.toUpperCase().match(/[A-Z0-9]{10,17}/g) || [];
        for (const m of matches) {
          const validOcrVin = cleanAndExtractVIN(m);
          if (validOcrVin) return await finalizeScan(validOcrVin);
        }
      }

      setStatus("VIN not found. Try again.");
    } catch (error) {
      console.error("Manual scan error:", error);
      setStatus("Ready to scan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4">
      {!isScanning ? (
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Status Badge (Normal Mode) */}
          <div className="w-full flex justify-center mb-2">
            <div className="bg-slate-900 border border-slate-800 text-blue-400 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg text-center leading-tight">
              {status}
            </div>
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={handleAutoScan}
              disabled={loading}
              className={`w-full h-16 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 ${loading ? "bg-slate-800" : "bg-green-600 hover:bg-green-500"}`}
            >
              {loading ? "Initializing..." : " Live Barcode Scan"}
            </button>

            <button
              onClick={handleManualScan}
              disabled={loading}
              className={`w-full h-16 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 ${loading ? "bg-slate-800" : "bg-blue-600 hover:bg-blue-500"}`}
            >
              {loading ? "Processing..." : " Manual Snap (OCR)"}
            </button>
            
            <p className="text-[10px] text-slate-500 text-center font-bold px-4 pt-2">
               Auto-Scan is fastest for barcodes. Use Manual Snap for dashboards or titles.
            </p>
          </div>
        </div>
      ) : (
        /* 🛑 THE FIX: "fixed inset-0" forces the scanner to ignore the page layout and center perfectly on the screen */
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-between p-10 bg-transparent pointer-events-auto">
          
          {/* Floating Status Badge */}
          <div className="mt-10 w-full flex justify-center">
            <div className="bg-slate-900/90 backdrop-blur border border-slate-800 text-blue-400 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">
              {status}
            </div>
          </div>

          {/* Aesthetic Viewfinder Box */}
          <div className="w-72 h-48 border-2 border-blue-400/30 rounded-lg relative overflow-hidden bg-blue-500/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
            <div className="scanner-laser"></div>
            
            {/* Viewfinder Corners */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-400"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-400"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-400"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-400"></div>
          </div>
          
          {/* Bottom Cancel Button */}
          <div className="w-full max-w-sm mb-6 flex justify-center">
            <button
              onClick={stopAutoScan}
              className="w-full h-14 bg-red-600 rounded-full font-black text-xs uppercase tracking-widest text-white shadow-2xl active:scale-95 transition-transform"
            >
              Cancel Scan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VinScanner;