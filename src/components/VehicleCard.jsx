import React, { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useNavigation } from '@react-navigation/native';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import axiosClient from '../api/axiosClient';

const VehicleCard = ({ vehicle, isBulkMode, isSelected, onToggleSelect }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(vehicle.imageUrl || null);
  const navigation = useNavigation();

  // 🛠️ Navigate to Detail Page
  const handleGoToDetails = (e) => {
    if (e) e.stopPropagation();
    if (isBulkMode) return;
    
    Haptics.impact({ style: ImpactStyle.Light });
    navigation.navigate('VehicleDetail', { vehicleId: vehicle._id });
  };

  const handleCaptureImage = async (e) => {
    e.stopPropagation();
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        source: CameraSource.Camera,
        resultType: CameraResultType.Base64
      });

      setUploading(true);

      // ✅ FIX: Match backend Base64 expectation
      const formattedBase64 = `data:image/jpeg;base64,${image.base64String}`;

      const res = await axiosClient.post(`/inventory/${vehicle._id}/image`, {
        image: formattedBase64
      });
      
      setPreviewUrl(res.data.imageUrl);
      Haptics.notification({ type: NotificationType.Success });
    } catch (err) {
      if (err.message !== "User cancelled photos app") {
        console.error("Camera error:", err);
      }
    } finally {
      setUploading(false);
    }
  };

  // KPI Helpers
  const daysOnLot = vehicle.daysOnLot || 0;
  const agingColor = daysOnLot > 60 ? 'text-rose-600' : daysOnLot > 30 ? 'text-orange-500' : 'text-emerald-600';
  const variance = vehicle.marketVariance || 0; 
  const isAggressivePrice = variance < 0;

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // Strip /api from baseURL to get the root for static /uploads
    const baseUrl = axiosClient.defaults.baseURL?.split('/api')[0] || 'http://192.168.0.73:5000';
    return `${baseUrl}${path}`;
  };

  return (
    <div 
      onClick={() => isBulkMode ? onToggleSelect(vehicle._id) : handleGoToDetails()}
      className={`bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden transition-all relative ${
        isBulkMode && isSelected ? 'ring-4 ring-blue-500 scale-95' : 'active:scale-[0.98] cursor-pointer'
      }`}
    >
      {/* 📸 Image Section */}
      <div className="relative h-44 bg-slate-100 overflow-hidden">
        {previewUrl ? (
          <img 
            src={getFullImageUrl(previewUrl)} 
            alt={`${vehicle.year} ${vehicle.make}`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
            <span className="text-4xl">📸</span>
            <p className="text-[10px] font-black mt-2 tracking-widest uppercase">Add Photo</p>
          </div>
        )}

        {isAggressivePrice && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 z-20">
            <span>📉</span> {Math.abs(variance)}% BELOW MARKET
          </div>
        )}

        {!isBulkMode && (
          <button 
            onClick={handleCaptureImage}
            disabled={uploading}
            className="absolute bottom-3 right-3 w-12 h-12 bg-white text-slate-900 rounded-2xl shadow-xl flex items-center justify-center active:scale-90 transition-transform border border-slate-100 z-20"
          >
            {uploading ? <span className="animate-spin text-lg">⚙️</span> : "📷"}
          </button>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-black text-slate-900 text-lg leading-tight">
            {vehicle.year} {vehicle.make}
            <span className="block text-slate-500 font-bold text-sm">{vehicle.model} {vehicle.trim}</span>
          </h4>
          <span className="text-[10px] font-black text-slate-300 bg-slate-50 px-2 py-1 rounded-lg">
            {vehicle.stockNumber || 'NO STOCK #'}
          </span>
        </div>

        {/* 🚗 Extended Info Row */}
        <div className="flex gap-2 mt-2">
           <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">
             {vehicle.exteriorColor || 'N/A'}
           </span>
           <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">
             {vehicle.driveTrain || 'N/A'}
           </span>
           <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">
             {vehicle.fuelType || 'Gas'}
           </span>
        </div>

        <div className="flex gap-4 mt-3 pb-3 border-b border-slate-50">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aging</p>
            <p className={`text-sm font-black ${agingColor}`}>{daysOnLot} Days</p>
          </div>
          <div className="border-l border-slate-100 pl-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mileage</p>
            <p className="text-sm font-black text-slate-700">{vehicle.mileage?.toLocaleString() || 0} mi</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-black text-slate-900 tracking-tighter">
            ${Number(vehicle.price || 0).toLocaleString()}
          </span>
          
          {!isBulkMode && (
            <button 
              onClick={handleGoToDetails}
              className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest active:scale-95 transition-all"
            >
              Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;