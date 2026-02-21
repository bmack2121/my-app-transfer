import React from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { ChevronRightIcon, ClockIcon } from "@heroicons/react/24/outline";

const ScanHistory = ({ history, onSelect }) => {
  // ✅ Added Array check to prevent .map crashes if localStorage returns corrupted data
  if (!history || !Array.isArray(history) || history.length === 0) return null;

  const handleItemClick = async (vin) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Non-native fallback
    }
    if (onSelect) onSelect(vin);
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
          const isString = typeof item === 'string';
          const vin = isString ? item : item.vin;
          
          // Handle missing NHTSA data gracefully so it doesn't say "... Unknown"
          const hasMake = !isString && item.make && item.make !== "Unknown";
          const displayYear = !isString && item.year !== "..." ? item.year : "";
          const displayLabel = hasMake ? `${displayYear} ${item.make}`.trim() : "Unit Scan";
          
          const subLabel = !isString && item.model && item.model !== "Vehicle" 
            ? item.model 
            : "Vehicle Acquisition";
            
          const dateStr = !isString && item.timestamp ? item.timestamp : null;
          const date = dateStr ? new Date(dateStr) : null;
          
          // Guarantee unique key to prevent React render glitches
          const itemKey = isString ? `${vin}-${index}` : `${vin}-${item.timestamp}-${index}`;

          return (
            <div
              key={itemKey}
              onClick={() => handleItemClick(vin)}
              className="bg-slate-900/40 border border-slate-800 p-4 rounded-[1.5rem] flex justify-between items-center active:scale-[0.97] transition-all cursor-pointer hover:border-blue-500/30 group"
            >
              <div className="flex flex-col overflow-hidden mr-4">
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-0.5">
                  {displayLabel}
                </span>
                
                {/* Added truncate to prevent long model names from breaking layout */}
                <span className="text-sm font-black text-slate-200 uppercase italic tracking-tight truncate">
                  {subLabel}
                </span>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-mono text-[10px] text-slate-500 tracking-wider">
                    {vin}
                  </span>
                  
                  {date && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-slate-800 shrink-0" />
                      <span className="text-[8px] text-slate-600 font-bold uppercase shrink-0">
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="bg-slate-800 p-2 rounded-xl group-hover:bg-blue-600 transition-colors shrink-0">
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