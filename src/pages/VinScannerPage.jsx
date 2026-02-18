import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarcodeScanner, BarcodeFormat } from "@capacitor-mlkit/barcode-scanning";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  XMarkIcon, 
  BoltIcon,
  BoltSlashIcon 
} from "@heroicons/react/24/outline";
import ScanHistory from "../components/ScanHistory";

/**
 * ✅ VIN Checksum Validation (North American Standard)
 * Ensures mathematically valid 17-digit codes.
 */
const validateVIN = (vin) => {
  if (!vin) return false;
  let v = vin.toUpperCase().trim().replace(/I/g, '1').replace(/O/g, '0');
  if (v.length !== 17) return false;
  
  const map = { 
    A:1, B:2, C:3, D:4, E:5, F:6, G:7, H:8, J:1, K:2, L:3, M:4, N:5, P:7, R:9, S:2, T:3, U:4, V:5, W:6, X:7, Y:8, Z:9,
    "0":0, "1":1, "2":2, "3":3, "4":4, "5":5, "6":6, "7":7, "8":8, "9":9 
  };
  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    if (i !== 8) { 
      const val = map[v[i]];
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
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualVin, setManualVin] = useState("");
  const [torchOn, setTorchOn] = useState(false);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("vin_history") || "[]");
    setHistory(saved);
    return () => stopScanning();
  }, []);

  // ✅ Updated: Now saves a full object for the enhanced ScanHistory component
  const handleSuccess = async (vin) => {
    await Haptics.impact({ style: ImpactStyle.Heavy });
    
    const historyItem = {
      vin: vin.toUpperCase(),
      timestamp: new Date().toISOString(),
      // Placeholders until VinResultPage fetches real data
      year: "...", 
      make: "New",
      model: "Acquisition"
    };

    const updatedHistory = [historyItem, ...history.filter(h => h.vin !== vin)].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem("vin_history", JSON.stringify(updatedHistory));
    navigate(`/vin-result/${vin}`);
  };

  const toggleTorch = async () => {
    try {
      await BarcodeScanner.toggleTorch();
      setTorchOn(prev => !prev);
    } catch (err) { console.warn("Torch unavailable"); }
  };

  const startScan = async () => {
    try {
      const { camera } = await BarcodeScanner.requestPermissions();
      if (camera !== 'granted') return setStatus("Camera permission denied.");

      setIsScanning(true);
      document.body.classList.add('scanner-active');
      await BarcodeScanner.hideBackground(); 
      
      const result = await BarcodeScanner.startScan({
        formats: [BarcodeFormat.Code128, BarcodeFormat.Code39],
      });
      
      await stopScanning();

      if (result?.barcodes?.length > 0) {
        const rawVin = result.barcodes[0].rawValue.toUpperCase();
        const vin = rawVin.length > 17 ? rawVin.slice(-17) : rawVin;
        if (validateVIN(vin)) { handleSuccess(vin); } 
        else { 
          await Haptics.impact({ style: ImpactStyle.Medium });
          setStatus(`Invalid Checksum: ${vin}`); 
        }
      }
    } catch (err) { await stopScanning(); }
  };

  const stopScanning = async () => {
    try {
      document.body.classList.remove('scanner-active');
      await BarcodeScanner.showBackground();
      await BarcodeScanner.stopScan();
    } catch (e) {}
    setIsScanning(false);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualVin.length === 17) handleSuccess(manualVin.toUpperCase());
  };

  return (
    <div className={`min-h-screen transition-all ${isScanning ? "bg-transparent" : "bg-slate-950 text-white"}`}>
      
      {/* --- Global Navigation Overlay --- */}
      <div className="fixed top-0 left-0 w-full z-[70] p-6 pt-safe flex justify-between items-center pointer-events-none">
        <button 
          onClick={() => isScanning ? stopScanning() : navigate(-1)}
          className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/5 text-white pointer-events-auto active:scale-90"
        >
          <ArrowLeftIcon className="w-6 h-6 stroke-[2.5px]" />
        </button>

        {isScanning && (
          <button 
            onClick={toggleTorch}
            className={`p-3 rounded-2xl border border-white/5 pointer-events-auto transition-all ${torchOn ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white'}`}
          >
            {torchOn ? <BoltIcon className="w-6 h-6" /> : <BoltSlashIcon className="w-6 h-6" />}
          </button>
        )}
      </div>

      {!isScanning ? (
        <div className="p-8 pt-32 flex flex-col h-full animate-in fade-in duration-500">
          <header className="mb-10">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
              VIN<span className="text-blue-600">PRO</span>
            </h1>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-2">
              Lot Acquisition Interface
            </p>
          </header>
          
          <button
            onClick={startScan}
            className="w-full bg-blue-600 py-6 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 shadow-2xl active:scale-95 transition-all mb-4"
          >
            <span className="text-2xl">📷</span>
            <span className="font-black uppercase tracking-widest text-xs">Launch Camera Lens</span>
          </button>

          <button
            onClick={() => setShowManualEntry(true)}
            className="w-full py-4 rounded-[2rem] border border-slate-800 flex items-center justify-center gap-2 text-slate-400 mb-12"
          >
            <PencilIcon className="w-4 h-4" />
            <span className="font-bold uppercase tracking-widest text-[10px]">Manual VIN Entry</span>
          </button>

          {/* Enhanced History Component */}
          <div className="mt-auto">
            <ScanHistory history={history} onSelect={handleSuccess} />
          </div>
        </div>
      ) : (
        /* --- Native Scanner Viewport --- */
        <div className="fixed inset-0 flex flex-col items-center justify-center">
          <div className="w-80 h-48 border-2 border-blue-600 rounded-[2.5rem] shadow-[0_0_0_9999px_rgba(2,6,23,0.92)] relative">
             <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-red-500/50 shadow-[0_0_8px_red]"></div>
          </div>
          <p className="mt-8 text-white/40 text-[9px] font-black uppercase tracking-[0.4em] animate-pulse">Scanning Door Jamb...</p>
        </div>
      )}

      {/* --- Manual Entry Modal --- */}
      {showManualEntry && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in zoom-in-95">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black uppercase italic text-xl">Type <span className="text-blue-500">VIN</span></h3>
              <button onClick={() => setShowManualEntry(false)} className="text-slate-500">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <input 
                autoFocus maxLength={17} placeholder="17-Digit VIN"
                value={manualVin} onChange={(e) => setManualVin(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center font-mono text-xl tracking-widest text-blue-400 focus:border-blue-500 outline-none"
              />
              <button 
                type="submit" disabled={manualVin.length !== 17}
                className="w-full bg-blue-600 disabled:bg-slate-800 py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
              >
                Decode Unit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VinScannerPage;