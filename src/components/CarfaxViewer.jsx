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

  // ✅ THE FIX: Point to Render Cloud instead of Local IP
  const cloudBackend = "https://autosalespro-backend.onrender.com";
  const backendBase = process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || cloudBackend;
  
  // ✅ Path Normalization: Ensures we don't have "uploads/uploads/file.pdf"
  const cleanPath = filePath.replace(/\\/g, "/").replace(/^public\//, "").replace(/^uploads\//, "");
  const pdfUrl = `${backendBase}/uploads/${cleanPath}`;

  // ✅ Native Download & View Logic
  const downloadReport = async () => {
    try {
      // 1. Use the Capacitor Browser for the best mobile PDF experience
      // This bypasses many iframe "white screen" issues on iOS/Android
      await Browser.open({ url: pdfUrl });

      // 2. Optional: Permanent save to device Documents
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        
        const fileName = `Carfax_${Date.now()}.pdf`;
        await Filesystem.writeFile({
          path: fileName,
          data: base64data,
          directory: Directory.Documents,
        });
        
        console.log(`Report saved: ${fileName}`);
      };
    } catch (err) {
      console.error("Cloud PDF Access failed", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* 📱 Mobile Optimized Preview */}
      <div className="w-full h-[500px] border border-slate-700 rounded-xl overflow-hidden shadow-inner bg-white relative">
        {/* We use a Google Docs viewer wrapper for iframes to ensure PDFs render correctly on mobile browsers */}
        <iframe
          src={`https://docs.google.com/gview?url=${pdfUrl}&embedded=true`}
          title="Carfax Report Preview"
          className="w-full h-full border-0"
        />
      </div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => Browser.open({ url: pdfUrl })}
          className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-semibold transition-all active:scale-95"
        >
          <span>👁️</span> Full Screen
        </button>
        
        <button 
          onClick={downloadReport}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
        >
          <span>📥</span> Save PDF
        </button>
      </div>
    </div>
  );
};

export default CarfaxViewer;