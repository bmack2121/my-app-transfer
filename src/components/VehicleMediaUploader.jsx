import React, { useState } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { CameraIcon, TrashIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import axiosClient from "../api/axiosClient";

const VehicleMediaUploader = ({ vehicleId, stockNumber, onUploadSuccess }) => {
  const [photos, setPhotos] = useState([]); // Holds our local preview URLs and file blobs
  const [isUploading, setIsUploading] = useState(false);

  // 📸 1. Trigger the Native Camera
  const handleTakePhoto = async () => {
    if (isUploading) return; // Prevent camera trigger during active upload

    try {
      try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}

      const image = await Camera.getPhoto({
        quality: 80, // 80% compression saves massive amounts of data without losing visible quality
        allowEditing: false,
        resultType: CameraResultType.Uri, // URIs are highly memory-efficient
        source: CameraSource.Camera, // Force the camera (use CameraSource.Prompt to allow gallery)
      });

      // 🔄 2. Convert the Native URI to a File Blob
      // Fetch the local device URI and convert it to a binary Blob
      const response = await fetch(image.webPath);
      const blob = await response.blob();
      
      // Create a standard JavaScript File object
      const file = new File([blob], `photo-${Date.now()}.${image.format}`, { 
        type: `image/${image.format}` 
      });

      // Add to state for preview and future upload
      setPhotos((prev) => [...prev, { preview: image.webPath, file }]);

    } catch (error) {
      if (!error.message?.includes('User cancelled')) {
        console.warn("Camera failed:", error);
      }
    }
  };

  // 🗑️ Remove photo before uploading
  const removePhoto = (indexToRemove) => {
    if (isUploading) return; // Lock deletion during upload
    try { Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    setPhotos((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // 🚀 3. Send to Node.js / Multer
  const handleUpload = async () => {
    if (photos.length === 0 || isUploading) return;

    try {
      setIsUploading(true);
      try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}

      // Create standard FormData
      const formData = new FormData();
      
      // Append the text fields
      formData.append("stockNumber", stockNumber || "PENDING");
      
      // Append every photo to the "photos" array expected by Multer
      photos.forEach((photoObj) => {
        formData.append("photos", photoObj.file);
      });

      // Send to the backend using our pre-configured Axios client
      // Note: Our axiosClient interceptor automatically strips the "Content-Type" header 
      // when it sees FormData, allowing the browser to set the correct boundary tags!
      const res = await axiosClient.put(`/inventory/${vehicleId}`, formData);

      try { await Haptics.notification({ type: NotificationType.Success }); } catch (e) {}
      setPhotos([]); // Clear out the staging area
      
      if (onUploadSuccess) onUploadSuccess(res.data);

    } catch (error) {
      console.error("Upload failed:", error);
      try { await Haptics.notification({ type: NotificationType.Error }); } catch (e) {}
      alert("Failed to upload media. Check connection and try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-white font-black uppercase tracking-widest text-sm">Lot Photos</h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase">{photos.length} Staged for Upload</p>
        </div>
        
        <button
          onClick={handleTakePhoto}
          disabled={isUploading}
          className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-blue-400 p-4 rounded-2xl transition-all active:scale-90 shadow-lg border border-slate-700"
        >
          <CameraIcon className="w-6 h-6" />
        </button>
      </div>

      {/* 🖼️ Staged Photo Gallery */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {photos.map((photo, index) => (
            <div key={photo.preview} className="relative aspect-square rounded-xl overflow-hidden border border-slate-700 group">
              <img src={photo.preview} alt="Staged vehicle" className="w-full h-full object-cover" />
              <button 
                onClick={() => removePhoto(index)}
                disabled={isUploading}
                className="absolute top-1 right-1 bg-red-500/80 backdrop-blur disabled:opacity-50 text-white p-1.5 rounded-lg active:scale-90 transition-all"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ⬆️ Upload Button */}
      <button
        onClick={handleUpload}
        disabled={photos.length === 0 || isUploading}
        className="w-full bg-blue-600 disabled:bg-slate-800 disabled:text-slate-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        {isUploading ? (
          <span className="animate-pulse">Transmitting to Server...</span>
        ) : (
          <>
            <ArrowUpTrayIcon className="w-5 h-5" />
            Sync Media to Cloud
          </>
        )}
      </button>
    </div>
  );
};

export default VehicleMediaUploader;