import React, { useState } from 'react';
import Papa from 'papaparse';
import axiosClient from '../api/axiosClient';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';

const InventoryImport = ({ onComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // Send to backend
          const res = await axiosClient.post("/inventory/bulk-import", { 
            vehicles: results.data 
          });
          
          alert(`Success! Imported ${res.data.inserted} new units.`);
          if (onComplete) onComplete();
        } catch (err) {
          alert("Import failed. Check your CSV headers.");
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  return (
    <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-colors text-center">
      <UploadCloud className="mx-auto text-slate-300 mb-4" size={48} />
      <h3 className="text-lg font-bold text-slate-800">Bulk Import Inventory</h3>
      <p className="text-sm text-slate-500 mb-6">Upload a CSV with headers: vin, make, model, year, price</p>
      
      <label className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold cursor-pointer hover:bg-indigo-600 transition-all inline-block">
        {isProcessing ? "Processing..." : "Choose CSV File"}
        <input 
          type="file" 
          accept=".csv" 
          className="hidden" 
          onChange={handleFileUpload} 
          disabled={isProcessing}
        />
      </label>
    </div>
  );
};

export default InventoryImport;