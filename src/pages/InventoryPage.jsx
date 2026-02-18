import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useDarkMode } from "../hooks/useDarkMode";
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  RectangleStackIcon, 
  WrenchScrewdriverIcon, 
  ArrowsRightLeftIcon,
  DocumentMagnifyingGlassIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";

import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

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
        try {
           await Haptics.notification({ type: NotificationType.Error });
        } catch (e) {}
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const triggerHaptic = async (style = ImpactStyle.Light) => {
    try {
      await Haptics.impact({ style });
    } catch (e) {}
  };

  const handleAddUnit = () => {
    triggerHaptic(ImpactStyle.Medium);
    navigate("/vin-scanner");
  };

  // ✅ FIXED: Added null-checks (|| "") for all fields to prevent filtering crashes
  const filteredInventory = inventory.filter(unit => 
    (unit.model || "").toLowerCase().includes(search.toLowerCase()) ||
    (unit.make || "").toLowerCase().includes(search.toLowerCase()) ||
    (unit.vin || "").toLowerCase().includes(search.toLowerCase()) ||
    (unit.stockNumber || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`min-h-screen p-6 pt-safe pb-32 transition-colors duration-300 ${isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section - Branding Removed */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">
              Unit <span className="text-blue-600">Inventory</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              {loading ? "Syncing VinPro Cloud..." : `${filteredInventory.length} Units On Lot`}
            </p>
          </div>

          <button 
            onClick={handleAddUnit}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95"
          >
            <PlusIcon className="w-4 h-4 stroke-[3px]" />
            Scan New Unit
          </button>
        </div>

        {/* Search Bar */}
        <div className={`p-1 rounded-[1.5rem] shadow-sm border mb-8 flex items-center ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-5 top-3.5 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search VIN, Model, or Stock #..."
              className={`w-full bg-transparent border-none py-3 pl-12 pr-4 text-sm font-bold outline-none placeholder-slate-500 ${isDark ? "text-white" : "text-slate-900"}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Inventory Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className={`h-80 animate-pulse rounded-[2rem] ${isDark ? "bg-slate-900" : "bg-slate-200"}`} />
            ))}
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className={`text-center py-20 border border-dashed rounded-[2rem] ${isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-300 bg-slate-50"}`}>
             <FunnelIcon className="w-12 h-12 mx-auto text-slate-500 mb-4 opacity-50" />
             <p className="text-slate-500 font-black uppercase text-xs tracking-widest">No Inventory Found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
  const statusColors = {
    available: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    Available: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    sold: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    Sold: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    pending: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    Pending: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  };

  const handleCardClick = () => {
    triggerHaptic();
    // ✅ Navigation matches path="/inventory/:id" in App.js
    navigate(`/inventory/${unit._id || unit.vin}`, { state: { unit } });
  };

  const handleCarfaxClick = (e) => {
    e.stopPropagation();
    triggerHaptic();
    navigate("/carfax", { state: { vin: unit.vin } });
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`group relative rounded-[2rem] border shadow-sm hover:shadow-2xl hover:border-blue-500/50 transition-all duration-300 cursor-pointer overflow-hidden ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}
    >
      <div className={`relative h-48 overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
        {unit.photo ? (
            <img src={unit.photo} alt={unit.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:scale-110 transition-transform duration-500">
              <RectangleStackIcon className="w-20 h-20 text-slate-400" />
            </div>
        )}
        
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md ${statusColors[unit.status] || "text-slate-400 bg-slate-900/50 border-slate-700"}`}>
          {unit.status}
        </div>

        <div className="absolute bottom-3 left-3 flex gap-2">
           {(unit.engine && unit.engine !== "N/A") && (
             <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[8px] font-bold text-white uppercase">
               <WrenchScrewdriverIcon className="w-3 h-3 text-slate-300" /> {unit.engine}
             </div>
           )}
           {(unit.driveType && unit.driveType !== "N/A") && (
             <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[8px] font-bold text-white uppercase">
               <ArrowsRightLeftIcon className="w-3 h-3 text-slate-300" /> {unit.driveType}
             </div>
           )}
        </div>
      </div>

      <div className="p-5">
        <h2 className={`text-lg font-black tracking-tight uppercase italic leading-tight mb-1 truncate ${isDark ? "text-white" : "text-slate-900"}`}>
          {unit.year} {unit.make}
        </h2>
        <p className="text-xs font-bold text-slate-500 uppercase mb-4 truncate">{unit.model} {unit.trim}</p>
        
        <div className={`space-y-2 mt-2 mb-4 p-3 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
          <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
            <span>VIN</span>
            <span className={`font-mono tracking-tighter ${isDark ? "text-slate-300" : "text-slate-700"}`}>{unit.vin}</span>
          </div>
          <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
            <span>Stock #</span>
            <span className={`font-mono ${isDark ? "text-slate-300" : "text-slate-700"}`}>{unit.stockNumber || "N/A"}</span>
          </div>
        </div>

        <div className={`pt-4 border-t flex justify-between items-center ${isDark ? "border-slate-800" : "border-slate-100"}`}>
          <span className="text-xl font-black text-blue-500">
            {unit.price > 0 ? `$${unit.price.toLocaleString()}` : "CALL"}
          </span>
          
          <button 
            onClick={handleCarfaxClick}
            className={`flex items-center gap-1 text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border transition-colors ${
                isDark 
                ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700" 
                : "bg-slate-100 border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-white"
            }`}
          >
            <DocumentMagnifyingGlassIcon className="w-3.5 h-3.5" />
            History
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;