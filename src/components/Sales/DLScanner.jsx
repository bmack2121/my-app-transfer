import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { parseDLData } from '../../utils/dlParser';
import { UserPlus, X } from 'lucide-react';

// We store the listener outside the component so we can easily kill it when we stop scanning
let scanListener = null;

const DLScanner = ({ onLeadCaptured }) => {
  const [isScanning, setIsScanning] = useState(false);

  // Clean up scanner when component unmounts
  useEffect(() => {
    return () => {
      stopScan();
    };
  }, []);

  const startScan = async () => {
    try {
      // 1. Check/Request Permissions
      const { camera } = await BarcodeScanner.requestPermissions();
      if (camera !== 'granted') {
        alert("Camera permission is required to scan licenses.");
        return;
      }

      // 2. Android-Only: Install Google ML Kit if missing
      if (Capacitor.getPlatform() === 'android') {
        const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
        if (!available) {
          await BarcodeScanner.installGoogleBarcodeScannerModule();
        }
      }

      // 3. Prepare the UI
      document.querySelector('body').classList.add('scanner-active');
      setIsScanning(true);

      // 4. 🛑 THE FIX: Set up the Listener BEFORE we turn on the camera
      scanListener = await BarcodeScanner.addListener('barcodeScanned', async (result) => {
        if (result.barcode) {
          const rawData = result.barcode.rawValue;
          const parsedData = parseDLData(rawData);
         
          await Haptics.impact({ style: ImpactStyle.Medium });
          await stopScan();
          onLeadCaptured(parsedData);
        }
      });

      // 5. Turn the camera on (This returns void/undefined, so we don't destructure anything!)
      await BarcodeScanner.startScan({
        formats: [BarcodeFormat.Pdf417],
      });

    } catch (error) {
      console.error("DL Scan Error:", error);
      stopScan();
    }
  };

  const stopScan = async () => {
    try {
      // Kill the listener so it doesn't keep running in the background
      if (scanListener) {
        await scanListener.remove();
        scanListener = null;
      }
      await BarcodeScanner.stopScan();
    } catch (e) {
      // Ignore errors if scanner wasn't running
    }
    document.querySelector('body').classList.remove('scanner-active');
    setIsScanning(false);
  };

  return (
    <div className="w-full">
      {!isScanning ? (
        <button
          onClick={startScan}
          className="flex items-center justify-center gap-3 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95"
        >
          <UserPlus size={20} />
           Scan License to Start Lead
        </button>
      ) : (
        /* The scanner UI overlay */
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-between p-10 bg-transparent">
          <div className="w-full flex justify-end">
            <button
              onClick={stopScan}
              className="p-4 bg-red-600 rounded-full text-white shadow-xl active:scale-90"
            >
              <X size={28} />
            </button>
          </div>
         
          <div className="w-full h-48 border-4 border-blue-400 border-dashed rounded-3xl flex flex-col items-center justify-center bg-blue-400/10 backdrop-blur-[2px]">
            <p className="text-white font-black bg-blue-600 px-6 py-2 rounded-full shadow-lg text-sm uppercase tracking-widest">
              Scan Back of ID
            </p>
          </div>

          <div className="h-20" />
        </div>
      )}
    </div>
  );
};

export default DLScanner;