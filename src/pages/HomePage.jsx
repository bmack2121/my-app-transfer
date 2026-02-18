import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// ✅ Safe haptics wrapper
import { hapticMedium } from "../utils/haptics";

const HomePage = () => {
  const [vinQuery, setVinQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (vinQuery.length < 17) return; // Simple validation

    // 🔵 Safe haptic
    await hapticMedium();

    navigate('/carfax', { state: { vin: vinQuery } });
  };

  return (
    <div className="bg-app-bg text-white min-h-screen selection:bg-app-accent/30">

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[60%] h-[100%] bg-gradient-to-l from-app-accent/10 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-7xl font-black italic tracking-tighter mb-4 leading-[0.9]">
              VIN<span className="text-app-accent">PRO</span>
            </h1>

            <p className="text-xl font-bold text-slate-400 mb-10 tracking-tight uppercase">
              Automotive Intelligence <span className="text-slate-700 mx-2">//</span> Precision Desking
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/scanner')}
                className="bg-pro-metal px-10 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-glow hover:scale-105 transition-transform"
              >
                Launch Scanner
              </button>

              <button
                onClick={() => navigate('/login')}
                className="border border-app-border px-10 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all"
              >
                Dealer Portal
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEARCH COMMAND BAR */}
      <section className="px-6 -mt-8 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto bg-app-surface border border-app-border shadow-pro rounded-vin p-2 flex flex-col md:flex-row items-center gap-2"
        >
          <div className="flex-1 flex items-center px-4 gap-4 w-full">
            <span className="text-slate-600">🔎</span>

            <input
              className="flex-1 bg-transparent py-4 outline-none font-mono text-xl font-black placeholder:text-slate-800 uppercase"
              placeholder="ENTER 17-CHAR VIN..."
              maxLength={17}
              value={vinQuery}
              onChange={(e) => setVinQuery(e.target.value.toUpperCase())}
            />
          </div>

          <button
            onClick={handleSearch}
            className="w-full md:w-auto bg-app-accent text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-performance transition-colors"
          >
            Initialize Lookup
          </button>
        </motion.div>
      </section>

      {/* CORE CAPABILITIES */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Optical Recognition"
              desc="Next-gen ML Kit scanning for instant VIN acquisition on the lot."
            />
            <FeatureCard
              title="Market Velocity"
              desc="Real-time desking metrics and predictive pricing models."
            />
            <FeatureCard
              title="Master Audit"
              desc="Comprehensive history reports including service, recall, and title status."
            />
          </div>
        </div>
      </section>

      {/* VEHICLE SHOWCASE */}
      <section className="py-24 px-6 bg-app-surface/30 border-y border-app-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-app-accent mb-10">
            Live Market Feed
          </h2>

          <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="min-w-[300px] snap-center bg-app-surface border border-app-border p-5 rounded-vin group hover:border-app-accent transition-all"
              >
                <div className="h-44 bg-app-bg rounded-xl mb-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                <h4 className="font-black text-xl italic uppercase tracking-tighter italic">
                  2026 Porsche 911
                </h4>

                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                  Stock: #VP-9021
                </p>

                <div className="mt-6 flex justify-between items-center">
                  <span className="text-xl font-black text-app-accent">$124,500</span>
                  <button className="text-[10px] font-black uppercase text-slate-400 group-hover:text-white">
                    Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-app-bg border-t border-app-border py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-3xl font-black italic tracking-tighter mb-4">
              VIN<span className="text-app-accent">PRO</span>
            </h3>

            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
              Precision Vehicle Intelligence & Inventory <br /> Management Systems for the 2026 Automotive Market.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-app-accent mb-6">
              Operations
            </h4>

            <ul className="text-xs font-bold text-slate-400 space-y-3 uppercase tracking-wider">
              <li className="hover:text-white cursor-pointer transition-colors">VIN Scanner</li>
              <li className="hover:text-white cursor-pointer transition-colors">Desking Tools</li>
              <li className="hover:text-white cursor-pointer transition-colors">API Access</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-app-accent mb-6">
              Support
            </h4>

            <p className="text-xs font-black text-white">1‑800‑VIN‑PRO</p>
            <p className="text-xs font-bold text-slate-500 mt-2">OPS@VINPRO.IO</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ title, desc }) => (
  <div className="bg-app-surface border border-app-border p-8 rounded-vin hover:border-app-accent transition-all group">
    <div className="w-10 h-1 bg-app-accent mb-6 group-hover:w-full transition-all duration-500" />
    <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4">{title}</h3>
    <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
      {desc}
    </p>
  </div>
);

export default HomePage;