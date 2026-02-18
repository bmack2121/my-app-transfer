import React from "react";
import { 
  FaCar, 
  FaUserCircle, 
  FaFileInvoiceDollar, 
  FaCheckCircle, 
  FaExclamationTriangle 
} from "react-icons/fa";

const RecentActivity = ({ activity }) => {
  // Mapping categories to specific Pro-Metal icons and colors
  const getCategoryMeta = (category, level) => {
    switch (category) {
      case "INVENTORY": return { icon: <FaCar />, color: "text-blue-400", bg: "bg-blue-400/10" };
      case "CUSTOMER": return { icon: <FaUserCircle />, color: "text-purple-400", bg: "bg-purple-400/10" };
      case "FINANCE": return { icon: <FaFileInvoiceDollar />, color: "text-app-success", bg: "bg-emerald-400/10" };
      case "DEAL": return { icon: <FaCheckCircle />, color: "text-app-accent", bg: "bg-app-accent/10" };
      default: return { icon: <FaExclamationTriangle />, color: "text-slate-400", bg: "bg-slate-400/10" };
    }
  };

  return (
    <div className="space-y-4">
      {(!Array.isArray(activity) || activity.length === 0) ? (
        <div className="py-10 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
            No live lot signals detected
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {activity.map((item) => {
            const meta = getCategoryMeta(item.category, item.level);
            
            return (
              <li
                key={item._id}
                className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-app-border"
              >
                {/* 🛡️ Category Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm ${meta.bg} ${meta.color} shrink-0 shadow-sm`}>
                  {meta.icon}
                </div>

                {/* 📝 Activity Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                    {item.message}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                      {item.user?.name || "System"}
                    </span>
                    <span className="text-slate-700">•</span>
                    <span className="text-[9px] font-bold text-slate-500">
                      {item.relativeTime || "Just now"}
                    </span>
                  </div>
                </div>

                {/* 🏷️ Severity Level */}
                {item.level === 'critical' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-performance animate-pulse shadow-[0_0_8px_rgba(255,59,48,0.6)]" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default RecentActivity;