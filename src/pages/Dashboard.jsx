import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import DashboardCharts from "../components/DashboardCharts";
import RecentActivity from "../components/RecentActivity";

// ✅ FIXED: Updated path to match the new hooks directory
import { useDarkMode } from "../hooks/useDarkMode";

// ✅ FIXED: Using direct Capacitor Haptics to bypass module resolution errors
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
  });

  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, activityRes] = await Promise.all([
          axiosClient.get("/dashboard/stats"),
          axiosClient.get("/dashboard/activity"),
        ]);

        if (statsRes.data) setStats(statsRes.data);
        if (activityRes.data) setActivity(activityRes.data);
      } catch (err) {
        console.error("Dashboard Sync Error:", err);
        if (err.response?.status === 401) {
          try {
            await Haptics.notification({ type: NotificationType.Error });
          } catch (e) {}
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleAction = async (route) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {}
    navigate(route);
  };

  const handleToggleTheme = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {}
    toggleDark();
  };

  const quickActions = [
    { label: "Scan VIN", icon: "📷", route: "/vin-scanner" },
    { label: "New Lead", icon: "📝", route: "/lead-intake" }, // Fixed label for Sales Weapon
    { label: "Inventory", icon: "🚗", route: "/inventory" },
    { label: "Calculator", icon: "🧮", route: "/lease-calculator" }, 
  ];

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
      {/* 📱 Top Bar with Safe Area Consideration */}
      <header className="px-6 pt-safe pb-4 flex items-center justify-between">
        <div className="mt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">VinPro Dealer Systems</p>
          <h1 className="text-3xl font-heading font-black tracking-tighter">Dashboard</h1>
        </div>
        <button
          onClick={handleToggleTheme}
          className={`w-12 h-12 mt-4 rounded-2xl border flex items-center justify-center shadow-xl active:scale-90 transition-transform ${
            isDark ? "bg-slate-900 border-slate-800 text-yellow-400" : "bg-white border-slate-200 text-slate-900"
          }`}
        >
          {isDark ? "🌙" : "☀️"}
        </button>
      </header>

      {/* ⚡ Quick Actions (Sales Weapon Shortcuts) */}
      <section className="px-6 mt-4">
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleAction(action.route)}
              className={`flex flex-col items-center justify-center min-w-[110px] h-[100px] gap-2 rounded-[2rem] border text-[10px] font-black uppercase tracking-widest shadow-sm active:scale-95 transition-all ${
                isDark ? "bg-slate-900 border-slate-800 hover:border-blue-500/50" : "bg-white border-slate-200 hover:border-slate-400"
              }`}
            >
              <span className="text-2xl">{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 📈 KPI Cards */}
      <section className="px-6 mt-2 grid grid-cols-2 gap-4">
        {[
          { label: "Active Listings", value: stats.activeListings, color: "text-blue-500" },
          { label: "Today’s Leads", value: stats.todaysLeads, color: "text-green-500" },
          { label: "Pending Deals", value: stats.pendingDeals, color: "text-amber-500" },
          { label: "Avg. Days on Lot", value: stats.avgDaysOnLot, color: "text-rose-500" },
        ].map((item) => (
          <div key={item.label} className={`rounded-3xl border p-5 shadow-lg ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] opacity-40">{item.label}</p>
            <p className={`text-3xl font-black mt-1 tracking-tighter ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </section>

      {/* 📊 Charts Section */}
      <section className="px-6 mt-8">
        <div className={`rounded-3xl border p-6 shadow-xl ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <h2 className="text-xs font-black mb-6 uppercase tracking-widest opacity-60">Performance Overview</h2>
          <DashboardCharts stats={stats} isDark={isDark} />
        </div>
      </section>

      {/* 🕒 Activity Feed */}
      <section className="px-6 mt-8 pb-32">
        <div className={`rounded-3xl border p-6 shadow-xl ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-black uppercase tracking-widest opacity-60">Recent Activity</h2>
            <button className="text-[10px] font-black uppercase tracking-widest text-blue-500">View All</button>
          </div>
          <RecentActivity activity={activity} isDark={isDark} />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;