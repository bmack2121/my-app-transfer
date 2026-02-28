import React, { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useNavigate } from 'react-router-dom';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import axiosClient from '../api/axiosClient';

const VehicleCard = ({ vehicle, isBulkMode, isSelected, onToggleSelect, isDark = true }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(vehicle.photos?.[0] || vehicle.imageUrl || vehicle.photo || null);
  const navigate = useNavigate();

  // 🛠️ Navigation Helper
  const handleGoToDetails = async (e) => {
    if (e) e.stopPropagation();
    if (isBulkMode) return;
    
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (err) {}
    navigate(`/inventory/${vehicle._id || vehicle.vin}`);
  };

  // 📸 Media Capture
  const handleCaptureImage = async (e) => {
    e.stopPropagation();
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        source: CameraSource.Camera,
        resultType: CameraResultType.Uri 
      });

      setUploading(true);

      const response = await fetch(image.webPath);
      const blob = await response.blob();
      const file = new File([blob], `photo-${Date.now()}.${image.format}`, { 
        type: `image/${image.format}` 
      });

      const formData = new FormData();
      formData.append("photos", file);
      formData.append("stockNumber", vehicle.stockNumber || "VINPRO"); 

      // Send to Render Cloud
      const res = await axiosClient.put(`/inventory/${vehicle._id}`, formData);
      
      if (res.data.photos && res.data.photos.length > 0) {
        setPreviewUrl(res.data.photos[res.data.photos.length - 1]);
      }
      
      try { await Haptics.notification({ type: NotificationType.Success }); } catch (err) {}
    } catch (err) {
      if (err.message !== "User cancelled photos app") {
        console.error("Camera error:", err);
        try { await Haptics.notification({ type: NotificationType.Error }); } catch (e) {}
      }
    } finally {
      setUploading(false);
    }
  };

  // KPI & Market Helpers
  const daysOnLot = vehicle.daysOnLot || 0;
  const agingColor = daysOnLot > 60 ? 'text-rose-500' : daysOnLot > 30 ? 'text-orange-500' : 'text-emerald-500';
  
  const marketPrice = vehicle.marketData?.mean_price || vehicle.marketAverage || 0;
  const isAggressive = (vehicle.marketData?.price_rank === 'Great Deal') || (marketPrice > 0 && vehicle.price < (marketPrice * 0.95));

  // ✅ THE FIX: Point to Render Cloud instead of Local IP
  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path; 
    
    const cloudBackend = "https://autosalespro-backend.onrender.com";
    const baseUrl = (process.env.REACT_APP_API_BASE_URL || `${cloudBackend}/api`).replace('/api', '');
    
    // Clean up paths that might have double slashes or start with 'public'
    const cleanPath = path.replace(/^public\//, "").replace(/^uploads\//, "");
    return `${baseUrl}/uploads/${cleanPath}`;
  };

  return (
    <div 
      onClick={(e) => isBulkMode ? onToggleSelect(vehicle._id) : handleGoToDetails(e)}
      className={`rounded-[2.5rem] border overflow-hidden transition-all relative ${
        isDark ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-100 shadow-md'
      } ${
        isBulkMode && isSelected ? 'ring-4 ring-blue-600 scale-[0.97]' : 'active:scale-[0.98] cursor-pointer'
      }`}
    >
      <div className={`relative h-56 overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
        {previewUrl ? (
          <img 
            src={getFullImageUrl(previewUrl)} 
            alt={`${vehicle.year} ${vehicle.make}`} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found'; }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 opacity-30">
            <span className="text-6xl mb-2">🚗</span>
            <p className="text-[10px] font-black tracking-widest uppercase">No Media</p>
          </div>
        )}

        {isAggressive && (
          <div className="absolute top-4 left-4 bg-emerald-600 text-white text-[9px] font-black px-3 py-1.5 rounded-xl shadow-xl z-20">
            DEAL RANK: AGGRESSIVE
          </div>
        )}

        {!isBulkMode && (
          <button 
            onClick={handleCaptureImage}
            disabled={uploading}
            className="absolute bottom-4 right-4 w-14 h-14 bg-white text-slate-950 rounded-2xl shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-20 border border-white/20 backdrop-blur-md"
          >
            {uploading ? (
              <div className="w-6 h-6 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            ) : (
              <span className="text-2xl">📷</span>
            )}
          </button>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className={`font-black text-2xl leading-none italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-950'}`}>
              {vehicle.year} {vehicle.make}
            </h4>
            <p className="text-blue-500 font-bold text-xs mt-1 uppercase tracking-widest">{vehicle.model} {vehicle.trim}</p>
          </div>
          <span className={`text-[8px] font-black px-2 py-1 rounded-md border ${
            isDark ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-100 text-slate-400'
          }`}>
            #{vehicle.stockNumber || 'STK?'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/5">
          <div className="space-y-1">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Lot Aging</p>
            <p className={`text-xl font-black italic tracking-tighter ${agingColor}`}>{daysOnLot} Days</p>
          </div>
          <div className="pl-4 border-l border-white/5 space-y-1">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Mileage</p>
            <p className={`text-xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {vehicle.mileage ? (vehicle.mileage / 1000).toFixed(1) + 'K' : '0'}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className={`text-2xl font-black italic tracking-tighter leading-none ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {vehicle.price > 0 ? `$${Number(vehicle.price).toLocaleString()}` : "DEALER PRICE"}
            </span>
            {marketPrice > 0 && (
                <span className="text-[8px] font-bold text-slate-500 uppercase mt-1">Market: ${Math.round(marketPrice).toLocaleString()}</span>
            )}
          </div>
          
          {!isBulkMode && (
            <button 
              onClick={handleGoToDetails}
              className="bg-blue-600 text-white text-[10px] font-black px-6 py-3.5 rounded-2xl uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all"
            >
              Inspect
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;