import React, { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Navigation } from './components/Navigation';
import { MOCK_USER } from './constants';
import { PostListing } from './components/PostListing';
import { ListingDetail } from './pages/ListingDetail';
import { Chat } from './pages/Chat';
import { MapPin, ShieldCheck, Mail, Phone, Trash2, Smartphone } from 'lucide-react';
import { Listing } from './types';
import { getListings, deleteListing } from './services/mockService';

// Types for View State management
type View = 
  | { name: 'home' }
  | { name: 'quicksale' }
  | { name: 'detail'; listingId: string }
  | { name: 'chat'; chatId: string }
  | { name: 'post' }
  | { name: 'profile' };

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>({ name: 'home' });
  const [userListings, setUserListings] = useState<Listing[]>([]);

  useEffect(() => {
    if (currentView.name === 'profile') {
      // Mock fetching user listings (currently just filters all mock listings for simplicity)
      // In real app, would filter by sellerId == MOCK_USER.id
      getListings().then(all => setUserListings(all.filter(l => l.sellerId === MOCK_USER.id)));
    }
  }, [currentView]);

  const handleDelete = async (id: string) => {
    if(window.confirm("Are you sure you want to delete this listing?")) {
      await deleteListing(id);
      setUserListings(prev => prev.filter(l => l.id !== id));
    }
  };

  // Simple Router Logic
  const renderView = () => {
    switch (currentView.name) {
      case 'home':
        return <Home onItemClick={(id) => setCurrentView({ name: 'detail', listingId: id })} />;
      
      case 'quicksale':
        return <Home isQuickSaleMode={true} onItemClick={(id) => setCurrentView({ name: 'detail', listingId: id })} />;
      
      case 'detail':
        return (
          <ListingDetail 
            id={currentView.listingId} 
            onBack={() => setCurrentView({ name: 'home' })}
            onChat={(id) => setCurrentView({ name: 'chat', chatId: 'chat_1' })} 
          />
        );
      
      case 'chat':
        return <Chat chatId={currentView.chatId} onBack={() => setCurrentView({ name: 'home' })} />;

      case 'post':
        return (
          <div className="p-4 pt-10 min-h-screen bg-cream-50">
            <h1 className="text-2xl font-bold text-primary-900 mb-2">Post to Market</h1>
            <p className="text-sm text-gray-500 mb-6">Create a supply or demand listing.</p>
            <PostListing onSuccess={() => setCurrentView({ name: 'home' })} />
            <button onClick={() => setCurrentView({ name: 'home' })} className="mt-6 text-center w-full text-gray-400 text-sm">Cancel</button>
          </div>
        );

      case 'profile':
        return (
          <div className="p-4 pt-10 min-h-screen bg-cream-50 pb-24">
            {/* Header */}
            <div className="text-center mb-8">
               <div className="relative w-24 h-24 mx-auto mb-4">
                  <img src={MOCK_USER.avatarUrl} className="w-full h-full rounded-full border-4 border-white shadow-lg object-cover" alt="Profile"/>
                  {MOCK_USER.isVerified && (
                    <div className="absolute bottom-1 right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white">
                      <ShieldCheck size={16} />
                    </div>
                  )}
               </div>
               <h1 className="text-2xl font-bold text-primary-900">{MOCK_USER.name}</h1>
               <div className="flex items-center justify-center gap-1 text-gray-500 text-sm mt-1">
                 <MapPin size={14} />
                 {MOCK_USER.location}, {MOCK_USER.state}
               </div>
               <div className="mt-2 inline-block bg-primary-900 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                 Dealer Account
               </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-white p-3 rounded-2xl border border-blue-200 text-center shadow-sm">
                <span className="block text-xl font-bold text-primary-900">42</span>
                <span className="text-[10px] text-gray-400 uppercase">Sold</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-blue-200 text-center shadow-sm">
                <span className="block text-xl font-bold text-primary-900">{userListings.length}</span>
                <span className="text-[10px] text-gray-400 uppercase">Active</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-blue-200 text-center shadow-sm">
                <span className="block text-xl font-bold text-primary-900">4.9</span>
                <span className="text-[10px] text-gray-400 uppercase">Rating</span>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-3xl p-6 border border-blue-200 shadow-sm space-y-4 mb-8">
               <h3 className="font-bold text-gray-900 mb-2">Contact Info</h3>
               
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-cream-50 flex items-center justify-center text-primary-900 border border-blue-100">
                   <Phone size={20} />
                 </div>
                 <div>
                   <p className="text-xs text-gray-400 uppercase">Phone</p>
                   <p className="font-semibold text-primary-900">{MOCK_USER.phone}</p>
                 </div>
               </div>

               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-cream-50 flex items-center justify-center text-primary-900 border border-blue-100">
                   <Mail size={20} />
                 </div>
                 <div>
                   <p className="text-xs text-gray-400 uppercase">Email</p>
                   <p className="font-semibold text-primary-900">{MOCK_USER.email}</p>
                 </div>
               </div>
            </div>

            {/* My Listings */}
            <h3 className="font-bold text-gray-900 mb-4 px-1">My Active Listings</h3>
            <div className="space-y-3">
              {userListings.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-dashed border-blue-200">
                   No active listings
                </div>
              ) : userListings.map(item => (
                <div key={item.id} className="bg-white p-3 rounded-2xl border border-blue-200 shadow-sm flex gap-3">
                   <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-50">
                      {item.images.length > 0 ? (
                        <img src={item.images[0]} className="w-full h-full object-cover rounded-xl" alt="" />
                      ) : (
                        <Smartphone size={20} className="text-gray-400" />
                      )}
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{item.model}</h4>
                      <p className="text-xs text-gray-500 mb-2">{item.category} • ₦{item.price.toLocaleString()}</p>
                      <div className="flex gap-2">
                         <button className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100">Edit</button>
                         <button 
                            onClick={() => handleDelete(item.id)}
                            className="text-[10px] font-bold bg-red-50 text-red-600 px-3 py-1.5 rounded-lg flex items-center gap-1 border border-red-100"
                         >
                           <Trash2 size={10} /> Delete
                         </button>
                      </div>
                   </div>
                </div>
              ))}
            </div>

            <button className="w-full py-4 bg-red-50 text-red-500 font-bold rounded-2xl mt-8 border border-red-100">
              Log Out
            </button>
          </div>
        );

      default:
        return <div>View not found</div>;
    }
  };

  const showNav = ['home', 'quicksale', 'post', 'profile'].includes(currentView.name);

  return (
    <div className="bg-cream-50 min-h-screen font-sans text-primary-900 selection:bg-primary-900 selection:text-white">
      {renderView()}
      
      {showNav && (
        <Navigation 
          currentTab={currentView.name} 
          onTabChange={(tab) => setCurrentView({ name: tab as any })}
        />
      )}
    </div>
  );
};

export default App;