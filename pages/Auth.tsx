
import React, { useState } from 'react';
import { Zap, Phone, Mail, MapPin, User as UserIcon, CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { checkAuth, registerPendingUser } from '../services/mockService';
import { User, UserRole } from '../types';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

type AuthState = 'login' | 'signup' | 'loading' | 'success' | 'fail' | 'pending';

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [phone, setPhone] = useState('');
  const [authState, setAuthState] = useState<AuthState>('login');
  const [signupForm, setSignupForm] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    state: ''
  });

  const handleAuth = async () => {
    if (!phone) return;
    setAuthState('loading');
    const user = await checkAuth(phone);
    if (user) {
      setAuthState('success');
      setTimeout(() => {
        onAuthSuccess(user);
      }, 2000);
    } else {
      setAuthState('fail');
      setTimeout(() => {
        setSignupForm(prev => ({ ...prev, phone: phone }));
        setAuthState('signup');
      }, 2000);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthState('loading');
    await registerPendingUser({
      ...signupForm,
      role: UserRole.USER,
      isVerified: false,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
    } as any);
    setAuthState('pending');
    setTimeout(() => {
      setAuthState('login');
      setPhone('');
    }, 3000);
  };

  if (authState === 'success') {
    return (
      <div className="fixed inset-0 bg-primary-900 z-[100] flex flex-col items-center justify-center text-white animate-in fade-in">
        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <CheckCircle size={64} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-black mb-2">You are Applesized</h1>
        <p className="text-white/60">Verification successful</p>
      </div>
    );
  }

  if (authState === 'fail') {
    return (
      <div className="fixed inset-0 bg-red-600 z-[100] flex flex-col items-center justify-center text-white animate-in fade-in">
        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
          <XCircle size={64} className="text-white" />
        </div>
        <h1 className="text-3xl font-black mb-2">You need to be Applesized</h1>
        <p className="text-white/80">Redirecting to registration...</p>
      </div>
    );
  }

  if (authState === 'pending') {
    return (
      <div className="fixed inset-0 bg-primary-900 z-[100] flex flex-col items-center justify-center text-white animate-in fade-in">
        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 animate-spin">
          <Loader2 size={64} className="text-accent-500" />
        </div>
        <h1 className="text-3xl font-black mb-2">Awaiting Applesization</h1>
        <p className="text-white/60 text-center px-10">Your account is being verified by our agents. Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col items-center px-6 pt-20">
      {/* Logo */}
      <div className="flex flex-col items-center mb-12">
        <div className="w-16 h-16 bg-primary-900 rounded-2xl flex items-center justify-center text-white shadow-2xl mb-4 rotate-3">
          <Zap size={32} fill="currentColor" />
        </div>
        <h1 className="text-3xl font-black text-primary-900 tracking-tighter">applesize</h1>
        <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">The Premium Apple Market</p>
      </div>

      {authState === 'login' || authState === 'loading' ? (
        <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl border border-blue-100 animate-in slide-in-from-bottom-10">
          <h2 className="text-xl font-bold text-primary-900 mb-6">Welcome Back</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Phone Number</label>
              <div className="flex bg-gray-50 rounded-xl border border-blue-100 px-4 items-center h-14 focus-within:border-primary-900 transition-colors">
                <span className="text-gray-400 font-bold mr-2">+234</span>
                <input 
                  type="tel" 
                  placeholder="800 000 0000" 
                  className="bg-transparent flex-1 text-primary-900 font-bold focus:outline-none"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  disabled={authState === 'loading'}
                />
              </div>
            </div>
            <button 
              onClick={handleAuth}
              disabled={!phone || authState === 'loading'}
              className="w-full h-14 bg-primary-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-900/20 active:scale-95 transition-transform disabled:opacity-50"
            >
              {authState === 'loading' ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight size={18} /></>}
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-8 uppercase tracking-widest">Only for verified agents & users</p>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-blue-100 animate-in slide-in-from-bottom-10 mb-20">
          <h2 className="text-2xl font-black text-primary-900 mb-2">Get Applesized</h2>
          <p className="text-sm text-gray-500 mb-8">Join the elite marketplace for premium iPhones.</p>
          
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Full Name</label>
              <div className="flex bg-gray-50 rounded-xl border border-blue-100 px-4 items-center h-12">
                <UserIcon size={16} className="text-gray-400 mr-3" />
                <input required className="bg-transparent flex-1 text-sm font-semibold focus:outline-none" placeholder="John Doe" value={signupForm.name} onChange={e => setSignupForm({...signupForm, name: e.target.value})} />
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Phone Number</label>
              <div className="flex bg-gray-50 rounded-xl border border-blue-100 px-4 items-center h-12">
                <Phone size={16} className="text-gray-400 mr-3" />
                <span className="text-gray-400 text-sm font-bold mr-1">+234</span>
                <input required type="tel" className="bg-transparent flex-1 text-sm font-semibold focus:outline-none" placeholder="800 000 0000" value={signupForm.phone} onChange={e => setSignupForm({...signupForm, phone: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Email Address</label>
              <div className="flex bg-gray-50 rounded-xl border border-blue-100 px-4 items-center h-12">
                <Mail size={16} className="text-gray-400 mr-3" />
                <input required type="email" className="bg-transparent flex-1 text-sm font-semibold focus:outline-none" placeholder="john@example.com" value={signupForm.email} onChange={e => setSignupForm({...signupForm, email: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Location</label>
                <div className="flex bg-gray-50 rounded-xl border border-blue-100 px-4 items-center h-12">
                  <MapPin size={16} className="text-gray-400 mr-2 shrink-0" />
                  <input required className="bg-transparent flex-1 text-sm font-semibold focus:outline-none" placeholder="Ikeja" value={signupForm.location} onChange={e => setSignupForm({...signupForm, location: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">State</label>
                <div className="flex bg-gray-50 rounded-xl border border-blue-100 px-4 items-center h-12">
                  <input required className="bg-transparent flex-1 text-sm font-semibold focus:outline-none" placeholder="Lagos" value={signupForm.state} onChange={e => setSignupForm({...signupForm, state: e.target.value})} />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full h-14 bg-primary-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-900/20 mt-6"
            >
              Submit Registration
            </button>
            <button 
              type="button"
              onClick={() => setAuthState('login')}
              className="w-full text-xs text-gray-400 font-bold uppercase tracking-widest mt-4"
            >
              Back to Login
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
