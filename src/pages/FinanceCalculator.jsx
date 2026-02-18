import React, { useState, useEffect } from "react";
import { CalculatorIcon, ArrowPathIcon, BanknotesIcon, CalendarDaysIcon, ReceiptPercentIcon } from "@heroicons/react/24/outline";
// ✅ FIXED: Direct Capacitor Haptics
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const FinanceCalculator = ({ initialPrice = 0, initialDown = 0, onUpdate }) => {
  // Initialize with props from Deal Desk so data persists
  const [price, setPrice] = useState(initialPrice);
  const [downPayment, setDownPayment] = useState(initialDown);
  const [rate, setRate] = useState(6.99); // Default APR
  const [term, setTerm] = useState(60);   // Default 60 months

  // 🧮 Real-time Amortization Effect
  useEffect(() => {
    const calculateFinance = () => {
      const principal = Number(price) - Number(downPayment);
      const monthlyRate = Number(rate) / 100 / 12;
      const numberOfPayments = Number(term);

      let monthly = 0;
      let totalInterest = 0;

      if (principal > 0 && numberOfPayments > 0) {
        if (Number(rate) === 0) {
          // 0% APR Logic
          monthly = principal / numberOfPayments;
        } else {
          // Standard Amortization Formula
          // P * (r(1+r)^n) / ((1+r)^n - 1)
          const x = Math.pow(1 + monthlyRate, numberOfPayments);
          monthly = (principal * x * monthlyRate) / (x - 1);
        }
        
        totalInterest = (monthly * numberOfPayments) - principal;
      }

      const finalPayment = monthly > 0 ? monthly.toFixed(2) : "0.00";

      // 📡 Send data back to Parent (DealDeskPage)
      if (onUpdate) {
        onUpdate({
          monthlyPayment: finalPayment,
          totalInterest: totalInterest > 0 ? totalInterest.toFixed(2) : "0.00",
          rate: rate,
          term: term,
          price: price,
          principal: principal.toFixed(2)
        });
      }
    };

    calculateFinance();
  }, [price, downPayment, rate, term, onUpdate]);

  const triggerHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {}
  };

  const handleReset = () => {
    triggerHaptic();
    setPrice(initialPrice);
    setDownPayment(0);
    setRate(6.99);
    setTerm(60);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl transition-colors duration-300">
      <div className="max-w-xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-600 rounded-xl shadow-[0_0_15px_rgba(22,163,74,0.3)]">
              <CalculatorIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                Quick<span className="text-green-600">Finance</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Traditional Auto Loan
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-green-600 transition-colors bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Calculator Inputs */}
        <div className="space-y-6">
          
          {/* Row 1: Vehicle Price & Down Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup 
              label="Vehicle Price" 
              value={price} 
              setValue={setPrice} 
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
           
          {/* Row 2: Interest Rate & Term */}
          <div className="grid grid-cols-2 gap-4">
            <InputGroup 
              label="APR %" 
              value={rate} 
              setValue={setRate} 
              suffix="%"
              step="0.1"
              icon={ReceiptPercentIcon}
            />
            <InputGroup 
              label="Term" 
              value={term} 
              setValue={setTerm} 
              suffix="Mo"
              icon={CalendarDaysIcon}
            />
          </div>

          {/* Quick Term Selectors */}
          <div className="grid grid-cols-4 gap-2">
            {[36, 48, 60, 72].map((t) => (
              <button
                key={t}
                onClick={() => { triggerHaptic(); setTerm(t); }}
                className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                  term === t 
                    ? "bg-green-600 text-white shadow-lg" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {t} Mo
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};

// Reusable Input Component (Matches LeaseCalculator style)
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
        className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all shadow-sm ${prefix ? 'pl-8' : 'pl-4'} ${suffix ? 'pr-10' : 'pr-4'}`}
      />
      {suffix && (
        <span className="absolute right-4 top-3.5 text-slate-400 font-bold text-sm">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

export default FinanceCalculator;