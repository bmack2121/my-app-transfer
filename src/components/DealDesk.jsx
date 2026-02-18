import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';
import DealComparison from './DealComparison';

const DealDesk = () => {
  const [loading, setLoading] = useState(false);
  const [dealData, setDealData] = useState(null);
  
  // Local state for the desk inputs
  const [inputs, setInputs] = useState({
    msrp: '',
    sellingPrice: '',
    downPayment: '',
    tradeValue: '',
    term: '36',
    creditScore: '700'
  });

  const handleInputChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const runNumbers = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ We hit both lease and finance endpoints to compare
      const [leaseRes, financeRes] = await Promise.all([
        axiosClient.post('/calculator/lease', { ...inputs, residualPercent: 60, moneyFactor: 0.0025 }),
        axiosClient.post('/calculator/finance', { ...inputs, apr: 5.99 })
      ]);

      setDealData({
        lease: {
          monthly: leaseRes.data.monthlyPayment,
          term: inputs.term,
          residual: 60,
          moneyFactor: 0.0025,
          down: inputs.downPayment
        },
        finance: {
          monthly: financeRes.data.monthlyPayment,
          term: 60, // Finance often defaults to longer terms
          rate: 5.99,
          down: inputs.downPayment
        }
      });
    } catch (err) {
      console.error("Deal calculation failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Deal Desk</h1>
        <p className="text-slate-500">Calculate and compare payment options instantly.</p>
      </div>

      <form onSubmit={runNumbers} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">MSRP</label>
            <input 
              name="msrp" 
              type="number" 
              placeholder="0.00"
              value={inputs.msrp}
              onChange={handleInputChange}
              className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 text-lg font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Selling Price</label>
            <input 
              name="sellingPrice" 
              type="number" 
              placeholder="0.00"
              value={inputs.sellingPrice}
              onChange={handleInputChange}
              className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 text-lg font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Down Payment</label>
            <input 
              name="downPayment" 
              type="number" 
              placeholder="0.00"
              value={inputs.downPayment}
              onChange={handleInputChange}
              className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 text-lg font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Trade-In Value</label>
            <input 
              name="tradeValue" 
              type="number" 
              placeholder="0.00"
              value={inputs.tradeValue}
              onChange={handleInputChange}
              className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 text-lg font-bold"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl text-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95"
        >
          {loading ? "Crunching Numbers..." : "Generate Comparison"}
        </button>
      </form>

      {/* Result Section */}
      {dealData && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <DealComparison lease={dealData.lease} finance={dealData.finance} />
        </div>
      )}
    </div>
  );
};

export default DealDesk;