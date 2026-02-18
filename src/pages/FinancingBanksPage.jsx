import React, { useState, useMemo } from "react";
import { Phone, Globe, Landmark, ExternalLink, Search, X, Filter } from "lucide-react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
// ✅ Capacitor Browser for reliable external navigation
import { Browser } from "@capacitor/browser";
import bankData from "../data/banks.json";

const FinancingBanksPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const categories = ["All", "National", "Captive", "Credit Union", "Subprime", "Digital"];

  const filteredBanks = useMemo(() => {
    return (bankData || [])
      .filter((bank) => {
        const matchesSearch = 
          bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bank.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === "All" || bank.type === activeTab;
        return matchesSearch && matchesTab;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery, activeTab]);

  const handlePortalNavigation = async (url) => {
    if (!url || url === "#" || url === "") return;
    
    try {
      // Physical feedback for mobile users
      await Haptics.impact({ style: ImpactStyle.Medium });
      
      // Open in the system's default browser (best for Capacitor apps)
      await Browser.open({ url: url });
    } catch (err) {
      console.error("Browser error:", err);
      // Fallback for web/local testing
      window.open(url, '_blank');
    }
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 pb-32">
      {/* 🏦 Branding Header - Cleaned up */}
      <header className="mb-8 pt-safe">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
              <Landmark className="text-blue-500" size={32} />
              Lender Portal
            </h1>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl hidden md:block">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Dealer Sync</span>
          </div>
        </div>
      </header>

      {/* 🔍 Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
        <input
          type="text"
          placeholder="Find Lenders..."
          className="w-full pl-12 pr-12 py-5 bg-slate-900 border border-slate-800 rounded-[2rem] focus:border-blue-500 outline-none transition-all text-lg font-bold placeholder-slate-700"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
            <X size={20} />
          </button>
        )}
      </div>

      {/* 📑 Filter Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-8 no-scrollbar pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === cat 
                ? "bg-blue-600 text-white shadow-lg" 
                : "bg-slate-900 text-slate-500 border border-slate-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 🏦 Bank Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredBanks.map((bank) => (
          <div
            key={bank.id}
            className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] relative overflow-hidden group hover:border-blue-500/50 transition-all shadow-2xl"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black uppercase italic tracking-tight text-white mb-1">
                  {bank.name}
                </h2>
                <span className="text-[8px] font-black bg-blue-600/10 text-blue-500 px-3 py-1 rounded-full uppercase tracking-tighter">
                  {bank.type}
                </span>
              </div>
              <div className="p-3 bg-slate-800 rounded-2xl">
                <Landmark size={20} className="text-blue-500" />
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Phone size={14} className="text-slate-500" />
                <span className="text-sm font-bold text-slate-300">{bank.phone || "Request Port"}</span>
              </div>
              <div className="flex items-start gap-3">
                <Filter size={14} className="text-slate-500 mt-1 shrink-0" />
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {bank.strengths || "Preferred VinPro Lending Partner"}
                </p>
              </div>
            </div>

            <button
              onClick={() => handlePortalNavigation(bank.website)}
              className="flex items-center justify-center gap-3 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl transition-all active:scale-95"
            >
              <Globe size={18} />
              Access Portal
              <ExternalLink size={14} className="opacity-50" />
            </button>
          </div>
        ))}
      </div>

      {/* ⚠️ Empty State */}
      {filteredBanks.length === 0 && (
        <div className="text-center py-20 bg-slate-900/40 rounded-[3rem] border border-dashed border-slate-800">
          <Landmark size={48} className="mx-auto text-slate-800 mb-4" />
          <p className="text-slate-500 font-black uppercase text-xs tracking-widest">No Lenders Found</p>
        </div>
      )}
    </div>
  );
};

export default FinancingBanksPage;