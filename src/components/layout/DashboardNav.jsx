import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LogOut, User, MessageSquare, BarChart2, Plus, Users, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function DashboardNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 dark:bg-black/40 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Main Links */}
          <div className="flex items-center gap-8">
            <div 
              className="flex items-center text-3xl font-black tracking-tighter cursor-pointer flex-shrink-0 hover:scale-105 transition-transform duration-300" 
              onClick={() => navigate('/home')}
            >
              <span className="text-slate-900 dark:text-white transition-colors duration-500">DEB</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#FF9900] dark:from-[#FFCC00] dark:to-primary">8</span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              <button 
                onClick={() => navigate('/home')}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                  isActive('/home') 
                    ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white" 
                    : "text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
                Dashboard
              </button>
              <button 
                onClick={() => navigate('/debates')}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                  isActive('/debates') 
                    ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white" 
                    : "text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                )}
              >
                <MessageSquare className="w-4 h-4" />
                Debates
              </button>
              <button 
                onClick={() => navigate('/polls')}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                  isActive('/polls') 
                    ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white" 
                    : "text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                )}
              >
                <BarChart2 className="w-4 h-4" />
                Polls
              </button>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/create?type=debate')}
              className="hidden sm:flex px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black text-sm font-bold hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white transition-all duration-300 items-center gap-2 shadow-[0_4px_14px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_4px_20px_rgba(251,121,11,0.4)] dark:hover:shadow-[0_0_20px_rgba(251,121,11,0.5)] transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>

            <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block"></div>

            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white focus:outline-none"
            >
              {theme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              )}
            </button>

            {user && (
              <div className="relative ml-2">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[#FF9900] flex items-center justify-center text-white font-black shadow-md border-2 border-white dark:border-[#020202] hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-[#020202]"
                >
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsProfileOpen(false)}
                      ></div>
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.username}</p>
                          <p className="text-xs text-slate-500 dark:text-white/50 truncate">{user.email}</p>
                        </div>
                        <div className="p-2 flex flex-col gap-1">
                          <button 
                            onClick={() => { navigate('/profile'); setIsProfileOpen(false); }}
                            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors flex items-center gap-2"
                          >
                            <User className="w-4 h-4" /> Profile
                          </button>
                          <button 
                            onClick={() => { navigate('/my-rooms'); setIsProfileOpen(false); }}
                            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors flex items-center gap-2"
                          >
                            <Users className="w-4 h-4" /> My Rooms
                          </button>
                          <button 
                            onClick={() => { logout(); setIsProfileOpen(false); }}
                            className="w-full text-left px-3 py-2 text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2 mt-1"
                          >
                            <LogOut className="w-4 h-4" /> Log out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
