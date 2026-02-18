import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import DashboardCharts from "../components/DashboardCharts";
import RecentActivity from "../components/RecentActivity";
import { useDarkMode } from "../components/useDarkMode";

// Safe haptics wrapper
import { hapticLight } from "../utils/haptics";

const Dashboard = () => {
  const { isDark, toggleDark } = useDarkMode();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    activeListings: 0,
    todaysLeads: 0,
    pendingDeals: 0,
    avgDaysOnLot: 0,
  });

  const [activity, setActivity] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          axiosClient.get("/dashboard/stats"),
          axiosClient.get("/dashboard/activity"),
        ]);

        setStats(statsRes.data);
        setActivity(activityRes.data);
      } catch (err) {
        console.error("Dashboard Sync Error:", err);
      }
    };

    fetchDashboardData();
  }, []);

  const handleAction = async (route) => {
    await hapticLight();
    navigate(route);
  };

  // ✅ FIX: Changed '/calculator' to '/deals' to match your App.js route
  const quickActions = [
    { label: "Scan VIN", icon: "📷", route: "/vin-scanner" },
    { label: "Inventory", icon: "🚗", route: "/inventory" },
    { label: "Leads", icon: "👥", route: "/customers" },
    { label: "Calculator", icon: "🧮", route: "/deals" }, // <--- Fixed this link
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-app-bg text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Top Bar */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-app-accent">
            VinPro Systems
          </p>
          <h1 className="text-3xl font-heading font-black tracking-tighter">
            Dashboard
          </h1>
        </div>

        <button
          onClick={toggleDark}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-pro active:scale-90 transition-transform ${
            isDark 
              ? "bg-app-surface border-app-border text-white" 
              : "bg-white border-slate-200 text-slate-900"
          }`}
        >
          {isDark ? "🌙" : "☀️"}
        </button>
      </header>

      {/* Quick Actions */}
      <section className="px-6 mt-4">
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleAction(action.route)}
              className={`flex flex-col items-center justify-center min-w-[100px] h-[90px] gap-2 rounded-2xl border text-xs font-black uppercase tracking-widest shadow-sm active:scale-95 transition-all ${
                 isDark 
                   ? "bg-app-surface border-app-border hover:border-app-accent" 
                   : "bg-white border-slate-200 hover:border-slate-400"
              }`}
            >
              <span className="text-2xl">{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* KPI Cards */}
      <section className="px-6 mt-2 grid grid-cols-2 gap-3">
        {[
          { label: "Active Listings", value: stats.activeListings },
          { label: "Today’s Leads", value: stats.todaysLeads },
          { label: "Pending Deals", value: stats.pendingDeals },
          { label: "Avg. Days on Lot", value: stats.avgDaysOnLot },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl border shadow-sm p-4 ${
              isDark 
                ? "bg-app-surface border-app-border" 
                : "bg-white border-slate-200"
            }`}
          >
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] opacity-60">
              {item.label}
            </p>
            <p className="text-2xl font-black mt-1 tracking-tight">{item.value}</p>
          </div>
        ))}
      </section>

      {/* Charts */}
      <section className="px-6 mt-6">
        <div className={`rounded-2xl border shadow-sm p-5 ${
           isDark ? "bg-app-surface border-app-border" : "bg-white border-slate-200"
        }`}>
          <h2 className="text-sm font-heading font-bold mb-4 uppercase tracking-wider">
            Performance Overview
          </h2>
          <DashboardCharts stats={stats} isDark={isDark} />
        </div>
      </section>

      {/* Recent Activity */}
      <section className="px-6 mt-6 pb-24">
        <div className={`rounded-2xl border shadow-sm p-5 ${
           isDark ? "bg-app-surface border-app-border" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-heading font-bold uppercase tracking-wider">
              Recent Activity
            </h2>
            <button className="text-[10px] font-black uppercase tracking-widest text-app-accent">
              View All
            </button>
          </div>

          <RecentActivity activity={activity} isDark={isDark} />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;