import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DLScanner from '../components/Sales/DLScanner';
import { Save, User, MapPin, Calendar, ArrowLeft } from 'lucide-react';

const LeadIntakePage = () => {
  const navigate = useNavigate();
  const [leadData, setLeadData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    dob: '',
    phone: '',
    email: '',
    notes: ''
  });

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleDLData = (data) => {
    setLeadData((prev) => ({
      ...prev,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      address: `${data.address || ''}, ${data.city || ''} ${data.state || ''} ${data.zip || ''}`,
      dob: data.dob || '',
    }));
    setIsDataLoaded(true);
  };

  const handleSaveLead = async () => {
    // Here we will eventually call your backend API to save the lead
    console.log("Saving Lead to VinPro Backend:", leadData);
    // After saving, navigate to the Lead Detail or Dashboard
    navigate('/dashboard'); 
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-slate-800 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">New Customer Intake</h1>
      </header>

      {!isDataLoaded ? (
        <div className="space-y-6">
          <div className="bg-blue-600/10 border border-blue-500/30 p-6 rounded-2xl text-center">
            <User className="mx-auto mb-4 text-blue-400" size={48} />
            <h2 className="text-lg font-semibold mb-2">Scan License to Begin</h2>
            <p className="text-slate-400 text-sm mb-6">
              Scanning the customer's ID automatically populates the guest sheet and saves time.
            </p>
            <DLScanner onLeadCaptured={handleDLData} />
          </div>
          
          <button 
            onClick={() => setIsDataLoaded(true)}
            className="w-full py-3 text-slate-400 text-sm hover:text-white transition-colors"
          >
            Or enter details manually
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          {/* Form Sections */}
          <section className="space-y-4">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Personal Info</label>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  placeholder="First Name"
                  className="bg-transparent border-b border-slate-700 py-2 outline-none focus:border-blue-500"
                  value={leadData.firstName}
                  onChange={(e) => setLeadData({...leadData, firstName: e.target.value})}
                />
                <input 
                  placeholder="Last Name"
                  className="bg-transparent border-b border-slate-700 py-2 outline-none focus:border-blue-500"
                  value={leadData.lastName}
                  onChange={(e) => setLeadData({...leadData, lastName: e.target.value})}
                />
              </div>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Contact & Address</label>
              <input 
                placeholder="Address"
                className="w-full bg-transparent border-b border-slate-700 py-2 outline-none focus:border-blue-500 mb-4"
                value={leadData.address}
                onChange={(e) => setLeadData({...leadData, address: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  placeholder="Phone Number"
                  type="tel"
                  className="bg-transparent border-b border-slate-700 py-2 outline-none focus:border-blue-500"
                  value={leadData.phone}
                  onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
                />
                <input 
                  placeholder="Email"
                  type="email"
                  className="bg-transparent border-b border-slate-700 py-2 outline-none focus:border-blue-500"
                  value={leadData.email}
                  onChange={(e) => setLeadData({...leadData, email: e.target.value})}
                />
              </div>
            </div>
          </section>

          <button 
            onClick={handleSaveLead}
            className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <Save size={20} />
            Create Lead & Start Deal
          </button>
        </div>
      )}
    </div>
  );
};

export default LeadIntakePage;