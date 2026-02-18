import React, { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { useDarkMode } from "../hooks/useDarkMode";

// ✅ FIXED: Using direct Capacitor Haptics to bypass module resolution issues
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const UserPage = () => {
  const { isDark } = useDarkMode();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        // ✅ FIXED: Path changed from /users to /auth/team to match VinPro backend
        const res = await axiosClient.get("/auth/team");
        
        // Ensure we always have an array even if the response is unexpected
        const teamData = Array.isArray(res.data) ? res.data : (res.data.users || []);
        setTeam(teamData);
      } catch (err) {
        console.error("Failed to load team data", err);
        setTeam([]); // Prevents .map() crashes
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  const handleContact = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Fallback for non-native web development
    }
  };

  return (
    /* ✅ pt-safe ensures content starts below the Android 16 status bar */
    <div className={`p-6 min-h-screen pt-safe transition-colors duration-300 ${isDark ? "bg-app-bg text-white" : "bg-slate-50 text-slate-900"}`}>
      <header className="mb-10">
        <p className="text-[10px] font-black text-app-accent uppercase tracking-[0.3em]">
          Organization
        </p>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">
          Dealership Team
        </h1>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-app-accent border-t-transparent rounded-full animate-spin shadow-glow" />
        </div>
      ) : team.length === 0 ? (
        <div className="text-center py-20 bg-app-surface border border-dashed border-app-border rounded-vin">
          <p className="text-slate-500 font-black uppercase text-xs tracking-widest">No team members found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {team.map((member) => (
            <div
              key={member._id || member.email}
              className={`${isDark ? 'bg-app-surface border-app-border' : 'bg-white border-slate-200'} border p-6 rounded-vin shadow-pro relative overflow-hidden group hover:border-app-accent transition-all active:scale-[0.98]`}
            >
              {/* Role Badge */}
              <div className="absolute top-0 right-0">
                <span
                  className={`text-[8px] font-black uppercase px-3 py-1 rounded-bl-lg ${
                    member.role === "admin" || member.role === "manager"
                      ? "bg-performance text-white"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {member.role || 'Sales'}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-pro-metal border border-app-border rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner text-white">
                  {(member.name || "U").charAt(0)}
                </div>

                <div className="flex-1 overflow-hidden">
                  <h2 className="font-heading font-black text-lg uppercase tracking-tight truncate">
                    {member.name || 'Unknown User'}
                  </h2>
                  <p className="text-[10px] text-slate-500 font-bold truncate">
                    {member.email}
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-6 flex gap-2">
                <button
                  onClick={handleContact}
                  className="flex-1 py-3 bg-app-bg border border-app-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-app-accent hover:text-white transition-all shadow-sm"
                >
                  Message
                </button>

                <button
                  onClick={handleContact}
                  className="px-5 py-3 bg-app-bg border border-app-border rounded-xl text-lg hover:border-app-accent transition-all shadow-sm"
                >
                  📞
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPage;