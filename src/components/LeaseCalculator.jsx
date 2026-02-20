import React, { useState, useCallback, useEffect } from 'react';
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const LeaseCalculator = ({ initialMsrp = 35000, onUpdate }) => {
  // Financial State
  const [msrp, setMsrp] = useState(initialMsrp);
  const [down, setDown] = useState(2500);
  const [tradeEquity, setTradeEquity] = useState(0);
  const [term, setTerm] = useState(36);
  
  // Fixed Rates
  const [residual] = useState(60); 
  const [moneyFactor] = useState(0.0025);
  const [acqFee] = useState(695);
  const [docFee] = useState(499);
  const [taxRate] = useState(7);

  const triggerHaptic = async () => {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
  };

  const calculateFinance = useCallback(() => {
    const safeMsrp = Number(msrp) || 0;
    const safeDown = Number(down) || 0;
    const safeTrade = Number(tradeEquity) || 0;
    const safeResidual = Number(residual) / 100;
    const safeTax = Number(taxRate) / 100;

    // 1. Calculate Residual Value (Fixed at inception)
    const residualValue = safeMsrp * safeResidual;

    // 2. Net Capitalized Cost
    // ✅ FIX: Added Math.max(0, ...) to prevent negative Cap Cost if trade equity is massive
    const grossCapCost = safeMsrp + Number(acqFee) + Number(docFee);
    const netCapCost = Math.max(residualValue, grossCapCost - safeDown - safeTrade);

    // 3. Depreciation (Monthly)
    const depreciation = (netCapCost - residualValue) / term;

    // 4. Rent Charge (Interest) - Formula: (Cap Cost + Residual) * Money Factor
    const financeCharge = (netCapCost + residualValue) * moneyFactor;

    // 5. Total Monthly Payment (Base + Tax)
    const basePayment = Math.max(0, depreciation + financeCharge);
    const taxAmount = basePayment * safeTax;
    const totalMonthly = basePayment + taxAmount;

    // 6. Due At Signing (Standard: 1st Payment + Cash Down)
    const totalDriveOff = safeDown + totalMonthly;

    return {
      monthly: totalMonthly.toFixed(2),
      tax: taxAmount.toFixed(2),
      dueAtSigning: totalDriveOff.toFixed(2),
      residualAmount: residualValue.toFixed(0),
    };
  }, [msrp, down, tradeEquity, term, residual, moneyFactor, taxRate, acqFee, docFee]);

  const { monthly, dueAtSigning, residualAmount, tax } = calculateFinance();

  useEffect(() => {
    const timeout = setTimeout(() => {
      onUpdate?.({ 
        monthly, 
        dueAtSigning, 
        msrp: Number(msrp), 
        term: Number(term),
        tradeEquity: Number(tradeEquity)
      });
    }, 150); 
    return () => clearTimeout(timeout);
  }, [monthly, dueAtSigning, msrp, term, tradeEquity, onUpdate]);

  return (
    <div className="bg-white dark:bg-slate-950 p-6 md:p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl max-w-5xl mx-auto transition-all duration-500">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
            Desk The <span className="text-blue-600">Deal</span>
          </h3>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
             Lease Intelligence Active
          </p>
        </div>
        
        <button 
          onClick={() => { setMsrp(initialMsrp); setDown(2500); setTradeEquity(0); triggerHaptic(); }}
          className="px-6 py-3 bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-blue-500 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all border border-transparent hover:border-blue-500/30"
        >
          Reset Pencil
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left: Input Controls (Span 7) */}
        <div className="lg:col-span-7 space-y-12">
          <SliderGroup label="Vehicle MSRP" value={msrp} min={15000} max={120000} step={500} onChange={setMsrp} onInteract={triggerHaptic} />
          <SliderGroup label="Cash Down" value={down} min={0} max={15000} step={250} onChange={setDown} onInteract={triggerHaptic} />
          <SliderGroup label="Trade Equity" value={tradeEquity} min={0} max={25000} step={500} onChange={setTradeEquity} onInteract={triggerHaptic} />

          <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded-[2rem] flex gap-2 border border-slate-200 dark:border-slate-800">
            {[24, 36, 48].map((t) => (
              <button
                key={t}
                onClick={() => { triggerHaptic(); setTerm(t); }}
                className={`flex-1 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                  term === t 
                  ? "bg-white dark:bg-slate-800 shadow-xl text-blue-500 scale-[1.02] border border-blue-500/20" 
                  : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {t} Mo
              </button>
            ))}
          </div>
        </div>

        {/* Right: Payment Dashboard (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative p-10 bg-slate-900 dark:bg-black rounded-[3.5rem] border border-slate-800 shadow-3xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
            
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6 opacity-80">Estimated Monthly</p>
            
            <div className="flex items-baseline gap-2">
              <span className="text-7xl font-black text-white tracking-tighter">${Math.floor(monthly)}</span>
              <span className="text-slate-600 font-bold text-2xl">.{monthly.split('.')[1]}</span>
            </div>

            <div className="mt-12 pt-10 border-t border-slate-800/50 flex justify-between items-end">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Due At Signing</p>
                <p className="text-4xl font-black text-white tracking-tighter">${Number(dueAtSigning).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Residual</p>
                <p className="text-sm font-black text-slate-400 font-mono">${Number(residualAmount).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-2">Monthly Tax ({taxRate}%)</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">${tax}</p>
             </div>
             <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-2">Effective APR</p>
                <p className="text-lg font-black text-blue-500">{(moneyFactor * 2400).toFixed(2)}%</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---
const SliderGroup = ({ label, value, min, max, step, onChange, onInteract }) => (
  <div className="group space-y-5">
    <div className="flex justify-between items-end px-2">
      <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</label>
      <div className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter">${Number(value).toLocaleString()}</div>
    </div>
    <div className="relative flex items-center px-1">
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => { onInteract(); onChange(Number(e.target.value)); }}
          className="w-full h-3 bg-slate-200 dark:bg-slate-900 rounded-full appearance-none cursor-pointer accent-blue-600 transition-all"
        />
    </div>
  </div>
);

export default LeaseCalculator;