import React from "react";
import { X, Zap, ZapOff } from "lucide-react";

const VinScannerOverlay = ({
  onClose,
  onToggleFlash,
  flashEnabled,
  status,
}) => {
  return (
    /* ✅ Important: The root must be transparent so the camera (behind the webview) is visible */
    <div className="fixed inset-0 z-[9999] bg-transparent flex flex-col pointer-events-none">
      
      {/* Top Bar (Interactive - needs pointer-events-auto) */}
      <div className="flex items-center justify-between px-6 pt-12 pb-6 pointer-events-auto bg-slate-950/60 backdrop-blur-sm">
        <button
          onClick={onClose}
          className="p-3 rounded-full bg-slate-800/80 border border-slate-700 text-white active:scale-95 transition-all"
        >
          <X size={20} />
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Scanner Active</span>
          <span className="text-blue-400 text-[10px] animate-pulse">Waiting for VIN...</span>
        </div>

        <button
          onClick={onToggleFlash}
          className={`p-3 rounded-full border transition-all active:scale-95 ${
            flashEnabled 
              ? "bg-yellow-500 border-yellow-400 text-slate-950" 
              : "bg-slate-800/80 border-slate-700 text-white"
          }`}
        >
          {flashEnabled ? <ZapOff size={20} /> : <Zap size={20} />}
        </button>
      </div>

      {/* 🎯 Scanner Viewfinder Section */}
      <div className="flex-1 relative flex items-center justify-center px-8">
        {/* The "Cut-out" effect: darkens the area around the scanner box */}
        <div className="absolute inset-0 bg-slate-950/40" />
        
        <div className="relative w-full aspect-[16/9] max-w-md border-2 border-blue-500/50 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.3)]">
          {/* Transparent area where the camera feed shows through */}
          <div className="absolute inset-0 bg-transparent" />

          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-blue-500 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-blue-500 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />

          {/* Animated Laser Line */}
          <div className="absolute inset-x-0 w-full h-1 bg-red-500/80 shadow-[0_0_15px_rgba(239,44,44,0.8)] animate-scanline" />
        </div>
      </div>

      {/* Bottom Status Panel */}
      <div className="bg-slate-950/80 backdrop-blur-md pt-6 pb-12 px-8 pointer-events-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Status</p>
          <p className="text-white text-sm font-medium">{status || "Align VIN barcode within frame"}</p>
        </div>
      </div>

      {/* Tailwind Laser Animation Definition */}
      <style>{`
        @keyframes scanline {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .animate-scanline {
          position: absolute;
          animation: scanline 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default VinScannerOverlay;