import React from 'react';
import RegisterForm from '../components/RegisterForm';
import { motion } from 'framer-motion';

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl"
      >
        {/* Branding & Context */}
        <div className="text-center mb-8">
          <div className="inline-block bg-pro-metal p-3 rounded-xl mb-4 shadow-glow">
            <h1 className="text-2xl font-black italic tracking-tighter text-white">V</h1>
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
            Vin<span className="text-app-accent">Pro</span> Enrollment
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">
            Authorized Dealership Personnel Only
          </p>
        </div>

        

        {/* The Form Component */}
        <div className="relative">
          {/* Decorative background element for that "Engine" feel */}
          <div className="absolute -inset-1 bg-gradient-to-r from-app-accent to-performance rounded-vin blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          
          <div className="relative bg-app-surface border border-app-border rounded-vin shadow-pro overflow-hidden">
             <RegisterForm />
          </div>
        </div>

        {/* Footer Legal/Info */}
        <footer className="mt-8 text-center space-y-2">
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
            By registering, you agree to the dealership's data handling policies <br /> 
            and 2026 security protocols.
          </p>
        </footer>
      </motion.div>
    </div>
  );
};

export default RegisterPage;