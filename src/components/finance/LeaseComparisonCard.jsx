import React from 'react';

const LeaseComparisonCard = ({ options, activeTerm, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2 bg-app-bg rounded-vin">
      {options.map((opt) => (
        <div 
          key={opt.term}
          onClick={() => onSelect(opt.term)}
          className={`relative overflow-hidden p-6 rounded-xl2 transition-all cursor-pointer border-2 ${
            activeTerm === opt.term 
              ? 'bg-pro-metal border-app-accent shadow-glow' 
              : 'bg-app-surface border-app-border opacity-70 scale-95 hover:opacity-100'
          }`}
        >
          {/* Badge for the typical 36-month "Sweet Spot" */}
          {opt.term === 36 && (
            <div className="absolute -right-8 top-4 rotate-45 bg-app-success text-[8px] font-black px-10 py-1 text-white uppercase tracking-tighter">
              Best Value
            </div>
          )}

          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              {opt.term} Month Term
            </p>
            <h3 className="text-3xl font-black text-white mb-4">
              <span className="text-app-accent font-medium text-lg">$</span>
              {opt.monthlyPayment}
              <span className="text-slate-500 text-xs">/mo</span>
            </h3>
          </div>

          <div className="space-y-3 border-t border-app-border pt-4">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold text-slate-500 uppercase">Residual</span>
              <span className="text-xs font-mono text-slate-300">${opt.residualValue.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold text-slate-500 uppercase">Rent Charge</span>
              <span className="text-xs font-mono text-slate-300">${opt.totalInterest.toLocaleString()}</span>
            </div>

            {/* Visual Progress: Residual vs Total Cost */}
            <div className="w-full h-1 bg-app-border rounded-full mt-2">
              <div 
                className="h-full bg-app-accent rounded-full" 
                style={{ width: `${(opt.residualValue / (opt.monthlyPayment * opt.term)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaseComparisonCard;