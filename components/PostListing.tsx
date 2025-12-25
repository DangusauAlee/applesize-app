import React, { useState } from 'react';
import { createListing } from '../services/mockService';
import { MODELS_BY_CATEGORY } from '../constants';
import { Region, SimStatus, Condition, ProductCategory } from '../types';
import { Loader2, Video, Zap, ArrowDownToLine, Tag, Info, Check } from 'lucide-react';

type PostType = 'supply' | 'demand' | 'quicksale';

const IPHONE_COLORS = [
  'Black', 'White', 'Graphite', 'Silver', 'Gold', 
  'Deep Purple', 'Space Black', 
  'Blue Titanium', 'Natural Titanium', 'White Titanium', 'Black Titanium',
  'Sierra Blue', 'Alpine Green', 'Midnight', 'Starlight', 'Red', 'Blue', 'Pink', 'Yellow', 'Green'
];

export const PostListing: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [postType, setPostType] = useState<PostType>('supply');
  const [loading, setLoading] = useState(false);
  const category: ProductCategory = 'iPhone';
  
  const [formData, setFormData] = useState({
    model: '',
    storage: '128GB',
    price: '',
    conditions: [Condition.CLEAN] as Condition[],
    region: 'UK' as Region,
    simStatus: 'Physical Sim' as SimStatus,
    batteryHealth: '100',
    color: 'Black',
    description: '',
  });

  const isDemand = postType === 'demand';
  const isQuickSale = postType === 'quicksale';

  const isFormValid = () => {
    if (!formData.model) return false;

    if (postType === 'supply') {
      return !!formData.model && !!formData.price; 
    }
    if (postType === 'demand') {
      return !!formData.model && !!formData.storage && !!formData.region;
    }
    if (postType === 'quicksale') {
      return !!formData.model && !!formData.storage && !!formData.price && !!formData.batteryHealth && !!formData.color;
    }
    return false;
  };

  const handleSubmit = async () => {
    setLoading(true);
    await createListing({
      ...formData,
      condition: formData.conditions,
      category,
      type: isDemand ? 'demand' : 'supply',
      isQuickSale: isQuickSale,
      allowOffers: isQuickSale,
      price: Number(formData.price),
      batteryHealth: Number(formData.batteryHealth),
      // Mock video for supply/quicksale
      videoUrl: (!isDemand) ? 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smart-phone-with-a-green-screen-3290-large.mp4' : undefined,
      images: []
    });
    setLoading(false);
    onSuccess();
  };

  const toggleCondition = (cond: Condition) => {
    setFormData(prev => {
      const exists = prev.conditions.includes(cond);
      let newConditions;
      if (exists) {
        newConditions = prev.conditions.filter(c => c !== cond);
      } else {
        newConditions = [...prev.conditions, cond];
      }
      
      // Logic: If selecting "Clean", clear defects. If selecting defects, clear "Clean".
      if (!exists && cond === Condition.CLEAN) {
         newConditions = [Condition.CLEAN];
      } else if (!exists && cond !== Condition.CLEAN) {
         newConditions = newConditions.filter(c => c !== Condition.CLEAN);
      }

      // If array becomes empty, we can leave it empty or default. 
      // For now, allow empty as user might be unselecting to select another.
      return { ...prev, conditions: newConditions };
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

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-blue-200 overflow-hidden pb-10">
      {/* Type Selector */}
      <div className="flex border-b border-blue-100 bg-gray-50/50">
        <button 
          onClick={() => setPostType('supply')}
          className={`flex-1 py-4 text-xs font-bold flex flex-col items-center justify-center gap-1 ${postType === 'supply' ? 'bg-primary-900 text-white' : 'text-gray-400'}`}
        >
          <Tag size={18} /> Supply
        </button>
        <button 
          onClick={() => setPostType('demand')}
          className={`flex-1 py-4 text-xs font-bold flex flex-col items-center justify-center gap-1 ${postType === 'demand' ? 'bg-accent-500 text-white' : 'text-gray-400'}`}
        >
          <ArrowDownToLine size={18} /> Demand
        </button>
        <button 
          onClick={() => setPostType('quicksale')}
          className={`flex-1 py-4 text-xs font-bold flex flex-col items-center justify-center gap-1 ${postType === 'quicksale' ? 'bg-red-600 text-white' : 'text-gray-400'}`}
        >
          <Zap size={18} fill="currentColor" /> Quick Sale
        </button>
      </div>

      <div className="p-5 space-y-5">
        
        {/* Helper Text */}
        <div className={`p-3 rounded-xl flex gap-3 items-start border ${isQuickSale ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
           <Info size={16} className={`${isQuickSale ? 'text-red-500' : 'text-blue-500'} mt-0.5 flex-shrink-0`} />
           <p className={`text-xs ${isQuickSale ? 'text-red-700' : 'text-blue-700'}`}>
             {isDemand && 'Request an iPhone. Verified dealers will contact you with offers.'}
             {postType === 'supply' && 'List your iPhone for sale. Video upload is required for verification.'}
             {isQuickSale && 'Quick Sales require competitive pricing and full details. These listings appear in the Deal Zone.'}
           </p>
        </div>

        <div className="space-y-4">
          
          {/* Model - iPhone Only */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">iPhone Model *</label>
            <select 
              className="w-full p-3 bg-cream-50 rounded-xl border border-blue-200 text-sm focus:outline-none focus:border-primary-900"
              value={formData.model}
              onChange={e => setFormData({...formData, model: e.target.value})}
            >
              <option value="">Select Model</option>
              {MODELS_BY_CATEGORY['iPhone']?.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Media - Supply/QuickSale Only */}
          {!isDemand && (
            <div>
               <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Video Upload *</label>
               <div className="flex gap-3">
                <button className="flex-1 h-20 border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-primary-900 bg-gray-50">
                  <Video size={20} />
                  <span className="text-[10px] mt-1">Select Video</span>
                </button>
              </div>
            </div>
          )}

          {/* Condition (Multi-select) */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">
              {isDemand ? 'Preferred Condition(s)' : 'Condition (Select Multiple) *'}
            </label>
            <div className="flex flex-wrap gap-2">
              {conditionsList.map(c => {
                const isSelected = formData.conditions.includes(c.value);
                return (
                  <button
                    key={c.value}
                    onClick={() => toggleCondition(c.value)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-1
                      ${isSelected 
                        ? 'bg-primary-900 text-white border-primary-900 shadow-md' 
                        : 'bg-white text-gray-500 border-blue-200 hover:border-primary-900/30'}`}
                  >
                    {isSelected && <Check size={12} />}
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                {isDemand ? 'Preferred Storage' : 'Storage *'}
              </label>
              <select 
                className="w-full p-3 bg-cream-50 rounded-xl border border-blue-200 text-sm"
                value={formData.storage}
                onChange={e => setFormData({...formData, storage: e.target.value})}
              >
                {['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                {isDemand ? 'Preferred Region' : 'Region *'}
              </label>
              <select 
                className="w-full p-3 bg-cream-50 rounded-xl border border-blue-200 text-sm"
                value={formData.region}
                onChange={e => setFormData({...formData, region: e.target.value as Region})}
              >
                {['UK', 'Dubai', 'China', 'Korea', 'New', 'Used'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Color - New Field */}
          <div>
             <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                {isDemand ? 'Preferred Color' : 'Color *'}
             </label>
             <select 
               className="w-full p-3 bg-cream-50 rounded-xl border border-blue-200 text-sm"
               value={formData.color}
               onChange={e => setFormData({...formData, color: e.target.value})}
             >
               {IPHONE_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>

          {/* Additional Specs - Visible for QuickSale & Supply */}
          {!isDemand && (
            <>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Battery % {isQuickSale && '*'}</label>
                     <input 
                        type="number"
                        className="w-full p-3 bg-cream-50 rounded-xl border border-blue-200 text-sm"
                        placeholder="100"
                        value={formData.batteryHealth}
                        onChange={e => setFormData({...formData, batteryHealth: e.target.value})}
                     />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Sim Status {isQuickSale && '*'}</label>
                    <select 
                      className="w-full p-3 bg-cream-50 rounded-xl border border-blue-200 text-sm"
                      value={formData.simStatus}
                      onChange={e => setFormData({...formData, simStatus: e.target.value as SimStatus})}
                    >
                      {['Physical Sim', 'E-Sim', 'Dual Sim', 'No Sim'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
               </div>
            </>
          )}

          {/* Description - For All Types */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">More Information</label>
            <textarea
              className="w-full p-3 bg-cream-50 rounded-xl border border-blue-200 text-sm focus:outline-none focus:border-primary-900 h-24 resize-none"
              placeholder={isDemand ? "Describe exactly what you are looking for..." : "Any defects? Accessories included?"}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Price / Budget */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
              {isDemand ? 'Your Budget (Optional)' : `Price (₦) ${isQuickSale ? '*' : ''}`}
            </label>
            <input 
              type="number"
              className="w-full p-3 bg-cream-50 rounded-xl border border-blue-200 text-sm font-bold text-lg"
              placeholder={isDemand ? "Enter budget..." : "0"}
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
            />
          </div>

          <button 
            onClick={handleSubmit}
            disabled={loading || !isFormValid()}
            className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 mt-4 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
              ${isQuickSale ? 'bg-red-600 shadow-red-600/20' : 
                isDemand ? 'bg-accent-500 shadow-accent-500/20' : 
                'bg-primary-900 shadow-primary-900/20'}`}
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              isDemand ? 'Post Demand Request' : 
              isQuickSale ? 'Post Quick Sale' : 
              'Post Supply Listing'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};