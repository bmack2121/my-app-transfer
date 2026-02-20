import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BarcodeScanner, BarcodeFormat } from "@capacitor-mlkit/barcode-scanning";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
// ✅ Wildcard import bypasses Webpack's strict named-export errors for OCR
import * as OCRPlugin from '@pantrist/capacitor-plugin-ml-kit-text-recognition';
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  XMarkIcon, 
  BoltIcon,
  BoltSlashIcon,
  QrCodeIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import ScanHistory from "../components/ScanHistory";

/**
 * ✅ VIN Checksum Validation (North American Standard)
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualVin, setManualVin] = useState("");
  const [torchOn, setTorchOn] = useState(false);
  const [history, setHistory] = useState([]);
  
  const navigate = useNavigate();
  const isScanningRef = useRef(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("vin_history") || "[]");
    setHistory(saved);
    return () => { stopScanning(); };
  }, []);

  // ✅ Integrates NHTSA Fetching from the original component
  const fetchVehicleDetails = async (vin) => {
    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`);
      const json = await response.json();
      return json?.Results?.[0] || {};
    } catch (error) {
      console.error("NHTSA Lookup failed:", error);
      return {}; 
    }
  };

  // ✅ Unified Success Handler (Hits API -> Saves History -> Navigates)
  const handleSuccess = async (vin) => {
    if (!vin) return;
    
    await Haptics.impact({ style: ImpactStyle.Heavy });
    await stopScanning(); 
    
    setIsProcessing(true);
    setStatus("Querying NHTSA Database...");
    
    const vehicleData = await fetchVehicleDetails(vin);
    
    const historyItem = {
      vin: vin.toUpperCase(),
      timestamp: new Date().toISOString(),
      year: vehicleData.ModelYear || "...", 
      make: vehicleData.Make || "Unknown",
      model: vehicleData.Model || "Vehicle"
    };

    const updatedHistory = [historyItem, ...history.filter(h => h.vin !== vin)].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem("vin_history", JSON.stringify(updatedHistory));
    
    setIsProcessing(false);
    navigate(`/vin-result/${vin}`);
  };

  const toggleTorch = async () => {
    try {
      if (isScanning) {
        await BarcodeScanner.toggleTorch();
        setTorchOn(prev => !prev);
      }
    } catch (err) { console.warn("Torch unavailable"); }
  };

  // 📸 SCAN MODE 1: Live Barcode (Best for Door Jambs)
  const startBarcodeScan = async () => {
    try {
      const { camera } = await BarcodeScanner.checkPermissions();
      if (camera !== 'granted') {
        const req = await BarcodeScanner.requestPermissions();
        if (req.camera !== 'granted') return alert("Camera permission denied.");
      }

      const isModuleAvailable = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
      if (!isModuleAvailable.available) {
        setStatus("Installing Scanner Engine...");
        await BarcodeScanner.installGoogleBarcodeScannerModule();
      }

      await BarcodeScanner.addListener('barcodesScanned', async (result) => {
        if (result.barcodes.length > 0) {
          const rawVin = result.barcodes[0].rawValue.toUpperCase();
          const vin = rawVin.length > 17 ? rawVin.slice(-17) : rawVin;
          
          if (validateVIN(vin)) {
            await BarcodeScanner.removeAllListeners();
            handleSuccess(vin);
          } 
        }
      });

      setIsScanning(true);
      isScanningRef.current = true;
      document.body.classList.add('scanner-active');
      
      // ✅ FIX: Silently swallow the Android "Not Implemented" exception
      await BarcodeScanner.hideBackground().catch(() => {}); 
      
      await BarcodeScanner.startScan({
        formats: [BarcodeFormat.Code128, BarcodeFormat.Code39], 
      });
      
    } catch (err) { 
      console.error("Scan failed:", err);
      await stopScanning(); 
    }
  };

  // 📝 SCAN MODE 2: OCR Photo Processing (Best for Dashboards/Titles)
  const startOcrScan = async () => {
    try {
      const perm = await Camera.checkPermissions();
      if (perm.camera !== 'granted') {
        const req = await Camera.requestPermissions();
        if (req.camera !== 'granted') return alert("Camera permission denied.");
      }

      const image = await Camera.getPhoto({
        quality: 90,
        source: CameraSource.Camera,
        resultType: CameraResultType.Base64,
      });

      if (!image || !image.base64String) return;

      setIsProcessing(true);
      setStatus("Analyzing Image Text...");

      const OCR = Object.values(OCRPlugin).find(v => typeof v === 'object' && v.detectText) || Object.values(OCRPlugin)[0]; 
      const ocrResult = await OCR.detectText({ base64Image: image.base64String }).catch(() => null);

      if (ocrResult?.text) {
        const cleanedText = ocrResult.text.replace(/[\s\n\t]/g, '');
        const potentialVins = cleanedText.match(/[A-HJ-NPR-Z0-9]{17}/gi) || [];
        const validOcrVin = potentialVins.find((v) => validateVIN(v));

        if (validOcrVin) {
          return await handleSuccess(validOcrVin.toUpperCase());
        }
      }

      alert("No valid 17-digit VIN found in that image. Try again or enter manually.");
      setIsProcessing(false);
    } catch (error) {
      console.error("OCR Scan aborted:", error);
      setIsProcessing(false);
    }
  };

  const stopScanning = async () => {
    try {
      await BarcodeScanner.removeAllListeners();
      await BarcodeScanner.stopScan();
      
      // ✅ FIX: Safely restore background for cross-platform compatibility
      await BarcodeScanner.showBackground().catch(() => {});
    } catch (e) {}
    
    document.body.classList.remove('scanner-active');
    setIsScanning(false);
    isScanningRef.current = false;
    setTorchOn(false);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualVin.length === 17) handleSuccess(manualVin.toUpperCase());
  };

  return (
    <div className={`min-h-screen transition-all ${isScanning ? "bg-transparent" : "bg-slate-950 text-white"}`}>
      
      {/* Global Navigation Overlay */}
      <div className="fixed top-0 left-0 w-full z-[70] p-6 pt-safe flex justify-between items-center pointer-events-none">
        <button 
          onClick={() => isScanning ? stopScanning() : navigate(-1)}
          className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/5 text-white pointer-events-auto active:scale-90 shadow-lg"
        >
          <ArrowLeftIcon className="w-6 h-6 stroke-[2.5px]" />
        </button>

        {isScanning && (
          <button 
            onClick={toggleTorch}
            className={`p-3 rounded-2xl border border-white/5 pointer-events-auto transition-all shadow-lg ${torchOn ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white'}`}
          >
            {torchOn ? <BoltIcon className="w-6 h-6" /> : <BoltSlashIcon className="w-6 h-6" />}
          </button>
        )}
      </div>

      {/* Full Screen Processing Spinner */}
      {isProcessing && (
        <div className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none">
           <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
           <p className="font-black uppercase tracking-widest text-blue-400 text-xs animate-pulse">{status}</p>
        </div>
      )}

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
          
          <div className="space-y-4 mb-8">
            <button
              onClick={startBarcodeScan}
              className="w-full bg-blue-600 py-6 rounded-[2rem] flex items-center justify-center gap-3 shadow-[0_8px_30px_rgba(37,99,235,0.3)] active:scale-95 transition-all"
            >
              <QrCodeIcon className="w-8 h-8" />
              <div className="text-left">
                <span className="block font-black uppercase tracking-widest text-sm leading-tight">Live Barcode</span>
                <span className="block text-[10px] text-blue-200 uppercase tracking-wider font-bold">Fastest for Door Jambs</span>
              </div>
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={startOcrScan}
                className="w-full bg-slate-800 py-4 rounded-3xl flex flex-col items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all"
              >
                <DocumentTextIcon className="w-6 h-6 text-slate-400" />
                <span className="font-bold uppercase tracking-widest text-[9px] text-slate-400 text-center">Scan Text<br/>(Dashboard)</span>
              </button>

              <button
                onClick={() => setShowManualEntry(true)}
                className="w-full bg-slate-800 py-4 rounded-3xl flex flex-col items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all"
              >
                <PencilIcon className="w-6 h-6 text-slate-400" />
                <span className="font-bold uppercase tracking-widest text-[9px] text-slate-400 text-center">Manual<br/>Entry</span>
              </button>
            </div>
          </div>

          {/* Enhanced History Component */}
          <div className="mt-auto">
            <ScanHistory history={history} onSelect={(item) => handleSuccess(item.vin)} />
          </div>
        </div>
      ) : (
        /* Native Scanner Viewport */
        <div className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-80 h-48 border-2 border-blue-500/80 rounded-[2.5rem] shadow-[0_0_0_9999px_rgba(2,6,23,0.85)] relative overflow-hidden">
             <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,1)] animate-[scan-move_2s_infinite]"></div>
             <div className="absolute inset-0 border-[3px] border-blue-400/30 rounded-[2.4rem]"></div>
          </div>
          <p className="mt-8 text-white/60 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Align Door Jamb Barcode</p>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in zoom-in-95">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black uppercase italic text-xl">Type <span className="text-blue-500">VIN</span></h3>
              <button onClick={() => setShowManualEntry(false)} className="text-slate-500 p-2 hover:bg-slate-800 rounded-full">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <input 
                autoFocus 
                maxLength={17} 
                placeholder="17-Digit VIN"
                value={manualVin} 
                onChange={(e) => setManualVin(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center font-mono text-xl tracking-widest text-blue-400 focus:border-blue-500 outline-none placeholder:text-slate-700"
              />
              <button 
                type="submit" disabled={manualVin.length !== 17}
                className="w-full bg-blue-600 disabled:bg-slate-800 disabled:text-slate-600 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-colors"
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