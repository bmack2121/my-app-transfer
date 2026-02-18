import React, { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { useDarkMode } from "../hooks/useDarkMode";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { 
  UsersIcon, 
  ShieldCheckIcon, 
  ServerIcon, 
  ArrowTrendingUpIcon, // ✅ FIXED: Correct name for Heroicons v2
  AdjustmentsHorizontalIcon 
} from "@heroicons/react/24/outline";

const AdminDashboard = () => {
  const { isDark } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    systemUptime: "99.9%",
    pendingApprovals: 0
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get("/admin/overview");
        if (res.data) {
          setAdminStats(prev => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error("Admin Portal Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const triggerHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      // Ignore haptic errors on web
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* 👑 Admin Header */}
      <header className="mb-10 flex justify-between items-start pt-safe">
        <div>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1">
            Command Center
          </p>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Admin <span className="text-blue-600">Control</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={triggerHaptic}
            className={`p-3 rounded-2xl border transition-all active:scale-95 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}
          >
            <AdjustmentsHorizontalIcon className="w-6 h-6 text-blue-500" />
          </button>
        </div>
      </header>

      {/* 📊 System High-Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Personnel", value: adminStats.totalUsers || 0, icon: UsersIcon, color: "text-blue-500" },
          { label: "Security Level", value: "Encrypted", icon: ShieldCheckIcon, color: "text-green-500" },
          { label: "Sync Status", value: adminStats.systemUptime || "Live", icon: ServerIcon, color: "text-purple-500" },
          { label: "Gross Volume", value: "+12.4%", icon: ArrowTrendingUpIcon, color: "text-amber-500" }, // ✅ Usage fixed here
        ].map((stat) => (
          <div key={stat.label} className={`p-5 rounded-[2rem] border shadow-xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-start mb-2">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
              <span className="text-[8px] font-black uppercase tracking-widest opacity-40">System Node</span>
            </div>
            <p className="text-2xl font-black tracking-tight">{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* 🛠️ Management Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-24">
        
        {/* User Permissions Table Placeholder */}
        <div className={`p-6 rounded-[2.5rem] border shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-black uppercase italic tracking-tighter text-lg">Staff Permissions</h2>
            <button 
              onClick={triggerHaptic}
              className="text-[10px] font-black uppercase tracking-widest bg-blue-600 px-4 py-2 rounded-full text-white active:bg-blue-700 transition-colors"
            >
              Manage Roles
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-center py-10 border border-dashed border-slate-700/50 rounded-3xl bg-slate-800/20">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                User List Loading...
              </p>
            </div>
          </div>
        </div>

        {/* Dealership Global Settings */}
        <div className={`p-6 rounded-[2.5rem] border shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <h2 className="font-black uppercase italic tracking-tighter text-lg mb-6">Global Overrides</h2>
          <div className="grid grid-cols-1 gap-3">
            {['Inventory Locking', 'CRM Auto-Assign', 'Bank API Sync', 'Manual VIN Override'].map(setting => (
              <div 
                key={setting} 
                onClick={triggerHaptic}
                className="flex justify-between items-center p-4 bg-slate-500/5 rounded-2xl border border-slate-500/10 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <span className="text-xs font-black uppercase tracking-widest">{setting}</span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${isDark ? 'bg-blue-600' : 'bg-blue-500'}`}>
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;