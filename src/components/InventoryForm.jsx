import React, { useState } from "react";
import VinScanner from "../components/VinScanner";
import axiosClient from "../api/axiosClient";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

// ✅ Safe haptics wrapper
import { 
  hapticHeavy, 
  hapticMedium, 
  hapticNotification 
} from "../utils/haptics";

const InventoryForm = ({ onAdd }) => {
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  const initialState = {
    vin: "",
    year: "",
    make: "",
    model: "",
    trim: "",
    stockNumber: "",
    price: "",
    status: "available",
  };

  const [form, setForm] = useState(initialState);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVinDetected = async (vin) => {
    try {
      setLoading(true);
      setShowScanner(false);

      // 🔵 Safe haptic
      await hapticHeavy();

      const [decodeRes, marketRes] = await Promise.all([
        axiosClient.get(`/vin/decode/${vin}`),
        axiosClient.get(`/vin/market-value/${vin}`).catch(() => ({ data: null }))
      ]);

      const v = decodeRes.data;
      setMarketData(marketRes.data);

      setForm((prev) => ({
        ...prev,
        vin: vin.toUpperCase(),
        year: v.year || "",
        make: v.make || "",
        model: v.model || "",
        trim: v.trim || "",
        price: marketRes.data?.average_retail || ""
      }));

      // 🟢 Safe success haptic
      await hapticNotification("success");

    } catch (err) {
      console.error("VinPro Lookup Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Save the vehicle
      const response = await axiosClient.post('/inventory', form);
      const newVehicleId = response.data._id;

      // 2. Safe haptic confirmation
      await hapticMedium();

      // 3. Ask for lot photo
      const confirmPhoto = window.confirm(
        "Vehicle added! Would you like to snap the primary lot photo now?"
      );

      if (confirmPhoto) {
        const image = await Camera.getPhoto({
          quality: 80,
          source: CameraSource.Camera,
          resultType: CameraResultType.Base64
        });

        await axiosClient.post(`/inventory/${newVehicleId}/image`, {
          image: image.base64String
        });
      }

      onAdd();
      setForm(initialState);
      setMarketData(null);

    } catch (err) {
      console.error("VinPro Save Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, placeholder, type = "text", symbol = null }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
        {label}
      </label>
      <div className="relative">
        {symbol && (
          <span className="absolute left-4 top-4 font-bold text-slate-400">
            {symbol}
          </span>
        )}
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={form[name]}
          onChange={handleInputChange}
          className={`w-full p-4 ${symbol ? "pl-8" : ""} bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 transition-all`}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Acquisition</h2>
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-black shadow-lg shadow-blue-900/20 active:scale-95 transition-transform"
        >
          📷 Scan VIN
        </button>
      </div>

      {marketData && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 relative animate-in zoom-in-95 duration-300">
          <button
            onClick={() => setMarketData(null)}
            className="absolute top-2 right-3 text-blue-300 hover:text-blue-500 font-bold"
          >
            ✕
          </button>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">
            Live Market Insight
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 font-medium">Avg. Retail</p>
              <p className="text-xl font-black text-slate-900">
                ${marketData.average_retail?.toLocaleString()}
              </p>
            </div>
            <div className="border-l border-blue-200 pl-4">
              <p className="text-xs text-slate-500 font-medium">Trade-In Est.</p>
              <p className="text-xl font-black text-blue-700">
                ${marketData.trade_in_value?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField label="VIN" name="vin" placeholder="17-Digit VIN" />

        <div className="grid grid-cols-2 gap-4">
          <InputField label="Year" name="year" placeholder="2026" type="number" />
          <InputField label="Stock #" name="stockNumber" placeholder="STK-000" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField label="Make" name="make" placeholder="Ford" />
          <InputField label="Model" name="model" placeholder="F-150" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField label="Trim" name="trim" placeholder="Lariat" />
          <InputField label="Listing Price" name="price" placeholder="0" type="number" symbol="$" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl text-lg shadow-xl active:scale-[0.98] transition-all disabled:bg-slate-400"
        >
          {loading ? "Processing..." : "Confirm & Save to Lot"}
        </button>
      </form>

      {showScanner && (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col p-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-white text-xl font-black uppercase tracking-widest">
              Scanner Active
            </h3>
            <button
              onClick={() => setShowScanner(false)}
              className="bg-white/10 text-white px-4 py-2 rounded-xl font-bold"
            >
              Cancel
            </button>
          </div>
          <div className="flex-1 rounded-3xl overflow-hidden border-2 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
            <VinScanner onDetected={handleVinDetected} />
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryForm;