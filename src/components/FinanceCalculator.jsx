import React, { useState, useEffect, useCallback } from "react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const FinanceCalculator = ({ onUpdate, initialPrice = 35000 }) => {
  // ✅ FIX: Added interactivity so the salesman can adjust the deal live
  const [price, setPrice] = useState(initialPrice);
  const [down, setDown] = useState(5000);
  const [rate, setRate] = useState(4.99);
  const [term, setTerm] = useState(72);
  const [rollInFees, setRollInFees] = useState(true);

  const docFee = 499;
  const taxRate = 0.0925;

  const triggerHaptic = async () => {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
  };

  const calculatePayment = useCallback(() => {
    // ✅ FIX: Correct tax math (Tax on Price + Doc Fee, then add Doc Fee)
    const taxes = (price + docFee) * taxRate;
    const totalFees = taxes + docFee;

    const principal = rollInFees
      ? price + totalFees - down
      : price - down;

    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = term;

    if (principal <= 0) return "0.00";
    if (rate === 0) return (principal / numberOfPayments).toFixed(2);

    const payment =
      (principal * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -numberOfPayments));

    return payment.toFixed(2);
  }, [price, down, rate, term, rollInFees, taxRate, docFee]);

  const monthly = calculatePayment();

  useEffect(() => {
    // ✅ Debounced update to parent context
    const timeout = setTimeout(() => {
      onUpdate?.({ price, down, rate, term, monthly, rollInFees });
    }, 100);
    return () => clearTimeout(timeout);
  }, [monthly, onUpdate, price, down, rate, term, rollInFees]);

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl space-y-10 transition-colors">
      
      {/* 📊 Sliders for Real-time Desking */}
      <div className="space-y-8">
        <SliderItem label="Sale Price" value={price} min={5000} max={100000} step={500} onChange={setPrice} onInteract={triggerHaptic} />
        <SliderItem label="Down Payment" value={down} min={0} max={25000} step={250} onChange={setDown} onInteract={triggerHaptic} />
        <SliderItem label="Interest Rate (APR)" value={rate} min={0} max={25} step={0.1} isPercent onChange={setRate} onInteract={triggerHaptic} />
        
        {/* Term Selector */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          {[48, 60, 72, 84].map(t => (
            <button
              key={t}
              onClick={() => { triggerHaptic(); setTerm(t); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                term === t ? "bg-white dark:bg-slate-800 text-blue-600 shadow-md" : "text-slate-500"
              }`}
            >
              {t} MO
            </button>
          ))}
        </div>
      </div>

      {/* 🔄 Capitalization Toggle */}
      <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">Capitalize Fees?</h4>
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">
              Roll Taxes ({taxRate * 100}%) into loan
            </p>
          </div>

          <button
            onClick={() => { triggerHaptic(); setRollInFees(!rollInFees); }}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${
              rollInFees ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-800"
            }`}
          >
            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${rollInFees ? "translate-x-6" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      {/* 💰 The Money Shot */}
      <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-900/40 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-white/20" />
        <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.3em] mb-3">
          {rollInFees ? "Estimated All-In Payment" : "Base Payment (Excludes Taxes)"}
        </p>

        <div className="text-5xl font-black italic tracking-tighter">
          ${Number(monthly).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          <span className="text-xl text-blue-200 ml-1 font-bold">/mo</span>
        </div>

        {!rollInFees && (
          <p className="text-[9px] text-blue-200 mt-4 uppercase font-black tracking-widest">
            *Taxes and Docs due at signing
          </p>
        )}
      </div>
    </div>
  );
};

// --- Slider Component ---
const SliderItem = ({ label, value, min, max, step, isPercent, onChange, onInteract }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-end">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
      <div className="text-xl font-black italic text-slate-900 dark:text-white">
        {isPercent ? `${value}%` : `$${value.toLocaleString()}`}
      </div>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => { onInteract(); onChange(Number(e.target.value)); }}
      className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600"
    />
  </div>
);

export default FinanceCalculator;