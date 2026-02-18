import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axiosClient from "../api/axiosClient";
import DashboardCharts from "../components/DashboardCharts";
import ActivityFeedItem from "../components/ActivityFeedItem";
import { useDarkMode } from "../hooks/useDarkMode";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

const Dashboard = () => {
  const { isDark, toggleDark } = useDarkMode();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeListings: 0,
    todaysLeads: 0,
    pendingDeals: 0,
    avgDaysOnLot: 0,
    totalLotValue: 0,
    marketHealth: "Competitive"
  });

  const [activity, setActivity] = useState([]);

  // --- 🛰️ Live Pulse Socket Integration ---
  useEffect(() => {
    // Establishing real-time link to the VinPro Engine
    const socket = io("http://192.168.0.73:5000"); 

    socket.on("new-activity", (newActivity) => {
      // ⚡ Instant Feed Update
      setActivity((prev) => [newActivity, ...prev].slice(0, 15));

      // 📳 Physical feedback based on severity (Success/Critical/Info)
      triggerLiveHaptic(newActivity.level);
    });

    return () => socket.disconnect();
  }, []);

  const triggerLiveHaptic = async (level) => {
    try {
      if (level === 'critical') {
        await Haptics.notification({ type: NotificationType.Error });
      } else if (level === 'success') {
        await Haptics.notification({ type: NotificationType.Success });
      } else {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
    } catch (e) { /* Fallback for desktop */ }
  };

  // --- 📊 Data Synchronization ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Hits the updated dashboardController endpoint
        const res = await axiosClient.get("/dashboard/stats");
        
        if (res.data) {
          setStats({
            activeListings: res.data.stats.unitsOnLot,
            todaysLeads: res.data.stats.newLeadsToday,
            pendingDeals: res.data.stats.activeDeals,
            avgDaysOnLot: res.data.stats.avgAging,
            totalLotValue: res.data.stats.totalLotValue,
            marketHealth: res.data.stats.marketHealthScore
          });
          setActivity(res.data.feed || []);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [navigate]);

  const handleAction = async (route) => {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    navigate(route);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 pb-32 ${isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
      
      {/* 📱 Immersive Header */}
      <header className="px-6 pt-safe pb-6 flex items-end justify-between">
        <div className="pt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-1">Lot Intelligence</p>
          <h1 className="text-4xl font-black italic tracking-tighter leading-none uppercase">
            The <span className="text-blue-500">Pulse</span>
          </h1>
        </div>
        <button
          onClick={toggleDark}
          className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-2xl active:scale-90 transition-all ${
            isDark ? "bg-slate-900 border-slate-800 text-yellow-400" : "bg-white border-slate-200 text-slate-900"
          }`}
        >
          <span className="text-xl">{isDark ? "🌙" : "☀️"}</span>
        </button>
      </header>

      {/* ⚡ Quick Actions */}
      <section className="px-6 mb-8">
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {[
            { label: "Scan VIN", icon: "📷", route: "/vin-scanner" },
            { label: "Lead Intake", icon: "📝", route: "/lead-intake" }, 
            { label: "Inventory", icon: "🚗", route: "/inventory" },
            { label: "Calculator", icon: "🧮", route: "/lease-calculator" }, 
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => handleAction(action.route)}
              className={`flex flex-col items-center justify-center min-w-[110px] h-[110px] gap-2 rounded-[2.5rem] border text-[9px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all ${
                isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <span className="text-3xl">{action.icon}</span>
              <span className="opacity-70">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 📈 KPI Grid */}
      <section className="px-6 grid grid-cols-2 gap-4">
        <div className={`col-span-2 rounded-[2rem] border p-6 shadow-xl ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <p className="text-[0.6rem] font-black uppercase tracking-widest opacity-40 mb-1">Total Lot Equity</p>
          <p className="text-4xl font-black italic tracking-tighter text-blue-500">
            ${stats.totalLotValue?.toLocaleString()}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md">
              {stats.marketHealth}
            </span>
            <span className="text-[9px] text-slate-500 font-bold uppercase">v. Local MarketCheck Data</span>
          </div>
        </div>

        {[
          { label: "Units On Lot", value: stats.activeListings, color: "text-white" },
          { label: "Today's Leads", value: stats.todaysLeads, color: "text-emerald-500" },
          { label: "Active Deals", value: stats.pendingDeals, color: "text-amber-500" },
          { label: "Avg. Aging", value: `${stats.avgDaysOnLot}D`, color: "text-rose-500" },
        ].map((item) => (
          <div key={item.label} className={`rounded-[2rem] border p-6 shadow-xl ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <p className="text-[0.6rem] font-black uppercase tracking-widest opacity-40 mb-1">{item.label}</p>
            <p className={`text-3xl font-black italic tracking-tighter ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </section>

      {/* 🕒 Real-Time Pulse Stream */}
      <section className="px-6 mt-8">
        <div className={`rounded-[2.5rem] border p-6 shadow-xl ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[10px] font-black uppercase tracking-widest opacity-60">Live Lot Activity</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-black uppercase text-emerald-500">Pulse Active</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {activity.length > 0 ? (
              activity.map((item) => (
                <ActivityFeedItem key={item._id} activity={item} />
              ))
            ) : (
              <p className="text-center text-[10px] uppercase font-bold text-slate-500 py-4 italic">Listening for lot events...</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;