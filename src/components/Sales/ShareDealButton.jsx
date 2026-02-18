import React from 'react';
import { Share2 } from 'lucide-react';
import { shareEBrochure } from '../../utils/shareDeal';
import { hapticSuccess } from '../../utils/haptics';

const ShareDealButton = ({ customer, vehicle, deal }) => {
  const handleShare = async () => {
    await hapticSuccess();
    await shareEBrochure(customer, vehicle, deal);
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center gap-2 w-full py-4 bg-slate-800 text-blue-400 border border-blue-500/30 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-700 transition-all"
    >
      <Share2 size={18} />
      Send Digital Brochure
    </button>
  );
};

export default ShareDealButton;