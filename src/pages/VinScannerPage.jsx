import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarcodeScanner, BarcodeFormat } from "@capacitor-mlkit/barcode-scanning";
// ✅ FIXED: Correct import for the v8 Pantrist plugin
import { TextRecognition } from "@pantrist/capacitor-plugin-ml-kit-text-recognition";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import ScanHistory from "../components/ScanHistory";

/**
 * ✅ VIN Checksum Validation (North American Standard)
 * Ensures the 17-digit code is mathematically valid.
 */
const validateVIN = (vin) => {
  if (!vin) return false;
  const v = vin.toUpperCase().trim();
  if (v.length !== 17 || /[IOQ]/.test(v)) return false;
  
  const map = { 
    A:1, B:2, C:3, D:4, E:5, F:6, G:7, H:8, J:1, K:2, L:3, M:4, N:5, P:7, R:9, S:2, T:3, U:4, V:5, W:6, X:7, Y:8, Z:9,
    "0":0, "1":1, "2":2, "3":3, "4":4, "5":5, "6":6, "7":7, "8":8, "9":9 
  };
  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const char = v[i];
    if (i !== 8) { // Skip the check digit itself
      const val = map[char];
      if (val === undefined) return false;
      sum += val * weights[i];
    }
  }
  
  const remainder = sum % 11;
  const expected = remainder === 10 ? "X" : remainder.toString();
  return v[8] === expected;
};

const VinScannerPage = () => {
  const [status, setStatus] = useState("Ready to scan");
  const [isScanning, setIsScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("vin_history") || "[]");
    setHistory(saved);
  }, []);

  const handleSuccess = async (vin) => {
    await Haptics.impact({ style: ImpactStyle.Heavy });
    const updatedHistory = [vin, ...history.filter(h => h !== vin)].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem("vin_history", JSON.stringify(updatedHistory));
    navigate(`/vin-result/${vin}`);
  };

  const toggleTorch = async () => {
    try {
      await BarcodeScanner.toggleTorch();
      setTorchOn(!torchOn);
    } catch (err) {
      console.warn("Torch not supported on this device/mode");
    }
  };

  const startScan = async () => {
    try {
      const { camera } = await BarcodeScanner.requestPermissions();
      if (camera !== 'granted') return setStatus("Camera permission denied.");

      setIsScanning(true);
      setTorchOn(false);
      
      // ✅ Essential for Capacitor 8 Transparent Webview
      document.querySelector('body')?.classList.add('scanner-active');
      await BarcodeScanner.hideBackground(); 
      
      const result = await BarcodeScanner.startScan({
        formats: [BarcodeFormat.Code128, BarcodeFormat.Code39],
      });
      
      await stopScanning();

      // ✅ Fix: ML Kit returns a barcodes array
      if (result?.barcodes?.length > 0) {
        const vin = result.barcodes[0].rawValue.toUpperCase();
        if (validateVIN(vin)) {
          handleSuccess(vin);
        } else {
          await Haptics.impact({ style: ImpactStyle.Medium });
          setStatus(`Invalid VIN: ${vin} (Checksum Failed)`);
        }
      }
    } catch (err) {
      console.error("Scanner Error:", err);
      await stopScanning();
      setStatus("Scanner closed.");
    }
  };

  const stopScanning = async () => {
    document.querySelector('body')?.classList.remove('scanner-active');
    try {
      await BarcodeScanner.showBackground();
      await BarcodeScanner.stopScan();
    } catch (e) {}
    setIsScanning(false);
  };

  return (
    <div className={`p-6 min-h-screen transition-colors ${isScanning ? "bg-transparent" : "bg-slate-950 text-white"}`}>
      {!isScanning && (
        <div className="flex flex-col h-full">
          <header className="mb-8">
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-blue-500">
              VinPro <span className="text-white not-italic">Scan</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
              Automotive Inventory Systems v8.1
            </p>
          </header>
          
          <div className="relative w-full h-44 border-2 border-dashed border-blue-500/30 rounded-3xl flex flex-col items-center justify-center mb-8 bg-blue-500/5">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
              <span className="text-xl">📷</span>
            </div>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest text-center px-8">
              Point at Barcode on Door Jamb
            </p>
          </div>

          <button
            onClick={startScan}
            className="w-full bg-blue-600 text-white py-6 rounded-[2rem] text-lg font-black shadow-[0_10px_30px_rgba(37,99,235,0.3)] active:scale-95 transition-all uppercase"
          >
            Launch Scanner
          </button>

          <p className="text-center mt-6 text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            {status}
          </p>

          <div className="mt-auto pt-10">
            <ScanHistory history={history} onSelect={handleSuccess} />
          </div>
        </div>
      )}

      {/* Viewfinder Overlay Area */}
      {isScanning && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-between py-12">
          <div className="w-full flex justify-end px-10 pt-4">
            <button 
              onClick={toggleTorch}
              className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all active:scale-90 ${torchOn ? 'bg-yellow-400 border-yellow-500 shadow-[0_0_20px_rgba(250,204,21,0.5)]' : 'bg-black/50 border-white/20 backdrop-blur-md'}`}
            >
              <span className="text-2xl">{torchOn ? '🔦' : '💡'}</span>
            </button>
          </div>

          {/* Viewfinder Frame (The logic uses the area behind this box) */}
          <div className="w-72 h-44 border-4 border-blue-500 rounded-[2rem] shadow-[0_0_0_9999px_rgba(2,6,23,0.85)] relative">
             <div className="absolute inset-0 border border-white/10 rounded-[1.8rem]" />
             <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/50 shadow-[0_0_10px_red]" />
          </div>

          <button 
            onClick={stopScanning}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-12 py-4 rounded-full font-black uppercase text-xs tracking-widest border border-white/10 transition-all active:scale-95"
          >
            Abort Scan
          </button>
        </div>
      )}
    </div>
  );
};

export default VinScannerPage;