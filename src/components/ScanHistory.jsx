import React from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const ScanHistory = ({ history, onSelect }) => {
  if (!history || history.length === 0) return null;

  const handleItemClick = (vin) => {
    Haptics.impact({ style: ImpactStyle.Light });
    onSelect(vin);
  };

  return (
    <div className="mt-8">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
        Recent Scans
      </h3>
      <div className="space-y-3">
        {history.map((item, index) => (
          <div
            key={index}
            onClick={() => handleItemClick(item.vin)}
            className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex justify-between items-center active:scale-[0.98] transition-all cursor-pointer"
          >
            <div>
              <p className="font-mono text-blue-400 font-bold tracking-tighter">
                {item.vin}
              </p>
              <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">
                {new Date(item.date).toLocaleDateString()} @ {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <span className="text-slate-700 text-xs">➡️</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScanHistory;