import React from "react";

const PrintableDealSheet = ({ lease, finance, summary, vehicle, customer }) => {
  const handlePrint = () => window.print();

  // Helper to safely format numbers for the customer
  const fmt = (val) => {
    const num = Number(val);
    return isNaN(num) ? "0.00" : num.toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  return (
    <div className="mt-10 bg-white p-10 rounded-vin shadow-pro print:m-0 print:p-0 print:shadow-none print:text-black">
      
      {/* 🏁 Header & Control */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8 print:mb-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">
            VIN<span className="text-app-accent print:text-black">PRO</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
            Official Purchase Proposal
          </p>
        </div>
        
        <div className="text-right flex flex-col items-end gap-2">
          <button
            onClick={handlePrint}
            className="bg-midnight text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-app-accent transition-all shadow-glow print:hidden"
          >
            Print Deal Jacket
          </button>
          <p className="text-[10px] font-mono text-slate-400">REF: {new Date().getTime().toString(16).toUpperCase()}</p>
        </div>
      </div>

      {/* 🚗 Vehicle & Client Info */}
      <div className="grid grid-cols-2 gap-8 mb-8 border-b border-slate-200 pb-8">
        <div className="space-y-2">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Customer Information</h3>
          <p className="text-lg font-black text-slate-900">{customer?.name || "____________________________"}</p>
          <p className="text-sm font-bold text-slate-600">PH: {customer?.phone || "____________________________"}</p>
        </div>

        <div className="space-y-2 text-right">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Vehicle Details</h3>
          <p className="text-lg font-black text-slate-900">{vehicle?.year} {vehicle?.make} {vehicle?.model}</p>
          <p className="text-sm font-mono font-bold text-slate-600">VIN: {vehicle?.vin || "____________________________"}</p>
          <p className="text-sm font-bold text-slate-600">STOCK: #{vehicle?.stockNumber || "N/A"}</p>
        </div>
      </div>

      {/* 📊 The Four-Square Comparison */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* LEASE OPTION */}
        <div className="border-2 border-slate-900 p-6 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-slate-900 text-white px-4 py-1 text-[10px] font-black uppercase">Lease</div>
          <h3 className="text-xs font-black uppercase tracking-widest mb-6">Lease Structure</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span>Term:</span> <span className="font-bold">{lease.term} Months</span></div>
            <div className="flex justify-between"><span>Annual Mileage:</span> <span className="font-bold">12,000</span></div>
            <div className="flex justify-between"><span>Cash Down:</span> <span className="font-bold">${fmt(lease.down)}</span></div>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-xs font-bold uppercase">Monthly Payment</span>
              <span className="text-3xl font-black">${fmt(lease.monthly)}</span>
            </div>
          </div>
        </div>

        {/* FINANCE OPTION */}
        <div className="border-2 border-slate-200 p-6 rounded-xl relative">
          <div className="absolute top-0 right-0 bg-slate-200 text-slate-600 px-4 py-1 text-[10px] font-black uppercase">Finance</div>
          <h3 className="text-xs font-black uppercase tracking-widest mb-6">Finance Structure</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span>Term:</span> <span className="font-bold">{finance.term} Months</span></div>
            <div className="flex justify-between"><span>APR:</span> <span className="font-bold">{finance.rate}%</span></div>
            <div className="flex justify-between"><span>Cash Down:</span> <span className="font-bold">${fmt(finance.down)}</span></div>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-xs font-bold uppercase">Monthly Payment</span>
              <span className="text-3xl font-black">${fmt(finance.monthly)}</span>
            </div>
          </div>
        </div>
      </div>

      

      {/* 💰 Itemized Breakdown */}
      <div className="bg-slate-50 print:bg-transparent border border-slate-200 p-8 rounded-xl mb-12">
        <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-slate-400">Price Breakdown</h3>
        <div className="space-y-4 font-bold text-slate-700">
          <div className="flex justify-between"><span>Selling Price:</span> <span>${fmt(summary.price)}</span></div>
          <div className="flex justify-between"><span>Dealer Doc Fee:</span> <span>${fmt(summary.docFee)}</span></div>
          <div className="flex justify-between text-rose-600"><span>Trade-In Credit:</span> <span>-${fmt(summary.tradeValue)}</span></div>
          <div className="flex justify-between"><span>Sales Tax ({summary.taxRate}%):</span> <span>${fmt(summary.taxes)}</span></div>
          <div className="pt-6 border-t-2 border-slate-900 flex justify-between items-baseline text-slate-900">
            <span className="text-sm font-black uppercase tracking-[0.2em]">Total Due At Signing</span>
            <span className="text-4xl font-black">${fmt(summary.driveOff)}</span>
          </div>
        </div>
      </div>

      {/* ✍️ Signature Blocks */}
      <div className="grid grid-cols-2 gap-20 pt-10 border-t border-slate-200 italic text-slate-400">
        <div className="space-y-12">
          <div className="border-b border-slate-400 pb-2">X</div>
          <p className="text-[10px] font-bold uppercase not-italic tracking-widest">Customer Approval Signature</p>
        </div>
        <div className="space-y-12 text-right">
          <div className="border-b border-slate-400 pb-2">X</div>
          <p className="text-[10px] font-bold uppercase not-italic tracking-widest">Authorized Dealer Manager</p>
        </div>
      </div>

      <p className="text-[8px] text-center mt-12 text-slate-400 uppercase tracking-widest leading-relaxed">
        * This proposal is based on credit approval. Payments are estimates and subject to final verification. <br />
        Generated via VinPro Desking System — 2026.
      </p>
    </div>
  );
};

export default PrintableDealSheet;