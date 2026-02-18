import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pt-safe">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="uppercase text-[10px] font-black tracking-widest">Back to Pipeline</span>
      </button>

      <h1 className="text-3xl font-black uppercase italic tracking-tighter">
        Lead <span className="text-blue-600">Details</span>
      </h1>
      <p className="text-slate-500 mt-2 font-mono text-xs">Internal ID: {id}</p>
      
      <div className="mt-12 p-8 border border-dashed border-slate-800 rounded-[3rem] text-center">
        <p className="text-slate-600 font-black uppercase text-xs tracking-[0.2em]">
          Lead Data Management Module Coming Soon
        </p>
      </div>
    </div>
  );
};

export default CustomerDetailPage;