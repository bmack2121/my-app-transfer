import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { NativeBiometric } from "capacitor-native-biometric";
import { FingerPrintIcon } from "@heroicons/react/24/solid";

// Safe haptics wrapper
import { hapticWarning, hapticSuccess, hapticError } from "../utils/haptics";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Trigger haptic feedback if redirected due to expired session
    if (params.get("expired") === "true") {
      hapticWarning();
    }

    // Check if biometric hardware is ready
    const checkBiometrics = async () => {
      try {
        const result = await NativeBiometric.isAvailable();
        // Only show button if hardware is ready AND a token exists
        const hasToken = localStorage.getItem("token");
        if (result.isAvailable && hasToken) {
          setIsBiometricAvailable(true);
        }
      } catch (e) {
        console.log("Biometrics not supported in browser context");
      }
    };
    checkBiometrics();
  }, []);

  const handleBiometricLogin = async () => {
    try {
      await NativeBiometric.verifyIdentity({
        reason: "Log in to VinPro Access Portal",
        title: "Biometric Authentication",
        subtitle: "Identify yourself to continue",
        description: "Use fingerprint or face recognition",
      });

      await hapticSuccess();
      // If verification passes, we assume the token in localStorage is valid
      navigate("/dashboard");
    } catch (err) {
      await hapticError();
      console.error("Biometric failed", err);
      // Fallback: stay on page so they can use the manual form
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-3xl border border-white/10 shadow-xl">

        <h1 className="text-center text-2xl font-black text-white tracking-tight mb-8 uppercase italic">
          VinPro <span className="text-app-accent">Access</span>
        </h1>

        <LoginForm />

        {/* ✅ BIOMETRIC LOGIN OPTION */}
        {isBiometricAvailable && (
          <button
            onClick={handleBiometricLogin}
            className="mt-4 w-full py-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all group"
          >
            <FingerPrintIcon className="w-6 h-6 text-app-accent group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
              Biometric Quick Entry
            </span>
          </button>
        )}

        {/* Forgot Password Link */}
        <p
          onClick={() => navigate("/forgot-password")}
          className="text-center text-xs text-app-accent mt-6 cursor-pointer hover:underline tracking-widest uppercase font-bold"
        >
          Forgot Password?
        </p>

        {/* Registration Link */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
            New Dealership?
          </p>
          <button
            onClick={() => navigate("/register")}
            className="w-full py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-white hover:bg-slate-700 hover:border-app-accent transition-all"
          >
            Create New Account
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-600 mt-6 tracking-widest uppercase font-bold">
          Secure Dealer Authentication
        </p>
      </div>
    </div>
  );
};

export default LoginPage;