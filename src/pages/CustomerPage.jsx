import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "../api/axiosClient";
import CarfaxViewer from "../components/CarfaxViewer";
import CustomerForm from "../components/CustomerForm";
import CustomerList from "../components/CustomerList";
import CreditBand from "../components/Sales/CreditBand"; 
import { Camera } from '@capacitor/camera';
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics"; // ✅ Native Haptics
import { Phone, Mail, MessageSquare, Video, UserPlus, Zap, Car, ShieldAlert, Loader2 } from 'lucide-react';

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('deal');
  const [isUploading, setIsUploading] = useState(false);
  const [isQualifying, setIsQualifying] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);

  const triggerHaptic = async (style = ImpactStyle.Light) => {
    try { await Haptics.impact({ style }); } catch (e) {}
  };

  const loadCustomers = useCallback(async () => {
    try {
      const res = await axiosClient.get("/customers");
      setCustomers(res.data);
      if (selected) {
        const updated = res.data.find(c => c._id === selected._id);
        if (updated) setSelected(updated);
      } else if (res.data.length > 0) {
        setSelected(res.data[0]);
      }
    } catch (err) { console.error(err); }
  }, [selected]);

  useEffect(() => { loadCustomers(); }, []);

  // ✅ Reset consent when lead changes
  useEffect(() => {
    setHasConsent(false);
  }, [selected?._id]);

  const handleRunSoftPull = async () => {
    if (!selected || !hasConsent) return;
    setIsQualifying(true);
    try {
      const res = await axiosClient.post(`/customers/${selected._id}/soft-pull`, { consent: true });
      await Haptics.notification({ type: NotificationType.Success });
      setSelected(res.data); 
      loadCustomers();
    } catch (err) {
      console.error("Credit Pull Failed", err);
      await Haptics.notification({ type: NotificationType.Error });
    } finally {
      setIsQualifying(false);
    }
  };

  const handleRecordVideo = async () => {
    if (!selected) return;
    try {
      const video = await Camera.pickVideos({ limit: 1 });
      if (video.videos.length > 0) {
        setIsUploading(true);
        const videoFile = video.videos[0];
        const formData = new FormData();
        
        // Convert webPath to blob for native upload
        const response = await fetch(videoFile.webPath);
        const blob = await response.blob();
        formData.append("video", blob, `walkthrough_${selected._id}.mp4`);

        await axiosClient.post(`/customers/${selected._id}/video`, formData, {
          onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total))
        });
        
        await Haptics.notification({ type: NotificationType.Success });
        loadCustomers();
      }
    } catch (err) { 
        console.error("Video Upload Error:", err); 
    } finally { 
        setIsUploading(false); 
        setUploadProgress(0); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-24 pt-safe">
      <header className="flex justify-between items-center mb-8 px-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter italic uppercase">Pipeline</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Active Deal Management</p>
        </div>
        <button 
          onClick={() => { triggerHaptic(ImpactStyle.Medium); setShowForm(!showForm); }} 
          className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-900/40 active:scale-95 transition-all"
        >
          <UserPlus size={24} />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lead List */}
        <div className="lg:col-span-4 space-y-4">
          {showForm && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] animate-in fade-in zoom-in-95">
              <CustomerForm onAdd={() => { setShowForm(false); loadCustomers(); }} />
            </div>
          )}
          <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
             <CustomerList customers={customers} onSelect={setSelected} selectedId={selected?._id} />
          </div>
        </div>

        {/* Right Column: Deal Workspace */}
        <div className="lg:col-span-8">
          {selected ? (
            <div className="bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden">
              <div className="p-8 pb-0">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                  <div>
                    <h2 className="text-4xl font-black text-white mb-2 leading-none tracking-tight">
                      {selected.firstName} {selected.lastName}
                    </h2>
                    <div className="flex gap-5 text-slate-500 mt-4">
                      <a href={`tel:${selected.phone}`} className="hover:text-blue-400 transition-colors"><Phone size={22} /></a>
                      <a href={`mailto:${selected.email}`} className="hover:text-blue-400 transition-colors"><Mail size={22} /></a>
                      <button onClick={() => triggerHaptic()} className="hover:text-blue-400 transition-colors"><MessageSquare size={22} /></button>
                    </div>
                  </div>
                  <button 
                    onClick={handleRecordVideo} 
                    className="bg-white text-black px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-3 hover:bg-slate-200 active:scale-95 transition-all"
                  >
                    {isUploading ? (
                      <span className="text-sm font-bold uppercase">{uploadProgress}%</span>
                    ) : (
                      <><Video size={20} /> <span className="uppercase text-[10px] tracking-widest">Video walkthrough</span></>
                    )}
                  </button>
                </div>

                <div className="flex gap-10 border-b border-slate-800 mt-10">
                  {['deal', 'history', 'carfax'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => { triggerHaptic(); setActiveTab(tab); }}
                      className={`pb-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                        activeTab === tab ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-600'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-8">
                {activeTab === 'deal' && (
                  <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                    <section>
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Zap size={14} className="text-yellow-500" /> 01. Qualification
                      </h3>
                      
                      {!selected.qualification?.creditBand || selected.qualification.creditBand === 'Unknown' ? (
                        <div className="bg-slate-950/50 border border-slate-800 p-8 rounded-[2.5rem]">
                          <div className="flex items-center justify-between mb-8 gap-4">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
                              Soft Pull Consent
                            </p>
                            <input 
                              type="checkbox" 
                              checked={hasConsent}
                              onChange={(e) => setHasConsent(e.target.checked)}
                              className="w-8 h-8 rounded-xl accent-blue-500 bg-slate-800 border-none cursor-pointer"
                            />
                          </div>
                          <button 
                            onClick={handleRunSoftPull}
                            disabled={!hasConsent || isQualifying}
                            className={`w-full py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                              hasConsent ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            }`}
                          >
                            {isQualifying ? <Loader2 className="animate-spin" /> : <ShieldAlert size={20} />}
                            {isQualifying ? 'Syncing...' : 'Execute The Pull'}
                          </button>
                        </div>
                      ) : (
                        <CreditBand 
                          range={selected.qualification.ficoRange} 
                          tier={selected.qualification.creditBand} 
                        />
                      )}
                    </section>

                    <section>
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Car size={14} className="text-blue-500" /> 02. Trade-In Appraisal
                      </h3>
                      <button className="w-full py-6 bg-slate-900 border border-slate-800 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all">
                        Launch Walkaround Checklist
                      </button>
                    </section>
                  </div>
                )}
                {activeTab === 'carfax' && <CarfaxViewer vin={selected.vin} />}
              </div>
            </div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center text-slate-800 border-4 border-dashed border-slate-900 rounded-[4rem]">
              <UserPlus size={48} className="mb-4 opacity-10" />
              <p className="font-black uppercase tracking-widest text-xs">Select a lead to desk the deal</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerPage;