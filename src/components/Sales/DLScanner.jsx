import React, { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { parseDLData } from '../../utils/dlParser';
import { UserPlus, Camera as CameraIcon } from 'lucide-react';

const DLScanner = ({ onLeadCaptured }) => {
  const [isScanning, setIsScanning] = useState(false);

  const startScan = async () => {
    try {
      const status = await BarcodeScanner.checkPermissions();
      if (status.camera !== 'granted') {
        const request = await BarcodeScanner.requestPermissions();
        if (request.camera !== 'granted') {
          alert("Camera access is required to scan IDs.");
          return;
        }
      }

      const isModuleAvailable = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
      if (!isModuleAvailable.available) {
        await BarcodeScanner.installGoogleBarcodeScannerModule();
      }

      setIsScanning(true);

      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.Pdf417]
      }); 

      if (barcodes && barcodes.length > 0) {
        // ✅ FIX 1: STRICTLY use rawValue to preserve AAMVA line breaks
        const rawData = barcodes[0].rawValue; 
        console.log("RAW AAMVA DATA (Live Scan):", rawData);
        
        await Haptics.impact({ style: ImpactStyle.Medium });
        
        const parsedData = parseDLData(rawData);
        if (onLeadCaptured) onLeadCaptured(parsedData);
      }

    } catch (error) {
      console.warn("Scan Process Stopped:", error.message);
    } finally {
      setIsScanning(false);
    }
  };

  const scanFromPhoto = async () => {
    try {
      setIsScanning(true);
      
      const image = await Camera.getPhoto({
        quality: 100, // Maximum quality needed for microscopic PDF417 dots
        source: CameraSource.Camera,
        resultType: CameraResultType.Base64,
      });

      if (image && image.base64String) {
        console.log("Processing high-res image...");
        
        const { barcodes } = await BarcodeScanner.readBarcodesFromImage({
          base64Image: image.base64String,
          formats: [BarcodeFormat.Pdf417],
        });

        if (barcodes && barcodes.length > 0) {
          // ✅ FIX 2: STRICTLY use rawValue here as well
          const rawData = barcodes[0].rawValue; 
          console.log("RAW AAMVA DATA (Photo Scan):", rawData);
          
          await Haptics.impact({ style: ImpactStyle.Medium });
          const parsedData = parseDLData(rawData);
          if (onLeadCaptured) onLeadCaptured(parsedData);
        } else {
          alert("Could not detect a clear ID barcode in that photo. Please check for glare and try again.");
        }
      }
    } catch (error) {
      // Ignore user cancellation errors
      if (!error.message?.includes('canceled') && !error.message?.includes('cancelled')) {
        console.error("Photo scan error:", error);
      }
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      <button
        onClick={startScan}
        disabled={isScanning}
        className={`flex items-center justify-center gap-3 w-full py-4 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 ${
          isScanning ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
        }`}
      >
        <UserPlus size={20} />
        {isScanning ? 'Scanner Active...' : 'Scan License to Start Lead'}
      </button>

      {/* Fallback button for devices with auto-focus issues */}
      <button
        onClick={scanFromPhoto}
        disabled={isScanning}
        className="flex items-center justify-center gap-2 w-full py-3 text-slate-400 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest border border-slate-800 rounded-xl"
      >
        <CameraIcon size={14} />
        Live Scanner Won't Focus? Take Photo
      </button>
    </div>
  );
};

export default DLScanner;