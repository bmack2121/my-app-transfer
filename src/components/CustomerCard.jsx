import React from 'react';
import { Share } from '@capacitor/share';

const CustomerCard = ({ customer }) => {
  // ✅ Handle sharing the walkthrough video via SMS/Apps
  const handleShareVideo = async (e) => {
    e.stopPropagation(); // Don't trigger the card click
    if (!customer.walkthroughVideoUrl) return;

    await Share.share({
      title: `Video for ${customer.name}`,
      text: `Hey ${customer.name.split(' ')[0]}, check out this walkthrough video of the vehicle you liked!`,
      url: customer.walkthroughVideoUrl,
      dialogTitle: 'Share Walkthrough',
    });
  };

  // Engagement Color Logic
  const getEngagementColor = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden">
      
      {/* Status Badges Container */}
      <div className="absolute top-0 right-0 flex items-center">
        {customer.walkthroughVideoUrl && (
          <button 
            onClick={handleShareVideo}
            className="bg-indigo-600 text-white p-2 rounded-bl-lg hover:bg-indigo-700 transition-colors shadow-sm"
            title="Share Video"
          >
            <span className="text-xs">🎥</span>
          </button>
        )}
        
        {customer.isScanned && (
          <div className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-lg flex items-center gap-1 shadow-sm">
            <span className="text-xs">🪪</span> VERIFIED
          </div>
        )}
      </div>

      <div className="flex items-start gap-4">
        {/* Profile Avatar with Engagement Ring */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold">
            {customer.name ? customer.name.split(' ').map(n => n[0]).join('') : '??'}
          </div>
          {/* Engagement Status Dot */}
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getEngagementColor(customer.engagement)}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start pr-12">
            <h4 className="font-bold text-slate-900 text-lg leading-tight mb-1 truncate">
              {customer.name}
            </h4>
          </div>
          
          <div className="flex flex-col gap-1 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="text-slate-400">📞</span> {customer.phone || 'No Phone'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-slate-400">📧</span> {customer.email || 'No Email'}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                customer.status === 'Hot Lead' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {customer.status}
              </span>
              {customer.walkthroughVideoUrl && (
                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase tracking-wider">
                  Video Sent
                </span>
              )}
            </div>
            
            {/* Lead Score Indicator */}
            <span className="text-[10px] font-black text-slate-300">
              SCORE: {customer.engagement || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;