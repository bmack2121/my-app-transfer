import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useDarkMode } from "../hooks/useDarkMode";
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  RectangleStackIcon, 
  WrenchScrewdriverIcon, 
  DocumentMagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon 
} from "@heroicons/react/24/outline";

import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

// ✅ Helper to format relative database paths into absolute server URLs
const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path; // Already an absolute URL
  
  // Strip '/api' from the end of the Axios base URL to point to the server root
  const baseUrl = (process.env.REACT_APP_API_BASE_URL || "http://192.168.0.73:5000/api").replace('/api', '');
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const InventoryPage = () => {
  const { isDark } = useDarkMode();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get("/inventory");
        const units = Array.isArray(data) ? data : (data.units || []);
        setInventory(units);
      } catch (err) {
        console.error("Inventory Fetch Error:", err);
        try { await Haptics.notification({ type: NotificationType.Error }); } catch (e) {}
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const triggerHaptic = async (style = ImpactStyle.Light) => {
    try { await Haptics.impact({ style }); } catch (e) {}
  };

  const handleAddUnit = () => {
    triggerHaptic(ImpactStyle.Medium);
    navigate("/vin-scanner");
  };

  const filteredInventory = inventory.filter(unit => 
    (unit.model || "").toLowerCase().includes(search.toLowerCase()) ||
    (unit.make || "").toLowerCase().includes(search.toLowerCase()) ||
    (unit.vin || "").toLowerCase().includes(search.toLowerCase()) ||
    (unit.stockNumber || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`min-h-screen p-6 pt-safe pb-32 transition-colors duration-300 ${isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
              Unit <span className="text-blue-600">Inventory</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              {loading ? "Syncing VinPro Cloud..." : `${filteredInventory.length} Units Active`}
            </p>
          </div>

          <button 
            onClick={handleAddUnit}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] transition-all active:scale-95"
          >
            <PlusIcon className="w-4 h-4 stroke-[3px]" />
            Scan New Unit
          </button>
        </div>

        {/* Search Bar */}
        <div className={`p-1 rounded-[2rem] shadow-2xl border mb-10 flex items-center ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-6 top-4 w-5 h-5 text-slate-500" />
            <input 
              type="text"
              placeholder="Filter by VIN, Model, or Stock #..."
              className={`w-full bg-transparent border-none py-4 pl-14 pr-4 text-sm font-bold outline-none placeholder-slate-600 ${isDark ? "text-white" : "text-slate-900"}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className={`h-96 animate-pulse rounded-[2.5rem] ${isDark ? "bg-slate-900/50" : "bg-slate-200"}`} />
            ))}
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className={`text-center py-24 border-2 border-dashed rounded-[2.5rem] ${isDark ? "border-slate-800 bg-slate-900/30" : "border-slate-200 bg-slate-50"}`}>
             <FunnelIcon className="w-16 h-16 mx-auto text-slate-600 mb-4 opacity-30" />
             <p className="text-slate-500 font-black uppercase text-xs tracking-[0.2em]">Zero results found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredInventory.map((unit) => (
              <InventoryCard 
                key={unit._id || unit.vin} 
                unit={unit} 
                isDark={isDark} 
                navigate={navigate}
                triggerHaptic={triggerHaptic}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const InventoryCard = ({ unit, isDark, navigate, triggerHaptic }) => {
  const handleCardClick = () => {
    triggerHaptic();
    navigate(`/inventory/${unit._id || unit.vin}`);
  };

  const handleCarfaxClick = (e) => {
    e.stopPropagation();
    triggerHaptic(ImpactStyle.Medium);
    navigate(`/carfax`, { state: { vin: unit.vin } });
  };

  const statusColors = {
    available: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    sold: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    hold: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };

  const isBelowMarket = unit.marketData && unit.price < unit.marketData.mean_price;

  return (
    <div 
      onClick={handleCardClick}
      className={`group relative rounded-[2.5rem] border shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/50 transition-all duration-500 cursor-pointer overflow-hidden ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}
    >
      {/* 📸 Media Hero */}
      <div className={`relative h-52 overflow-hidden ${isDark ? "bg-slate-950" : "bg-slate-100"}`}>
        {unit.photos?.[0] ? (
            // ✅ FIX: Wrapped the image source in the formatting helper
            <img src={getMediaUrl(unit.photos[0])} alt={unit.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <RectangleStackIcon className="w-24 h-24 text-slate-500" />
            </div>
        )}
        
        {/* Status Badge */}
        <div className={`absolute top-5 right-5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border backdrop-blur-xl ${statusColors[unit.status?.toLowerCase()] || "text-slate-400 bg-slate-900/80 border-slate-700"}`}>
          {unit.status || 'UNKNOWN'}
        </div>

        {/* Market Analysis Badge */}
        {unit.marketData && (
          <div className={`absolute top-5 left-5 flex items-center gap-2 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest backdrop-blur-xl border ${isBelowMarket ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-blue-600/20 text-blue-400 border-blue-500/30'}`}>
            <ChartBarIcon className="w-3.5 h-3.5" />
            {isBelowMarket ? 'Aggressive Pricing' : 'Market Fair'}
          </div>
        )}

        <div className="absolute bottom-4 left-5 flex gap-2">
           {unit.engine && (
             <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[8px] font-black text-white uppercase italic">
               <WrenchScrewdriverIcon className="w-3.5 h-3.5 text-blue-500" /> {unit.engine}
             </div>
           )}
        </div>
      </div>

      <div className="p-6">
        <h2 className={`text-xl font-black tracking-tighter uppercase italic leading-none mb-1 truncate ${isDark ? "text-white" : "text-slate-900"}`}>
          {unit.year} {unit.make}
        </h2>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 truncate opacity-60">{unit.model} {unit.trim}</p>
        
        <div className={`p-4 rounded-2xl border mb-6 ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
          <div className="flex justify-between items-center text-[9px] font-black uppercase">
            <span className="text-slate-600">Stock #</span>
            <span className="text-blue-500 tracking-tighter">{unit.stockNumber || 'PENDING'}</span>
          </div>
        </div>

        <div className={`pt-6 border-t flex justify-between items-center ${isDark ? "border-slate-800" : "border-slate-100"}`}>
          <div className="flex flex-col">
            <span className="text-2xl font-black italic tracking-tighter text-white">
              {unit.price > 0 ? `$${unit.price.toLocaleString()}` : "DEALER PRICE"}
            </span>
            {unit.marketData && (
              <span className="text-[8px] font-black text-slate-600 uppercase mt-1">
                {/* ✅ FIX: Safety check for missing mean_price to prevent NaN formatting errors */}
                Market Avg: {unit.marketData.mean_price ? `$${Math.round(unit.marketData.mean_price).toLocaleString()}` : 'N/A'}
              </span>
            )}
          </div>
          
          <button 
            onClick={handleCarfaxClick}
            className={`flex items-center gap-1.5 text-[9px] font-black uppercase px-4 py-2.5 rounded-xl border transition-all active:scale-90 ${
                isDark 
                ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-blue-500" 
                : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-white hover:text-blue-600"
            }`}
          >
            <DocumentMagnifyingGlassIcon className="w-4 h-4" />
            History
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;