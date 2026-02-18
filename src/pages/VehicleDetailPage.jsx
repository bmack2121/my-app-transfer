import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const VehicleDetailPage = () => {
  // ✅ FIXED: Must match the ":id" defined in App.js
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form States
  const [price, setPrice] = useState('');
  const [mileage, setMileage] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (id) {
      fetchVehicleDetails();
    }
  }, [id]);

  const fetchVehicleDetails = async () => {
    try {
      setLoading(true);
      // ✅ Using 'id' from useParams
      const res = await axiosClient.get(`/inventory/${id}`);
      const data = res.data;
      
      setVehicle(data);
      setPrice(data.price?.toString() || '');
      setMileage(data.mileage?.toString() || '');
      setStatus(data.status || '');
    } catch (err) {
      console.error("Fetch error:", err);
      try {
        await Haptics.notification({ type: NotificationType.Error });
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
      
      await axiosClient.put(`/inventory/${id}`, {
        price: Number(price),
        mileage: Number(mileage),
        status: status
      });
      
      try {
        await Haptics.notification({ type: NotificationType.Success });
      } catch (e) {}
      
      navigate('/inventory'); 
    } catch (err) {
      try {
        await Haptics.notification({ type: NotificationType.Error });
      } catch (e) {}
      console.error("Update failed:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-slate-950 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // ✅ Safety Check: Prevent crash if vehicle wasn't found
  if (!vehicle) {
    return (
      <div className="flex-1 bg-slate-950 p-6 text-center pt-20">
        <p className="text-rose-500 font-black uppercase">Vehicle Not Found</p>
        <button onClick={() => navigate('/inventory')} className="mt-4 text-blue-500 underline">Return to Inventory</button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 p-6 overflow-y-auto pt-safe">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-white uppercase leading-none italic tracking-tighter">
          {vehicle.year} {vehicle.make}
        </h1>
        <p className="text-lg text-slate-400 font-bold mt-2 uppercase">
          {vehicle.model} {vehicle.trim}
        </p>
      </header>

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
            className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black text-xl border border-slate-800 focus:border-blue-500 outline-none transition-all shadow-inner"
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
            className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black text-xl border border-slate-800 focus:border-blue-500 outline-none transition-all shadow-inner"
          />
        </div>

        {/* 🚗 Read-Only Specs Grid */}
        <div className="grid grid-cols-3 bg-slate-900 p-6 rounded-[2rem] border border-slate-800 mt-4 shadow-2xl">
          <div className="flex flex-col items-center border-r border-slate-800">
            <span className="text-[8px] text-slate-500 font-black uppercase mb-1">Drive</span>
            <span className="text-white font-bold text-sm uppercase">{vehicle.driveType || 'N/A'}</span>
          </div>
          <div className="flex flex-col items-center border-r border-slate-800">
            <span className="text-[8px] text-slate-500 font-black uppercase mb-1">Fuel</span>
            <span className="text-white font-bold text-sm uppercase">{vehicle.fuelType || 'N/A'}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] text-slate-500 font-black uppercase mb-1">Engine</span>
            <span className="text-white font-bold text-[10px] text-center uppercase leading-tight">{vehicle.engine || 'N/A'}</span>
          </div>
        </div>
      </div>

      <button 
        onClick={handleUpdate}
        disabled={saving}
        className={`w-full p-6 rounded-[2rem] mt-10 shadow-2xl font-black uppercase tracking-widest transition-all active:scale-95 ${
          saving ? 'bg-slate-700 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-500'
        }`}
      >
        {saving ? 'Syncing...' : 'Save Unit Changes'}
      </button>

      <div className="h-20" />
    </div>
  );
};

export default VehicleDetailPage;