import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FaShieldAlt } from "react-icons/fa";

// ✅ Safe haptics wrapper
import { hapticError } from "../utils/haptics";

const Unauthorized = () => {
  // 📳 Physical alert when hitting a restricted zone
  useEffect(() => {
    hapticError(); // 🔵 Safe browser‑friendly haptic
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center bg-app-bg">
      <div className="mb-6 relative">
        {/* Animated Glow Shield */}
        <div className="absolute inset-0 bg-performance/20 blur-3xl rounded-full animate-pulse" />
        <FaShieldAlt className="text-7xl text-performance relative z-10" />
      </div>

      <header className="space-y-2 mb-8 relative z-10">
        <p className="text-[10px] font-black text-performance uppercase tracking-[0.4em]">
          Security Breach Blocked
        </p>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">
          Access <span className="text-performance">Denied</span>
        </h1>
        <p className="max-w-xs mx-auto text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
          Your current credentials do not have the required "Master Auth" level to view this sector.
        </p>
      </header>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          to="/dashboard"
          className="bg-pro-metal text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-pro hover:shadow-glow transition-all active:scale-95"
        >
          Return to Dashboard
        </Link>

        <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">
          Event logged: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;