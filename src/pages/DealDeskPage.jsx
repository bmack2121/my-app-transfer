import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../hooks/useDarkMode";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { 
  CurrencyDollarIcon, 
  CalculatorIcon, 
  DocumentArrowDownIcon, 
  ArrowPathIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

// ✅ Components from sibling files
import LeaseCalculator from "./LeaseCalculator";
import FinanceCalculator from "./FinanceCalculator";

const DealDeskPage = () => {
  const { isDark } = useDarkMode();
  const navigate = useNavigate();
  const [mode, setMode] = useState("lease");

  // 1. Source of Truth for the "Pencil"
  const [dealState, setDealState] = useState({
    price: 38500, // Pulled from vehicle data in production
    down: 3500,
    tradeValue: 0,
    tradePayoff: 0,
    docFee: 499,
  });

  // 2. Results synced from the specialized calculators
  const [leaseResult, setLeaseResult] = useState(null);
  const [financeResult, setFinanceResult] = useState(null);

  const triggerHaptic = async (style = ImpactStyle.Light) => {
    try { await Haptics.impact({ style }); } catch (e) {}
  };

  const handleTabChange = (newMode) => {
    triggerHaptic(ImpactStyle.Medium);
    setMode(newMode);
  };

  // 🔥 Stable Callbacks to prevent infinite loops from the calculator's useEffect
  const handleLeaseUpdate = useCallback((data) => {
    setLeaseResult(data);
  }, []);

  const handleFinanceUpdate = useCallback((data) => {
    setFinanceResult(data);
  }, []);

  return (
    <div className={`min-h-screen p-6 pt-safe pb-32 transition-colors duration-300 ${isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
      
      {/* Header */}
      <header className="mb-8 flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1">
            VinPro Desking Engine
          </p>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-3">
            <CurrencyDollarIcon className="w-10 h-10 text-blue-500" />
            Deal Desk
          </h1>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[9px] font-black uppercase text-emerald-500">Tower Connected</span>
          </div>
        </div>
      </header>

      {/* 🎛️ Mode Toggles (Lease vs Finance) */}
      <div className="bg-slate-900/5 dark:bg-slate-900 p-1.5 rounded-3xl flex gap-1 mb-10 border border-slate-500/10 shadow-inner">
        <button
          onClick={() => handleTabChange("lease")}
          className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
            mode === "lease"
              ? "bg-blue-600 text-white shadow-xl scale-[1.02]"
              : "text-slate-500 hover:bg-slate-500/10"
          }`}
        >
          Lease Option
        </button>
        <button
          onClick={() => handleTabChange("finance")}
          className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
            mode === "finance"
              ? "bg-blue-600 text-white shadow-xl scale-[1.02]"
              : "text-slate-500 hover:bg-slate-500/10"
          }`}
        >
          Finance / Cash
        </button>
      </div>

      {/* 🧮 Calculator Injection */}
      <div className="mb-10 animate-in fade-in zoom-in-95 duration-500">
        {mode === "lease" ? (
          <LeaseCalculator 
            initialMsrp={dealState.price} 
            onUpdate={handleLeaseUpdate} 
          />
        ) : (
          <FinanceCalculator 
            initialPrice={dealState.price}
            onUpdate={handleFinanceUpdate} 
          />
        )}
      </div>

      {/* 📊 Deal Summary Preview */}
      <div className={`rounded-[2.5rem] border overflow-hidden shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="bg-slate-800/30 p-5 border-b border-slate-700/50 flex justify-between items-center">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Side-by-Side Pencil</h2>
          <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Lease Summary */}
          <div className={`p-6 rounded-3xl border transition-all ${leaseResult ? 'border-blue-500/40 bg-blue-500/5' : 'border-dashed border-slate-800'}`}>
            <p className="text-[9px] font-black uppercase text-blue-500 mb-4 tracking-widest">Lease Terms</p>
            {leaseResult ? (
              <div className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black italic tracking-tighter text-white">${leaseResult.monthly}</span>
                  <span className="text-xs text-slate-500 font-bold uppercase">/mo</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                   <div>
                     <p className="text-[8px] font-bold text-slate-600 uppercase">Drive Off</p>
                     <p className="text-sm font-black text-slate-300">${Number(leaseResult.dueAtSigning).toLocaleString()}</p>
                   </div>
                   <div>
                     <p className="text-[8px] font-bold text-slate-600 uppercase">Residual</p>
                     <p className="text-sm font-black text-slate-300">${Number(leaseResult.residualAmount).toLocaleString()}</p>
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-24 opacity-20">
                <CalculatorIcon className="w-8 h-8 mb-2" />
                <span className="text-[8px] uppercase font-black">Waiting for Data</span>
              </div>
            )}
          </div>

          {/* Finance Summary */}
          <div className={`p-6 rounded-3xl border transition-all ${financeResult ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-dashed border-slate-800'}`}>
            <p className="text-[9px] font-black uppercase text-indigo-500 mb-4 tracking-widest">Finance Terms</p>
            {financeResult ? (
              <div className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black italic tracking-tighter text-white">${financeResult.monthly}</span>
                  <span className="text-xs text-slate-500 font-bold uppercase">/mo</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                   <div>
                     <p className="text-[8px] font-bold text-slate-600 uppercase">Rate (APR)</p>
                     <p className="text-sm font-black text-indigo-400">{financeResult.rate}%</p>
                   </div>
                   <div>
                     <p className="text-[8px] font-bold text-slate-600 uppercase">Loan Term</p>
                     <p className="text-sm font-black text-slate-300">{financeResult.term} Months</p>
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-24 opacity-20">
                <CalculatorIcon className="w-8 h-8 mb-2" />
                <span className="text-[8px] uppercase font-black">Waiting for Data</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex gap-4">
          <button 
            onClick={() => { triggerHaptic(ImpactStyle.Heavy); }}
            className="flex-1 py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            Submit to Manager Tower
          </button>
          <button 
            onClick={() => { triggerHaptic(); window.location.reload(); }}
            className="px-6 py-5 bg-slate-800 hover:bg-slate-700 rounded-2xl text-white active:scale-95 transition-all border border-slate-700"
          >
             <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealDeskPage;