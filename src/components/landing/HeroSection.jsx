import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

export default function HeroSection() {
  const navigate = useNavigate();
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background subtle zoom
      gsap.fromTo(bgRef.current, 
        { scale: 1.1, opacity: 0 },
        { scale: 1, opacity: 1, duration: 2.5, ease: "power3.out" }
      );

      // Simple stagger reveal for texts
      if (titleRef.current && subtitleRef.current && ctaRef.current) {
        gsap.fromTo([titleRef.current.children, subtitleRef.current, ctaRef.current],
          { y: 50, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 1, 
            stagger: 0.15, 
            ease: "back.out(1.2)", 
            delay: 0.2 
          }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Abstract Background */}
      <div ref={bgRef} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center mt-20">
        <h1 ref={titleRef} className="text-6xl md:text-8xl font-bold tracking-tighter mb-6">
          <div className="overflow-hidden inline-block"><span className="block text-white">The Ultimate</span></div><br />
          <div className="overflow-hidden inline-block"><span className="block text-white">Real-Time</span></div>{' '}
          <div className="overflow-hidden inline-block"><span className="block font-serif italic text-primary">Debate</span></div>
        </h1>
        
        <p ref={subtitleRef} className="text-lg md:text-2xl text-text-secondary max-w-3xl mx-auto mb-10 leading-relaxed font-light">
          Transform discussions into structured debates with live participation, team collaboration, and instant polling.
        </p>
        
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate('/auth?mode=register')}
            className="px-8 py-4 rounded-full bg-primary text-white font-semibold text-lg hover:bg-white hover:text-background transition-all duration-300 transform hover:scale-105 shadow-[0_0_40px_rgba(251,121,11,0.4)]"
          >
            Start Debating Now
          </button>
          <button 
            onClick={() => navigate('/debates')}
            className="px-8 py-4 rounded-full bg-surface-light border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300"
          >
            Explore Public Rooms
          </button>
        </div>
      </div>
    </div>
  );
}
