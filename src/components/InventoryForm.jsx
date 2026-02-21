import React, { useState } from "react";
import VinScanner from "../components/VinScanner";
import axiosClient from "../api/axiosClient";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

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

  const triggerHaptic = async (style = ImpactStyle.Light) => {
    try { await Haptics.impact({ style }); } catch (e) {}
  };

  /**
   * ✅ FIX: Optimized to a single backend call. 
   * Your backend decodeVin already fetches MarketCheck data internally.
   */
  const handleVinDetected = async (vin) => {
    try {
      setLoading(true);
      setShowScanner(false);
      await triggerHaptic(ImpactStyle.Heavy);

      // Single call handles both NHTSA and MarketCheck on the server
      const response = await axiosClient.get(`/inventory/decode/${vin}`);
      const data = response.data;

      setMarketData({
        market_average: data.marketAverage,
        msrp: data.msrp
      });

      setForm((prev) => ({
        ...prev,
        vin: data.vin,
        year: data.year || "",
        make: data.make || "",
        model: data.model || "",
        trim: data.trim || "Base",
        price: data.marketAverage || ""
      }));

      try { await Haptics.notification({ type: NotificationType.Success }); } catch (e) {}

    } catch (err) {
      console.error("VinPro Lookup Error:", err);
      try { await Haptics.notification({ type: NotificationType.Error }); } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vin || !form.price) return alert("VIN and Price are required.");
    
    setLoading(true);
    try {
      // 1. Save the vehicle record
      const response = await axiosClient.post('/inventory', form);
      const newVehicleId = response.data._id;
      const currentStock = form.stockNumber || "VINPRO";

      await triggerHaptic(ImpactStyle.Medium);

      // 2. High-Performance Photo Workflow
      const confirmPhoto = window.confirm("Unit Saved! Snap the primary lot photo?");
      if (confirmPhoto) {
        const image = await Camera.getPhoto({
          quality: 80, // Slightly reduced for faster upload
          allowEditing: false,
          source: CameraSource.Camera,
          resultType: CameraResultType.Uri // ✅ URI prevents memory crashes
        });

        // Convert URI to Blob for Multipart/FormData
        const imgResponse = await fetch(image.webPath);
        const blob = await imgResponse.blob();

        const formData = new FormData();
        formData.append("stockNumber", currentStock); // Appended first for backend filename logic
        formData.append("photos", blob, `${currentStock}-primary.jpg`);

        // Send to the PUT route handled by Multer
        await axiosClient.put(`/inventory/${newVehicleId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      onAdd();
      setForm(initialState);
      setMarketData(null);

    } catch (err) {
      console.error("VinPro Save Error:", err);
      alert("Sync failed. Check terminal for ADB errors.");
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, placeholder, type = "text", symbol = null }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-[0.2em]">
        {label}
      </label>
      <div className="relative">
        {symbol && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-blue-500">
            {symbol}
          </span>
        )}
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={form[name]}
          onChange={handleInputChange}
          className={`w-full p-4 ${symbol ? "pl-8" : ""} bg-slate-50 border border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-slate-800 transition-all`}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">Acquisition</h2>
        <button
          type="button"
          onClick={() => { triggerHaptic(); setShowScanner(true); }}
          className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/20 active:scale-95 transition-transform"
        >
          Scan VIN
        </button>
      </div>

      {marketData && (
        <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-6 mb-6 relative animate-in zoom-in-95">
          <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4">
            Market Intelligence
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Market Avg</p>
              <p className="text-xl font-black text-white">
                ${marketData.market_average?.toLocaleString()}
              </p>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <p className="text-[8px] text-slate-500 font-black uppercase mb-1">List Potential</p>
              <p className="text-xl font-black text-emerald-500">
                ${(marketData.market_average * 1.05).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="VIN" name="vin" placeholder="Enter 17-digit VIN" />
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Year" name="year" placeholder="Year" type="number" />
          <InputField label="Stock #" name="stockNumber" placeholder="STK-000" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Make" name="make" placeholder="Make" />
          <InputField label="Model" name="model" placeholder="Model" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Trim" name="trim" placeholder="Trim" />
          <InputField label="Price" name="price" placeholder="Price" type="number" symbol="$" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-[0.98] transition-all disabled:bg-slate-300 mt-4"
        >
          {loading ? "Syncing..." : "Commit to Inventory"}
        </button>
      </form>

      {showScanner && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col p-6 animate-in fade-in">
          <div className="flex justify-between items-center mb-8 pt-safe">
            <h3 className="text-white text-xs font-black uppercase tracking-widest">Scanner Active</h3>
            <button onClick={() => setShowScanner(false)} className="text-slate-500 font-black uppercase text-[10px]">Close</button>
          </div>
          <div className="flex-1 rounded-[3rem] overflow-hidden border border-blue-500/30">
            <VinScanner onDetected={handleVinDetected} />
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryForm;