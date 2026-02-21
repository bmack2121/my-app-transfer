import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useDarkMode } from "../hooks/useDarkMode";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

// Components
import VehicleMediaUploader from "../components/VehicleMediaUploader";
import PhotoCarousel from "../components/PhotoCarousel";
import PriceEditModal from "../components/PriceEditModal"; // ✅ Added for quick updates

import { 
  ArrowLeftIcon, 
  TagIcon,
  HashtagIcon,
  WrenchScrewdriverIcon,
  QrCodeIcon,
  CheckBadgeIcon,
  PencilSquareIcon
} from "@heroicons/react/24/outline";

const InventoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useDarkMode();
  
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/inventory/${id}`);
        setVehicle(res.data);
      } catch (error) {
        console.error("Failed to fetch vehicle details:", error);
        navigate("/inventory");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [id, navigate]);

  const triggerHaptic = async (style = ImpactStyle.Light) => {
    try { await Haptics.impact({ style }); } catch (e) {}
  };

  const handleUploadSuccess = (updatedVehicle) => {
    setVehicle(updatedVehicle);
  };

  const handlePriceUpdate = async (unitId, newPrice) => {
    try {
      const { data } = await axiosClient.patch(`/inventory/${unitId}`, { price: Number(newPrice) });
      setVehicle(prev => ({ ...prev, price: data.price }));
      await Haptics.notification({ type: NotificationType.Success });
    } catch (err) {
      await Haptics.notification({ type: NotificationType.Error });
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Syncing Engine...</p>
      </div>
    );
  }

  if (!vehicle) return null;

  return (
    <div className={`min-h-screen pb-32 transition-colors duration-300 ${isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
      
      {/* 📸 Navigation Overlay */}
      <div className="absolute top-0 left-0 w-full z-50 p-6 pt-safe flex justify-between items-center pointer-events-none">
        <button 
          onClick={() => { triggerHaptic(); navigate(-1); }}
          className="p-3 bg-slate-950/40 backdrop-blur-md rounded-2xl border border-white/10 text-white active:scale-90 transition-all shadow-lg pointer-events-auto"
        >
          <ArrowLeftIcon className="w-5 h-5 stroke-[2px]" />
        </button>
        
        <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border backdrop-blur-xl pointer-events-auto ${
          vehicle.status === 'available' ? 'bg-emerald-500/80 border-emerald-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-400'
        }`}>
          {vehicle.status || 'UNKNOWN'}
        </div>
      </div>

      {/* 🖼️ Photo Carousel */}
      <div className="w-full">
        <PhotoCarousel photos={vehicle.photos} isDark={isDark} />
      </div>

      {/* 📝 Details Content */}
      <div className="px-6 -mt-8 relative z-20">
        
        {/* ✅ Interactive Title & Price Card */}
        <div 
          onClick={() => { triggerHaptic(); setIsPriceModalOpen(true); }}
          className={`p-6 rounded-[2.5rem] border shadow-2xl mb-6 backdrop-blur-xl transition-all active:scale-[0.98] cursor-pointer ${
            isDark ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white/90 border-slate-200 text-slate-900"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-1">
                {vehicle.year} {vehicle.make}
              </h1>
              <p className="text-[12px] font-bold text-blue-500 uppercase tracking-widest">{vehicle.model} {vehicle.trim}</p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 mb-1">
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Listing Price</p>
                <PencilSquareIcon className="w-3 h-3 text-blue-500" />
              </div>
              <p className={`text-2xl font-black italic tracking-tighter ${vehicle.price > 0 ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`}>
                {vehicle.price > 0 ? `$${vehicle.price.toLocaleString()}` : "SET PRICE"}
              </p>
            </div>
          </div>
        </div>

        {/* 📷 Native Media Uploader */}
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

      {/* ✅ Quick Price Edit Modal */}
      <PriceEditModal 
        unit={vehicle} 
        isOpen={isPriceModalOpen} 
        isDark={isDark}
        onClose={() => setIsPriceModalOpen(false)} 
        onSave={handlePriceUpdate} 
      />
    </div>
  );
};

export default InventoryDetailPage;