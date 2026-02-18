import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axiosClient from "../api/axiosClient";

// ✅ Safe haptics wrapper
import { hapticLight } from "../utils/haptics";

const SearchOverlay = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ inventory: [], customers: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSearch = async (val) => {
    setQuery(val);

    if (val.length < 2) {
      setResults({ inventory: [], customers: [] });
      return;
    }

    setLoading(true);
    try {
      const res = await axiosClient.get(`/search?q=${val}`);
      setResults(res.data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = async (path) => {
    await hapticLight();   // 🔵 Safe haptic
    onClose();
    navigate(path);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-app-bg/95 backdrop-blur-xl flex justify-center p-4 pt-20"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -20, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: -20, scale: 0.95 }}
        className="w-full max-w-2xl bg-app-surface border border-app-border rounded-vin shadow-glow h-fit overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Header */}
        <div className="p-6 border-b border-app-border flex items-center gap-4">
          <span className="text-2xl opacity-50">🔎</span>
          <input
            autoFocus
            className="flex-1 bg-transparent text-2xl font-black placeholder:text-slate-700 outline-none uppercase tracking-tighter"
            placeholder="Search Stock # or Name..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {loading && (
            <div className="w-5 h-5 border-2 border-app-accent border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-8 custom-scrollbar">
          {query.length < 2 ? (
            <div className="py-20 text-center opacity-30 italic font-bold">
              Begin typing to search VinPro database...
            </div>
          ) : (
            <>
              {/* Inventory Results */}
              <section className="space-y-2">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                  Vehicles
                </h3>

                {results.inventory.length > 0 ? (
                  results.inventory.map((car) => (
                    <button
                      key={car._id}
                      onClick={() => navigateTo(`/inventory/${car._id}`)}
                      className="w-full flex justify-between items-center p-4 bg-app-bg hover:bg-app-accent/10 border border-app-border rounded-xl transition-all group"
                    >
                      <div className="text-left">
                        <p className="font-black text-sm uppercase italic tracking-tighter group-hover:text-app-accent">
                          {car.year} {car.make} {car.model}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          Stock: #{car.stockNumber}
                        </p>
                      </div>
                      <span className="text-xs font-black text-app-accent">
                        ${car.price.toLocaleString()}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-600 ml-2">No vehicles found.</p>
                )}
              </section>

              {/* Customer Results */}
              <section className="space-y-2">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                  Customers
                </h3>

                {results.customers.length > 0 ? (
                  results.customers.map((cust) => (
                    <button
                      key={cust._id}
                      onClick={() => navigateTo(`/customers/${cust._id}`)}
                      className="w-full flex justify-between items-center p-4 bg-app-bg hover:bg-app-accent/10 border border-app-border rounded-xl transition-all group"
                    >
                      <div className="text-left">
                        <p className="font-black text-sm uppercase tracking-tighter group-hover:text-app-accent">
                          {cust.firstName} {cust.lastName}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          {cust.phone}
                        </p>
                      </div>
                      <span className="text-[10px] font-black bg-slate-800 px-2 py-1 rounded text-slate-400">
                        View Lead
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-600 ml-2">No customers found.</p>
                )}
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-app-bg p-3 flex justify-between items-center px-6 border-t border-app-border">
          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">
            Global Search Engine v2.6
          </span>
          <div className="flex gap-4">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">
              [Esc] to Close
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SearchOverlay;