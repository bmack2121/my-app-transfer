import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useDarkMode } from "../hooks/useDarkMode";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import VehicleMediaUploader from "../components/VehicleMediaUploader";

import { 
  ArrowLeftIcon, 
  RectangleStackIcon,
  TagIcon,
  HashtagIcon,
  WrenchScrewdriverIcon,
  QrCodeIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";

// ✅ Helper to format relative database paths into absolute server URLs
const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path; 
  const baseUrl = (process.env.REACT_APP_API_BASE_URL || "http://192.168.0.73:5000/api").replace('/api', '');
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const InventoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useDarkMode();
  
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/inventory/${id}`);
        setVehicle(res.data);
      } catch (error) {
        console.error("Failed to fetch vehicle details:", error);
        alert("Vehicle not found or connection lost.");
        navigate("/inventory");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [id, navigate]);

  const triggerHaptic = async () => {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
  };

  const handleUploadSuccess = (updatedVehicle) => {
    // ⚡ Instantly update the UI with the new photos without reloading the page
    setVehicle(updatedVehicle);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Decrypting Unit...</p>
      </div>
    );
  }

  if (!vehicle) return null;

  return (
    <div className={`min-h-screen pb-32 transition-colors duration-300 ${isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
      
      {/* 📸 Hero Image / Header Section */}
      <div className="relative h-72 w-full bg-slate-900 overflow-hidden">
        {vehicle.photos && vehicle.photos.length > 0 ? (
          <img 
            src={getMediaUrl(vehicle.photos[0])} 
            alt={vehicle.model} 
            className="w-full h-full object-cover opacity-90"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20">
            <RectangleStackIcon className="w-24 h-24 mb-2" />
            <span className="font-black uppercase tracking-widest text-xs">Awaiting Media</span>
          </div>
        )}
        
        {/* Top Gradient Overlay for Nav */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-950/80 to-transparent" />
        
        {/* Navigation Overlay */}
        <div className="absolute top-0 left-0 w-full z-10 p-6 pt-safe flex justify-between items-center">
          <button 
            onClick={() => { triggerHaptic(); navigate(-1); }}
            className="p-3 bg-slate-950/50 backdrop-blur-md rounded-2xl border border-white/10 text-white active:scale-90 transition-all shadow-lg"
          >
            <ArrowLeftIcon className="w-5 h-5 stroke-[2px]" />
          </button>
          
          <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border backdrop-blur-xl ${
            vehicle.status === 'available' ? 'bg-emerald-500/80 border-emerald-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-400'
          }`}>
            {vehicle.status || 'UNKNOWN'}
          </div>
        </div>
      </div>

      {/* 📝 Core Details Wrapper */}
      <div className="px-6 -mt-8 relative z-20">
        
        {/* Title Card */}
        <div className={`p-6 rounded-[2.5rem] border shadow-xl mb-6 backdrop-blur-xl ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white/90 border-slate-200"}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-1">
                {vehicle.year} {vehicle.make}
              </h1>
              <p className="text-[12px] font-bold text-blue-500 uppercase tracking-widest">{vehicle.model} {vehicle.trim}</p>
            </div>
            {vehicle.price > 0 && (
              <div className="text-right">
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Listed Price</p>
                <p className="text-2xl font-black italic text-emerald-500 tracking-tighter">${vehicle.price.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* 📷 Integrated Native Camera Uploader */}
        <div className="mb-6">
          <VehicleMediaUploader 
            vehicleId={vehicle._id} 
            stockNumber={vehicle.stockNumber}
            onUploadSuccess={handleUploadSuccess} 
          />
        </div>

        {/* 🛠️ Specs Grid */}
        <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4 ml-2 mt-8">Unit Specifications</h3>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: "VIN", val: vehicle.vin, icon: QrCodeIcon },
            { label: "Stock #", val: vehicle.stockNumber, icon: HashtagIcon },
            { label: "Engine", val: vehicle.engine, icon: WrenchScrewdriverIcon },
            { label: "Color", val: vehicle.exteriorColor || "N/A", icon: TagIcon },
            { label: "Drive", val: vehicle.driveType || "N/A", icon: CheckBadgeIcon },
            { label: "Fuel", val: vehicle.fuelType || "N/A", icon: CheckBadgeIcon },
          ].map((spec, idx) => (
            <div key={idx} className={`p-5 rounded-3xl border flex flex-col gap-2 ${isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-100 shadow-sm"}`}>
              <spec.icon className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-0.5">{spec.label}</p>
                <p className={`text-[10px] font-black uppercase tracking-tight truncate ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  {spec.val}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default InventoryDetailPage;