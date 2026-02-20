import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DLScanner from '../components/Sales/DLScanner';
import VinScanner from '../components/VinScanner'; 
import axiosClient from '../api/axiosClient';
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Save, User, MapPin, Calendar, ArrowLeft, Car, Phone, Mail } from 'lucide-react';

const LeadIntakePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const [leadData, setLeadData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    dob: '',
    phone: '',
    email: '',
    notes: '',
    vin: '',
    vehicleYear: '',
    vehicleMake: '',
    vehicleModel: ''
  });

  const triggerHaptic = async (style = ImpactStyle.Light) => {
    try { await Haptics.impact({ style }); } catch (e) {}
  };

  // Triggered when the DLScanner successfully parses a license
  const handleDLData = async (data) => {
    if (!data) return;
    await triggerHaptic(ImpactStyle.Heavy);
    
    setLeadData((prev) => ({
      ...prev,
      firstName: data.firstName || prev.firstName,
      lastName: data.lastName || prev.lastName,
      address: data.address ? `${data.address}, ${data.city || ''} ${data.state || ''} ${data.zip || ''}`.trim() : prev.address,
      dob: data.dob || prev.dob,
    }));
    setIsDataLoaded(true);
  };

  // Triggered when VinScanner captures vehicle info
  const handleVinData = async (vehicle) => {
    if (!vehicle) return;
    await triggerHaptic(ImpactStyle.Heavy);

    setLeadData((prev) => ({
      ...prev,
      vin: vehicle.vin || prev.vin,
      vehicleYear: vehicle.year || prev.vehicleYear,
      vehicleMake: vehicle.make || prev.vehicleMake,
      vehicleModel: vehicle.model || prev.vehicleModel
    }));
    setIsDataLoaded(true);
  };

  const handleSaveLead = async () => {
    if (isSubmitting) return;
    
    // Basic validation
    if (!leadData.firstName || !leadData.lastName) {
      alert("First and Last name are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await triggerHaptic(ImpactStyle.Medium);

      // Structure the payload for your Node.js backend
      const payload = {
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        email: leadData.email,
        phone: leadData.phone,
        address: leadData.address,
        dob: leadData.dob,
        notes: leadData.notes,
        // Map the scanned VIN to a Trade-In object if it exists
        tradeIn: leadData.vin ? {
          vin: leadData.vin,
          year: leadData.vehicleYear,
          make: leadData.vehicleMake,
          model: leadData.vehicleModel
        } : null
      };

      const res = await axiosClient.post('/customers', payload);
      
      try { await Haptics.notification({ type: NotificationType.Success }); } catch (e) {}
      
      // Navigate directly to the newly created customer's profile
      navigate(`/customers/${res.data._id || res.data.id}`); 
      
    } catch (error) {
      console.error("Failed to save lead:", error);
      try { await Haptics.notification({ type: NotificationType.Error }); } catch (e) {}
      alert(error.response?.data?.message || "Failed to save lead. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-safe pb-32">
      {/* The 'no-scan-ui' class hides this block when the native camera lens opens */}
      <div className="no-scan-ui p-6">
        
        <header className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => { triggerHaptic(); navigate(-1); }} 
            className="p-3 bg-slate-900 rounded-2xl border border-slate-800 active:scale-90 transition-all"
          >
            <ArrowLeft size={20} className="stroke-[2px]" />
          </button>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Lead Intake</h1>
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">VinPro Sales Engine</p>
          </div>
        </header>

        <div className="space-y-6">
          {/* ?? Top Action Section: Scanners */}
          <div className="grid grid-cols-2 gap-4">
             <DLScanner onLeadCaptured={handleDLData} />
             <VinScanner onDetected={handleVinData} />
          </div>

          {!isDataLoaded ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-[2.5rem] bg-slate-900/30">
               <User className="mx-auto mb-4 text-slate-700 stroke-[1.5px]" size={48} />
               <p className="text-slate-500 text-xs font-bold uppercase tracking-widest px-8">Scan an ID or Trade-in to begin</p>
               <button 
                onClick={() => { triggerHaptic(); setIsDataLoaded(true); }}
                className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
               >
                 Or Enter Manually
               </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              
              {/* ?? Customer Information */}
              <section className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-blue-500 mb-4">
                  <User size={18} className="stroke-[2.5px]" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Customer Details</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    placeholder="First Name"
                    className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500 text-sm font-bold text-white placeholder-slate-600 transition-all"
                    value={leadData.firstName}
                    onChange={(e) => setLeadData({...leadData, firstName: e.target.value})}
                  />
                  <input 
                    placeholder="Last Name"
                    className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500 text-sm font-bold text-white placeholder-slate-600 transition-all"
                    value={leadData.lastName}
                    onChange={(e) => setLeadData({...leadData, lastName: e.target.value})}
                  />
                </div>
                
                {/* ? Added Contact Fields */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-4 text-slate-500" />
                    <input 
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:border-blue-500 text-sm font-bold text-white placeholder-slate-600 transition-all"
                      value={leadData.phone}
                      onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
                    />
                  </div>
                  
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-4 text-slate-500" />
                    <input 
                      type="email"
                      placeholder="Email Address"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:border-blue-500 text-sm font-bold text-white placeholder-slate-600 transition-all"
                      value={leadData.email}
                      onChange={(e) => setLeadData({...leadData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-4 text-slate-500" />
                  <input 
                    placeholder="Street Address, City, State ZIP"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:border-blue-500 text-sm font-bold text-white placeholder-slate-600 transition-all"
                    value={leadData.address}
                    onChange={(e) => setLeadData({...leadData, address: e.target.value})}
                  />
                </div>
              </section>

              {/* ?? Vehicle Information (Auto-filled by VinScanner) */}
              {(leadData.vin || leadData.vehicleMake) && (
                <section className="bg-blue-600/10 p-6 rounded-[2.5rem] border border-blue-500/20 space-y-4 animate-in zoom-in-95">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <Car size={18} className="stroke-[2.5px]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Trade-In Attached</span>
                  </div>
                  <div>
                    <div className="text-xl font-black italic uppercase tracking-tighter text-white">
                      {leadData.vehicleYear} {leadData.vehicleMake} {leadData.vehicleModel}
                    </div>
                    <div className="text-[11px] text-blue-400 font-mono font-bold mt-1 tracking-wider">
                      VIN: {leadData.vin}
                    </div>
                  </div>
                </section>
              )}

              {/* ?? Submit Button */}
              <button 
                onClick={handleSaveLead}
                disabled={isSubmitting || !leadData.firstName}
                className="w-full py-5 bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 hover:bg-blue-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-[0_15px_30px_-10px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 transition-all active:scale-95 mt-8"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Creating Record...</span>
                ) : (
                  <>
                    <Save size={20} className="stroke-[2.5px]" />
                    Create Lead & Start Deal
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadIntakePage;