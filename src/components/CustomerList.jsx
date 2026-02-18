import React, { useState } from 'react';
import CustomerCard from './CustomerCard';

const CustomerList = ({ customers }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Filter Logic: Search by Name or Phone
  const filteredCustomers = customers?.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.includes(searchTerm)
  ) || [];

  // 2. Handle Empty State
  if (!customers || customers.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
        <div className="text-5xl mb-4 grayscale opacity-50">👥</div>
        <p className="text-slate-600 font-bold text-xl">Your pipeline is empty</p>
        <p className="text-slate-400 text-sm mt-1">Start by scanning a driver's license.</p>
      </div>
    );
  }

  // 3. Aggregate Stats for the Header
  const verifiedCount = customers.filter(c => c.isScanned).length;
  const missingVideoCount = customers.filter(c => !c.walkthroughVideoUrl).length;

  return (
    <div className="space-y-6">
      {/* 4. Stats & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-slate-900 font-black text-lg tracking-tight">Active Pipeline</h3>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">{customers.length} Leads Total</p>
          </div>
          <div className="flex gap-2">
             <div className="text-right">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Verification</span>
                <span className="text-xs font-bold text-blue-600">{verifiedCount} Verified</span>
             </div>
          </div>
        </div>

        {/* 🔍 Dynamic Search */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      

      {/* 5. Alerts Section */}
      {missingVideoCount > 0 && searchTerm === "" && (
        <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center justify-between">
          <p className="text-amber-800 text-xs font-medium">
            ⚠️ {missingVideoCount} leads are waiting for a walkthrough video.
          </p>
        </div>
      )}

      {/* 6. Optimized Grid */}
      <div className="grid grid-cols-1 gap-4 pb-20">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((cust, index) => (
            <CustomerCard 
              key={cust._id || cust.id || `cust-${index}`} 
              customer={cust} 
            />
          ))
        ) : (
          <p className="text-center py-10 text-slate-400 italic">No matches for "{searchTerm}"</p>
        )}
      </div>
    </div>
  );
};

export default CustomerList;