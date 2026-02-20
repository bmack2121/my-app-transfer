import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { 
  DocumentMagnifyingGlassIcon, 
  PlusCircleIcon, 
  ArrowLeftIcon,
  CurrencyDollarIcon,
  TruckIcon
} from "@heroicons/react/24/outline";

const VinResultPage = () => {
  const { vin: paramVin } = useParams(); 
  const location = useLocation();
  const navigate = useNavigate();
  const vin = location.state?.vin || paramVin;

  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedColor, setSelectedColor] = useState("White");

  const triggerHaptic = async (style = ImpactStyle.Light) => {
    try { await Haptics.impact({ style }); } catch (e) {}
  };

  useEffect(() => {
    if (!vin) {
      navigate("/vin-scanner");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Decode VIN via internal Engine (NHTSA API proxy)
        const decodeRes = await axiosClient.get(`/inventory/decode/${vin}`);
        setVehicleInfo(decodeRes.data || {});

        // 2. Fetch Market Intelligence via MarketCheck Bridge
        try {
          const marketRes = await axiosClient.get(`/marketcheck/v2/predict/${vin}`);
          if (marketRes?.data) setMarketData(marketRes.data);
        } catch (marketErr) {
          console.warn("MarketCheck API unavailable or returned no data.");
        }
        
      } catch (err) {
        console.error("Data retrieval failed", err);
        try { await Haptics.notification({ type: NotificationType.Error }); } catch (e) {}
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [vin, navigate]);

  const handleAddToInventory = async () => {
    if (adding || !vehicleInfo) return;
    setAdding(true);
    await triggerHaptic(ImpactStyle.Medium);

    try {
      const payload = {
        vin: vin.toUpperCase().trim(),
        year: vehicleInfo.year ?? 0,
        make: vehicleInfo.make ?? "Unknown",
        model: vehicleInfo.model ?? "Unknown",
        trim: vehicleInfo.trim ?? "Base",
        engine: vehicleInfo.engine ?? "N/A",
        driveType: vehicleInfo.driveType ?? "N/A",
        fuelType: vehicleInfo.fuelType ?? "Gasoline",
        exteriorColor: selectedColor,
        status: "available", 
        price: marketData?.mean_price || 0, 
        stockNumber: `VP-${Date.now().toString().slice(-6)}`
      };

      const res = await axiosClient.post("/inventory", payload);
      
      if (res.status === 201 || res.status === 200) {
        try { await Haptics.notification({ type: NotificationType.Success }); } catch (e) {}
        
        // ✅ FIX: Navigate directly to the new vehicle's detail page 
        // so the user can immediately use the VehicleMediaUploader.
        navigate(`/inventory/${res.data._id || res.data.vin}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Cloud Sync Failed";
      alert(`🚨 Error: ${msg}`);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-950 min-h-screen flex flex-col items-center justify-center text-white text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Analyzing VIN Context...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-white pb-32 overflow-y-auto pt-safe">
      
      {/* 🧭 Top Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate("/vin-scanner")} className="p-3 bg-slate-900 rounded-2xl border border-white/5 active:scale-90 transition-all shadow-lg">
          <ArrowLeftIcon className="w-5 h-5 stroke-[2px]" />
        </button>
        <div className="text-right">
          <h1 className="text-[9px] font-black text-blue-500 uppercase tracking-widest leading-none">Scanning Engine</h1>
          <p className="text-[11px] font-mono text-slate-500 mt-1 uppercase tracking-tighter">{vin}</p>
        </div>
      </div>

      {/* 🚗 Vehicle Hero Card */}
      <div className="mb-6 p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
        <div className="absolute -top-10 -right-10 opacity-5 rotate-12 pointer-events-none">
           <TruckIcon className="w-48 h-48" />
        </div>
        
        <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-2">
          {vehicleInfo?.year ?? "----"}
        </h2>
        <h3 className="text-3xl font-black uppercase italic text-blue-500 leading-none mb-2">
          {vehicleInfo?.make ?? "Unknown"}
        </h3>
        <p className="text-xl font-bold text-slate-400 uppercase tracking-tight relative z-10">
          {vehicleInfo?.model ?? "Unit Found"} {vehicleInfo?.trim ?? ""}
        </p>
      </div>

      {/* 📊 Market Intelligence (MarketCheck Integration) */}
      {marketData && (
        <div className="mb-8 p-6 bg-blue-600/10 border border-blue-500/20 rounded-[2.5rem] flex items-center justify-between shadow-[0_0_15px_rgba(37,99,235,0.15)]">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30">
              <CurrencyDollarIcon className="w-6 h-6 text-white stroke-[2px]" />
            </div>
            <div>
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Predictive Valuation</p>
              <p className="text-2xl font-black italic tracking-tighter">
                {/* ✅ FIX: Safety check to prevent NaN if MarketCheck returns 0 or null */}
                {marketData.mean_price ? `$${Math.round(marketData.mean_price).toLocaleString()}` : "N/A"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Rank</p>
            <p className="text-xs font-bold text-emerald-500 uppercase italic">Competitive</p>
          </div>
        </div>
      )}

      {/* 🛠️ Technical Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { label: 'Drivetrain', val: vehicleInfo?.driveType || "N/A" },
          { label: 'Fuel Context', val: vehicleInfo?.fuelType || "Gasoline" },
          { label: 'Engine Config', val: vehicleInfo?.engine || "N/A" },
          { label: 'Body Style', val: vehicleInfo?.bodyClass || "Sedan" }
        ].map((stat, i) => (
          <div key={i} className="p-5 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-[10px] font-black uppercase tracking-tight text-slate-200">{stat.val}</p>
          </div>
        ))}
      </div>

      {/* 🎨 Color Configuration */}
      <div className="mb-10">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4 ml-2">Verified Color</p>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1 snap-x snap-mandatory">
          {['White', 'Black', 'Silver', 'Blue', 'Red', 'Gray', 'Other'].map((color) => (
            <button
              key={color}
              onClick={() => { triggerHaptic(); setSelectedColor(color); }}
              className={`snap-center flex-shrink-0 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                selectedColor === color 
                ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20' 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* ⚡ Action Controls */}
      <div className="space-y-4">
        <button
          onClick={() => navigate("/carfax", { state: { vin } })}
          className="w-full p-6 bg-slate-900 border border-slate-800 rounded-[2.5rem] flex items-center justify-between active:scale-[0.98] transition-all group hover:border-blue-500/50"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 group-hover:border-blue-500/20 transition-colors">
              <DocumentMagnifyingGlassIcon className="w-8 h-8 text-blue-500 stroke-[1.5px]" />
            </div>
            <div className="text-left">
              <p className="font-black uppercase text-sm tracking-tight italic">Run History Bridge</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest">VIN Safety & Title Scan</p>
            </div>
          </div>
          <ArrowLeftIcon className="w-5 h-5 text-slate-600 rotate-180 stroke-[2px] group-hover:text-blue-500 transition-colors" />
        </button>

        <button
          onClick={handleAddToInventory}
          disabled={adding}
          className="w-full p-6 bg-blue-600 rounded-[2.5rem] flex items-center justify-between active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl shadow-blue-600/20"
        >
          <div className="flex items-center gap-4 text-white">
            <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
              <PlusCircleIcon className="w-8 h-8 stroke-[1.5px]" />
            </div>
            <div className="text-left">
              <p className="font-black uppercase text-sm tracking-tight italic">{adding ? "SYNCING..." : "COMMIT TO LOT"}</p>
              <p className="text-[9px] text-blue-100/60 uppercase tracking-widest">Execute Cloud Inventory Add</p>
            </div>
          </div>
        </button>
      </div>

      <button 
        onClick={() => navigate("/vin-scanner")}
        className="mt-12 w-full text-slate-700 text-[10px] font-black uppercase tracking-[0.4em] active:text-white transition-colors"
      >
        Discard & Back to Scan
      </button>
    </div>
  );
};

export default VinResultPage;