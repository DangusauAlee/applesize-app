import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Share2, Heart, Battery, MapPin, MessageCircle, Phone, Smartphone, ScanFace, Eye, Cpu, Zap, Send, AlertCircle } from 'lucide-react';
import { getListingById, sendMessage } from '../services/mockService';
import { Listing, Condition } from '../types';
import { MOCK_USER } from '../constants';

interface ListingDetailProps {
  id: string;
  onBack: () => void;
  onChat: (listingId: string) => void;
}

export const ListingDetail: React.FC<ListingDetailProps> = ({ id, onBack, onChat }) => {
  const [listing, setListing] = useState<Listing | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [sendingOffer, setSendingOffer] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    getListingById(id).then(setListing);
  }, [id]);

  const handleMakeOffer = async () => {
    if (!listing || !offerAmount) return;
    setSendingOffer(true);
    // Send offer as a special message type to the chat
    await sendMessage('chat_1', `I am offering ₦${Number(offerAmount).toLocaleString()}`, MOCK_USER.id, 'offer', Number(offerAmount));
    setSendingOffer(false);
    setShowOfferModal(false);
    onChat(listing.id); // Go to chat to see the offer
  };

  if (!listing) return <div className="h-screen flex items-center justify-center bg-cream-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-900"></div></div>;

  const hasFaceIdIssue = listing.condition.includes(Condition.OFF_ID);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Top Nav Overlay */}
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-between z-20">
        <button onClick={onBack} className="p-2 bg-white/80 backdrop-blur rounded-full shadow-sm border border-blue-100"><ArrowLeft size={20}/></button>
        <div className="flex gap-2">
          <button className="p-2 bg-white/80 backdrop-blur rounded-full shadow-sm border border-blue-100"><Share2 size={20}/></button>
          <button className="p-2 bg-white/80 backdrop-blur rounded-full shadow-sm border border-blue-100"><Heart size={20}/></button>
        </div>
      </div>

      {/* Video Gallery */}
      <div className="h-[50vh] bg-black relative">
        {listing.videoUrl ? (
           <video 
             ref={videoRef}
             src={listing.videoUrl} 
             className="w-full h-full object-cover" 
             autoPlay 
             muted 
             loop 
             playsInline
           />
        ) : (
           <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500">No Video Available</div>
        )}
        <div className="absolute bottom-10 left-4 bg-black/60 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20">
          {listing.region}
        </div>
      </div>

      {/* Content */}
      <div className="relative -top-6 bg-white rounded-t-3xl px-6 pt-8 pb-4 border-t border-blue-200 min-h-[50vh]">
        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6"></div>

        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold text-primary-900 w-3/4 leading-tight">{listing.model}</h1>
          <div className="text-right">
             <p className="text-sm text-gray-400">Price</p>
             <p className="text-xl font-bold text-primary-900">
               {listing.price === 0 ? 'Offer' : `₦${(listing.price/1000).toFixed(0)}k`}
             </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
          <MapPin size={14} />
          {listing.location}
        </div>

        {/* Conditions Section */}
        <div className="mb-6">
           <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Conditions</h3>
           <div className="flex flex-wrap gap-2">
             {listing.condition.map((c, i) => (
               <span key={i} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100 flex items-center gap-1">
                 <AlertCircle size={12} /> {c}
               </span>
             ))}
           </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-cream-50 p-4 rounded-2xl border border-blue-200">
             <div className="text-gray-400 text-xs mb-1 flex items-center gap-1"><Smartphone size={12}/> Storage</div>
             <div className="font-semibold text-primary-900">{listing.storage}</div>
          </div>
          <div className="bg-cream-50 p-4 rounded-2xl border border-blue-200">
             <div className="text-gray-400 text-xs mb-1 flex items-center gap-1"><Battery size={12}/> Health</div>
             <div className="font-semibold text-primary-900">{listing.batteryHealth}%</div>
          </div>
          <div className="bg-cream-50 p-4 rounded-2xl border border-blue-200">
             <div className="text-gray-400 text-xs mb-1 flex items-center gap-1"><Cpu size={12}/> Sim</div>
             <div className="font-semibold text-primary-900">{listing.simStatus}</div>
          </div>
           <div className="bg-cream-50 p-4 rounded-2xl border border-blue-200">
             <div className="text-gray-400 text-xs mb-1 flex items-center gap-1"><ScanFace size={12}/> Face ID</div>
             <div className={`font-semibold ${!hasFaceIdIssue ? 'text-green-600' : 'text-red-500'}`}>
               {!hasFaceIdIssue ? 'Working' : 'Not Working'}
             </div>
          </div>
        </div>

        {/* Description */}
        <h3 className="font-bold text-primary-900 mb-2">Description</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          {listing.description || 'No description provided.'}
        </p>

        {/* Seller Info */}
        <div className="flex items-center gap-3 p-4 border border-blue-200 rounded-2xl mb-8">
          <div className="w-10 h-10 bg-primary-900 rounded-full flex items-center justify-center text-white font-bold">
            {listing.sellerName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-sm text-primary-900">{listing.sellerName}</p>
            <p className="text-xs text-green-600">{listing.sellerVerified ? 'Verified Dealer' : 'Dealer'}</p>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-blue-100 p-4 pb-8 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button className="flex-1 bg-cream-100 text-primary-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-cream-200 border border-blue-100">
          <Phone size={20} />
          Call
        </button>
        
        {listing.isQuickSale ? (
           <button 
             onClick={() => setShowOfferModal(true)}
             className="flex-1 bg-red-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-700 shadow-lg shadow-red-600/20"
           >
             <Zap size={20} fill="currentColor" />
             Make Offer
           </button>
        ) : (
           <button 
             onClick={() => onChat(listing.id)}
             className="flex-1 bg-primary-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-800"
           >
             <MessageCircle size={20} />
             Chat
           </button>
        )}
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in">
           <div className="bg-white w-full sm:w-96 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl slide-in-from-bottom-10 animate-in">
              <h3 className="text-xl font-bold text-primary-900 mb-2">Make an Offer</h3>
              <p className="text-sm text-gray-500 mb-6">
                 Your offer will be sent privately to the seller via chat.
              </p>
              
              <div className="mb-6">
                 <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Your Price (₦)</label>
                 <input 
                   type="number"
                   autoFocus
                   className="w-full p-4 bg-gray-50 rounded-xl border border-blue-200 text-2xl font-bold text-primary-900 focus:outline-none focus:border-primary-900"
                   placeholder="0"
                   value={offerAmount}
                   onChange={(e) => setOfferAmount(e.target.value)}
                 />
              </div>

              <div className="flex gap-3">
                 <button 
                   onClick={() => setShowOfferModal(false)}
                   className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-xl"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleMakeOffer}
                   disabled={!offerAmount || sendingOffer}
                   className="flex-1 py-4 bg-primary-900 text-white font-bold rounded-xl shadow-lg shadow-primary-900/20 flex items-center justify-center gap-2"
                 >
                   {sendingOffer ? 'Sending...' : <><Send size={18} /> Send Offer</>}
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};