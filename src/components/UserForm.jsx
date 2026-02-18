import React, { useState } from 'react';
import { hapticMedium } from "../utils/haptics";

const UserForm = ({ onAdd }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'sales',
    password: '' // Added for initial account setup
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔵 Safe haptic feedback
      await hapticMedium();

      await onAdd(form);

      setForm({
        name: '',
        email: '',
        role: 'sales',
        password: ''
      });

    } catch (err) {
      console.error("User creation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const InputWrapper = ({ label, children }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl mb-8 animate-in fade-in zoom-in-95">
      <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Onboard Staff</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <InputWrapper label="Full Name">
          <input
            name="name"
            placeholder="e.g. Christopher McWilliams"
            value={form.name}
            onChange={handleChange}
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 transition-all"
            required
          />
        </InputWrapper>

        <InputWrapper label="Dealership Email">
          <input
            name="email"
            type="email"
            placeholder="staff@vinpro.com"
            value={form.email}
            onChange={handleChange}
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 transition-all"
            required
          />
        </InputWrapper>

        <div className="grid grid-cols-2 gap-4">
          <InputWrapper label="Temporary Password">
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 transition-all"
              required
            />
          </InputWrapper>

          <InputWrapper label="Access Level">
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-blue-600 appearance-none transition-all"
            >
              <option value="sales">Sales</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </InputWrapper>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl text-lg shadow-xl active:scale-[0.98] transition-all disabled:bg-slate-400"
        >
          {loading ? "Creating Account..." : "Confirm & Send Invite"}
        </button>
      </form>
    </div>
  );
};

export default UserForm;