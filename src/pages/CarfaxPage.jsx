import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDarkMode } from "../hooks/useDarkMode";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { 
  DocumentMagnifyingGlassIcon, 
  ArrowTopRightOnSquareIcon, 
  ShieldCheckIcon,
  QrCodeIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

const CarfaxPage = () => {
  const { isDark } = useDarkMode();
  const location = useLocation();
  const [scannedVin, setScannedVin] = useState("");

  useEffect(() => {
    // Check if a VIN was passed through navigation state from the scanner
    if (location.state?.vin) {
      setScannedVin(location.state.vin);
    }
  }, [location]);

  const handleOpenCarfax = async (url) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
      // Force open in system browser (Chrome/Safari) to handle Carfax login cookies correctly
      window.open(url, '_system');
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  const clearVin = async () => {
    await Haptics.impact({ style: ImpactStyle.Light });
    setScannedVin("");
  };

  // Generate the direct Carfax report URL (or default to login)
  const carfaxUrl = scannedVin 
    ? `https://www.carfaxonline.com/vhr/vin/${scannedVin}` // Updated to standard deep link pattern
    : "https://www.carfaxonline.com";

  return (
    <div className={`min-h-screen p-6 pt-safe pb-32 transition-colors duration-300 ${isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
      
      {/* 👑 Header */}
      <header className="mb-10 flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1">
            Vehicle History
          </p>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
            <DocumentMagnifyingGlassIcon className="w-8 h-8 text-blue-500" />
            Carfax<span className="text-slate-500 text-lg align-top">®</span> Integration
          </h1>
        </div>
      </header>

      {/* 🚨 Active VIN Action Card */}
      {scannedVin ? (
        <div className="bg-blue-600 rounded-[2.5rem] p-8 shadow-[0_10px_40px_-10px_rgba(37,99,235,0.5)] mb-10 relative overflow-hidden">
          {/* Background Decorative Icon */}
          <QrCodeIcon className="absolute -right-6 -bottom-6 w-48 h-48 text-blue-500 opacity-20 rotate-12" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
               <h2 className="text-xs font-black text-blue-200 uppercase tracking-widest border border-blue-400/30 px-3 py-1 rounded-full">
                Active Scan Detected
              </h2>
              <button onClick={clearVin} className="bg-blue-800/50 p-2 rounded-full hover:bg-blue-700 transition-colors">
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>
           
            <p className="text-4xl font-black font-mono tracking-widest text-white mb-6 break-all">
              {scannedVin}
            </p>

            <button
              onClick={() => handleOpenCarfax(carfaxUrl)}
              className="w-full bg-white text-blue-600 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              Run Report Now
              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        /* Manual Input Fallback */
        <div className={`p-6 rounded-[2rem] border mb-10 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">
            Manual VIN Entry
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Enter 17-Digit VIN"
              className={`flex-1 bg-transparent border-b-2 font-mono text-xl py-2 outline-none uppercase placeholder-slate-600 ${isDark ? "border-slate-700 text-white focus:border-blue-500" : "border-slate-300 text-slate-900 focus:border-blue-500"}`}
              onChange={(e) => setScannedVin(e.target.value.toUpperCase())}
            />
          </div>
        </div>
      )}

      {/* 🔐 Dealer Access Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <button
          onClick={() => handleOpenCarfax("https://www.carfaxonline.com")}
          className={`p-6 rounded-[2rem] border text-left group transition-all active:scale-[0.98] ${isDark ? "bg-slate-900 border-slate-800 hover:border-blue-500/50" : "bg-white border-slate-200 hover:border-blue-400"}`}
        >
          <h3 className="text-lg font-black uppercase italic mb-1 group-hover:text-blue-500 transition-colors">Dealer Login</h3>
          <p className="text-xs text-slate-500 font-medium">Access your dashboard to view bulk reports.</p>
        </button>

        <button
          onClick={() => handleOpenCarfax("https://www.carfaxonline.com/signup")}
          className={`p-6 rounded-[2rem] border text-left group transition-all active:scale-[0.98] ${isDark ? "bg-slate-900 border-slate-800 hover:border-blue-500/50" : "bg-white border-slate-200 hover:border-blue-400"}`}
        >
          <h3 className="text-lg font-black uppercase italic mb-1 group-hover:text-blue-500 transition-colors">Register Store</h3>
          <p className="text-xs text-slate-500 font-medium">Set up a new rooftop account.</p>
        </button>
      </div>

      {/* ℹ️ Info Section */}
      <div className={`p-6 rounded-[2rem] border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <h2 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
          <ShieldCheckIcon className="w-5 h-5 text-green-500" />
          Pro Integration Guide
        </h2>
        <ul className="space-y-3 opacity-80 text-sm">
          <li className="flex gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
            <span>Scan VINs at the trade-in walkaround to catch accident history immediately.</span>
          </li>
          <li className="flex gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
            <span>Screenshots of reports can be attached to the Deal Jacket in the Deal Desk.</span>
          </li>
          <li className="flex gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
            <span><strong>Security:</strong> VinPro does not store your Carfax credentials. All sessions happen securely on Carfax.com.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CarfaxPage;