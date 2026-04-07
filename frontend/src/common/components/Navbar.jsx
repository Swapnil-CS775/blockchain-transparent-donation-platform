import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useWalletAuth } from '../hooks/useWalletAuth.js';
import { Wallet, User, LogOut, FileEdit, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { walletAddress, logout } = useAuthStore();
  const { loginWithWallet } = useWalletAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth-storage');
    logout();
    setIsProfileOpen(false);
    // Inside your handleLogout
    toast.error('LOGGED OUT: SESSION DISCONNECTED');
    navigate('/');
  };

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/'); 
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  return (
    <>
      {/* FIXED OVERLAY: Lower z-index than the dropdown, but covers the screen */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 z-[50] bg-black/5" 
          onClick={() => setIsProfileOpen(false)}
        />
      )}

      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 z-[60]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2 cursor-pointer">
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-lg">NGO</span> 
              <span className="text-slate-800">Chain</span>
            </Link>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              {!walletAddress ? (
                <>
                  <button onClick={() => handleScroll('how-to-use')} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition cursor-pointer">How to Use</button>
                  <button onClick={() => handleScroll('how-it-works')} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition cursor-pointer">How it Works</button>
                  <button onClick={() => handleScroll('impact')} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition cursor-pointer">Our Impact</button>
                  <button onClick={() => handleScroll('about')} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition cursor-pointer">About</button>
                </>
              ) : (
                <Link to="/marketplace" className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg cursor-pointer">NGO Marketplace</Link>
              )}
            </div>

            <div className="flex items-center gap-4">
              {!walletAddress ? (
                <button 
                  onClick={loginWithWallet}
                  className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-95 cursor-pointer"
                >
                  <Wallet className="w-4 h-4" /> Connect Wallet
                </button>
              ) : (
                <div className="relative z-[70]">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center gap-2 p-2 rounded-full transition border cursor-pointer ${
                      isProfileOpen ? 'bg-blue-600 border-blue-600' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <User className={`w-5 h-5 ${isProfileOpen ? 'text-white' : 'text-blue-600'}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl py-3 animate-in slide-in-from-top-2 fade-in duration-200">
                      
                      <div className="px-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                        <button 
                          onClick={() => setIsProfileOpen(false)}
                          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account</span>
                        <div className="w-4 h-4" />
                      </div>

                      <div className="px-4 py-3 bg-slate-50/50 mx-2 mt-2 rounded-xl border border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Connected Wallet</p>
                        <p className="text-[11px] font-mono text-blue-600 truncate mt-1">{walletAddress}</p>
                      </div>

                      <div className="px-2 mt-2 space-y-1">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition font-bold cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 opacity-70" /> Disconnect
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;