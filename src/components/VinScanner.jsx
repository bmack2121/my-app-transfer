import React, { useState } from "react";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { TextRecognition } from '@pantrist/capacitor-plugin-ml-kit-text-recognition';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const VinScanner = ({ onDetected }) => {
  const [status, setStatus] = useState("Ready to scan");
  const [loading, setLoading] = useState(false);

  // ✅ VINs never contain I, O, or Q to avoid confusion with numbers
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
      const data = json.Results[0];

      // Optimized mapping for 2026 vehicle types (including EVs)
      return {
        vin: vin,
        year: data.ModelYear,
        make: data.Make,
        model: data.Model,
        trim: data.Trim,
        driveTrain: data.DriveType,
        fuelType: data.FuelPrimary,
        bodyClass: data.BodyClass,
        // Cleaner engine string handling for diverse powertrains
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
      setStatus("Waking Camera...");

      // Capture photo (Base64 is required for ML Kit process)
      const image = await Camera.getPhoto({
        quality: 100, // Highest quality for better OCR accuracy
        source: CameraSource.Camera,
        resultType: CameraResultType.Base64,
      });

      // ✅ FIX: ML Kit usually expects the string WITHOUT the 'data:image/jpeg;base64,' prefix
      const base64Data = image.base64String;

      // STEP 1: Barcode Scan (Fastest)
      setStatus("Searching for Barcode...");
      const { barcodes } = await BarcodeScanner.readBarcodesFromImage({
        base64Image: base64Data,
        formats: [BarcodeFormat.Code128, BarcodeFormat.Code39],
      });

      const barcodeVin = barcodes.find((b) => validateVIN(b.rawValue));
      if (barcodeVin) {
        return finalizeScan(barcodeVin.rawValue.toUpperCase());
      }

      // STEP 2: OCR Fallback (For VINs on dashboards or titles)
      setStatus("Analyzing Text (OCR)...");
      const { text } = await TextRecognition.detectText({
        base64Image: base64Data,
      });

      // Join multi-line text and strip spaces
      const cleanedText = text.replace(/[\s\n\t]/g, '');
      const potentialVins = cleanedText.match(/[A-HJ-NPR-Z0-9]{17}/gi) || [];
      const validOcrVin = potentialVins.find((v) => validateVIN(v));

      if (validOcrVin) {
        return finalizeScan(validOcrVin.toUpperCase());
      }

      setStatus("No VIN detected. Reposition and try again.");
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
    onDetected(vehicleData);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto p-4">
      {/* Visual Status Indicator */}
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
            <span className="opacity-50 text-[8px]">Processing Image...</span>
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