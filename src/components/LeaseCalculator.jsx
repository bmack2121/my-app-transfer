import React, { useState, useCallback, useEffect } from 'react';
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const LeaseCalculator = ({ initialMsrp = 35000, onUpdate }) => {
  // Financial State
  const [msrp, setMsrp] = useState(initialMsrp);
  const [down, setDown] = useState(2500);
  const [tradeEquity, setTradeEquity] = useState(0);
  const [term, setTerm] = useState(36);
  
  // Fixed Rates (These could eventually be moved to a settings context)
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

    // 1. Calculate Residual Value
    const residualValue = safeMsrp * safeResidual;

    // 2. Net Capitalized Cost
    const netCapCost = (safeMsrp + Number(acqFee) + Number(docFee)) - safeDown - safeTrade;

    // 3. Depreciation (Monthly)
    const depreciation = Math.max(0, (netCapCost - residualValue) / term);

    // 4. Rent Charge (Interest)
    const financeCharge = (netCapCost + residualValue) * moneyFactor;

    // 5. Total Monthly Payment (Base + Tax)
    const basePayment = depreciation + financeCharge;
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
      onUpdate?.({ monthly, dueAtSigning, msrp, term });
    }, 150); 
    return () => clearTimeout(timeout);
  }, [monthly, dueAtSigning, msrp, term, onUpdate]);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl max-w-4xl mx-auto transition-colors duration-500">
      
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
            Desk The <span className="text-indigo-600">Deal</span>
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Lease Configurator</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => { setMsrp(initialMsrp); setDown(2500); triggerHaptic(); }}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left: Input Controls */}
        <div className="space-y-10">
          <SliderGroup label="Vehicle MSRP" value={msrp} min={15000} max={120000} step={500} onChange={setMsrp} onInteract={triggerHaptic} />
          <SliderGroup label="Cash Down" value={down} min={0} max={15000} step={250} onChange={setDown} onInteract={triggerHaptic} />
          <SliderGroup label="Trade Equity" value={tradeEquity} min={0} max={15000} step={250} onChange={setTradeEquity} onInteract={triggerHaptic} />

          <div className="bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-[1.5rem] flex gap-1">
            {[24, 36, 48].map((t) => (
              <button
                key={t}
                onClick={() => { triggerHaptic(); setTerm(t); }}
                className={`flex-1 py-4 rounded-xl text-[10px] font-black transition-all ${
                  term === t ? "bg-white dark:bg-slate-700 shadow-lg text-indigo-600" : "text-slate-500"
                }`}
              >
                {t} MONTHS
              </button>
            ))}
          </div>
        </div>

        {/* Right: Payment Dashboard */}
        <div className="space-y-6">
          <div className="relative p-10 bg-slate-950 rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
            
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-4">Estimated Monthly</p>
            
            <div className="flex items-baseline gap-2">
              <span className="text-7xl font-black text-white tracking-tighter">${monthly}</span>
              <span className="text-slate-600 font-bold text-xl">/mo</span>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-800 flex justify-between items-end">
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Due At Signing</p>
                <p className="text-3xl font-black text-white tracking-tighter">${dueAtSigning}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Residual Value</p>
                <p className="text-sm font-black text-slate-400">${Number(residualAmount).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Monthly Tax ({taxRate}%)</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">${tax}</p>
             </div>
             <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Effective APR</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{(moneyFactor * 2400).toFixed(2)}%</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---
const SliderGroup = ({ label, value, min, max, step, onChange, onInteract }) => (
  <div className="group space-y-4">
    <div className="flex justify-between items-end px-1">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
      <div className="text-lg font-black text-slate-900 dark:text-white">${Number(value).toLocaleString()}</div>
    </div>
    <div className="relative flex items-center">
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => { onInteract(); onChange(Number(e.target.value)); }}
          className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
    </div>
  </div>
);

export default LeaseCalculator;