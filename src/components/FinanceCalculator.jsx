import React, { useState, useEffect, useCallback } from "react";

const FinanceCalculator = ({ onUpdate }) => {
  const [price] = useState(35000);
  const [down] = useState(5000);
  const [rate] = useState(4.99);
  const [term] = useState(72);

  // Toggle for rolling taxes/fees into the loan
  const [rollInFees, setRollInFees] = useState(true);

  const docFee = 499;
  const taxRate = 0.0925;

  const calculatePayment = useCallback(() => {
    const feesAndTaxes = (price + docFee) * taxRate + docFee;

    const principal = rollInFees
      ? price + feesAndTaxes - down
      : price - down;

    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = term;

    if (principal <= 0) return "0.00";
    if (rate === 0) return (principal / numberOfPayments).toFixed(2);

    const payment =
      (principal * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -numberOfPayments));

    return payment.toFixed(2);
  }, [price, down, rate, term, rollInFees]);

  const monthly = calculatePayment();

  useEffect(() => {
    onUpdate({ price, down, rate, term, monthly, rollInFees });
  }, [monthly, onUpdate, price, down, rate, term, rollInFees]);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-8">

      {/* Toggle Switch Section */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Capitalize Fees?</h4>
            <p className="text-[10px] text-slate-500 uppercase font-medium">
              Roll Taxes & Doc Fee into loan
            </p>
          </div>

          <button
            onClick={() => setRollInFees(!rollInFees)}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${
              rollInFees ? "bg-blue-600" : "bg-slate-300"
            }`}
          >
            <div
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                rollInFees ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/20 text-center">
        <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">
          {rollInFees ? "All-In Monthly Payment" : "Base Monthly Payment"}
        </p>

        <div className="text-4xl font-black">
          ${Number(monthly).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          <span className="text-lg text-blue-200 ml-1">/mo</span>
        </div>

        {!rollInFees && (
          <p className="text-[10px] text-blue-200 mt-2 italic font-medium">
            *Plus taxes and fees due at signing
          </p>
        )}
      </div>
    </div>
  );
};

export default FinanceCalculator;