import React, { useState, useEffect, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useDarkMode } from "../hooks/useDarkMode";
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  RectangleStackIcon, 
  DocumentMagnifyingGlassIcon,
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
  BanknotesIcon
} from "@heroicons/react/24/outline";

import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/* -------------------------------------------
 * ??? Helpers
 * ----------------------------------------- */
const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const host = window.location.hostname;
  return `http://${host}:5000${path.startsWith('/') ? '' : '/'}${path}`;
};

/* -------------------------------------------
 * ?? Component: Price Edit Modal
 * ----------------------------------------- */
const PriceEditModal = ({ unit, isOpen, onClose, onSave, isDark }) => {
  const [price, setPrice] = useState(unit?.price || "");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/60 animate-in fade-in duration-200">
      <div className={`w-full max-w-sm rounded-[2.5rem] border p-8 shadow-2xl ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black italic uppercase tracking-tighter">Set Listing Price</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 transition-colors">
            <XMarkIcon className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(unit._id, price); }} className="space-y-6">
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-2xl">$</span>
            <input 
              type="number" 
              autoFocus
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={`w-full pl-12 pr-6 py-5 rounded-2xl border-none text-3xl font-black italic tracking-tighter outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
              }`}
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">
            Update Inventory
          </button>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------
 * ?? Component: Inventory Card
 * ----------------------------------------- */
const InventoryCard = memo(({ unit, isDark, navigate, triggerHaptic, onEditPrice }) => {
  const handleCarfaxClick = (e) => {
    e.stopPropagation();
    triggerHaptic(ImpactStyle.Medium);
    navigate(`/carfax`, { state: { vin: unit.vin } });
  };

  return (
    <div onClick={() => navigate(`/inventory/${unit._id}`)} className={`group relative rounded-[2.5rem] border shadow-xl transition-all duration-500 cursor-pointer overflow-hidden ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
      <div className={`relative h-52 overflow-hidden ${isDark ? "bg-slate-950" : "bg-slate-100"}`}>
        {unit.photos?.[0] ? (
          <img src={getMediaUrl(unit.photos[0])} alt={unit.model} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-10"><RectangleStackIcon className="w-24 h-24 text-slate-500" /></div>
        )}
        {unit.photos?.length > 1 && (
          <div className="absolute bottom-4 left-5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[9px] font-black text-white uppercase">
            <PhotoIcon className="w-3.5 h-3.5 text-blue-500 mr-1 inline" /> {unit.photos.length} Photos
          </div>
        )}
      </div>

      <div className="p-6">
        <h2 className={`text-xl font-black tracking-tighter uppercase italic leading-none mb-1 truncate ${isDark ? "text-white" : "text-slate-900"}`}>{unit.year} {unit.make}</h2>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 truncate opacity-60">{unit.model} {unit.trim}</p>
        
        <div className={`pt-6 border-t flex justify-between items-center ${isDark ? "border-slate-800" : "border-slate-100"}`}>
          <div className="flex flex-col cursor-pointer" onClick={(e) => { e.stopPropagation(); onEditPrice(unit); }}>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{unit.price > 0 ? "Listing Price" : "Action Required"}</span>
            <span className={`text-2xl font-black italic tracking-tighter leading-none ${unit.price > 0 ? (isDark ? 'text-white' : 'text-slate-900') : 'text-amber-500 animate-pulse'}`}>
              {unit.price > 0 ? `$${unit.price.toLocaleString()}` : "SET PRICE"}
            </span>
          </div>
          
          <button onClick={handleCarfaxClick} className={`flex flex-col items-center justify-center px-4 py-2.5 rounded-xl border transition-all active:scale-90 ${isDark ? "bg-blue-600/10 border-blue-500/30 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-600"}`}>
             <DocumentMagnifyingGlassIcon className="w-5 h-5 mb-0.5" />
             <span className="text-[7px] font-black uppercase">Carfax</span>
          </button>
        </div>
      </div>
    </div>
  );
});

/* -------------------------------------------
 * ?? Main Page: InventoryPage
 * ----------------------------------------- */
const InventoryPage = () => {
  const { isDark } = useDarkMode();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingUnit, setEditingUnit] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get("/inventory", { signal: controller.signal });
        setInventory(Array.isArray(data) ? data : (data.units || []));
      } catch (err) { if (err.name !== 'AbortError') console.error(err); } 
      finally { setLoading(false); }
    };
    fetchInventory();
    return () => controller.abort();
  }, []);

  const triggerHaptic = useCallback(async (style = ImpactStyle.Light) => {
    try { await Haptics.impact({ style }); } catch (e) {}
  }, []);

  const handleUpdatePrice = async (unitId, newPrice) => {
    try {
      await axiosClient.patch(`/inventory/${unitId}`, { price: Number(newPrice) });
      setInventory(prev => prev.map(u => u._id === unitId ? { ...u, price: Number(newPrice) } : u));
      setEditingUnit(null);
      await Haptics.notification({ type: NotificationType.Success });
    } catch (err) {
      await Haptics.notification({ type: NotificationType.Error });
    }
  };

  const filteredInventory = inventory.filter(u => 
    [u.model, u.make, u.vin, u.stockNumber].some(val => (val || "").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className={`min-h-screen p-6 pt-safe pb-32 transition-colors duration-300 ${isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-widest mb-6 active:scale-95 transition-transform">
          <ArrowLeftIcon className="w-4 h-4 stroke-[3px]" /> Back to Dashboard
        </button>

        <div className="flex justify-between items-end mb-8">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Unit <span className="text-blue-600">Inventory</span></h1>
          <button onClick={() => navigate("/vin-scanner")} className="bg-blue-600 text-white p-4 rounded-2xl active:scale-95 transition-all shadow-xl shadow-blue-500/20">
            <PlusIcon className="w-6 h-6 stroke-[3px]" />
          </button>
        </div>

        {/* Search Bar */}
        <div className={`p-1 rounded-[2rem] shadow-2xl border mb-10 flex items-center ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-6 top-4 w-5 h-5 text-slate-500" />
            <input type="text" placeholder="Search Inventory..." className={`w-full bg-transparent border-none py-4 pl-14 pr-4 text-sm font-bold outline-none ${isDark ? "text-white" : "text-slate-900"}`} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(n => <div key={n} className="h-96 rounded-[2.5rem] bg-slate-900/50" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredInventory.map(unit => (
              <InventoryCard key={unit._id} unit={unit} isDark={isDark} navigate={navigate} triggerHaptic={triggerHaptic} onEditPrice={(u) => { triggerHaptic(); setEditingUnit(u); }} />
            ))}
          </div>
        )}
      </div>

      <PriceEditModal 
        unit={editingUnit} 
        isOpen={!!editingUnit} 
        isDark={isDark} 
        onClose={() => setEditingUnit(null)} 
        onSave={handleUpdatePrice} 
      />
    </div>
  );
};

export default InventoryPage;