import React, { useState, useEffect } from "react";
import { CalculatorIcon, ArrowPathIcon, BanknotesIcon } from "@heroicons/react/24/outline";
// ✅ FIXED: Using direct Capacitor Haptics to match the rest of the project
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const LeaseCalculator = ({ initialPrice = 0, initialDown = 0, onUpdate }) => {
  // Initialize state with props from the parent Deal Desk
  const [msrp, setMsrp] = useState(initialPrice);
  const [downPayment, setDownPayment] = useState(initialDown);
  const [residual, setResidual] = useState(58); // Standard 36mo residual
  const [moneyFactor, setMoneyFactor] = useState(0.00250); // ~6% APR equivalent
  const [term, setTerm] = useState(36);
  const [payment, setPayment] = useState(0);

  // 🧮 Real-time Calculation Effect
  useEffect(() => {
    const calculateLease = () => {
      const capCost = Number(msrp) || 0;
      const capReduction = Number(downPayment) || 0;
      
      // Net Cap Cost (Adjusted for down payment)
      const netCapCost = capCost - capReduction;
      
      const residPct = Number(residual) / 100;
      const residualValue = capCost * residPct;
      
      // Monthly Depreciation
      const depreciation = (netCapCost - residualValue) / Number(term);
      
      // Monthly Rent Charge (Money Factor)
      const rentCharge = (netCapCost + residualValue) * Number(moneyFactor);
      
      const totalMonthly = depreciation + rentCharge;
      
      const finalPayment = totalMonthly > 0 ? totalMonthly.toFixed(2) : "0.00";
      
      setPayment(finalPayment);

      // 📡 Send data back to Parent (DealDeskPage)
      if (onUpdate) {
        onUpdate({
          monthlyPayment: finalPayment,
          driveOff: (capReduction + totalMonthly).toFixed(2), // Simple drive-off logic
          term: term,
          msrp: capCost,
          residualValue: residualValue.toFixed(2)
        });
      }
    };

    calculateLease();
  }, [msrp, downPayment, residual, moneyFactor, term, onUpdate]);

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
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl transition-colors duration-300">
      <div className="max-w-xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              <CalculatorIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                Quick<span className="text-blue-500">Lease</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Money Factor Calculator
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-blue-500 transition-colors bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Calculator Inputs */}
        <div className="space-y-6">
          
          {/* Row 1: Vehicle Price & Down Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup 
              label="Vehicle MSRP" 
              value={msrp} 
              setValue={setMsrp} 
              prefix="$"
              icon={BanknotesIcon}
            />
             <InputGroup 
              label="Cash Down" 
              value={downPayment} 
              setValue={setDownPayment} 
              prefix="$"
              icon={BanknotesIcon}
            />
          </div>
           
          {/* Row 2: Residual & Term */}
          <div className="grid grid-cols-2 gap-4">
            <InputGroup 
              label="Residual %" 
              value={residual} 
              setValue={setResidual} 
              suffix="%"
            />
            <InputGroup 
              label="Term" 
              value={term} 
              setValue={setTerm} 
              suffix="Mo"
            />
          </div>

          {/* Row 3: Money Factor */}
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <InputGroup 
              label="Money Factor" 
              value={moneyFactor} 
              setValue={setMoneyFactor} 
              step="0.00001"
              placeholder="0.00250"
            />
            <p className="text-[10px] text-slate-400 mt-2 font-bold text-right uppercase tracking-wider">
              ≈ {(moneyFactor * 2400).toFixed(2)}% APR
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

// Reusable Input Component
const InputGroup = ({ label, placeholder, value, setValue, prefix, suffix, step }) => (
  <div>
    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
      {label}
    </label>
    <div className="relative group">
      {prefix && (
        <span className="absolute left-4 top-3.5 text-slate-400 font-bold text-sm z-10">
          {prefix}
        </span>
      )}
      <input
        type="number"
        step={step}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm ${prefix ? 'pl-8' : 'pl-4'} ${suffix ? 'pr-10' : 'pr-4'}`}
      />
      {suffix && (
        <span className="absolute right-4 top-3.5 text-slate-400 font-bold text-sm">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

export default LeaseCalculator;