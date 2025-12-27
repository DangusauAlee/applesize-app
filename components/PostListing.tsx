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
    if (postType === 'supply') return !!formData.model && !!formData.price; 
    if (postType === 'demand') return !!formData.model && !!formData.storage && !!formData.region;
    if (postType === 'quicksale') return !!formData.model && !!formData.storage && !!formData.price;
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
      videoUrl: (!isDemand) ? 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smart-phone-with-a-green-screen-3290-large.mp4' : undefined,
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
        newConditions = cond === Condition.CLEAN ? [Condition.CLEAN] : [...prev.conditions.filter(c => c !== Condition.CLEAN), cond];
      }
      return { ...prev, conditions: newConditions };
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-blue-200 overflow-hidden">
      <div className="flex border-b border-blue-100 bg-gray-50/50">
        <button onClick={() => setPostType('supply')} className={`flex-1 py-4 text-xs font-bold flex flex-col items-center gap-1 ${postType === 'supply' ? 'bg-primary-900 text-white' : 'text-gray-400'}`}>
          <Tag size={18} /> Supply
        </button>
        <button onClick={() => setPostType('demand')} className={`flex-1 py-4 text-xs font-bold flex flex-col items-center gap-1 ${postType === 'demand' ? 'bg-accent-500 text-white' : 'text-gray-400'}`}>
          <ArrowDownToLine size={18} /> Demand
        </button>
        <button onClick={() => setPostType('quicksale')} className={`flex-1 py-4 text-xs font-bold flex flex-col items-center gap-1 ${postType === 'quicksale' ? 'bg-red-600 text-white' : 'text-gray-400'}`}>
          <Zap size={18} fill="currentColor" /> Quick Sale
        </button>
      </div>

      <div className="p-5 space-y-5">
        <div className={`p-3 rounded-xl flex gap-3 border ${isQuickSale ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
          <Info size={16} className={`${isQuickSale ? 'text-red-500' : 'text-blue-500'} mt-0.5`} />
          <p className="text-xs">{isDemand ? 'Request an iPhone from verified dealers.' : 'List your iPhone. Video verification required.'}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">iPhone Model *</label>
            <select className="w-full p-3 bg-cream-50 rounded-xl border border-blue-200 text-sm" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})}>
              <option value="">Select Model</option>
              {MODELS_BY_CATEGORY['iPhone']?.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {!isDemand && (
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Video verification *</label>
              <button className="w-full h-16 border-2 border-dashed border-blue-300 rounded-xl flex items-center justify-center text-gray-400 bg-gray-50">
                <Video size={20} className="mr-2"/>
                <span className="text-[10px]">Select Video</span>
              </button>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Condition *</label>
            <div className="flex flex-wrap gap-2">
              {[Condition.CLEAN, Condition.DM, Condition.BM, Condition.OFF_ID, Condition.BACK_CRACK].map(c => (
                <button key={c} onClick={() => toggleCondition(c)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border ${formData.conditions.includes(c) ? 'bg-primary-900 text-white border-primary-900' : 'bg-white text-gray-500 border-blue-200'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Storage *</label>
              <select className="w-full p-3 bg-cream-50 rounded-xl border border-blue-200 text-sm" value={formData.storage} onChange={e => setFormData({...formData, storage: e.target.value})}>
                {['64GB', '128GB', '256GB', '512GB', '1TB'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Region *</label>
              <select className="w-full p-3 bg-cream-50 rounded-xl border border-blue-200 text-sm" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value as Region})}>
                {['UK', 'Dubai', 'China', 'Korea', 'New', 'Used'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Color *</label>
            <select className="w-full p-3 bg-cream-50 rounded-xl border border-blue-200 text-sm" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})}>
              {IPHONE_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Price (₦) *</label>
            <input type="number" className="w-full p-3 bg-cream-50 rounded-xl border border-blue-200 text-sm font-bold" placeholder="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
          </div>

          <button onClick={handleSubmit} disabled={loading || !isFormValid()} className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 mt-4 shadow-lg ${isQuickSale ? 'bg-red-600' : isDemand ? 'bg-accent-500' : 'bg-primary-900'} disabled:opacity-50`}>
            {loading ? <Loader2 className="animate-spin" /> : 'Publish Listing'}
          </button>
        </div>
      </div>
    </div>
  );
};