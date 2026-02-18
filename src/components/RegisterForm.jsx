import React, { useState, useContext } from 'react';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

// ✅ FIX 1: Import the specific haptic functions instead of the missing wrapper
import { hapticSuccess, hapticError } from "../utils/haptics";

const RegisterForm = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sales'
  });

  const [loading, setLoading] = useState(false);
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Single-Hop Registration
      const { data } = await axiosClient.post('/auth/register', form);

      if (data.token) {
        localStorage.setItem('token', data.token);
        
        setAuth({
          user: data.user,
          token: data.token,
          isAuthenticated: true
        });

        // ✅ FIX 2: Call the specific success function
        await hapticSuccess(); 
        
        navigate('/dashboard');
      }

    } catch (err) {
      // ✅ FIX 3: Call the specific error function
      await hapticError();

      const msg =
        err.response?.data?.message ||
        err.message ||
        "Registration Failed";

      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-app-bg px-6">
      <div className="w-full max-w-md bg-app-surface p-8 rounded-vin border border-app-border shadow-pro">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-heading font-black tracking-tighter text-white uppercase italic">
            Join Vin<span className="text-app-accent">Pro</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">
            Create your dealership credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              placeholder="Christopher McWilliams"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full p-4 bg-app-bg border border-app-border rounded-xl text-sm font-bold text-white focus:ring-2 focus:ring-app-accent outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="name@dealership.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full p-4 bg-app-bg border border-app-border rounded-xl text-sm font-bold text-white focus:ring-2 focus:ring-app-accent outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Set Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full p-4 bg-app-bg border border-app-border rounded-xl text-sm font-bold text-white focus:ring-2 focus:ring-app-accent outline-none"
            />
          </div>

          <div className="pt-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
              Organization Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['sales', 'manager'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm({ ...form, role })}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    form.role === role
                      ? 'bg-app-accent border-app-accent text-white shadow-glow'
                      : 'border-app-border text-slate-500'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 mt-4 bg-pro-metal text-white font-black rounded-xl shadow-glow active:scale-95 transition-all uppercase tracking-widest text-xs"
          >
            {loading ? "Creating Account..." : "Initialize Onboarding"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-[10px] font-black uppercase text-slate-500 hover:text-app-accent transition-colors tracking-widest"
          >
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;