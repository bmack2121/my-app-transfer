import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarcodeScanner, BarcodeFormat } from "@capacitor-mlkit/barcode-scanning";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { CapacitorPluginMlKitTextRecognition as TextRecognition } from '@pantrist/capacitor-plugin-ml-kit-text-recognition';
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";
import { 
  PencilIcon, 
  XMarkIcon, 
  QrCodeIcon,
  DocumentTextIcon,
  ArrowLeftIcon 
} from "@heroicons/react/24/outline";
import ScanHistory from "../components/ScanHistory";

const validateVIN = (vin) => {
  if (!vin) return false;
  let v = vin.toUpperCase().trim().replace(/I/g, '1').replace(/[OQ]/g, '0');
  if (v.length !== 17) return false;
  const map = { A:1, B:2, C:3, D:4, E:5, F:6, G:7, H:8, J:1, K:2, L:3, M:4, N:5, P:7, R:9, S:2, T:3, U:4, V:5, W:6, X:7, Y:8, Z:9, "0":0, "1":1, "2":2, "3":3, "4":4, "5":5, "6":6, "7":7, "8":8, "9":9 };
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualVin, setManualVin] = useState("");
  const [history, setHistory] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("vin_history") || "[]");
    setHistory(saved);
    
    const initScanner = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const res = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
          if (!res.available) {
            await BarcodeScanner.installGoogleBarcodeScannerModule();
          }
        } catch (e) {
          console.warn("Scanner module check failed", e);
        }
      }
    };
    initScanner();
  }, []);

  const triggerHaptic = async (style = ImpactStyle.Light) => {
    try { await Haptics.impact({ style }); } catch (e) {}
  };

  const handleSuccess = async (vin) => {
    if (!vin) return;
    await triggerHaptic(ImpactStyle.Heavy);
    setIsProcessing(true);
    setStatus("Querying NHTSA Database...");
    
    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`);
      const vehicleData = (await response.json())?.Results?.[0] || {};
      
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
      
      navigate(`/vin-result/${vin}`);
    } catch (e) {
      console.error("NHTSA Error:", e);
      navigate(`/vin-result/${vin}`); 
    } finally {
      setIsProcessing(false);
    }
  };

  const startOcrScan = async () => {
    try {
      // 1. Permission Check
      if (Capacitor.isNativePlatform()) {
        const permissions = await Camera.checkPermissions();
        if (permissions.camera !== 'granted') {
          const request = await Camera.requestPermissions();
          if (request.camera !== 'granted') {
            alert("Camera permission denied.");
            return;
          }
        }
      }

      // 2. Open Camera
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        source: CameraSource.Camera,
        resultType: CameraResultType.Base64,
      });

      if (!image?.base64String) return;

      setIsProcessing(true);
      setStatus("Analyzing Image Text...");

      // 3. Process with OCR
      const ocrResult = await TextRecognition.detectText({ 
        base64Image: image.base64String 
      });
      
      if (ocrResult?.text) {
        // Look for 17-character alphanumeric strings
        const potentialVins = ocrResult.text.replace(/[\s\n\t]/g, '').match(/[A-HJ-NPR-Z0-9]{17}/gi) || [];
        const validOcrVin = potentialVins.find((v) => validateVIN(v));
        
        if (validOcrVin) {
          return handleSuccess(validOcrVin.toUpperCase());
        }
      }
      alert("No valid VIN detected in the image. Ensure the VIN is clear and well-lit.");
    } catch (error) {
      console.error("OCR Error:", error);
      // Alert ensures we see the error on the physical device
      alert(`OCR Error: ${error.message || "Failed to process image"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ... rest of component (Barcode Scan, Manual Submit, JSX) remains same ...

  const startBarcodeScan = async () => {
    try {
      const permReq = await BarcodeScanner.requestPermissions();
      if (permReq.camera !== 'granted') {
        alert("Camera permission required.");
        return;
      }
      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.Code128, BarcodeFormat.Code39, BarcodeFormat.DataMatrix],
      });
      if (barcodes && barcodes.length > 0) {
        const rawVin = (barcodes[0].displayValue || barcodes[0].rawValue || "").toUpperCase();
        const vin = rawVin.length > 17 ? rawVin.slice(-17) : rawVin;
        if (validateVIN(vin)) handleSuccess(vin);
        else alert(`Invalid VIN: ${vin}`);
      }
    } catch (err) {
      console.error("Scanner error:", err);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (validateVIN(manualVin)) {
      setShowManualEntry(false);
      handleSuccess(manualVin);
    } else alert("Invalid VIN Checksum");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="p-8 pt-24 flex flex-col h-full">
        <div className="flex items-center gap-5 mb-10">
          <button onClick={() => navigate(-1)} className="p-3 bg-slate-900 rounded-2xl border border-white/5 active:scale-90 shadow-lg shrink-0">
            <ArrowLeftIcon className="w-6 h-6 text-slate-300 stroke-[2px]" />
          </button>
          <header>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
              VIN<span className="text-blue-600">PRO</span>
            </h1>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-2">Lot Acquisition Interface</p>
          </header>
        </div>
        
        <div className="space-y-4 mb-8">
          <button onClick={startBarcodeScan} className="w-full bg-blue-600 py-6 rounded-[2rem] flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all">
            <QrCodeIcon className="w-8 h-8" />
            <div className="text-left">
              <span className="block font-black uppercase tracking-widest text-sm">Live Barcode</span>
              <span className="block text-[10px] text-blue-200 uppercase font-bold">Fastest for Door Jambs</span>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={startOcrScan} className="bg-slate-800 py-4 rounded-3xl flex flex-col items-center gap-2 border border-slate-700 active:scale-95 transition-all">
              <DocumentTextIcon className="w-6 h-6 text-slate-400" />
              <span className="font-bold uppercase tracking-widest text-[9px] text-slate-400">Scan Text</span>
            </button>
            <button onClick={() => { triggerHaptic(); setShowManualEntry(true); }} className="bg-slate-800 py-4 rounded-3xl flex flex-col items-center gap-2 border border-slate-700 active:scale-95 transition-all">
              <PencilIcon className="w-6 h-6 text-slate-400" />
              <span className="font-bold uppercase tracking-widest text-[9px] text-slate-400">Manual Entry</span>
            </button>
          </div>
        </div>

        <ScanHistory history={history} onSelect={(item) => handleSuccess(item.vin)} />
      </div>

      {isProcessing && (
        <div className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center">
           <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
           <p className="font-black uppercase tracking-widest text-blue-400 text-xs animate-pulse">{status}</p>
        </div>
      )}

      {showManualEntry && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black uppercase italic text-xl">Type <span className="text-blue-500">VIN</span></h3>
              <button onClick={() => setShowManualEntry(false)} className="text-slate-500 p-2"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <input 
                autoFocus maxLength={17} placeholder="17-Digit VIN"
                value={manualVin} onChange={(e) => setManualVin(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center font-mono text-xl text-blue-400 outline-none"
              />
              <button type="submit" disabled={manualVin.length !== 17} className="w-full bg-blue-600 disabled:bg-slate-800 py-4 rounded-2xl font-black uppercase text-xs">Decode Unit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VinScannerPage;