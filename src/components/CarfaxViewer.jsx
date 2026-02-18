import React from "react";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Browser } from '@capacitor/browser';

const CarfaxViewer = ({ filePath }) => {
  if (!filePath) {
    return (
      <div className="p-4 bg-slate-800 rounded-lg text-slate-400 border border-slate-700 italic">
        No Carfax report available.
      </div>
    );
  }

  const backendBase = process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || "http://192.168.0.73:5000";
  const cleanPath = filePath.replace(/\\/g, "/").replace(/^uploads\//, "");
  const pdfUrl = `${backendBase}/uploads/${cleanPath}`;

  // ✅ Native Download Logic
  const downloadReport = async () => {
    try {
      // 1. Open in a secure in-app browser for immediate viewing
      await Browser.open({ url: pdfUrl });

      // 2. Optional: Download to local storage
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      
      // Convert blob to base64 for Capacitor
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        
        await Filesystem.writeFile({
          path: `Carfax_${Date.now()}.pdf`,
          data: base64data,
          directory: Directory.Documents,
        });
        alert("Report saved to your Documents folder.");
      };
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* PDF Container */}
      <div className="w-full h-[500px] border border-slate-700 rounded-xl overflow-hidden shadow-inner bg-slate-100">
        <iframe
          src={`${pdfUrl}#toolbar=0`}
          title="Carfax Report"
          className="w-full h-full"
        />
      </div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => Browser.open({ url: pdfUrl })}
          className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-semibold transition-all"
        >
          <span>👁️</span> View Full
        </button>
        
        <button 
          onClick={downloadReport}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/20"
        >
          <span>📥</span> Download
        </button>
      </div>
    </div>
  );
};

export default CarfaxViewer;