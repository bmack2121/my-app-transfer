import React, { useState, useEffect, useCallback } from "react";
import { CalculatorIcon, ArrowPathIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const LeaseCalculator = ({ initialPrice = 0, initialDown = 0, onUpdate }) => {
  const [msrp, setMsrp] = useState(initialPrice);
  const [downPayment, setDownPayment] = useState(initialDown);
  const [residual, setResidual] = useState(58); 
  const [moneyFactor, setMoneyFactor] = useState(0.00250); 
  const [term, setTerm] = useState(36);
  const [payment, setPayment] = useState(0);

  // ✅ FIXED: Wrapped in useCallback to prevent infinite loops when passed to useEffect
  const calculateLease = useCallback(() => {
    const capCost = Number(msrp) || 0;
    const capReduction = Number(downPayment) || 0;
    const netCapCost = capCost - capReduction;
    
    const residPct = Number(residual) / 100;
    const residualValue = capCost * residPct;
    
    // Monthly Depreciation: (Net Cap Cost - Residual) / Term
    const depreciation = (netCapCost - residualValue) / Number(term);
    
    // Monthly Rent Charge: (Net Cap Cost + Residual) * Money Factor
    const rentCharge = (netCapCost + residualValue) * Number(moneyFactor);
    
    const totalMonthly = depreciation + rentCharge;
    const finalPayment = totalMonthly > 0 ? totalMonthly.toFixed(2) : "0.00";
    
    setPayment(finalPayment);

    if (onUpdate) {
      onUpdate({
        monthlyPayment: finalPayment,
        driveOff: (capReduction + Number(finalPayment)).toFixed(2),
        term,
        msrp: capCost,
        residualValue: residualValue.toFixed(2)
      });
    }
  }, [msrp, downPayment, residual, moneyFactor, term, onUpdate]);

  useEffect(() => {
    calculateLease();
  }, [calculateLease]);

  const triggerHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {}
  };

  const handleReset = () => {
    triggerHaptic();
    setMsrp(initialPrice);
    setDownPayment(0);
    setResidual(58);
    setMoneyFactor(0.00250);
    setTerm(36);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl transition-colors duration-300">
      <div className="max-w-xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
              <CalculatorIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                Quick<span className="text-blue-600">Lease</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Professional Desking Tool
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-blue-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 📟 Main Payment Display */}
        <div className="mb-10 p-8 bg-slate-950 rounded-[2rem] border border-slate-800 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2">Estimated Monthly</p>
          <h2 className="text-6xl font-black text-white tracking-tighter">
            <span className="text-2xl align-top mt-2 inline-block mr-1 text-slate-500">$</span>
            {payment}
          </h2>
        </div>

        {/* Calculator Inputs */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup 
              label="Vehicle MSRP" 
              value={msrp} 
              setValue={setMsrp} 
              prefix="$"
            />
             <InputGroup 
              label="Cash Down" 
              value={downPayment} 
              setValue={setDownPayment} 
              prefix="$"
            />
          </div>
           
          <div className="grid grid-cols-2 gap-6">
            <InputGroup 
              label="Residual %" 
              value={residual} 
              setValue={setResidual} 
              suffix="%"
            />
            <InputGroup 
              label="Term (Months)" 
              value={term} 
              setValue={setTerm} 
            />
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-200 dark:border-slate-800">
            <InputGroup 
              label="Money Factor" 
              value={moneyFactor} 
              setValue={setMoneyFactor} 
              step="0.00001"
              placeholder="0.00250"
            />
            <div className="flex justify-between items-center mt-4 px-1">
               <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                Interest Rate Equiv.
              </p>
              <p className="text-sm font-black text-blue-500">
                {(moneyFactor * 2400).toFixed(2)}% APR
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, placeholder, value, setValue, prefix, suffix, step }) => (
  <div className="flex flex-col">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
      {label}
    </label>
    <div className="relative group">
      {prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">{prefix}</span>}
      <input
        type="number"
        step={step}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all ${prefix ? 'pl-8' : 'pl-5'} ${suffix ? 'pr-10' : 'pr-5'}`}
      />
      {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">{suffix}</span>}
    </div>
  </div>
);

export default LeaseCalculator;