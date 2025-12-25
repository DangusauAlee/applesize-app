import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Phone, Info, Image as ImageIcon, Smile, Sticker, X, Video } from 'lucide-react';
import { getMessages, sendMessage } from '../services/mockService';
import { ChatMessage } from '../types';
import { MOCK_USER } from '../constants';

interface ChatProps {
  chatId: string;
  onBack: () => void;
}

export const Chat: React.FC<ChatProps> = ({ chatId, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load initial messages
    getMessages(chatId).then(setMessages);
  }, [chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (type: 'text' | 'image' | 'sticker' = 'text', content?: string) => {
    const textToSend = content || input;
    if (!textToSend.trim() && type === 'text') return;
    
    if (type === 'text') setInput('');

    const newMsg = await sendMessage(chatId, textToSend, MOCK_USER.id, type);
    setMessages(prev => [...prev, newMsg]);
  };

  return (
    <div className="flex flex-col h-screen bg-cream-50 relative">
      
      {/* Header */}
      <div className="h-16 bg-white flex items-center justify-between px-4 border-b border-blue-200 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-3 p-2 -ml-2 rounded-full hover:bg-gray-100 border border-transparent hover:border-blue-100">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowProfile(true)}>
             <div className="w-9 h-9 bg-primary-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
               S
             </div>
             <div>
                <h2 className="font-bold text-primary-900 text-sm leading-tight">Seller Support</h2>
                <p className="text-[10px] text-green-600 font-medium">Online</p>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
           <button onClick={() => setIsCalling(true)} className="p-2.5 text-primary-900 hover:bg-gray-100 rounded-full border border-transparent hover:border-blue-100">
             <Phone size={20} />
           </button>
           <button onClick={() => setShowProfile(true)} className="p-2.5 text-primary-900 hover:bg-gray-100 rounded-full border border-transparent hover:border-blue-100">
             <Info size={20} />
           </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-cream-50/50">
        {messages.map(msg => {
          const isMe = msg.senderId === MOCK_USER.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[75%] rounded-2xl overflow-hidden shadow-sm ${
                  isMe 
                    ? 'bg-primary-900 text-white rounded-tr-none' 
                    : 'bg-white text-primary-900 border border-blue-200 rounded-tl-none'
                }`}
              >
                {/* Content based on type */}
                {msg.type === 'image' ? (
                  <div className="p-1">
                     <img src={msg.imageUrl} alt="attachment" className="rounded-xl max-w-full h-auto" />
                  </div>
                ) : msg.type === 'sticker' ? (
                  <div className="p-2 text-4xl">
                     {msg.stickerUrl}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm">{msg.text}</div>
                )}
                
                <div className={`px-2 pb-1 text-[9px] text-right ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-3 pb-6 border-t border-blue-200">
        <div className="flex gap-2 items-end">
          {/* Media Actions */}
          <button 
             onClick={() => handleSend('image', 'https://images.unsplash.com/photo-1530319067432-f2a729c03db5?auto=format&fit=crop&w=500&q=80')}
             className="p-3 text-gray-500 hover:text-primary-900 hover:bg-gray-100 rounded-xl border border-transparent hover:border-blue-200"
          >
             <ImageIcon size={22} />
          </button>
          
          {/* Text Field */}
          <div className="flex-1 bg-gray-50 rounded-2xl border border-blue-200 flex items-center px-2">
             <button 
                onClick={() => handleSend('sticker', '👋')}
                className="p-2 text-gray-400 hover:text-yellow-500"
             >
               <Smile size={20} />
             </button>
             <input 
                className="flex-1 bg-transparent focus:outline-none text-sm py-3 min-h-[44px]"
                placeholder="Message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             />
             <button 
                onClick={() => handleSend('sticker', '🔥')}
                className="p-2 text-gray-400 hover:text-red-500"
             >
               <Sticker size={20} />
             </button>
          </div>

          <button 
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="p-3 bg-primary-900 text-white rounded-xl disabled:opacity-50 hover:scale-105 transition-transform"
          >
            <Send size={22} />
          </button>
        </div>
      </div>

      {/* Profile Overlay Modal */}
      {showProfile && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in">
           <div className="bg-white w-full sm:w-80 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl slide-in-from-bottom-10 animate-in">
              <div className="flex justify-between items-start mb-4">
                 <h3 className="font-bold text-lg">Seller Profile</h3>
                 <button onClick={() => setShowProfile(false)} className="p-1 bg-gray-100 rounded-full border border-blue-100"><X size={16}/></button>
              </div>
              <div className="flex flex-col items-center mb-6">
                 <div className="w-20 h-20 bg-primary-900 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">
                    S
                 </div>
                 <h2 className="font-bold text-xl">Emeka Phones Ltd</h2>
                 <p className="text-gray-500 text-sm">Verified Dealer • Ikeja</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                 <div className="bg-green-50 p-3 rounded-xl text-center border border-green-100">
                    <p className="font-bold text-green-700 text-lg">98%</p>
                    <p className="text-xs text-green-600">Response Rate</p>
                 </div>
                 <div className="bg-blue-50 p-3 rounded-xl text-center border border-blue-100">
                    <p className="font-bold text-blue-700 text-lg">1.2h</p>
                    <p className="text-xs text-blue-600">Avg. Reply</p>
                 </div>
              </div>
              <button onClick={() => setShowProfile(false)} className="w-full py-3 bg-primary-900 text-white rounded-xl font-bold">
                 View Full Inventory
              </button>
           </div>
        </div>
      )}

      {/* Calling Overlay */}
      {isCalling && (
        <div className="absolute inset-0 z-50 bg-primary-900 flex flex-col items-center justify-center text-white animate-in fade-in">
           <div className="w-24 h-24 rounded-full border-4 border-white/20 flex items-center justify-center mb-6 animate-pulse">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                 <span className="text-primary-900 text-3xl font-bold">S</span>
              </div>
           </div>
           <h2 className="text-2xl font-bold mb-2">Emeka Phones Ltd</h2>
           <p className="text-white/60 mb-12">Calling...</p>
           
           <div className="flex gap-8">
             <button className="p-4 bg-white/20 rounded-full hover:bg-white/30 border border-white/10"><Video size={24} /></button>
             <button onClick={() => setIsCalling(false)} className="p-4 bg-red-500 rounded-full hover:bg-red-600 shadow-lg scale-110 border border-red-400"><Phone size={24} className="rotate-[135deg]" /></button>
             <button className="p-4 bg-white/20 rounded-full hover:bg-white/30 border border-white/10"><Sticker size={24} /></button>
           </div>
        </div>
      )}

    </div>
  );
};