import React, { useEffect, useState } from 'react';
import { ArrowLeft, Search, MessageCircle } from 'lucide-react';
import { getChats, getCurrentUser } from '../services/mockService';
import { ChatSession } from '../types';

interface ChatListProps {
  onBack: () => void;
  onSelectChat: (id: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ onBack, onSelectChat }) => {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const user = getCurrentUser();

  useEffect(() => {
    getChats().then(setChats);
  }, []);

  return (
    <div className="min-h-screen bg-cream-50 pb-20">
      <div className="sticky top-0 z-20 bg-white border-b border-blue-100 p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-primary-900">Messages</h1>
        </div>
      </div>

      <div className="p-4">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <MessageCircle size={48} className="mb-4 opacity-20" />
            <p className="font-medium">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map(chat => {
              const otherId = chat.buyerId === user.id ? chat.sellerId : chat.buyerId;
              return (
                <div 
                  key={chat.id} 
                  onClick={() => onSelectChat(chat.id)}
                  className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all"
                >
                  <div className="w-12 h-12 bg-primary-900 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    {chat.listingModel.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold text-primary-900 truncate">{chat.listingModel}</h3>
                      <span className="text-[10px] text-gray-400">{new Date(chat.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};