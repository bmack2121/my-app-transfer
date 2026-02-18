import React, { useState, useCallback, useEffect } from 'react';
import { hapticLight } from "../utils/haptics";

const LeaseCalculator = ({ initialMsrp = 35000, onUpdate }) => {
  // Financial State
  const [msrp, setMsrp] = useState(initialMsrp);
  const [down, setDown] = useState(2500);
  const [tradeEquity, setTradeEquity] = useState(0);
  const [term, setTerm] = useState(36);
  
  // Fixed Rates
  const [residual] = useState(60); 
  const [moneyFactor] = useState(0.0025);

  // Fees & Tax State
  const [acqFee] = useState(695);
  const [docFee] = useState(499);
  const [taxRate] = useState(7);

  // Calculation Logic
  const calculateFinance = useCallback(() => {
    const safeMsrp = Number(msrp) || 0;
    const safeDown = Number(down) || 0;
    const safeTrade = Number(tradeEquity) || 0;
    const safeResidual = Number(residual) / 100;
    const safeTax = Number(taxRate) / 100;

    // 1. Calculate Residual Value (Vehicle worth at end of lease)
    const residualValue = safeMsrp * safeResidual;

    // 2. Net Capitalized Cost (The total amount being financed)
    const netCapCost = (safeMsrp + Number(acqFee) + Number(docFee)) - safeDown - safeTrade;

    // 3. Depreciation (Monthly loss of value)
    const depreciation = Math.max(0, (netCapCost - residualValue) / term);

    // 4. Rent Charge (Interest) = (Net Cap + Residual) * Money Factor
    const financeCharge = (netCapCost + residualValue) * moneyFactor;

    // 5. Total Monthly Payment (Base + Tax)
    const basePayment = depreciation + financeCharge;
    const totalMonthly = basePayment * (1 + safeTax);

    // 6. Drive Off (Due at Signing)
    const totalDriveOff = safeDown + totalMonthly;

    return {
      monthly: totalMonthly.toFixed(2),
      dueAtSigning: totalDriveOff.toFixed(2),
      residualAmount: residualValue.toFixed(0),
    };
  }, [msrp, down, tradeEquity, term, residual, moneyFactor, taxRate, acqFee, docFee]);

  const { monthly, dueAtSigning, residualAmount } = calculateFinance();

  // Sync with parent context (VinPro Dashboard)
  useEffect(() => {
    const timeout = setTimeout(() => {
      onUpdate?.({ monthly, dueAtSigning, msrp, term });
    }, 300); // Debounce update to prevent lag during slider movement
    return () => clearTimeout(timeout);
  }, [monthly, dueAtSigning, msrp, term, onUpdate]);

  const handleImpact = () => hapticLight();

  return (
    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl max-w-4xl mx-auto">
      
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
            Desk The <span className="text-indigo-500">Deal</span>
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lease Configurator</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => { setMsrp(initialMsrp); setDown(2500); handleImpact(); }}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-xs font-black uppercase tracking-wider"
          >
            Reset
          </button>
          <button className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all">
            Lock Deal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left: Input Controls */}
        <div className="space-y-8">
          <SliderGroup label="Vehicle MSRP" value={msrp} min={15000} max={120000} step={500} onChange={setMsrp} onInteract={handleImpact} />
          <SliderGroup label="Cash Down" value={down} min={0} max={15000} step={250} onChange={setDown} onInteract={handleImpact} />
          <SliderGroup label="Trade Equity" value={tradeEquity} min={0} max={15000} step={250} onChange={setTradeEquity} onInteract={handleImpact} />

          {/* Lease Term Tabs */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl flex gap-1">
            {[24, 36, 48].map((t) => (
              <button
                key={t}
                onClick={() => { handleImpact(); setTerm(t); }}
                className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${
                  term === t ? "bg-white dark:bg-slate-700 shadow-md text-indigo-600" : "text-slate-400"
                }`}
              >
                {t} MONTHS
              </button>
            ))}
          </div>
        </div>

        {/* Right: Payment Dashboard */}
        <div className="space-y-6">
          <div className="relative p-10 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden group">
            {/* Payment Aura */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 blur-[100px] pointer-events-none"></div>

            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-3">Est. Payment</p>
            
            <div className="flex items-baseline gap-1">
              <span className="text-7xl font-black text-white tracking-tighter">${monthly}</span>
              <span className="text-slate-500 font-bold text-lg">/mo</span>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 flex justify-between">
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Due At Signing</p>
                <p className="text-2xl font-black text-white">${dueAtSigning}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Residual Value</p>
                <p className="text-sm font-bold text-slate-400">${Number(residualAmount).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="text-center p-4">
             <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-relaxed">
              *Tier 1 Credit (740+) Required. <br/> Excludes Tax, Title, & License Fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

const SliderGroup = ({ label, value, min, max, step, onChange, onInteract }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-end px-1">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
      <div className="text-sm font-black text-slate-900 dark:text-indigo-400">${Number(value).toLocaleString()}</div>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => { onInteract(); onChange(Number(e.target.value)); }}
      className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
    />
  </div>
);

export default LeaseCalculator;