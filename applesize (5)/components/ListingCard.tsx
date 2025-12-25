import React, { useRef } from 'react';
import { Listing } from '../types';
import { Zap, MapPin, Smartphone, Info } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  onClick: (id: string) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onClick }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumSignificantDigits: 3 }).format(price);
  };

  const isDemand = listing.type === 'demand';

  const handleMouseEnter = () => {
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Prevent console errors if the user interacts too quickly or browser blocks autoplay
        });
      }
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // --- DEMAND CARD LAYOUT ---
  if (isDemand) {
    return (
      <div 
        onClick={() => onClick(listing.id)}
        className="bg-white rounded-xl shadow-sm border border-l-4 border-l-accent-500 border-blue-200 p-4 cursor-pointer active:scale-95 transition-transform duration-100 flex flex-col justify-between h-full"
      >
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="bg-accent-50 text-accent-500 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <Smartphone size={14} /> REQUEST
            </span>
            <span className="text-[10px] text-gray-400">{listing.region}</span>
          </div>
          <h3 className="font-bold text-primary-900 text-sm leading-tight mb-3 line-clamp-2">{listing.model}</h3>
          
          <div className="flex gap-2 mb-3">
             <span className="text-[10px] bg-gray-50 text-gray-500 px-2 py-1 rounded border border-blue-50">{listing.storage}</span>
             <span className="text-[10px] bg-gray-50 text-gray-500 px-2 py-1 rounded border border-blue-50">{listing.color}</span>
          </div>
        </div>

        <div className="flex justify-between items-end border-t border-blue-100 pt-3">
           <div>
             <p className="text-[10px] text-gray-400">Budget</p>
             <p className="font-bold text-accent-500 text-sm">
                {listing.price > 0 ? formatPrice(listing.price) : 'Open Offer'}
             </p>
           </div>
           <div className="text-[10px] text-gray-400 flex items-center gap-1">
             <MapPin size={10} /> {listing.location.split(',')[0]}
           </div>
        </div>
      </div>
    );
  }

  // --- SUPPLY & QUICKSALE CARD LAYOUT ---
  return (
    <div 
      onClick={() => onClick(listing.id)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden cursor-pointer active:scale-95 transition-transform duration-100 flex flex-col h-full"
    >
      {/* Media Section (Video Preview) */}
      <div className="relative aspect-[4/5] bg-gray-100 w-full overflow-hidden">
        {listing.videoUrl ? (
          <video
            ref={videoRef}
            src={listing.videoUrl}
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster={listing.images[0]} // Fallback to image if video hasn't loaded
          />
        ) : (
          <img 
            src={listing.images[0]} 
            alt={listing.model} 
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Type Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {listing.isQuickSale && (
            <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
              <Zap size={10} fill="currentColor" /> QUICK SALE
            </div>
          )}
        </div>

        {/* Condition Badge (Top Right) */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1 z-10">
            {listing.condition && listing.condition.length > 0 ? (
              listing.condition.length > 1 ? (
                 <div className="bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded border border-white/20">
                   Multiple
                 </div>
              ) : (
                 <div className="bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded border border-white/20">
                   {listing.condition[0]}
                 </div>
              )
            ) : null}
        </div>
        
        {/* Quick Info Overlay (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-10 text-white z-10">
          <h3 className="font-bold text-sm truncate">{listing.model}</h3>
          <div className="flex justify-between items-end mt-1">
             <div className="flex flex-col">
                <span className="text-[10px] text-gray-300">{listing.storage}</span>
                <p className="font-bold text-lg leading-none mt-0.5">
                  {formatPrice(listing.price)}
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="p-2 flex justify-between items-center text-[10px] text-gray-400 bg-white">
        <div className="flex items-center gap-1">
           <MapPin size={10} /> {listing.location.split(',')[0]}
        </div>
        <div className="flex items-center gap-1">
           <Info size={10} /> Details
        </div>
      </div>
    </div>
  );
};