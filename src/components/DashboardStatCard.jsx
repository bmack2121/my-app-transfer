import React from 'react';

const DashboardStatCard = ({ title, value, icon: Icon, trend, color, suffix }) => {
  // Mapping colors to VinPro's dark theme palette
  const colorMap = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    slate: "text-slate-400 bg-slate-400/10 border-slate-400/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    rose: "text-rose-500 bg-rose-500/10 border-rose-500/20"
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group hover:border-blue-500/40 transition-all">
      {/* Background Icon Glow */}
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="w-24 h-24" />
      </div>

      <div className={`p-3 rounded-2xl w-fit mb-4 border ${selectedColor}`}>
        <Icon className="w-6 h-6" />
      </div>

      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
        {title}
      </p>

      <div className="flex items-baseline gap-1">
        <h3 className="text-3xl font-black text-white italic tracking-tighter">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
        {suffix && <span className="text-xs font-bold text-slate-600 uppercase">{suffix}</span>}
      </div>

      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <span className="text-[9px] font-black text-emerald-500 uppercase">
            {trend}
          </span>
          <span className="text-[8px] font-bold text-slate-600 uppercase italic">vs Yesterday</span>
        </div>
      )}
    </div>
  );
};

export default DashboardStatCard;