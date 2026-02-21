import React, { useState, useEffect } from "react";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import * as OCRPlugin from '@pantrist/capacitor-plugin-ml-kit-text-recognition';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const VinScanner = ({ onDetected }) => {
  const [status, setStatus] = useState("Ready to scan");
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false); // ✅ NEW: Tracks live feed state

  // ✅ Clean up listeners if the component unmounts unexpectedly
  useEffect(() => {
    return () => {
      BarcodeScanner.removeAllListeners();
      BarcodeScanner.stopScan().catch(() => {});
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
      const response = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`
      );
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
    await Haptics.impact({ style: ImpactStyle.Medium });
    const vehicleData = await fetchVehicleDetails(vin);
    setStatus(`Verified: ${vehicleData.year || ''} ${vehicleData.make || ''}`);
    if (onDetected) onDetected(vehicleData);
  };

  // ==========================================
  // ✅ NEW: TRUE AUTOMATIC LIVE SCANNING
  // ==========================================
  const handleAutoScan = async () => {
    setLoading(true);
    setStatus("Starting Auto-Scanner...");

    try {
      const perm = await BarcodeScanner.checkPermissions();
      if (perm.camera !== 'granted') {
        const req = await BarcodeScanner.requestPermissions();
        if (req.camera !== 'granted') throw new Error("Permission denied");
      }

      const isModuleAvailable = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
      if (!isModuleAvailable.available) {
        setStatus("Installing Modules...");
        await BarcodeScanner.installGoogleBarcodeScannerModule();
      }

      // 1. Set up the continuous listener FIRST
      const listener = await BarcodeScanner.addListener('barcodeScanned', async (result) => {
        const rawVal = result.barcode?.rawValue || result.barcode?.displayValue || "";
        const validVin = cleanAndExtractVIN(rawVal);
        
        if (validVin) {
          console.log("✅ AUTO-SCAN VIN ACCEPTED:", validVin);
          
          // Instantly kill the scanner to prevent duplicate scans
          await listener.remove();
          await stopAutoScan();
          return await finalizeScan(validVin);
        }
      });

      // 2. Hide HTML background so camera shows through
      document.body.style.backgroundColor = "transparent";
      document.body.style.opacity = "0"; // Sometimes needed depending on app structure
      
      setTimeout(() => { document.body.style.opacity = "1"; }, 100);

      // 3. Start live feed
      setIsScanning(true);
      setStatus("Hover over VIN Barcode...");
      setLoading(false);
      
      await BarcodeScanner.startScan({
        formats: [BarcodeFormat.Code39, BarcodeFormat.DataMatrix, BarcodeFormat.Code128]
      });

    } catch (error) {
      console.error("Auto-scanning error:", error);
      setStatus("Auto-Scan Failed");
      setLoading(false);
      setIsScanning(false);
    }
  };

  const stopAutoScan = async () => {
    await BarcodeScanner.stopScan();
    await BarcodeScanner.removeAllListeners();
    document.body.style.backgroundColor = ""; // Restore original background
    setIsScanning(false);
    setStatus("Ready to scan");
  };

  // ==========================================
  // ORIGINAL MANUAL SNAP (FALLBACK)
  // ==========================================
  const handleManualScan = async () => {
    setLoading(true);
    setStatus("Waking Camera...");

    try {
      const perm = await Camera.checkPermissions();
      if (perm.camera !== 'granted') await Camera.requestPermissions();

      let image = await Camera.getPhoto({
        quality: 80,
        width: 1600, 
        source: CameraSource.Camera, 
        resultType: CameraResultType.Base64,
      });

      if (!image?.base64String) throw new Error("No image data");
      const base64Data = image.base64String;

      setStatus("Searching for Barcode...");
      const barcodeResult = await BarcodeScanner.readBarcodesFromImage({
        base64Image: base64Data,
        formats: [BarcodeFormat.Code128, BarcodeFormat.Code39, BarcodeFormat.DataMatrix],
      }).catch(() => null);

      if (barcodeResult?.barcodes?.length > 0) {
        for (const b of barcodeResult.barcodes) {
          const validVin = cleanAndExtractVIN(b.rawValue || b.displayValue || "");
          if (validVin) return await finalizeScan(validVin);
        }
      }

      setStatus("Analyzing Text (OCR)...");
      const TextRecognition = Object.values(OCRPlugin).find(v => v && typeof v.detectText === 'function');
      if (TextRecognition) {
        const ocrResult = await TextRecognition.detectText({ base64Image: base64Data }).catch(() => null);
        if (ocrResult?.text) {
          const sanitizedText = ocrResult.text.toUpperCase().replace(/I/g, '1').replace(/[OQ]/g, '0').replace(/[^A-Z0-9]/g, ''); 
          const potentialVins = sanitizedText.match(/[A-Z0-9]{17}/g) || [];
          for (const match of potentialVins) {
            const validOcrVin = cleanAndExtractVIN(match);
            if (validOcrVin) return await finalizeScan(validOcrVin);
          }
        }
      }

      setStatus("No VIN detected. Try again.");
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      setStatus("Ready to scan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 w-full max-w-sm mx-auto p-4 ${isScanning ? 'bg-transparent' : ''}`}>
      <div className="w-full flex justify-center mb-2">
        <div className="bg-slate-900 border border-slate-800 text-blue-400 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg text-center leading-tight">
          {status}
        </div>
      </div>
      
      {/* RENDER ACTIVE SCANNER OVERLAY OR MAIN BUTTONS */}
      {isScanning ? (
        <div className="flex flex-col items-center gap-4 w-full mt-10">
          <div className="w-64 h-64 border-4 border-blue-500 border-dashed rounded-xl flex items-center justify-center animate-pulse">
             <span className="text-blue-500 font-bold text-center px-4">Aim at VIN Barcode</span>
          </div>
          <button
            onClick={stopAutoScan}
            className="w-full h-14 mt-4 bg-red-600 hover:bg-red-500 rounded-full font-black text-xs uppercase tracking-widest text-white shadow-lg"
          >
            Cancel Scan
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={handleAutoScan}
            disabled={loading}
            className={`relative w-full h-16 flex flex-col items-center justify-center rounded-[1.5rem] font-black text-xs uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 ${
              loading ? "bg-slate-800" : "bg-green-600 hover:bg-green-500"
            }`}
          >
            {loading ? "Processing..." : "📡 Auto-Scan (Live)"}
          </button>

          <button
            onClick={handleManualScan}
            disabled={loading}
            className={`relative w-full h-16 flex flex-col items-center justify-center rounded-[1.5rem] font-black text-xs uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 ${
              loading ? "bg-slate-800" : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {loading ? "Processing..." : "📸 Manual Snap (OCR)"}
          </button>
        </>
      )}

      {!isScanning && (
        <p className="text-[10px] text-slate-500 text-center font-bold px-4 mt-2">
          Use Auto-Scan for barcodes. Use Manual Snap if you need to read plain text VINs.
        </p>
      )}
    </div>
  );
};

export default VinScanner;