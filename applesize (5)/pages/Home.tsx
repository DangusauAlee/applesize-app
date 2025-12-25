import React, { useEffect, useState, useRef } from 'react';
import { Search, SlidersHorizontal, Bell, X, Zap, ArrowDownToLine, Tag, Filter, Check } from 'lucide-react';
import { getListings, getSearchSuggestions, FilterOptions } from '../services/mockService';
import { Listing, Condition, Region } from '../types';
import { ListingCard } from '../components/ListingCard';

interface HomeProps {
  onItemClick: (id: string) => void;
  isQuickSaleMode?: boolean; 
}

type TabType = 'supply' | 'demand' | 'quicksale';

export const Home: React.FC<HomeProps> = ({ onItemClick, isQuickSaleMode }) => {
  const [activeTab, setActiveTab] = useState<TabType>(isQuickSaleMode ? 'quicksale' : 'supply');
  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter State
  const [filters, setFilters] = useState<FilterOptions>({
    minPrice: undefined,
    maxPrice: undefined,
    sortBy: 'newest',
    conditions: [],
    regions: [],
    storage: []
  });

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await getListings(search, activeTab, filters);
      setListings(data);
      setLoading(false);
    };
    const debounce = setTimeout(fetch, 500);
    return () => clearTimeout(debounce);
  }, [search, activeTab, filters]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (search.length > 1) {
        const results = await getSearchSuggestions(search);
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionClick = (term: string) => {
    setSearch(term);
    setShowSuggestions(false);
  };

  const getTabLabel = (tab: TabType) => {
     if(tab === 'supply') return 'Supply';
     if(tab === 'demand') return 'Demand';
     if(tab === 'quicksale') return 'Quick Sales';
     return '';
  }

  // Helper for multi-select filters
  const toggleFilter = <T extends string>(
    type: 'conditions' | 'regions' | 'storage', 
    value: T
  ) => {
    setFilters(prev => {
      const current = prev[type] as T[] || [];
      const updated = current.includes(value) 
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  const conditionsList = [
    { label: 'Clean', value: Condition.CLEAN },
    { label: 'Display Msg', value: Condition.DM },
    { label: 'Deep DM', value: Condition.DDM },
    { label: 'Battery Msg', value: Condition.BM },
    { label: 'Camera Msg', value: Condition.CM },
    { label: 'No FaceID', value: Condition.OFF_ID },
    { label: 'Back Crack', value: Condition.BACK_CRACK },
    { label: 'Screen Crack', value: Condition.SCREEN_CRACK },
  ];

  const regionsList: Region[] = ['UK', 'Dubai', 'China', 'Korea', 'New', 'Used'];
  const storageList = ['64GB', '128GB', '256GB', '512GB', '1TB'];

  return (
    <div className={`flex flex-col h-screen ${activeTab === 'quicksale' ? 'bg-red-50/20' : 'bg-cream-50'}`}>
      
      {/* Fixed Top Section: Header, Tabs, Search */}
      <div className="flex-none px-4 pt-4 pb-2 z-30 bg-cream-50/95 backdrop-blur-sm border-b border-blue-100 transition-colors duration-300 shadow-sm">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <div className="w-12 shrink-0 flex items-center justify-start">
             <div className="w-10 h-10 bg-primary-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-900/20 relative overflow-hidden">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-1">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="white" className="drop-shadow-sm">
                      <path d="M12,22c4.97,0,9-4.03,9-9c0-4.97-4.03-9-9-9c-4.97,0-9,4.03-9,9C3,17.97,7.03,22,12,22z"/>
                      <circle cx="18" cy="13" r="4" fill="#0F172A" />
                   </svg>
                </div>
             </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center select-none">
             <h1 className="text-xl font-black text-primary-900 tracking-tighter leading-none">applesize</h1>
             <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">The Premium Market</p>
          </div>

          <div className="w-12 flex justify-end shrink-0">
            <button className="p-2.5 bg-white rounded-full shadow-sm border border-blue-100 relative hover:bg-gray-50 active:scale-95 transition-transform">
              <Bell size={20} className="text-primary-900" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-blue-100 mb-4">
          <button 
            onClick={() => setActiveTab('supply')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'supply' ? 'bg-primary-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Tag size={14} /> Supply
          </button>
          <button 
            onClick={() => setActiveTab('demand')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'demand' ? 'bg-accent-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <ArrowDownToLine size={14} /> Demand
          </button>
          <button 
            onClick={() => setActiveTab('quicksale')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'quicksale' ? 'bg-red-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Zap size={14} fill={activeTab === 'quicksale' ? 'currentColor' : 'none'} /> Quick Sales
          </button>
        </div>

        {/* Search & Filter */}
        <div className="relative z-20" ref={searchContainerRef}>
          <div className="flex gap-3">
            <div className="flex-1 bg-white flex items-center px-4 h-12 rounded-xl shadow-sm border border-blue-200 relative focus-within:ring-2 focus-within:ring-primary-900/10 transition-all">
              <Search size={18} className="text-gray-400 mr-3" />
              <input 
                type="text" 
                placeholder={`Search ${getTabLabel(activeTab)}...`} 
                className="flex-1 bg-transparent text-sm focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => search.length > 1 && setShowSuggestions(true)}
              />
              {search && (
                <button onClick={() => setSearch('')} className="p-1 text-gray-400 hover:text-red-500">
                  <X size={14} />
                </button>
              )}
            </div>
            <button 
              onClick={() => setShowFilters(true)}
              className="w-12 h-12 bg-primary-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-900/20 active:scale-95 transition-transform"
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>

          {/* Suggestion Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-14 left-0 right-14 bg-white rounded-xl shadow-xl border border-blue-200 overflow-hidden animate-in fade-in slide-in-from-top-2">
              {suggestions.map((item, index) => (
                <div 
                  key={index} 
                  onClick={() => handleSuggestionClick(item)}
                  className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer border-b border-blue-50 last:border-0 flex items-center gap-2"
                >
                  <Search size={14} className="text-gray-400" />
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Listings Grid */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 no-scrollbar">
        <div className="grid grid-cols-2 gap-4">
          {loading ? (
            Array.from({length: 6}).map((_, i) => (
               <div key={i} className="h-64 bg-blue-50 rounded-xl animate-pulse"></div>
            ))
          ) : listings.length > 0 ? (
            listings.map(item => (
              <ListingCard key={item.id} listing={item} onClick={onItemClick} />
            ))
          ) : (
            <div className="col-span-2 flex flex-col items-center justify-center py-20 text-gray-400">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border border-blue-100">
                 <Search size={24} />
               </div>
               <p className="font-medium">No listings found</p>
               <p className="text-xs">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in">
          <div className="bg-white w-full sm:w-[500px] h-[85vh] sm:h-auto overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl slide-in-from-bottom-10 animate-in">
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-lg flex items-center gap-2"><Filter size={18}/> Filters</h3>
               <button onClick={() => setShowFilters(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 border border-blue-100"><X size={18}/></button>
             </div>
             
             <div className="space-y-6">
               {/* Sort By */}
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Sort By</label>
                  <div className="flex gap-2">
                    {['newest', 'price_asc', 'price_desc'].map(sort => (
                      <button 
                        key={sort}
                        onClick={() => setFilters({...filters, sortBy: sort as any})}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${filters.sortBy === sort ? 'bg-primary-900 text-white border-primary-900' : 'bg-gray-50 text-gray-600 border-blue-200'}`}
                      >
                        {sort === 'newest' ? 'Newest' : sort === 'price_asc' ? 'Lowest Price' : 'Highest Price'}
                      </button>
                    ))}
                  </div>
               </div>

               {/* Conditions Filter */}
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Conditions</label>
                  <div className="flex flex-wrap gap-2">
                    {conditionsList.map(c => {
                       const isSelected = filters.conditions?.includes(c.value);
                       return (
                         <button 
                           key={c.value}
                           onClick={() => toggleFilter('conditions', c.value)}
                           className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1 ${isSelected ? 'bg-primary-900 text-white border-primary-900' : 'bg-gray-50 text-gray-600 border-blue-200'}`}
                         >
                           {isSelected && <Check size={10} />}
                           {c.label}
                         </button>
                       );
                    })}
                  </div>
               </div>

               {/* Region Filter */}
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Region / Spec</label>
                  <div className="flex flex-wrap gap-2">
                    {regionsList.map(r => {
                       const isSelected = filters.regions?.includes(r);
                       return (
                         <button 
                           key={r}
                           onClick={() => toggleFilter('regions', r)}
                           className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1 ${isSelected ? 'bg-primary-900 text-white border-primary-900' : 'bg-gray-50 text-gray-600 border-blue-200'}`}
                         >
                           {isSelected && <Check size={10} />}
                           {r}
                         </button>
                       );
                    })}
                  </div>
               </div>

               {/* Storage Filter */}
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Storage</label>
                  <div className="flex flex-wrap gap-2">
                    {storageList.map(s => {
                       const isSelected = filters.storage?.includes(s);
                       return (
                         <button 
                           key={s}
                           onClick={() => toggleFilter('storage', s)}
                           className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1 ${isSelected ? 'bg-primary-900 text-white border-primary-900' : 'bg-gray-50 text-gray-600 border-blue-200'}`}
                         >
                           {isSelected && <Check size={10} />}
                           {s}
                         </button>
                       );
                    })}
                  </div>
               </div>

               {/* Price Range */}
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Price Range (₦)</label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="number" 
                      placeholder="Min"
                      className="flex-1 bg-gray-50 border border-blue-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary-900"
                      value={filters.minPrice || ''}
                      onChange={(e) => setFilters({...filters, minPrice: Number(e.target.value)})}
                    />
                    <span className="text-gray-400">-</span>
                    <input 
                      type="number" 
                      placeholder="Max"
                      className="flex-1 bg-gray-50 border border-blue-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary-900"
                      value={filters.maxPrice || ''}
                      onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})}
                    />
                  </div>
               </div>

               <div className="flex gap-3">
                 <button 
                   onClick={() => setFilters({ minPrice: undefined, maxPrice: undefined, sortBy: 'newest', conditions: [], regions: [], storage: [] })}
                   className="py-4 px-6 bg-gray-100 text-gray-600 font-bold rounded-xl"
                 >
                   Reset
                 </button>
                 <button 
                   onClick={() => setShowFilters(false)}
                   className="flex-1 py-4 bg-primary-900 text-white font-bold rounded-xl shadow-lg shadow-primary-900/20"
                 >
                   Show Results
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};