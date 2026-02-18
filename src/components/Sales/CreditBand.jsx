import React from 'react';
import { ShieldCheck, AlertCircle, Info } from 'lucide-react';

const CreditBand = ({ range }) => {
  // Logic to determine color and label based on range
  const getBandDetails = (scoreRange) => {
    if (!scoreRange) return { color: 'text-slate-500', bg: 'bg-slate-800', label: 'Not Verified' };
    
    const lowEnd = parseInt(scoreRange.split('-')[0]);
    if (lowEnd >= 700) return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Tier 1 / Prime' };
    if (lowEnd >= 620) return { color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Tier 2 / Near-Prime' };
    return { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Tier 3 / Subprime' };
  };

  const { color, bg, label } = getBandDetails(range);

  return (
    <div className={`p-4 rounded-2xl border border-slate-700 ${bg} transition-all`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Qualification Status</span>
        <ShieldCheck className={color} size={18} />
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className={`text-xl font-bold ${color}`}>{label}</h3>
        <span className="text-slate-400 text-sm">{range || '---'}</span>
      </div>
      
      <div className="mt-4 h-2 w-full bg-slate-700 rounded-full overflow-hidden flex">
        <div className="h-full w-1/3 bg-red-500/40" />
        <div className="h-full w-1/3 bg-yellow-500/40" />
        <div className="h-full w-1/3 bg-emerald-500/40" />
      </div>
    </div>
  );
};

export default CreditBand;