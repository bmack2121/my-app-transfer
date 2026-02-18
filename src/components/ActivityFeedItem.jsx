import React from 'react';
import { 
  UserIcon, 
  TruckIcon, 
  BanknotesIcon, 
  InformationCircleIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

const ActivityFeedItem = ({ activity }) => {
  // 🎨 Border and background based on 'level'
  const levelStyles = {
    info: "border-blue-500 bg-blue-500/5",
    success: "border-emerald-500 bg-emerald-500/5",
    warning: "border-orange-500 bg-orange-500/5",
    critical: "border-rose-500 bg-rose-500/5",
  };

  // 🛠️ Icons based on 'category'
  const categoryIcons = {
    CUSTOMER: UserIcon,
    INVENTORY: TruckIcon,
    DEAL: BanknotesIcon,
    SYSTEM: InformationCircleIcon,
    TASK: CheckBadgeIcon,
    FINANCE: BanknotesIcon
  };

  const Icon = categoryIcons[activity.category] || InformationCircleIcon;
  
  // Dynamic text coloring for the type label
  const typeColor = activity.level === 'critical' ? 'text-rose-500' : 
                    activity.level === 'success' ? 'text-emerald-500' : 
                    activity.level === 'warning' ? 'text-orange-500' : 'text-blue-500';

  return (
    <div className={`flex items-center gap-4 p-4 rounded-3xl border-l-4 shadow-sm transition-all hover:bg-slate-800/40 ${levelStyles[activity.level || 'info']} border-y border-r border-slate-800/50`}>
      
      {/* Icon Wrapper */}
      <div className={`p-3 rounded-2xl bg-slate-950 border border-slate-800 ${typeColor}`}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">
            {activity.category} • <span className={typeColor}>{activity.type?.replace(/_/g, ' ')}</span>
          </p>
          <span className="text-[9px] font-bold text-slate-600 uppercase ml-2 whitespace-nowrap">
            {activity.relativeTime}
          </span>
        </div>
        
        <p className="text-sm font-bold text-slate-200 truncate pr-2">
          {activity.message}
        </p>
        
        <p className="text-[10px] font-medium text-slate-500 mt-0.5">
          By <span className="text-slate-400 font-bold">{activity.user?.name || 'System'}</span>
        </p>
      </div>

      {/* Mini Thumbnail (If Inventory related) */}
      {activity.inventory?.photo && (
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-700 flex-shrink-0">
          <img src={activity.inventory.photo} alt="unit" className="w-full h-full object-cover opacity-60" />
        </div>
      )}
    </div>
  );
};

export default ActivityFeedItem;