
import React, { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Navigation } from './components/Navigation';
import { PostListing } from './components/PostListing';
import { ListingDetail } from './pages/ListingDetail';
import { Chat } from './pages/Chat';
import { ChatList } from './pages/ChatList';
import { Auth } from './pages/Auth';
import { MapPin, ShieldCheck, Mail, Phone, Trash2, Edit3, Check, X, Camera } from 'lucide-react';
import { Listing, User } from './types';
import { getListings, deleteListing, getCurrentUser, updateCurrentUser } from './services/mockService';

type View = 
  | { name: 'home' }
  | { name: 'quicksale' }
  | { name: 'detail'; listingId: string }
  | { name: 'chat'; chatId: string }
  | { name: 'chatList' }
  | { name: 'post' }
  | { name: 'profile' };

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<View>({ name: 'home' });
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  useEffect(() => {
    if (isAuthenticated && currentView.name === 'profile' && user) {
      getListings().then(all => setUserListings(all.filter(l => l.sellerId === user.id)));
    }
  }, [currentView, user, isAuthenticated]);

  const handleLoginSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setIsAuthenticated(true);
  };

  const handleDelete = async (id: string) => {
    if(window.confirm("Delete this listing?")) {
      await deleteListing(id);
      setUserListings(prev => prev.filter(l => l.id !== id));
    }
  };

  const handleStartEdit = () => {
    if (user) {
      setEditForm({ ...user });
      setIsEditingProfile(true);
    }
  };

  const handleSaveProfile = () => {
    const updated = updateCurrentUser(editForm);
    setUser(updated);
    setIsEditingProfile(false);
  };

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleLoginSuccess} />;
  }

  const renderView = () => {
    if (!user) return null;

    switch (currentView.name) {
      case 'home':
        return <Home 
          onItemClick={(id) => setCurrentView({ name: 'detail', listingId: id })} 
          onChatListClick={() => setCurrentView({ name: 'chatList' })}
        />;
      
      case 'quicksale':
        return <Home 
          isQuickSaleMode={true} 
          onItemClick={(id) => setCurrentView({ name: 'detail', listingId: id })} 
          onChatListClick={() => setCurrentView({ name: 'chatList' })}
        />;
      
      case 'chatList':
        return <ChatList 
          onBack={() => setCurrentView({ name: 'home' })} 
          onSelectChat={(chatId) => setCurrentView({ name: 'chat', chatId })}
        />;

      case 'detail':
        return <ListingDetail id={currentView.listingId} onBack={() => setCurrentView({ name: 'home' })} onChat={(chatId) => setCurrentView({ name: 'chat', chatId })} />;
      
      case 'chat':
        return <Chat chatId={currentView.chatId} onBack={() => setCurrentView({ name: 'chatList' })} />;

      case 'post':
        return (
          <div className="p-4 pt-10 min-h-screen bg-cream-50">
            <h1 className="text-2xl font-bold text-primary-900 mb-6">Post Listing</h1>
            <PostListing onSuccess={() => setCurrentView({ name: 'home' })} />
            <button onClick={() => setCurrentView({ name: 'home' })} className="mt-6 w-full text-gray-400 text-sm">Cancel</button>
          </div>
        );

      case 'profile':
        return (
          <div className="p-4 pt-10 min-h-screen bg-cream-50 pb-24">
            <div className="flex justify-end mb-4">
              {isEditingProfile ? (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditingProfile(false)} className="p-2 bg-gray-100 rounded-full text-gray-600"><X size={20}/></button>
                  <button onClick={handleSaveProfile} className="p-2 bg-green-600 rounded-full text-white"><Check size={20}/></button>
                </div>
              ) : (
                <button onClick={handleStartEdit} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-blue-200 text-xs font-bold text-primary-900 shadow-sm">
                   <Edit3 size={14} /> Edit Profile
                </button>
              )}
            </div>

            <div className="text-center mb-8">
               <div className="relative w-24 h-24 mx-auto mb-4">
                  <img src={user.avatarUrl} className="w-full h-full rounded-full border-4 border-white shadow-lg object-cover" alt="Profile"/>
                  {isEditingProfile && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white cursor-pointer">
                      <Camera size={24} />
                    </div>
                  )}
                  {user.isVerified && (
                    <div className="absolute bottom-1 right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white">
                      <ShieldCheck size={16} />
                    </div>
                  )}
               </div>
               
               {isEditingProfile ? (
                 <input 
                   className="text-2xl font-bold text-primary-900 text-center bg-white border border-blue-200 rounded-lg px-2 w-full max-w-[200px]"
                   value={editForm.name}
                   onChange={e => setEditForm({...editForm, name: e.target.value})}
                 />
               ) : (
                 <h1 className="text-2xl font-bold text-primary-900">{user.name}</h1>
               )}

               <div className="flex items-center justify-center gap-1 text-gray-500 text-sm mt-1">
                 <MapPin size={14} />
                 {isEditingProfile ? (
                   <div className="flex gap-1">
                     <input className="text-[10px] bg-white border rounded px-1" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} />
                     <input className="text-[10px] bg-white border rounded px-1" value={editForm.state} onChange={e => setEditForm({...editForm, state: e.target.value})} />
                   </div>
                 ) : (
                   `${user.location}, ${user.state}`
                 )}
               </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-blue-200 shadow-sm space-y-4 mb-8">
               <h3 className="font-bold text-gray-900 mb-2">Contact Info</h3>
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-cream-50 flex items-center justify-center text-primary-900 border border-blue-100"><Phone size={20} /></div>
                 <div className="flex-1">
                   <p className="text-xs text-gray-400 uppercase">Phone</p>
                   {isEditingProfile ? (
                     <input className="font-semibold text-primary-900 bg-gray-50 border w-full rounded p-1" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                   ) : (
                     <p className="font-semibold text-primary-900">{user.phone}</p>
                   )}
                 </div>
               </div>
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-cream-50 flex items-center justify-center text-primary-900 border border-blue-100"><Mail size={20} /></div>
                 <div className="flex-1">
                   <p className="text-xs text-gray-400 uppercase">Email</p>
                   {isEditingProfile ? (
                     <input className="font-semibold text-primary-900 bg-gray-50 border w-full rounded p-1" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                   ) : (
                     <p className="font-semibold text-primary-900">{user.email}</p>
                   )}
                 </div>
               </div>
            </div>

            <h3 className="font-bold text-gray-900 mb-4 px-1">My Listings</h3>
            <div className="space-y-3 mb-8">
              {userListings.map(item => (
                <div key={item.id} className="bg-white p-3 rounded-2xl border border-blue-200 flex gap-3">
                   <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden">
                      {item.images[0] && <img src={item.images[0]} className="w-full h-full object-cover" alt="" />}
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{item.model}</h4>
                      <p className="text-xs text-gray-500">₦{item.price.toLocaleString()}</p>
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => handleDelete(item.id)} className="text-[10px] text-red-600 bg-red-50 px-2 py-1 rounded-lg">Delete</button>
                      </div>
                   </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => {
                setIsAuthenticated(false);
                setUser(null);
                setCurrentView({ name: 'home' });
              }} 
              className="w-full py-4 text-red-600 bg-red-50 font-bold rounded-2xl border border-red-100 mt-4"
            >
              Sign Out
            </button>
          </div>
        );

      default:
        return <div>View not found</div>;
    }
  };

  const showNav = ['home', 'quicksale', 'post', 'profile', 'chatList'].includes(currentView.name);

  return (
    <div className="bg-cream-50 min-h-screen font-sans text-primary-900">
      {renderView()}
      {showNav && <Navigation currentTab={currentView.name} onTabChange={(tab) => setCurrentView({ name: tab as any })} />}
    </div>
  );
};

export default App;
