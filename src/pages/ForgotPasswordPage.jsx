import React, { useState } from "react";
import axiosClient from "../api/axiosClient";
import { hapticHeavy, hapticError } from "../utils/haptics";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axiosClient.post("/auth/request-reset", { email });
      console.log("Reset URL:", res.data.resetURL); // For dev only

      setSent(true);
      await hapticHeavy();
    } catch (err) {
      await hapticError();
      alert("Unable to send reset link. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-3xl border border-white/10 shadow-xl">

        <h1 className="text-center text-2xl font-black text-white tracking-tight mb-8">
          Reset Your Password
        </h1>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Account Email
              </label>
              <input
                type="email"
                placeholder="you@vinpro.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-app-bg border border-app-border rounded-xl font-bold text-white focus:ring-2 focus:ring-app-accent outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-pro-metal text-white font-black rounded-xl shadow-glow active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <p className="text-center text-slate-300">
            If that email exists, a reset link has been sent.
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;