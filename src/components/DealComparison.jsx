import React from "react";
import { Share } from "@capacitor/share";

// ✅ Safe haptics wrapper
import { hapticLight } from "../utils/haptics";

const DealComparison = ({ lease, finance }) => {
  if (!lease || !finance) return null;

  const better =
    parseFloat(lease.monthly) < parseFloat(finance.monthly)
      ? "lease"
      : "finance";

  // VinPro Theme Styling
  const highlight = "ring-4 ring-blue-500 shadow-2xl scale-[1.02]";

  const handleShare = async () => {
    const message = `VinPro Deal Comparison:
-----------------------
LEASE: $${lease.monthly}/mo for ${lease.term} mos.
FINANCE: $${finance.monthly}/mo for ${finance.term} mos.
-----------------------
Which one works best for you?`;

    try {
      await Share.share({
        title: "Deal Comparison",
        text: message,
        dialogTitle: "Send to Customer",
      });

      // 🔵 Safe haptic
      await hapticLight();

    } catch (err) {
      console.error("Sharing failed", err);
    }
  };

  const StatRow = ({ label, value }) => (
    <div className="flex justify-between text-sm py-1 border-b border-slate-50 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold text-slate-700">{value}</span>
    </div>
  );

  return (
    <div className="mt-12 space-y-6">
      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
        Payment Comparison
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lease Option */}
        <div
          className={`bg-white p-6 rounded-3xl border border-slate-100 transition-all duration-300 relative ${
            better === "lease" ? highlight : "opacity-90"
          }`}
        >
          {better === "lease" && (
            <span className="absolute -top-3 left-6 bg-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
              Lower Payment
            </span>
          )}

          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Lease Option
          </h3>

          <div className="mb-6">
            <span className="text-4xl font-black text-slate-900">
              ${lease.monthly}
            </span>
            <span className="text-slate-400 font-bold ml-1">/mo</span>
          </div>

          <div className="space-y-1">
            <StatRow label="Term" value={`${lease.term} Months`} />
            <StatRow label="Residual" value={`${lease.residual}%`} />
            <StatRow label="Money Factor" value={lease.moneyFactor} />
            <StatRow label="Down Payment" value={`$${lease.down}`} />
          </div>
        </div>

        {/* Finance Option */}
        <div
          className={`bg-white p-6 rounded-3xl border border-slate-100 transition-all duration-300 relative ${
            better === "finance" ? highlight : "opacity-90"
          }`}
        >
          {better === "finance" && (
            <span className="absolute -top-3 left-6 bg-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
              Lower Payment
            </span>
          )}

          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Finance Option
          </h3>

          <div className="mb-6">
            <span className="text-4xl font-black text-slate-900">
              ${finance.monthly}
            </span>
            <span className="text-slate-400 font-bold ml-1">/mo</span>
          </div>

          <div className="space-y-1">
            <StatRow label="Term" value={`${finance.term} Months`} />
            <StatRow label="Rate (APR)" value={`${finance.rate}%`} />
            <StatRow label="Down Payment" value={`$${finance.down}`} />
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          onClick={() => alert("Saving to CRM...")}
          className="flex-1 bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 active:scale-95 transition-all shadow-lg"
        >
          Save to Deal Jacket
        </button>

        <button
          onClick={handleShare}
          className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-900/20"
        >
          📱 Text to Customer
        </button>
      </div>
    </div>
  );
};

export default DealComparison;