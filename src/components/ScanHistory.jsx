import React from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { ChevronRightIcon, ClockIcon } from "@heroicons/react/24/outline";

const ScanHistory = ({ history, onSelect }) => {
  if (!history || history.length === 0) return null;

  const handleItemClick = async (vin) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Non-native fallback
    }
    onSelect(vin);
  };

  return (
    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-4 px-1">
        <ClockIcon className="w-3 h-3 text-slate-500" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          Recent Lot Activity
        </h3>
      </div>

      <div className="space-y-3">
        {history.map((item, index) => {
          // ✅ Support both old string history and new object history
          const vin = typeof item === 'string' ? item : item.vin;
          const displayLabel = item.make ? `${item.year} ${item.make}` : "Unit Scan";
          const subLabel = item.model ? item.model : "Vehicle Acquisition";
          const date = item.timestamp ? new Date(item.timestamp) : new Date();

          return (
            <div
              key={index}
              onClick={() => handleItemClick(vin)}
              className="bg-slate-900/40 border border-slate-800 p-4 rounded-[1.5rem] flex justify-between items-center active:scale-[0.97] transition-all cursor-pointer hover:border-blue-500/30 group"
            >
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-0.5">
                  {displayLabel}
                </span>
                <span className="text-sm font-black text-slate-200 uppercase italic tracking-tight">
                  {subLabel}
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-mono text-[10px] text-slate-500 tracking-wider">
                    {vin}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-slate-800" />
                  <span className="text-[8px] text-slate-600 font-bold uppercase">
                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              
              <div className="bg-slate-800 p-2 rounded-xl group-hover:bg-blue-600 transition-colors">
                <ChevronRightIcon className="w-4 h-4 text-white" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScanHistory;