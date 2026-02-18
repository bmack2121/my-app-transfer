import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// ✅ Safe haptics wrapper
import { hapticLight } from "../utils/haptics";

const Header = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  // ⌨️ Keyboard Shortcut for Power Users
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('token');
    setAuth({ user: null, token: null, isAuthenticated: false });
    navigate('/login', { replace: true });
  };

  if (!auth?.user) return null;

  return (
    <>
      <header className="bg-app-surface/90 backdrop-blur-md text-white px-6 py-4 flex items-center justify-between border-b border-app-border sticky top-0 z-[60] shadow-pro">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="w-10 h-10 bg-pro-metal rounded-xl flex items-center justify-center font-black shadow-glow active:scale-90 transition-transform italic"
          >
            V
          </Link>

          <div className="hidden sm:flex flex-col">
            <span className="text-[9px] font-black text-app-accent uppercase tracking-[0.2em]">
              {auth.user?.role}
            </span>
            <span className="font-heading font-black text-slate-100 leading-tight tracking-tight uppercase">
              {auth.user?.name}
            </span>
          </div>
        </div>

        {/* 🔍 Search Trigger */}
        <button
          onClick={async () => {
            await hapticLight();
            setIsSearchOpen(true);
          }}
          className="flex-1 max-w-md mx-6 bg-app-bg border border-app-border rounded-xl px-4 py-2 flex items-center justify-between text-slate-500 hover:border-app-accent transition-all group"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg group-hover:text-app-accent transition-colors">🔎</span>
            <span className="text-xs font-bold uppercase tracking-widest">
              Find Stock # or Lead...
            </span>
          </div>
          <kbd className="hidden lg:block text-[8px] font-black bg-app-surface px-1.5 py-0.5 rounded border border-app-border">
            ⌘K
          </kbd>
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="text-[10px] font-black uppercase text-slate-500 hover:text-rose-500 tracking-[0.15em]"
          >
            End Session
          </button>
        </div>
      </header>

      {/* 🚀 Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <SearchOverlay onClose={() => setIsSearchOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;