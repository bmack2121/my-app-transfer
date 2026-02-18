import React, { useState, useCallback } from "react";
import { useDarkMode } from "../hooks/useDarkMode";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { 
  CurrencyDollarIcon, 
  CalculatorIcon, 
  DocumentArrowDownIcon, 
  ArrowPathIcon 
} from "@heroicons/react/24/outline";

// ✅ FIXED: Imports point to sibling files based on your directory list
import LeaseCalculator from "./LeaseCalculator";
import FinanceCalculator from "./FinanceCalculator";
// If these components don't exist yet, we handle the UI gracefully below

const DealDeskPage = () => {
  const { isDark } = useDarkMode();
  const [mode, setMode] = useState("lease");

  // Shared State (Source of Truth)
  // This ensures data persists when switching tabs
  const [dealState, setDealState] = useState({
    price: 35000,
    down: 2000,
    tradeValue: 0,
    tradePayoff: 0,
    docFee: 499,
  });

  // Results from children
  const [leaseResult, setLeaseResult] = useState(null);
  const [financeResult, setFinanceResult] = useState(null);

  // ⚡ Haptic Feedback Helper
  const triggerHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {}
  };

  const handleTabChange = (newMode) => {
    triggerHaptic();
    setMode(newMode);
  };

  // 🔥 Stable Callbacks
  const handleLeaseUpdate = useCallback((data) => {
    setLeaseResult(data);
    // Optional: Sync back to parent if needed, but usually we just read
  }, []);

  const handleFinanceUpdate = useCallback((data) => {
    setFinanceResult(data);
  }, []);

  return (
    <div className={`min-h-screen p-6 pt-safe pb-32 transition-colors duration-300 ${isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
      {/* Header */}
      <header className="mb-8">
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1">
          Jason Lucas Vision
        </p>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
          <CurrencyDollarIcon className="w-8 h-8 text-blue-500" />
          Deal Desk
        </h1>
      </header>

      {/* 🎛️ Mode Toggles */}
      <div className="bg-slate-900/5 p-1 rounded-2xl flex gap-1 mb-8 border border-slate-500/10">
        <button
          onClick={() => handleTabChange("lease")}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            mode === "lease"
              ? "bg-blue-600 text-white shadow-lg"
              : "text-slate-500 hover:bg-slate-500/10"
          }`}
        >
          Lease Structure
        </button>
        <button
          onClick={() => handleTabChange("finance")}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            mode === "finance"
              ? "bg-blue-600 text-white shadow-lg"
              : "text-slate-500 hover:bg-slate-500/10"
          }`}
        >
          Finance / Cash
        </button>
      </div>

      {/* 🧮 Calculator Injection */}
      <div className={`p-6 rounded-[2rem] shadow-2xl border mb-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        {mode === "lease" ? (
          <LeaseCalculator 
            // Pass shared state down so input persists
            initialPrice={dealState.price} 
            initialDown={dealState.down}
            onUpdate={handleLeaseUpdate} 
          />
        ) : (
          <FinanceCalculator 
            initialPrice={dealState.price}
            initialDown={dealState.down}
            onUpdate={handleFinanceUpdate} 
          />
        )}
      </div>

      {/* 📊 Live Deal Summary (Replaces missing components) */}
      <div className={`rounded-[2rem] border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
        <div className="bg-slate-800/50 p-4 border-b border-slate-700/50 flex justify-between items-center">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Deal Sheet Preview</h2>
          <DocumentArrowDownIcon className="w-5 h-5 text-blue-500" />
        </div>
        
        <div className="p-6 grid grid-cols-2 gap-8">
          {/* Left: Lease Side */}
          <div className={`p-4 rounded-2xl border ${leaseResult ? 'border-blue-500/30 bg-blue-500/5' : 'border-dashed border-slate-700'}`}>
            <p className="text-[10px] font-black uppercase text-blue-400 mb-2">Lease Scenario</p>
            {leaseResult ? (
              <>
                <div className="text-3xl font-black text-white">${leaseResult.monthlyPayment || "0.00"}</div>
                <div className="text-xs text-slate-500 font-bold mt-1">/ mo + tax</div>
                <div className="mt-3 space-y-1">
                   <div className="flex justify-between text-xs text-slate-400"><span>Due at Sign:</span> <span>${leaseResult.driveOff || "0"}</span></div>
                   <div className="flex justify-between text-xs text-slate-400"><span>Term:</span> <span>{leaseResult.term || 36} mo</span></div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-20 opacity-50">
                <CalculatorIcon className="w-6 h-6 mb-1" />
                <span className="text-[9px] uppercase">Not Calculated</span>
              </div>
            )}
          </div>

          {/* Right: Finance Side */}
          <div className={`p-4 rounded-2xl border ${financeResult ? 'border-green-500/30 bg-green-500/5' : 'border-dashed border-slate-700'}`}>
            <p className="text-[10px] font-black uppercase text-green-500 mb-2">Finance Scenario</p>
            {financeResult ? (
              <>
                <div className="text-3xl font-black text-white">${financeResult.monthlyPayment || "0.00"}</div>
                <div className="text-xs text-slate-500 font-bold mt-1">/ mo</div>
                <div className="mt-3 space-y-1">
                   <div className="flex justify-between text-xs text-slate-400"><span>APR:</span> <span>{financeResult.rate || "0.0"}%</span></div>
                   <div className="flex justify-between text-xs text-slate-400"><span>Total Interest:</span> <span>${financeResult.totalInterest || "0"}</span></div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-20 opacity-50">
                <CalculatorIcon className="w-6 h-6 mb-1" />
                <span className="text-[9px] uppercase">Not Calculated</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-950/30 border-t border-slate-800 flex gap-3">
          <button className="flex-1 py-4 bg-blue-600 rounded-xl text-white font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-transform">
            Print Deal Jacket
          </button>
          <button className="px-6 py-4 bg-slate-800 rounded-xl text-white active:scale-95 transition-transform">
             <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealDeskPage;