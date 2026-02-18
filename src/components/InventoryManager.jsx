import React, { useState, useEffect } from "react";
import InventoryForm from "./InventoryForm";
import InventoryList from "./InventoryList";
import axiosClient from "../api/axiosClient";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const InventoryManager = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Bulk Action State
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkMode, setIsBulkMode] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/inventory");
      setVehicles(res.data);
    } catch (err) {
      console.error("VinPro Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdate = async (newStatus) => {
    try {
      setLoading(true);
      await axiosClient.put("/inventory/bulk-update", {
        ids: selectedIds,
        status: newStatus
      });

      await Haptics.notification({ type: 'SUCCESS' });
      
      // Reset and Refresh
      setSelectedIds([]);
      setIsBulkMode(false);
      fetchInventory();
    } catch (err) {
      console.error("Bulk update failed", err);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // ✅ Dashboard KPI Calculations
  const availableVehicles = vehicles.filter(v => v.status === 'available');
  const totalLotValue = availableVehicles.reduce((sum, v) => sum + (Number(v.price) || 0), 0);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8 pb-32">
      
      {/* 1. Header & Quick Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Lot Manager</h1>
          <p className="text-slate-500 font-medium">Real-time inventory control for VinPro</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none bg-white p-4 rounded-3xl border border-slate-100 shadow-sm text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available</p>
            <p className="text-xl font-black text-blue-600">{availableVehicles.length}</p>
          </div>
          <div className="flex-1 md:flex-none bg-white p-4 rounded-3xl border border-slate-100 shadow-sm text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lot Value</p>
            <p className="text-xl font-black text-slate-900">${(totalLotValue / 1000).toFixed(1)}k</p>
          </div>
          <button 
            onClick={() => {
              setIsBulkMode(!isBulkMode);
              setSelectedIds([]);
            }}
            className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg ${
              isBulkMode ? "bg-orange-500 text-white" : "bg-slate-900 text-white"
            }`}
          >
            {isBulkMode ? "Exit Bulk" : "Bulk Edit"}
          </button>
        </div>
      </div>

      

      {/* 2. Add Vehicle Section */}
      {!isBulkMode && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
           <InventoryForm onAdd={fetchInventory} />
        </div>
      )}

      {/* 3. Bulk Action Floating Toolbar */}
      {isBulkMode && selectedIds.length > 0 && (
        <div className="fixed bottom-8 inset-x-4 z-50 bg-slate-900 text-white p-5 rounded-[2.5rem] shadow-2xl flex items-center justify-between border border-white/10 animate-in slide-in-from-bottom-12">
          <div className="pl-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Selected</p>
            <p className="text-xl font-black">{selectedIds.length} Units</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => handleBulkUpdate('available')}
              className="bg-emerald-600 px-6 py-3 rounded-2xl text-xs font-black uppercase shadow-lg shadow-emerald-900/40"
            >
              Set Avail
            </button>
            <button 
              onClick={() => handleBulkUpdate('sold')}
              className="bg-rose-600 px-6 py-3 rounded-2xl text-xs font-black uppercase shadow-lg shadow-rose-900/40"
            >
              Mark Sold
            </button>
          </div>
        </div>
      )}

      {/* 4. The Inventory Grid */}
      <div className={`${isBulkMode ? 'opacity-90' : 'opacity-100'} transition-opacity`}>
        {loading ? (
          <div className="text-center py-20 font-bold text-slate-400">Loading Warehouse...</div>
        ) : (
          <InventoryList 
            vehicles={vehicles} 
            isBulkMode={isBulkMode} 
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
          />
        )}
      </div>
    </div>
  );
};

export default InventoryManager;