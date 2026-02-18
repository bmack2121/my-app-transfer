import React, { useState, useMemo } from 'react';
import VehicleCard from './VehicleCard';

const InventoryList = ({ vehicles = [] }) => {
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
        const matchesStatus = filter === 'all' || v.status === filter;
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
        return sortBy === 'aging' ? dateA - dateB : dateB - dateA;
      });
  }, [vehicles, filter, searchTerm, sortBy]);

  return (
    <div className="space-y-6">
      {/* 2. Controls Section */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <input 
          type="text"
          placeholder="Search by Make, Model, VIN or Stock #..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {['all', 'available', 'hold'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === status ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border-none text-[10px] font-black uppercase tracking-widest rounded-lg py-1.5 px-3 focus:ring-0"
          >
            <option value="newest">Recent Arrivals</option>
            <option value="aging">Oldest Inventory</option>
          </select>
        </div>
      </div>

      {/* 3. Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
        {processedVehicles.length > 0 ? (
          processedVehicles.map((v) => {
            const days = getDaysOnLot(v.createdAt);
            return (
              <div key={v._id || v.vin} className="relative">
                {/* ✅ Stale Unit Badge (Over 30 days) */}
                {days > 30 && v.status === 'available' && (
                  <div className="absolute -top-2 -left-2 z-10 bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg animate-pulse">
                    STALE: {days} DAYS
                  </div>
                )}
                <VehicleCard vehicle={v} aging={days} />
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-10 text-center text-slate-400 text-sm">
            No vehicles found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryList;