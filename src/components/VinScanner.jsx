import React, { useState } from "react";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
// ✅ Wildcard import bypasses Webpack's strict named-export errors
import * as OCRPlugin from '@pantrist/capacitor-plugin-ml-kit-text-recognition';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const VinScanner = ({ onDetected }) => {
  const [status, setStatus] = useState("Ready to scan");
  const [loading, setLoading] = useState(false);

  // VINs never contain I, O, or Q to avoid confusion with numbers
  const validateVIN = (vin) => {
    if (!vin) return false;
    const cleanVin = vin.trim().toUpperCase();
    return /^[A-HJ-NPR-Z0-9]{17}$/.test(cleanVin);
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

  const handleScan = async () => {
    try {
      setLoading(true);
      setStatus("Checking Permissions...");

      // 1. Ensure Camera Permissions are actually granted
      const perm = await Camera.checkPermissions();
      if (perm.camera !== 'granted') {
        const req = await Camera.requestPermissions();
        if (req.camera !== 'granted') {
          setStatus("Camera permission denied");
          setLoading(false);
          return;
        }
      }

      // 2. Ensure Google ML Kit modules are ready (Android requirement)
      const isModuleAvailable = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
      if (!isModuleAvailable.available) {
        setStatus("Installing Scanner Modules...");
        await BarcodeScanner.installGoogleBarcodeScannerModule();
      }

      setStatus("Waking Camera...");
      const image = await Camera.getPhoto({
        quality: 90, // Slightly reduced for faster OCR processing
        source: CameraSource.Camera,
        resultType: CameraResultType.Base64,
      });

      if (!image || !image.base64String) {
        setStatus("Scan cancelled");
        return;
      }

      const base64Data = image.base64String;

      // STEP 1: Barcode Scan (Fastest)
      setStatus("Searching for Barcode...");
      const barcodeResult = await BarcodeScanner.readBarcodesFromImage({
        base64Image: base64Data,
        formats: [BarcodeFormat.Code128, BarcodeFormat.Code39],
      }).catch(() => null);

      if (barcodeResult?.barcodes?.length > 0) {
        const barcodeVin = barcodeResult.barcodes.find((b) => validateVIN(b.rawValue));
        if (barcodeVin) {
          return await finalizeScan(barcodeVin.rawValue.toUpperCase());
        }
      }

      // STEP 2: OCR Fallback
      setStatus("Analyzing Text (OCR)...");
      
      // ✅ Safely extract the actual plugin instance from the wildcard import
      const OCR = Object.values(OCRPlugin).find(v => typeof v === 'object' && v.detectText) || Object.values(OCRPlugin)[0]; 

      const ocrResult = await OCR.detectText({
        base64Image: base64Data,
      }).catch(() => null);

      if (ocrResult?.text) {
        const cleanedText = ocrResult.text.replace(/[\s\n\t]/g, '');
        const potentialVins = cleanedText.match(/[A-HJ-NPR-Z0-9]{17}/gi) || [];
        const validOcrVin = potentialVins.find((v) => validateVIN(v));

        if (validOcrVin) {
          return await finalizeScan(validOcrVin.toUpperCase());
        }
      }

      setStatus("No VIN detected. Try again.");
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.error("Scanning process aborted:", error);
      setStatus("Ready to scan");
    } finally {
      setLoading(false);
    }
  };

  const finalizeScan = async (vin) => {
    await Haptics.impact({ style: ImpactStyle.Medium });
    const vehicleData = await fetchVehicleDetails(vin);
    setStatus(`Verified: ${vehicleData.year || ''} ${vehicleData.make || ''}`);
    if (onDetected) onDetected(vehicleData);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto p-4">
      <div className="w-full flex justify-center">
        <div className="bg-slate-900 border border-slate-800 text-blue-400 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
          {status}
        </div>
      </div>
      
      <button
        onClick={handleScan}
        disabled={loading}
        className={`relative w-full h-20 flex flex-col items-center justify-center rounded-[2rem] font-black text-xs uppercase tracking-widest text-white shadow-2xl transition-all active:scale-95 ${
          loading ? "bg-slate-800" : "bg-blue-600 hover:bg-blue-500"
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full" />
            <span className="opacity-50 text-[8px]">Processing...</span>
          </div>
        ) : (
          <>
            <span className="text-xl mb-1">📸</span>
            <span>Scan VIN Plate</span>
          </>
        )}
      </button>

      <p className="text-[10px] text-slate-500 text-center font-bold px-4">
        Tip: Capture the barcode on the door jamb or the VIN plate under the windshield.
      </p>
    </div>
  );
};

export default VinScanner;