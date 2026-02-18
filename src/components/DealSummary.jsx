import React from "react";

const DealSummary = ({ price = 0, down = 0, docFee = 499, taxRate = 0.0925 }) => {
  // ✅ Professional Accounting Logic
  const subtotal = Number(price) + Number(docFee);
  const taxes = subtotal * taxRate;
  const totalPurchasePrice = subtotal + taxes;
  
  // Amount the customer pays today
  const driveOff = Number(down); 
  
  // The balance remaining (what the loan/lease is based on)
  const amountFinanced = totalPurchasePrice - driveOff;

  const Row = ({ label, value, isBold = false, isTotal = false }) => (
    <div className={`flex justify-between items-center py-2 ${isTotal ? "mt-4 pt-4 border-t border-slate-200" : ""}`}>
      <span className={`${isBold ? "font-bold text-slate-900" : "text-slate-500"} text-sm`}>
        {label}
      </span>
      <span className={`${isBold ? "font-black text-slate-900" : "font-medium text-slate-700"} ${isTotal ? "text-xl" : "text-base"}`}>
        {value}
      </span>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl mt-8 animate-in zoom-in-95 duration-300">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Deal Breakdown</h3>
      </div>

      

      <div className="space-y-1">
        <Row label="Selling Price" value={`$${Number(price).toLocaleString()}`} />
        <Row label="Documentation Fee" value={`$${docFee.toLocaleString()}`} />
        
        <div className="bg-slate-50 px-3 py-1 rounded-lg my-2">
          <Row 
            label={`Sales Tax (${(taxRate * 100).toFixed(2)}%)`} 
            value={`$${taxes.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          />
        </div>

        <Row label="Total Purchase Price" value={`$${totalPurchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} isBold />
        
        <Row 
          label="Cash Down Payment" 
          value={`-$${Number(down).toLocaleString()}`} 
          isBold 
        />

        <div className="bg-blue-600 rounded-2xl p-4 mt-6 text-white shadow-lg shadow-blue-900/20">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Amount to Finance</p>
              <p className="text-2xl font-black leading-none mt-1">
                ${amountFinanced.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-[10px] font-bold uppercase">Drive-Off</p>
              <p className="text-lg font-bold">${Number(down).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-[10px] text-slate-400 mt-4 text-center italic">
        *Figures are estimates based on provided data and subject to final credit approval.
      </p>
    </div>
  );
};

export default DealSummary;