import React, { useState, useEffect } from 'react';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { parseDLData } from '../../utils/dlParser';
import { UserPlus, X } from 'lucide-react';

const DLScanner = ({ onLeadCaptured }) => {
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    return () => {
      stopScan();
    };
  }, []);

  const startScan = async () => {
    try {
      // 1. Check & Request Permissions
      const status = await BarcodeScanner.checkPermissions();
      if (status.camera !== 'granted') {
        const request = await BarcodeScanner.requestPermissions();
        if (request.camera !== 'granted') {
          alert("Camera access is required to scan IDs.");
          return;
        }
      }

      // 2. Verify Google Play Services Barcode Module
      const isModuleAvailable = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
      if (!isModuleAvailable.available) {
        await BarcodeScanner.installGoogleBarcodeScannerModule();
        alert("Initializing scanner modules... Please try again in a few seconds.");
        return; 
      }

      // 3. Prepare the UI & Native Webview
      document.body.classList.add('scanner-active');
      setIsScanning(true);
      
      // ✅ FIX: Crucial for native camera visibility
      await BarcodeScanner.hideBackground();

      // 4. Set up the Listener
      await BarcodeScanner.addListener('barcodesScanned', async (event) => {
        if (event.barcodes && event.barcodes.length > 0) {
          const rawData = event.barcodes[0].rawValue;
          const parsedData = parseDLData(rawData);
          
          await Haptics.impact({ style: ImpactStyle.Medium });
          
          // ✅ FIX: Safely tear down everything at once
          await stopScan();
          
          if (onLeadCaptured) onLeadCaptured(parsedData);
        }
      });

      // 5. Start the Native Camera View
      await BarcodeScanner.startScan({
        formats: [BarcodeFormat.Pdf417],
      });

    } catch (error) {
      console.error("DL Scan Error:", error);
      await stopScan();
    }
  };

  const stopScan = async () => {
    try {
      // Clean up all listeners and UI layers
      await BarcodeScanner.removeAllListeners();
      await BarcodeScanner.stopScan();
      
      // ✅ FIX: Restore the native webview background
      await BarcodeScanner.showBackground();
    } catch (e) {
      // Silent catch if already stopped
    }
    document.body.classList.remove('scanner-active');
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
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-between p-10 bg-transparent pointer-events-none">
          <div className="w-full flex justify-end">
            <button 
              onClick={stopScan} 
              className="p-4 bg-red-600 rounded-full text-white shadow-xl active:scale-90 pointer-events-auto"
            >
              <X size={28} />
            </button>
          </div>
          
          {/* Enhanced Target Guide for Driver's Licenses */}
          <div className="relative w-full h-48 border-4 border-blue-400 border-dashed rounded-3xl flex flex-col items-center justify-center bg-blue-400/10 backdrop-blur-[2px] overflow-hidden">
            {/* Reusing the laser animation from your global.css */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,1)] animate-[scan-move_2s_infinite]"></div>
            
            <p className="text-white font-black bg-blue-600 px-6 py-2 rounded-full shadow-lg text-sm uppercase tracking-widest mt-auto mb-4">
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