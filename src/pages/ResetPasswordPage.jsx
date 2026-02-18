import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { hapticHeavy, hapticError } from "../utils/haptics";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      await hapticError();
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await axiosClient.post(`/auth/reset-password/${token}`, { password });

      await hapticHeavy();
      alert("Password updated successfully");
      navigate("/login");
    } catch (err) {
      await hapticError();
      alert("Reset link invalid or expired");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-3xl border border-white/10 shadow-xl">

        <h1 className="text-center text-2xl font-black text-white tracking-tight mb-8">
          Create New Password
        </h1>

        <form onSubmit={handleReset} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-app-bg border border-app-border rounded-xl font-bold text-white focus:ring-2 focus:ring-app-accent outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full p-4 bg-app-bg border border-app-border rounded-xl font-bold text-white focus:ring-2 focus:ring-app-accent outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-pro-metal text-white font-black rounded-xl shadow-glow active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;