import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarcodeScanner, BarcodeFormat } from "@capacitor-mlkit/barcode-scanning";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import * as OCRPlugin from '@pantrist/capacitor-plugin-ml-kit-text-recognition';
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  XMarkIcon, 
  QrCodeIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import ScanHistory from "../components/ScanHistory";

// VIN Validation logic remains the same...
const validateVIN = (vin) => {
  if (!vin) return false;
  let v = vin.toUpperCase().trim().replace(/I/g, '1').replace(/[OQ]/g, '0');
  if (v.length !== 17) return false;
  const map = { A:1, B:2, C:3, D:4, E:5, F:6, G:7, H:8, J:1, K:2, L:3, M:4, N:5, P:7, R:9, S:2, T:3, U:4, V:5, W:6, X:7, Y:8, Z:9, "0":0, "1":1, "2":2, "3":3, "4":4, "5":5, "6":6, "7":7, "8":8, "9":9 };
  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 17; i++) { if (i !== 8) { const val = map[v[i]]; if (val === undefined) return false; sum += val * weights[i]; } }
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
  const [isScanning, setIsScanning] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("vin_history") || "[]");
    setHistory(saved);
    
    // ✅ PRE-INSTALL SCANNER MODULE
    // This ensures the engine is ready before the user clicks "Scan"
    BarcodeScanner.isGoogleBarcodeScannerModuleAvailable().then((res) => {
      if (!res.available) BarcodeScanner.installGoogleBarcodeScannerModule();
    });
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
      console.error(e);
      navigate(`/vin-result/${vin}`); // Navigate anyway to show partial data
    } finally {
      setIsProcessing(false);
    }
  };

  // 📸 SCAN MODE 1: Hardened Barcode Scan
  const startBarcodeScan = async () => {
    try {
      // 1. Explicitly request permissions before doing anything else
      const permReq = await BarcodeScanner.requestPermissions();
      if (permReq.camera !== 'granted') {
        alert("Camera permission is required for the VIN Scanner.");
        return;
      }

      // 2. Hide WebView backgrounds
      setIsScanning(true);
      document.body.classList.add('barcode-scanner-active');
      
      // 3. Start scanning with specific constraints
      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.Code128, BarcodeFormat.Code39, BarcodeFormat.DataMatrix],
      });

      // 4. Immediate Cleanup
      document.body.classList.remove('barcode-scanner-active');
      setIsScanning(false);

      if (barcodes && barcodes.length > 0) {
        const rawVin = (barcodes[0].displayValue || barcodes[0].rawValue || "").toUpperCase();
        const vin = rawVin.length > 17 ? rawVin.slice(-17) : rawVin;
        
        if (validateVIN(vin)) {
          handleSuccess(vin);
        } else {
          alert(`Invalid VIN: ${vin}`);
        }
      }
    } catch (err) {
      document.body.classList.remove('barcode-scanner-active');
      setIsScanning(false);
      console.error("Scanner error:", err);
    }
  };

  const startOcrScan = async () => {
    try {
      const req = await Camera.requestPermissions();
      if (req.camera !== 'granted') return;

      const image = await Camera.getPhoto({
        quality: 90,
        source: CameraSource.Camera,
        resultType: CameraResultType.Base64,
      });

      if (!image?.base64String) return;

      setIsProcessing(true);
      setStatus("Analyzing Image Text...");

      const TextRecognition = Object.values(OCRPlugin).find(v => v && typeof v.detectText === 'function');
      if (TextRecognition) {
        const ocrResult = await TextRecognition.detectText({ base64Image: image.base64String });
        if (ocrResult?.text) {
          const potentialVins = ocrResult.text.replace(/[\s\n\t]/g, '').match(/[A-HJ-NPR-Z0-9]{17}/gi) || [];
          const validOcrVin = potentialVins.find((v) => validateVIN(v));
          if (validOcrVin) return handleSuccess(validOcrVin.toUpperCase());
        }
      }
      alert("No valid VIN found.");
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`min-h-screen ${isScanning ? 'bg-transparent' : 'bg-slate-950'} text-white overflow-hidden`}>
      
      {/* HUD Overlay - Only visible when NOT scanning */}
      {!isScanning && (
        <div className="p-8 pt-32 flex flex-col h-full">
          <header className="mb-10">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
              VIN<span className="text-blue-600">PRO</span>
            </h1>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-2">
              Lot Acquisition Interface
            </p>
          </header>
          
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
      )}

      {/* Close Button for Scanner (Visible only when scanning) */}
      {isScanning && (
        <div className="fixed bottom-10 left-0 w-full flex justify-center z-[100]">
          <button 
            onClick={() => {
              BarcodeScanner.stopScan();
              document.body.classList.remove('barcode-scanner-active');
              setIsScanning(false);
            }}
            className="bg-rose-600 p-4 rounded-full shadow-2xl"
          >
            <XMarkIcon className="w-8 h-8 text-white" />
          </button>
        </div>
      )}

      {/* Processing and Manual Entry UI... */}
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
            <form onSubmit={(e) => { e.preventDefault(); handleSuccess(manualVin); }} className="space-y-6">
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