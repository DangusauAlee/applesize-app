import React from 'react';
import { Home, PlusCircle, User } from 'lucide-react';

interface NavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange }) => {
  const navItemClass = (tabName: string) => `
    flex flex-col items-center justify-center w-full h-full space-y-1
    ${currentTab === tabName ? 'text-primary-900 font-semibold' : 'text-gray-400 hover:text-gray-600'}
  `;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-blue-100 pb-5 pt-2 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-between items-center h-full max-w-sm mx-auto">
        
        <button onClick={() => onTabChange('home')} className={navItemClass('home')}>
          <Home size={24} strokeWidth={currentTab === 'home' ? 2.5 : 2} />
          <span className="text-[10px]">Market</span>
        </button>

        <button onClick={() => onTabChange('post')} className="relative -top-5">
          <div className="bg-primary-900 text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform border-4 border-white">
            <PlusCircle size={28} />
          </div>
        </button>

        <button onClick={() => onTabChange('profile')} className={navItemClass('profile')}>
          <User size={24} strokeWidth={currentTab === 'profile' ? 2.5 : 2} />
          <span className="text-[10px]">Profile</span>
        </button>

      </div>
    </nav>
  );
};