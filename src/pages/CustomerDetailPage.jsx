import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Car, 
  FileText, 
  Edit3,
  MessageSquare
} from 'lucide-react';

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosClient.get(`/customers/${id}`);
      setCustomer(data);
    } catch (err) {
      console.error("Failed to fetch customer:", err);
      setError("Could not load customer profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerHaptic = async () => {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
        <p className="text-slate-400 font-bold tracking-widest uppercase text-xs animate-pulse">Loading Profile...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
        <p className="text-red-400 font-bold mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="bg-slate-800 px-6 py-3 rounded-xl font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-32">
      
      {/* Header Profile Section */}
      <div className="bg-slate-900 border-b border-slate-800 pt-safe px-6 pb-8 shadow-lg">
        <header className="flex items-center justify-between mb-6 pt-6">
          <button 
            onClick={() => { triggerHaptic(); navigate('/customers'); }} 
            className="p-3 bg-slate-800 rounded-2xl border border-slate-700 active:scale-90 transition-all"
          >
            <ArrowLeft size={20} className="stroke-[2px]" />
          </button>
          
          <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">{customer.status || 'New Lead'}</span>
          </div>
        </header>

        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center flex-shrink-0 shadow-inner">
            <User size={32} className="text-slate-500 stroke-[1.5px]" />
          </div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-1">
              {customer.firstName} <span className="text-blue-500">{customer.lastName}</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
              Added: {new Date(customer.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex gap-3 mt-8">
          <a href={`tel:${customer.phone}`} className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors border border-slate-700">
            <Phone size={16} className="text-green-400" /> Call
          </a>
          <a href={`sms:${customer.phone}`} className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors border border-slate-700">
            <MessageSquare size={16} className="text-blue-400" /> Text
          </a>
          <a href={`mailto:${customer.email}`} className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors border border-slate-700">
            <Mail size={16} className="text-purple-400" /> Email
          </a>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Contact Info Card */}
        <section className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-slate-400">
              <FileText size={18} className="stroke-[2px]" />
              <span className="text-[10px] font-black uppercase tracking-widest">Contact Details</span>
            </div>
            <button className="text-blue-500 p-2 hover:bg-slate-800 rounded-full transition-colors">
              <Edit3 size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Phone size={20} className="text-slate-600 mt-1" />
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Mobile Phone</p>
                <p className="font-bold text-slate-200">{customer.phone || 'No phone provided'}</p>
              </div>
            </div>
            <div className="h-px w-full bg-slate-800/50"></div>
            
            <div className="flex items-start gap-4">
              <Mail size={20} className="text-slate-600 mt-1" />
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Email Address</p>
                <p className="font-bold text-slate-200">{customer.email || 'No email provided'}</p>
              </div>
            </div>
            <div className="h-px w-full bg-slate-800/50"></div>

            <div className="flex items-start gap-4">
              <MapPin size={20} className="text-slate-600 mt-1" />
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Home Address</p>
                <p className="font-bold text-slate-200 leading-snug">{customer.address || 'No address provided'}</p>
              </div>
            </div>
            <div className="h-px w-full bg-slate-800/50"></div>

            <div className="flex items-start gap-4">
              <Calendar size={20} className="text-slate-600 mt-1" />
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Date of Birth</p>
                <p className="font-bold text-slate-200">{customer.dob || 'Unknown'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trade-In Vehicle Card */}
        {customer.tradeIn?.vin ? (
          <section className="bg-blue-600/10 p-6 rounded-[2rem] border border-blue-500/20 shadow-xl">
            <div className="flex items-center gap-2 text-blue-400 mb-4">
              <Car size={18} className="stroke-[2.5px]" />
              <span className="text-[10px] font-black uppercase tracking-widest">Trade-In Vehicle</span>
            </div>
            
            <div className="mb-4">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">
                {customer.tradeIn.year} {customer.tradeIn.make}
              </h3>
              <p className="text-lg font-bold text-slate-300">{customer.tradeIn.model}</p>
            </div>
            
            <div className="bg-slate-950/50 rounded-xl p-4 border border-blue-500/10 flex justify-between items-center">
              <div>
                <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mb-1">VIN Number</p>
                <p className="font-mono text-sm tracking-wider text-slate-300">{customer.tradeIn.vin}</p>
              </div>
              <button className="px-4 py-2 bg-slate-800 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-700 transition-colors">
                Appraise
              </button>
            </div>
          </section>
        ) : (
          <button className="w-full py-4 border-2 border-dashed border-slate-800 rounded-[2rem] text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-colors flex items-center justify-center gap-2">
            <Car size={16} /> Add Trade-In Vehicle
          </button>
        )}

      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pointer-events-none">
        <button className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-[0_15px_30px_-10px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 transition-all active:scale-95 pointer-events-auto">
          Start Deal Worksheet
        </button>
      </div>

    </div>
  );
};

export default CustomerDetailPage;