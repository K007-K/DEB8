import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function FloatingNav() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setIsScrolled(latest > 50);
  });

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        isScrolled ? "py-4" : "py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className={cn(
          "flex items-center justify-between rounded-2xl px-6 py-4 transition-all duration-500",
          isScrolled 
            ? "bg-black/40 backdrop-blur-xl border border-white/[0.08] shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)]" 
            : "bg-transparent border-transparent"
        )}>
          {/* Logo */}
          <div className="flex items-center text-3xl font-black tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-white">DEB</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFCC00] to-primary">8</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <button onClick={() => navigate('/home')} className="text-white/60 hover:text-white transition-colors font-medium">Dashboard</button>
                <button onClick={() => logout()} className="text-white/60 hover:text-white transition-colors font-medium">Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/auth?mode=login')} className="text-white/60 hover:text-white transition-colors font-medium">Log In</button>
                <button 
                  onClick={() => navigate('/auth?mode=register')} 
                  className="px-6 py-2.5 rounded-full bg-white text-black font-bold hover:bg-primary hover:text-white transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(251,121,11,0.5)]"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
