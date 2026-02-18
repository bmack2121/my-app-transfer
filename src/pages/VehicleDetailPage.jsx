import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const VehicleDetailPage = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form States
  const [price, setPrice] = useState('');
  const [mileage, setMileage] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchVehicleDetails();
  }, [vehicleId]);

  const fetchVehicleDetails = async () => {
    try {
      const res = await axiosClient.get(`/inventory/${vehicleId}`);
      setVehicle(res.data);
      setPrice(res.data.price?.toString() || '');
      setMileage(res.data.mileage?.toString() || '');
      setStatus(res.data.status || '');
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await axiosClient.put(`/inventory/${vehicleId}`, {
        price: Number(price),
        mileage: Number(mileage),
        status: status
      });
      
      await Haptics.notification({ type: NotificationType.Success });
      navigate('/inventory'); // Standard React Router navigation
    } catch (err) {
      await Haptics.notification({ type: NotificationType.Error });
      console.error("Update failed:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 p-6 overflow-y-auto">
      {/* 🏷️ Header Section */}
      <header className="mb-8">
        <h1 className="text-3xl font-black text-white uppercase leading-none">
          {vehicle.year} {vehicle.make}
        </h1>
        <p className="text-lg text-slate-400 font-bold mt-2">
          {vehicle.model} {vehicle.trim}
        </p>
      </header>

      {/* 📊 Editable Form Section */}
      <div className="space-y-6">
        <div className="group">
          <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">
            Listing Price ($)
          </label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            inputMode="numeric"
            className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black text-xl border border-slate-800 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="group">
          <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">
            Current Mileage
          </label>
          <input
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            type="number"
            inputMode="numeric"
            className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black text-xl border border-slate-800 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* 🚗 Read-Only Specs Grid */}
        <div className="grid grid-cols-3 bg-slate-900 p-6 rounded-[2rem] border border-slate-800 mt-4 shadow-2xl">
          <div className="flex flex-col items-center border-r border-slate-800">
            <span className="text-[8px] text-slate-500 font-black uppercase mb-1">Drive</span>
            <span className="text-white font-bold text-sm">{vehicle.driveTrain || 'N/A'}</span>
          </div>
          <div className="flex flex-col items-center border-r border-slate-800">
            <span className="text-[8px] text-slate-500 font-black uppercase mb-1">Fuel</span>
            <span className="text-white font-bold text-sm">{vehicle.fuelType || 'N/A'}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] text-slate-500 font-black uppercase mb-1">Engine</span>
            <span className="text-white font-bold text-xs text-center">{vehicle.engine || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* 💾 Action Button */}
      <button 
        onClick={handleUpdate}
        disabled={saving}
        className={`w-full p-6 rounded-[2rem] mt-10 shadow-2xl font-black uppercase tracking-widest transition-all active:scale-95 ${
          saving ? 'bg-slate-700 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-500'
        }`}
      >
        {saving ? 'Syncing...' : 'Save Unit Changes'}
      </button>

      {/* Extra space for safe area at bottom */}
      <div className="h-20" />
    </div>
  );
};

export default VehicleDetailPage;