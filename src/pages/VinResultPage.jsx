import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { hapticSuccess, hapticWarning } from "../utils/haptics";
import { 
  DocumentMagnifyingGlassIcon, 
  PlusCircleIcon, 
  ArrowLeftIcon,
  ChartBarIcon,
  BeakerIcon, // For Fuel
  PaintBrushIcon // For Color
} from "@heroicons/react/24/outline";

const VinResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const vin = location.state?.vin;

  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  // Local state for color since VIN decoding doesn't usually provide it
  const [selectedColor, setSelectedColor] = useState("White");

  useEffect(() => {
    if (!vin) {
      navigate("/vin-scanner");
      return;
    }

    const decodeVin = async () => {
      try {
        const res = await axiosClient.get(`/inventory/decode/${vin}`);
        setVehicleInfo(res.data || {});
      } catch (err) {
        console.error("Decoding failed", err);
        await hapticWarning();
      } finally {
        setLoading(false);
      }
    };
    decodeVin();
  }, [vin, navigate]);

  const handleAddToInventory = async () => {
    if (adding || !vehicleInfo) return;
    setAdding(true);

    try {
      const payload = {
        vin: vin.toUpperCase().trim(),
        year: vehicleInfo.year ?? 0,
        make: vehicleInfo.make ?? "Unknown",
        model: vehicleInfo.model ?? "Unknown",
        trim: vehicleInfo.trim ?? "Base",
        engine: vehicleInfo.engine ?? "N/A",
        driveTrain: vehicleInfo.driveType ?? vehicleInfo.driveTrain ?? "N/A",
        fuelType: vehicleInfo.fuelType ?? "Gas", // Added
        exteriorColor: selectedColor, // Added
        status: "available", 
        price: 0,
        mileage: 0,
        stockNumber: `VP-${Date.now().toString().slice(-6)}`
      };

      const res = await axiosClient.post("/inventory", payload);
      
      if (res.status === 201 || res.status === 200) {
        await hapticSuccess();
        navigate("/inventory");
      }
    } catch (err) {
      await hapticWarning();
      const errorMessage = err.response?.data?.message || "Server Communication Error";
      alert(`❌ Save Failed: ${errorMessage}`);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-950 min-h-screen flex flex-col items-center justify-center text-white text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-black uppercase tracking-widest animate-pulse">Analyzing VIN...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-white pb-12">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/vin-scanner")} className="p-2 bg-slate-900 rounded-xl">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-black text-blue-400 uppercase tracking-widest">Verification Result</h1>
      </div>

      <div className="mb-6 p-6 bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ChartBarIcon className="w-24 h-24" />
        </div>
        
        <h2 className="text-4xl font-black italic uppercase leading-none mb-1">
          {vehicleInfo?.year ?? "----"} {vehicleInfo?.make ?? "Unknown"}
        </h2>
        <p className="text-xl font-bold text-slate-400 mb-4">
            {vehicleInfo?.model ?? "Vehicle"} {vehicleInfo?.trim ?? ""}
        </p>
        
        <div className="inline-block px-3 py-1 bg-slate-950 rounded-lg border border-slate-800">
          <p className="text-[10px] font-mono text-blue-400">{vin}</p>
        </div>
      </div>

      {/* 📊 Enhanced Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-8">
        <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Drivetrain</p>
          <p className="text-[10px] font-bold truncate">{vehicleInfo?.driveType || vehicleInfo?.driveTrain || "N/A"}</p>
        </div>
        <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Fuel Type</p>
          <p className="text-[10px] font-bold truncate">{vehicleInfo?.fuelType ?? "Gas"}</p>
        </div>
        <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Engine</p>
          <p className="text-[10px] font-bold truncate">{vehicleInfo?.engine ?? "N/A"}</p>
        </div>
      </div>

      {/* 🎨 Quick Color Picker */}
      <div className="mb-8">
        <p className="text-[10px] text-slate-500 font-black uppercase mb-3 ml-1">Select Unit Color</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['White', 'Black', 'Silver', 'Blue', 'Red'].map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${
                selectedColor === color 
                ? 'bg-blue-600 border-blue-500 text-white' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => navigate("/carfax", { state: { vin } })}
          className="w-full p-6 bg-blue-600 rounded-3xl flex items-center gap-4 active:scale-95 transition-all"
        >
          <div className="p-3 bg-white/20 rounded-2xl">
            <DocumentMagnifyingGlassIcon className="w-8 h-8 text-white" />
          </div>
          <div className="text-left text-white">
            <p className="font-black uppercase text-sm">Review Carfax</p>
            <p className="text-[10px] text-blue-100 opacity-80 uppercase">History & Accidents</p>
          </div>
        </button>

        <button
          onClick={handleAddToInventory}
          disabled={adding}
          className="w-full p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-center gap-4 active:scale-95 transition-all disabled:opacity-50"
        >
          <div className="p-3 bg-green-500/10 rounded-2xl">
            <PlusCircleIcon className="w-8 h-8 text-green-500" />
          </div>
          <div className="text-left">
            <p className="font-black uppercase text-sm">{adding ? "Syncing..." : "Add to Inventory"}</p>
            <p className="text-[10px] text-slate-500 uppercase">Save to VinPro Cloud</p>
          </div>
        </button>
      </div>

      <button 
        onClick={() => navigate("/vin-scanner")}
        className="mt-12 w-full text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]"
      >
        Discard & Scan Again
      </button>
    </div>
  );
};

export default VinResultPage;