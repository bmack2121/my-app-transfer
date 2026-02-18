import React, { useState } from 'react';
import { CapacitorPluginMlKitTextRecognition } from '@pantrist/capacitor-plugin-ml-kit-text-recognition';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { hapticHeavy, hapticSuccess, hapticError } from "../utils/haptics";
import { User, Phone, Mail, FileText, CreditCard, Loader2 } from 'lucide-react';

const CustomerForm = ({ onAdd }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', leadSource: 'Walk-in', notes: '', isScanned: false
  });

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const num = value.replace(/[^\d]/g, '');
    if (num.length < 4) return num;
    if (num.length < 7) return `(${num.slice(0, 3)}) ${num.slice(3)}`;
    return `(${num.slice(0, 3)}) ${num.slice(3, 6)}-${num.slice(6, 10)}`;
  };

  const handleScanLicense = async () => {
    try {
      setLoading(true);
      const image = await Camera.getPhoto({
        quality: 90, 
        source: CameraSource.Camera, 
        resultType: CameraResultType.Base64
      });
      
      const result = await CapacitorPluginMlKitTextRecognition.detectText({
        base64Image: image.base64String, 
        rotation: 0
      });

      const rawLines = result.text.split('\n').map(l => l.trim());
      const names = rawLines.filter(l => l.length > 2 && !/\d/.test(l) && !/USA|DL|DOT/i.test(l));

      if (names.length >= 1) {
        const full = names[1] ? `${names[1]} ${names[0]}` : names[0];
        setForm(prev => ({ ...prev, name: full.toUpperCase(), isScanned: true }));
        await hapticHeavy();
      }
    } catch (err) {
      console.error("OCR Scan Failed", err);
      await hapticError();
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(form);
    await hapticSuccess();
    setForm({ name: '', phone: '', email: '', leadSource: 'Walk-in', notes: '', isScanned: false });
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">New Lead</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pipeline Entry</p>
        </div>
        <button 
          type="button" 
          onClick={handleScanLicense} 
          disabled={loading}
          className="bg-slate-900 text-white p-3 rounded-xl hover:bg-indigo-600 transition-colors active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <CreditCard size={20} />}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field with User Icon */}
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            name="name" 
            value={form.name} 
            onChange={(e) => setForm({...form, name: e.target.value})} 
            placeholder="Full Name" 
            className="w-full pl-12 p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" 
            required 
          />
        </div>

        {/* Phone Field with Phone Icon */}
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            name="phone" 
            type="tel"
            value={form.phone} 
            onChange={(e) => setForm({...form, phone: formatPhoneNumber(e.target.value)})} 
            placeholder="Phone Number" 
            className="w-full pl-12 p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" 
          />
        </div>

        {/* Email Field with Mail Icon */}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            name="email" 
            type="email"
            value={form.email} 
            onChange={(e) => setForm({...form, email: e.target.value})} 
            placeholder="Email Address" 
            className="w-full pl-12 p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" 
          />
        </div>

        {/* Notes Field with FileText Icon */}
        <div className="relative">
          <FileText className="absolute left-4 top-5 text-slate-300" size={18} />
          <textarea 
            name="notes" 
            value={form.notes} 
            onChange={(e) => setForm({...form, notes: e.target.value})} 
            placeholder="Add internal notes..." 
            className="w-full pl-12 p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium h-24 resize-none" 
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all text-lg"
        >
          Add to Pipeline
        </button>
      </form>
    </div>
  );
};

export default CustomerForm;