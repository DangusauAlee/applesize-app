
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Phone, Info, Image as ImageIcon, Smile, Sticker, X, Video, CheckCircle, XCircle, Mic, Play, Pause, Trash2, Volume2 } from 'lucide-react';
import { getMessages, sendMessage, respondToOffer } from '../services/mockService';
import { ChatMessage } from '../types';
import { MOCK_USER } from '../constants';

interface ChatProps {
  chatId: string;
  onBack: () => void;
}

const AudioBubble: React.FC<{ url: string, isMe: boolean }> = ({ url, isMe }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const onEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="flex items-center gap-3 py-1 px-1">
      <button 
        onClick={togglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          isMe ? 'bg-white/20 text-white' : 'bg-primary-900 text-white'
        }`}
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="ml-0.5" fill="currentColor" />}
      </button>
      
      <div className="flex-1 min-w-[120px]">
        <div className={`h-1.5 w-full rounded-full overflow-hidden ${isMe ? 'bg-white/20' : 'bg-gray-100'}`}>
          <div 
            className={`h-full transition-all duration-75 ${isMe ? 'bg-white' : 'bg-primary-900'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <Volume2 size={14} className={isMe ? 'text-white/40' : 'text-gray-300'} />
      <audio ref={audioRef} src={url} onTimeUpdate={onTimeUpdate} onEnded={onEnded} hidden />
    </div>
  );
};

export const Chat: React.FC<ChatProps> = ({ chatId, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    getMessages(chatId).then(setMessages);
    const interval = setInterval(() => {
       getMessages(chatId).then(setMessages);
    }, 2000);
    return () => clearInterval(interval);
  }, [chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (type: 'text' | 'image' | 'sticker' | 'audio' = 'text', content?: string) => {
    const textToSend = content || input;
    if (type === 'text' && !textToSend.trim()) return;
    
    if (type === 'text') setInput('');
    const newMsg = await sendMessage(chatId, textToSend, MOCK_USER.id, type);
    setMessages(prev => [...prev, newMsg]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        await handleSend('audio', audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Microphone permission is required for voice messages.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleOfferResponse = async (messageId: string, status: 'accepted' | 'rejected') => {
    await respondToOffer(chatId, messageId, status);
    const updated = await getMessages(chatId);
    setMessages(updated);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-cream-50/50 no-scrollbar">
        {messages.map(msg => {
          const isMe = msg.senderId === MOCK_USER.id;
          const isSystem = msg.isSystem;

          if (isSystem) {
             return (
               <div key={msg.id} className="flex justify-center my-4">
                 <span className="text-[10px] bg-gray-200 text-gray-500 px-3 py-1 rounded-full font-bold">
                   {msg.text}
                 </span>
               </div>
             );
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[80%] rounded-2xl overflow-hidden shadow-sm ${
                  isMe 
                    ? 'bg-primary-900 text-white rounded-tr-none' 
                    : 'bg-white text-primary-900 border border-blue-200 rounded-tl-none'
                }`}
              >
                {/* Content based on type */}
                {msg.type === 'audio' ? (
                  <div className="p-2 min-w-[200px]">
                    <AudioBubble url={msg.audioUrl || ''} isMe={isMe} />
                  </div>
                ) : msg.type === 'image' ? (
                  <div className="p-1">
                     <img src={msg.imageUrl} alt="attachment" className="rounded-xl max-w-full h-auto" />
                  </div>
                ) : msg.type === 'sticker' ? (
                  <div className="p-2 text-4xl">
                     {msg.stickerUrl}
                  </div>
                ) : msg.type === 'offer' ? (
                  <div className="p-4 bg-gray-50/10">
                    <p className="text-xs font-medium opacity-70 mb-1">SENT AN OFFER</p>
                    <p className="text-2xl font-bold mb-3">₦{msg.offerAmount?.toLocaleString()}</p>
                    
                    {msg.offerStatus === 'pending' ? (
                      <div className="flex gap-2">
                         {!isMe ? (
                           <>
                            <button 
                              onClick={() => handleOfferResponse(msg.id, 'rejected')}
                              className="flex-1 py-2 px-3 bg-red-100 text-red-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-red-200"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                            <button 
                              onClick={() => handleOfferResponse(msg.id, 'accepted')}
                              className="flex-1 py-2 px-3 bg-green-100 text-green-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-green-200"
                            >
                              <CheckCircle size={14} /> Accept
                            </button>
                           </>
                         ) : (
                           <div className="w-full py-2 bg-black/10 rounded-lg text-center text-xs font-medium">
                             Waiting for response...
                           </div>
                         )}
                      </div>
                    ) : (
                      <div className={`w-full py-2 rounded-lg text-center text-xs font-bold border ${msg.offerStatus === 'accepted' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-600 border-red-200'}`}>
                        {msg.offerStatus === 'accepted' ? 'Offer Accepted' : 'Offer Rejected'}
                      </div>
                    )}
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

      {/* Recording Overlay */}
      {isRecording && (
        <div className="absolute bottom-20 left-4 right-4 bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-4 flex items-center justify-between border border-red-100 animate-in slide-in-from-bottom-5 z-20">
           <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
              <span className="text-sm font-bold text-primary-900">Recording... {formatTime(recordingTime)}</span>
           </div>
           <div className="flex items-center gap-3">
             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Release to send</span>
           </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white p-3 pb-6 border-t border-blue-200">
        <div className="flex gap-2 items-end">
          <button 
             onClick={() => handleSend('image', 'https://images.unsplash.com/photo-1530319067432-f2a729c03db5?auto=format&fit=crop&w=500&q=80')}
             className="p-3 text-gray-500 hover:text-primary-900 hover:bg-gray-100 rounded-xl border border-transparent hover:border-blue-200"
          >
             <ImageIcon size={22} />
          </button>
          
          <div className="flex-1 bg-gray-50 rounded-2xl border border-blue-200 flex items-center px-1">
             <button 
                onMouseDown={(e) => { e.preventDefault(); startRecording(); }}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
                onTouchEnd={stopRecording}
                className={`p-2.5 rounded-full transition-all ${
                  isRecording 
                    ? 'bg-red-50 text-red-600 scale-125 shadow-lg' 
                    : 'text-gray-400 hover:text-primary-900'
                }`}
             >
               <Mic size={20} fill={isRecording ? 'currentColor' : 'none'} />
             </button>
             <input 
                className="flex-1 bg-transparent focus:outline-none text-sm py-3 px-2 min-h-[44px]"
                placeholder={isRecording ? "Listening..." : "Message..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isRecording}
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
            disabled={!input.trim() || isRecording}
            className="p-3 bg-primary-900 text-white rounded-xl disabled:opacity-50 hover:scale-105 transition-transform shadow-md"
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
