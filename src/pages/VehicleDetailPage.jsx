import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const VehicleDetailPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [vehicle, setVehicle] = useState(null);
  const [marketData, setMarketData] = useState(null); // 📈 New MarketCheck State
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
      const res = await axiosClient.get(`/inventory/${id}`);
      const data = res.data;
      
      setVehicle(data);
      setPrice(data.price?.toString() || '');
      setMileage(data.mileage?.toString() || '');
      setStatus(data.status || 'available');

      // 🔍 Fetch MarketCheck Insights if VIN is available
      if (data.vin) {
        const marketRes = await axiosClient.get(`/marketcheck/v2/predict/${data.vin}`);
        setMarketData(marketRes.data);
      }
    } catch (err) {
      console.error("Sync Error:", err);
      try { await Haptics.notification({ type: NotificationType.Error }); } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
      
      await axiosClient.put(`/inventory/${id}`, {
        price: Number(price),
        mileage: Number(mileage),
        status: status
      });
      
      try { await Haptics.notification({ type: NotificationType.Success }); } catch (e) {}
      navigate('/inventory'); 
    } catch (err) {
      try { await Haptics.notification({ type: NotificationType.Error }); } catch (e) {}
      console.error("Update failed:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex-1 bg-slate-950 p-6 overflow-y-auto pt-safe pb-24">
      {/* 🏷️ Header */}
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-2">
           <span className="bg-blue-600/10 text-blue-500 text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest">
             {vehicle.stockNumber || 'No Stock #'}
           </span>
           <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest ${status === 'sold' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
             {status}
           </span>
        </div>
        <h1 className="text-4xl font-black text-white uppercase leading-none italic tracking-tighter">
          {vehicle.year} {vehicle.make}
        </h1>
        <p className="text-xl text-slate-500 font-bold uppercase italic tracking-tighter mt-1">
          {vehicle.model} {vehicle.trim}
        </p>
      </header>

      {/* 📈 MARKET INTELLIGENCE SECTION */}
      {marketData && (
        <div className="mb-8 p-6 bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem] shadow-glow">
          <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
             <span className="animate-pulse">📡</span> MarketCheck Insights
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-2xl">
              <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Market Avg</p>
              <p className="text-lg font-black text-white">${marketData.mean_price?.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-2xl">
              <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Rank</p>
              <p className="text-lg font-black text-emerald-500">{marketData.rank || 'Top 10%'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Listing Price */}
        <div className="group">
          <label className="text-[10px] font-black uppercase text-slate-500 mb-3 block tracking-[0.2em] ml-1">Listing Price ($)</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            inputMode="decimal"
            className="w-full bg-slate-900 text-white p-6 rounded-3xl font-black text-2xl border border-slate-800 focus:border-blue-500 outline-none transition-all shadow-2xl"
          />
        </div>

        {/* Odometer */}
        <div className="group">
          <label className="text-[10px] font-black uppercase text-slate-500 mb-3 block tracking-[0.2em] ml-1">Odometer</label>
          <input
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            type="number"
            inputMode="numeric"
            className="w-full bg-slate-900 text-white p-6 rounded-3xl font-black text-2xl border border-slate-800 focus:border-blue-500 outline-none transition-all shadow-2xl"
          />
        </div>

        {/* Status */}
        <div className="group">
          <label className="text-[10px] font-black uppercase text-slate-500 mb-3 block tracking-[0.2em] ml-1">Status</label>
          <div className="grid grid-cols-2 gap-3">
            {['available', 'hold', 'sold', 'trade'].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border transition-all ${
                  status === s ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Technical Badges */}
        <div className="grid grid-cols-3 bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800/50 shadow-inner">
          <TechnicalBadge label="Drive" value={vehicle.driveType} />
          <TechnicalBadge label="Fuel" value={vehicle.fuelType} border={true} />
          <TechnicalBadge label="Engine" value={vehicle.engine} border={true} />
        </div>
      </div>

      {/* Save Button */}
      <button 
        onClick={handleUpdate}
        disabled={saving}
        className={`w-full p-7 rounded-[2.5rem] mt-12 shadow-2xl font-black uppercase tracking-[0.3em] transition-all active:scale-95 ${
          saving ? 'bg-slate-800 text-slate-600' : 'bg-blue-600 text-white'
        }`}
      >
        {saving ? 'Syncing...' : 'Commit Changes'}
      </button>

      <div className="h-20" />
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex-1 bg-slate-950 flex justify-center items-center h-screen">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const TechnicalBadge = ({ label, value, border }) => (
  <div className={`flex flex-col items-center ${border ? 'border-l border-slate-800' : ''}`}>
    <span className="text-[8px] text-slate-600 font-black uppercase mb-1 tracking-widest">{label}</span>
    <span className="text-white font-bold text-[10px] uppercase truncate px-2">{value || 'N/A'}</span>
  </div>
);

export default VehicleDetailPage;