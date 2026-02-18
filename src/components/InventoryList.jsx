import React, { useState, useMemo } from 'react';
import VehicleCard from './VehicleCard';

const InventoryList = ({ vehicles = [], isDark = true }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' or 'aging'

  // Helper to calculate days on lot
  const getDaysOnLot = (date) => {
    if (!date) return 0;
    const created = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // ✅ Optimized Filter & Sort Logic
  const processedVehicles = useMemo(() => {
    return vehicles
      .filter(v => {
        const matchesStatus = filter === 'all' || v.status?.toLowerCase() === filter.toLowerCase();
        const search = searchTerm.toLowerCase();
        const matchesSearch = 
          v.make?.toLowerCase().includes(search) ||
          v.model?.toLowerCase().includes(search) ||
          v.stockNumber?.toLowerCase().includes(search) ||
          v.vin?.toLowerCase().includes(search);
        
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        // Aging puts the oldest (earliest date) at the top
        return sortBy === 'aging' ? dateA - dateB : dateB - dateA;
      });
  }, [vehicles, filter, searchTerm, sortBy]);

  return (
    <div className="space-y-6">
      {/* 📊 Controls & Search */}
      <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} p-5 rounded-[2.5rem] border shadow-xl space-y-4`}>
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Filter Results</h3>
            <span className="text-[10px] font-black text-blue-500 uppercase">{processedVehicles.length} Units Found</span>
        </div>

        <input 
          type="text"
          placeholder="Search Make, Model, VIN or Stock..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full border-none rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-blue-600 transition-all ${
            isDark ? 'bg-slate-950 text-white placeholder:text-slate-600' : 'bg-slate-50 text-slate-900'
          }`}
        />

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex gap-2 p-1 bg-slate-950/50 rounded-xl">
            {['all', 'available', 'hold', 'sold'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  filter === status 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`border-none text-[9px] font-black uppercase tracking-widest rounded-xl py-2 px-4 focus:ring-0 cursor-pointer ${
                isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <option value="newest">Recent Arrivals</option>
            <option value="aging">Oldest Inventory</option>
          </select>
        </div>
      </div>

      {/* 🚗 Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
        {processedVehicles.length > 0 ? (
          processedVehicles.map((v) => {
            const days = getDaysOnLot(v.createdAt);
            const isStale = days > 30 && v.status === 'available';
            
            return (
              <div key={v._id || v.vin} className="relative group">
                {/* ✅ STALE BADGE */}
                {isStale && (
                  <div className="absolute -top-3 left-6 z-20 bg-rose-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-xl animate-pulse ring-4 ring-slate-950">
                    STALE: {days} DAYS
                  </div>
                )}
                
                <VehicleCard 
                    vehicle={v} 
                    aging={days} 
                    isDark={isDark}
                />
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="text-4xl">🔎</div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                No matching units in current inventory
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryList;