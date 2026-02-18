import React, { useState, useContext, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon, FingerPrintIcon } from "@heroicons/react/24/solid";
import { useBiometrics } from "../hooks/useBiometrics";
import { Capacitor } from "@capacitor/core";

// Haptics
import { hapticHeavy, hapticError } from "../utils/haptics";

const LoginForm = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [canUseBio, setCanUseBio] = useState(false);

  const { setAuth } = useContext(AuthContext);
  const { loginWithBiometrics, enrollBiometrics, checkAvailability } = useBiometrics();
  const navigate = useNavigate();

  useEffect(() => {
    const initBio = async () => {
      if (Capacitor.isNativePlatform() && typeof checkAvailability === "function") {
        try {
          const available = await checkAvailability();
          const enrolled = localStorage.getItem("biometrics_enrolled") === "true";
          if (available && enrolled) setCanUseBio(true);
        } catch (e) {
          console.warn("Biometrics check skipped");
        }
      }
    };
    initBio();
  }, [checkAvailability]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const executeLogin = async (credentials) => {
    setLoading(true);
    try {
      const res = await axiosClient.post("/auth/login", credentials);
      const { token, user } = res.data;

      // 1. Critical: Update Axios headers IMMEDIATELY for the next request
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 2. Persist to storage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // 3. Update Global Context
      setAuth(user, token);

      // 4. Handle Biometrics (Native only)
      if (Capacitor.isNativePlatform() && typeof enrollBiometrics === "function") {
        const alreadyEnrolled = localStorage.getItem("biometrics_enrolled") === "true";
        if (!alreadyEnrolled) {
          const wantBio = window.confirm("Enable FaceID / TouchID for VinPro?");
          if (wantBio) {
            await enrollBiometrics(credentials.email, credentials.password);
            localStorage.setItem("biometrics_enrolled", "true");
            setCanUseBio(true);
          }
        }
      }

      if (typeof hapticHeavy === "function") await hapticHeavy();

      // 5. Persistence Delay: Prevents "kick-back" on mobile by allowing storage to settle
      setTimeout(() => {
        navigate("/dashboard");
      }, 150);

    } catch (err) {
      if (typeof hapticError === "function") await hapticError();
      console.error("Login Fail:", err.response?.data);
      const message = err.response?.data?.message || "Check your credentials and try again.";
      alert(`Access Denied: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const creds = await loginWithBiometrics();
      if (creds?.email && creds?.password) {
        await executeLogin({ email: creds.email, password: creds.password });
      }
    } catch (e) {
      console.error("Biometric Login Error", e);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        executeLogin(form);
      }}
      className="space-y-5"
    >
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          Access Email
        </label>
        <input
          name="email"
          type="email"
          placeholder="id@vinpro.io"
          value={form.email}
          onChange={handleChange}
          className="w-full p-4 bg-app-bg border border-app-border rounded-xl font-bold text-white focus:ring-2 focus:ring-app-accent outline-none transition-all"
          required
        />
      </div>

      <div className="space-y-1 relative">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          Security Key
        </label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            className="w-full p-4 bg-app-bg border border-app-border rounded-xl font-bold text-white focus:ring-2 focus:ring-app-accent outline-none transition-all"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
          >
            {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-5 bg-pro-metal text-white font-black rounded-xl shadow-glow active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
        >
          {loading ? "Syncing..." : "Authorize"}
        </button>

        {canUseBio && (
          <button
            type="button"
            onClick={handleBiometricAuth}
            className="px-6 bg-app-surface border border-app-border rounded-xl text-app-accent hover:border-app-accent shadow-glow transition-all"
          >
            <FingerPrintIcon className="w-6 h-6" />
          </button>
        )}
      </div>
    </form>
  );
};

export default LoginForm;