import React, { useState } from 'react';
import { BanknotesIcon, XMarkIcon } from '@heroicons/react/24/outline';

const PriceEditModal = ({ unit, isOpen, onClose, onSave, isDark }) => {
  const [price, setPrice] = useState(unit?.price || "");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(unit._id, Number(price));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/60 animate-in fade-in duration-200">
      <div className={`w-full max-w-sm rounded-[2.5rem] border p-8 shadow-2xl ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black italic uppercase tracking-tighter">Set Listing Price</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 transition-colors">
            <XMarkIcon className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-2xl">$</span>
            <input 
              type="number" 
              autoFocus
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={`w-full pl-12 pr-6 py-5 rounded-2xl border-none text-3xl font-black italic tracking-tighter outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
              }`}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
          >
            Update Inventory
          </button>
        </form>
      </div>
    </div>
  );
};

export default PriceEditModal;