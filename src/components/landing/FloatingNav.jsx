import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function FloatingNav() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <nav
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        isScrolled ? "py-4" : "py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className={cn(
          "flex items-center justify-between rounded-2xl px-6 py-4 transition-all duration-500",
          isScrolled 
            ? "bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)]" 
            : "bg-transparent border-transparent"
        )}>
          {/* Logo */}
          <div className="flex items-center text-3xl font-black tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-slate-900 dark:text-white transition-colors duration-300">DEB</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFCC00] to-primary">8</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
            >
              {theme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              )}
            </button>
            {user ? (
              <>
                <button onClick={() => navigate('/home')} className="text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors font-medium">Dashboard</button>
                <button onClick={() => logout()} className="text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors font-medium">Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/auth?mode=login')} className="text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors font-medium">Log In</button>
                <button 
                  onClick={() => navigate('/auth?mode=register')} 
                  className="px-6 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-bold hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(251,121,11,0.5)] dark:hover:shadow-[0_0_20px_rgba(251,121,11,0.5)]"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
