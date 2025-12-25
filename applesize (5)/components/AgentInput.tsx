import React, { useState } from 'react';
import { parseAgentText, createListing } from '../services/mockService';
import { Listing, Condition } from '../types';
import { Check, Loader2, ClipboardPaste } from 'lucide-react';

export const AgentInput: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [rawText, setRawText] = useState('');
  const [parsedData, setParsedData] = useState<Partial<Listing> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleParse = () => {
    const result = parseAgentText(rawText);
    setParsedData(result);
  };

  const handleSubmit = async () => {
    if (!parsedData) return;
    setLoading(true);
    // Add default mock location/condition if missing
    await createListing({ ...parsedData, condition: [Condition.CLEAN], location: 'Ikeja, Lagos' });
    setLoading(false);
    setRawText('');
    setParsedData(null);
    onSuccess();
  };

  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-blue-200">
      <h2 className="text-lg font-bold text-primary-900 mb-4 flex items-center gap-2">
        <ClipboardPaste size={20} />
        Quick Lister
      </h2>
      
      {!parsedData ? (
        <div className="space-y-4">
          <textarea
            className="w-full h-32 p-4 bg-cream-50 rounded-xl border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-900"
            placeholder="Paste WhatsApp listing here...&#10;e.g. iPhone 14 Pro 128GB Gold 90% Battery 650000"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          <button 
            disabled={!rawText.trim()}
            onClick={handleParse}
            className="w-full py-3 bg-primary-900 text-white rounded-xl font-semibold disabled:opacity-50"
          >
            Parse Listing
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-green-50 p-4 rounded-xl border border-green-100 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Model</span>
              <span className="font-bold text-primary-900">{parsedData.model}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Price</span>
              <span className="font-bold text-primary-900">₦{parsedData.price?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Specs</span>
              <span className="font-bold text-primary-900">{parsedData.storage} • {parsedData.color} • {parsedData.batteryHealth}% BH</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setParsedData(null)}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold border border-blue-100"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Check size={18} />}
              Publish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};