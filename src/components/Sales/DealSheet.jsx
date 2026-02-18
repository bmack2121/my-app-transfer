import React, { useState, useMemo } from 'react';
import { ArrowRight, CheckCircle2, TrendingDown, Landmark, Share2 } from 'lucide-react';
import { hapticImpactMedium, hapticSuccess } from '../../utils/haptics';
import { shareEBrochure } from '../../utils/shareDeal'; // Added for Step 5

const DealSheet = ({ customer, vehicle, vehiclePrice, tradeValue, creditTier }) => {
  const [downPayment, setDownPayment] = useState(2500);
  const [term, setTerm] = useState(60);
  const [isCommitted, setIsCommitted] = useState(false);

  // Dynamic APR based on Credit Tier
  const apr = useMemo(() => {
    switch (creditTier) {
      case 'Prime': return 5.49;
      case 'Near-Prime': return 9.99;
      case 'Subprime': return 17.99;
      default: return 7.99;
    }
  }, [creditTier]);

  // Financial Math Engine
  const monthlyPayment = useMemo(() => {
    const principal = vehiclePrice - tradeValue - downPayment;
    if (principal <= 0) return 0;
    
    const monthlyRate = (apr / 100) / 12;
    
    // ✅ FIX: Handle 0% Interest scenarios to avoid NaN errors
    if (monthlyRate === 0) return principal / term;
    
    return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
  }, [vehiclePrice, tradeValue, downPayment, term, apr]);

  const handleCommit = async () => {
    await hapticSuccess();
    setIsCommitted(true);
    // Logic to update backend status to 'pending_manager' would go here
  };

  const handleShare = async () => {
    await hapticSuccess();
    // Passing data to our Step 5 Utility
    await shareEBrochure(customer, vehicle, {
      monthlyPayment,
      downPayment,
      termMonths: term
    });
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-[3rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-3xl font-black text-white">The Deal</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">VINPRO DESK ENGINE v2.0</p>
        </div>
        <div className="bg-blue-600/20 px-4 py-2 rounded-2xl border border-blue-500/30">
          <span className="text-blue-400 text-xs font-black uppercase tracking-widest">{creditTier || 'Tier 2'}</span>
        </div>
      </div>

      {/* 4-Square Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem]">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Trade ACV</p>
          <p className="text-2xl font-black text-white">${tradeValue.toLocaleString()}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem]">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Selling Price</p>
          <p className="text-2xl font-black text-white">${vehiclePrice.toLocaleString()}</p>
        </div>

        {/* Down Payment Slider */}
        <div className="bg-blue-600/5 border-2 border-blue-500/20 p-6 rounded-[2rem]">
          <div className="flex justify-between items-center mb-1">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Down Payment</p>
            <TrendingDown size={14} className="text-blue-500" />
          </div>
          <p className="text-3xl font-black text-white mb-4">${downPayment.toLocaleString()}</p>
          <input 
            type="range" min="0" max="20000" step="500"
            value={downPayment}
            onChange={(e) => { hapticImpactMedium(); setDownPayment(parseInt(e.target.value)); }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Payment Result */}
        <div className="bg-emerald-600/5 border-2 border-emerald-500/20 p-6 rounded-[2rem] text-center">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Monthly</p>
          <p className="text-4xl font-black text-white">${Math.round(monthlyPayment)}</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Landmark size={10} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase">{term} MO @ {apr}%</span>
          </div>
        </div>
      </div>

      {/* Term Selector */}
      <div className="flex bg-slate-900 p-1.5 rounded-2xl mb-10 border border-slate-800">
        {[36, 48, 60, 72].map((t) => (
          <button
            key={t}
            onClick={() => { hapticImpactMedium(); setTerm(t); }}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${
              term === t ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t} MO
          </button>
        ))}
      </div>

      {/* Main Action */}
      {!isCommitted ? (
        <button
          onClick={handleCommit}
          className="group w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-xl shadow-blue-900/40 transition-all active:scale-95"
        >
          I AGREE TO THESE TERMS
          <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
        </button>
      ) : (
        <div className="space-y-4">
          <div className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 animate-in fade-in zoom-in">
            <CheckCircle2 size={24} />
            SENT TO MANAGER
          </div>
          
          {/* Digital Handshake (Step 5) */}
          <button
            onClick={handleShare}
            className="w-full py-4 bg-slate-900 border border-slate-800 rounded-2xl text-blue-400 font-black text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
          >
            <Share2 size={16} />
            SEND DIGITAL BROCHURE TO CUSTOMER
          </button>
        </div>
      )}

      <p className="text-center text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-6 leading-relaxed">
        * Estimated payments based on ${apr}% APR.<br/>Subject to lender approval & verification.
      </p>
    </div>
  );
};

export default DealSheet;