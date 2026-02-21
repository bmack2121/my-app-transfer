import React, { useState, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PhotoIcon } from '@heroicons/react/24/outline';

const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const host = window.location.hostname;
  return `http://${host}:5000${path.startsWith('/') ? '' : '/'}${path}`;
};

const PhotoCarousel = ({ photos = [], isDark }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setCurrentIndex(index);
    }
  };

  if (!photos.length) {
    return (
      <div className={`h-80 w-full flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
        <PhotoIcon className="w-12 h-12 text-slate-500 opacity-20 mb-2" />
        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">No Media Synced</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* 🏁 Main Scroller */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar rounded-[2.5rem] bg-black shadow-2xl"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {photos.map((photo, idx) => (
          <div key={idx} className="min-w-full h-[400px] snap-center flex items-center justify-center overflow-hidden">
            <img 
              src={getMediaUrl(photo)} 
              alt={`Vehicle ${idx + 1}`}
              className="w-full h-full object-cover"
              loading={idx === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* 🔢 Index Counter Badge */}
      <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl text-[10px] font-black text-white tracking-widest">
        {currentIndex + 1} / {photos.length}
      </div>

      {/* 📱 Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/20 backdrop-blur-md rounded-full">
        {photos.slice(0, 8).map((_, idx) => (
          <div 
            key={idx} 
            className={`h-1.5 transition-all duration-300 rounded-full ${currentIndex === idx ? 'w-6 bg-blue-500' : 'w-1.5 bg-white/40'}`} 
          />
        ))}
        {photos.length > 8 && <span className="text-[8px] text-white/40 font-bold leading-none">...</span>}
      </div>
    </div>
  );
};

export default PhotoCarousel;