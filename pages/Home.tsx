import React, { useEffect, useState, useRef } from 'react';
import { Search, SlidersHorizontal, MessageSquare, X, Zap, ArrowDownToLine, Tag, Filter, Check } from 'lucide-react';
import { getListings, getSearchSuggestions, getTotalUnreadCount } from '../services/mockService';
import { Listing, Condition, Region } from '../types';
import { ListingCard } from '../components/ListingCard';

interface HomeProps {
  onItemClick: (id: string) => void;
  onChatListClick: () => void;
  isQuickSaleMode?: boolean; 
}

type TabType = 'supply' | 'demand' | 'quicksale';

export const Home: React.FC<HomeProps> = ({ onItemClick, onChatListClick, isQuickSaleMode }) => {
  const [activeTab, setActiveTab] = useState<TabType>(isQuickSaleMode ? 'quicksale' : 'supply');
  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(getTotalUnreadCount());
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await getListings(search, activeTab);
      setListings(data);
      setLoading(false);
    };
    const debounce = setTimeout(fetch, 500);
    return () => clearTimeout(debounce);
  }, [search, activeTab]);

  return (
    <div className={`flex flex-col h-screen ${activeTab === 'quicksale' ? 'bg-red-50/20' : 'bg-cream-50'}`}>
      <div className="flex-none px-4 pt-4 pb-2 z-30 bg-cream-50/95 backdrop-blur-sm border-b border-blue-100 shadow-sm">
        <header className="flex items-center justify-between mb-4">
          <div className="w-12 shrink-0">
             <div className="w-10 h-10 bg-primary-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-900/20">
                <Zap size={20} fill="currentColor" />
             </div>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center">
             <h1 className="text-xl font-black text-primary-900 tracking-tighter leading-none">applesize</h1>
             <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">The Premium Apple Market</p>
          </div>
          <div className="w-12 flex justify-end shrink-0">
            <button 
              onClick={onChatListClick}
              className="p-2.5 bg-white rounded-full shadow-sm border border-blue-100 relative hover:bg-gray-50 active:scale-95 transition-transform"
            >
              <MessageSquare size={20} className="text-primary-900" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center px-1">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-blue-100 mb-4">
          <button onClick={() => setActiveTab('supply')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'supply' ? 'bg-primary-900 text-white shadow-md' : 'text-gray-500'}`}>
            <Tag size={14} /> Supply
          </button>
          <button onClick={() => setActiveTab('demand')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'demand' ? 'bg-accent-500 text-white shadow-md' : 'text-gray-500'}`}>
            <ArrowDownToLine size={14} /> Demand
          </button>
          <button onClick={() => setActiveTab('quicksale')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'quicksale' ? 'bg-red-600 text-white shadow-md' : 'text-gray-500'}`}>
            <Zap size={14} fill={activeTab === 'quicksale' ? 'currentColor' : 'none'} /> Quick Sales
          </button>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 bg-white flex items-center px-4 h-12 rounded-xl shadow-sm border border-blue-200 relative focus-within:ring-2 focus-within:ring-primary-900/10">
            <Search size={18} className="text-gray-400 mr-3" />
            <input type="text" placeholder="Search..." className="flex-1 bg-transparent text-sm focus:outline-none" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button onClick={() => setShowFilters(true)} className="w-12 h-12 bg-primary-900 rounded-xl flex items-center justify-center text-white shadow-lg">
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 no-scrollbar">
        <div className="grid grid-cols-2 gap-4">
          {loading ? (
            Array.from({length: 4}).map((_, i) => <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>)
          ) : listings.map(item => <ListingCard key={item.id} listing={item} onClick={onItemClick} />)}
        </div>
      </div>
    </div>
  );
};