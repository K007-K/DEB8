import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

export default function HeroSection() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const spotlightRef = useRef(null);
  const title1Ref = useRef(null);
  const title2Ref = useRef(null);
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const card3Ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Mouse move spotlight & parallax cards
      const onMouseMove = (e) => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 2;
        const yPos = (clientY / window.innerHeight - 0.5) * 2;

        gsap.to(spotlightRef.current, {
          x: clientX - window.innerWidth / 2,
          y: clientY - window.innerHeight / 2,
          duration: 1.2,
          ease: "power2.out"
        });

        // Enhanced Parallax Floating Cards with more dynamic rotation
        gsap.to(card1Ref.current, { x: xPos * -40, y: yPos * -50, rotationY: xPos * 15, rotationX: yPos * -15, duration: 1.5, ease: "power2.out" });
        gsap.to(card2Ref.current, { x: xPos * 50, y: yPos * 30, rotationY: xPos * -15, rotationX: yPos * 15, duration: 1.5, ease: "power2.out" });
        gsap.to(card3Ref.current, { x: xPos * -30, y: yPos * 60, rotationY: xPos * 10, rotationX: yPos * -10, duration: 1.5, ease: "power2.out" });
      };

      window.addEventListener('mousemove', onMouseMove);

      // Entry Animations
      gsap.fromTo([title1Ref.current, title2Ref.current],
        { y: 120, opacity: 0, rotateX: -30 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1.8, stagger: 0.2, ease: "expo.out", delay: 0.2 }
      );

      gsap.fromTo([card1Ref.current, card2Ref.current, card3Ref.current],
        { scale: 0.7, opacity: 0, y: 80, rotateZ: -10 },
        { scale: 1, opacity: 1, y: 0, rotateZ: 0, duration: 1.5, stagger: 0.15, ease: "back.out(1.5)", delay: 0.8 }
      );

      // Continuous subtle breathing animation for cards
      gsap.to([card1Ref.current, card2Ref.current, card3Ref.current], {
        y: "+=15",
        duration: 2.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: 0.2,
        delay: 2.5
      });

      return () => window.removeEventListener('mousemove', onMouseMove);
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505]" style={{ perspective: '1200px' }}>
      
      {/* Dynamic Animated Grid - Pure Black/Orange vibe */}
      <div className="absolute inset-0 z-0 opacity-[0.2]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(251,121,11,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(251,121,11,0.15)_1px,transparent_1px)] bg-[size:60px_60px] animate-[grid_15s_linear_infinite]" style={{ transformOrigin: 'top center', transform: 'rotateX(60deg) scale(3)' }} />
      </div>

      {/* Mouse Spotlight - Orange */}
      <div ref={spotlightRef} className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-primary/20 rounded-full blur-[160px] mix-blend-screen" />
      </div>

      {/* Floating Cards (Parallax Elements) - Enhanced styling */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Card 1: Live Poll */}
        <div ref={card1Ref} className="absolute top-[20%] left-[8%] md:left-[12%] w-52 h-60 bg-surface/30 backdrop-blur-2xl border border-primary/20 rounded-2xl p-5 shadow-[0_0_50px_rgba(251,121,11,0.15)] flex flex-col justify-between hidden md:flex">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-lg shadow-[0_0_15px_rgba(251,121,11,0.4)]">📊</div>
          <div>
            <div className="h-2 w-full bg-white/5 rounded-full mb-3 overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full w-[70%] shadow-[0_0_10px_rgba(251,121,11,0.8)]" />
            </div>
            <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Trending Poll</p>
            <p className="text-white text-base font-bold">AI vs Human?</p>
          </div>
        </div>

        {/* Card 2: Debate Match */}
        <div ref={card2Ref} className="absolute top-[60%] right-[8%] md:right-[12%] w-64 h-36 bg-surface/30 backdrop-blur-2xl border border-primary/20 rounded-2xl p-5 shadow-[0_0_50px_rgba(251,121,11,0.15)] flex items-center gap-5 hidden md:flex">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#050505] to-primary/40 flex items-center justify-center border border-primary/50 text-white font-black text-sm shadow-[0_0_20px_rgba(251,121,11,0.5)]">VS</div>
          <div>
            <p className="text-white text-base font-bold mb-1">Live 2v2 Debate</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_5px_rgba(251,121,11,1)]" />
              <p className="text-xs text-text-secondary">4,230 watching</p>
            </div>
          </div>
        </div>

        {/* Card 3: Speaker */}
        <div ref={card3Ref} className="absolute top-[15%] right-[22%] md:right-[18%] w-44 h-44 bg-surface/30 backdrop-blur-2xl border border-primary/20 rounded-2xl p-5 shadow-[0_0_40px_rgba(251,121,11,0.2)] flex flex-col items-center justify-center hidden lg:flex">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-secondary mb-3 animate-pulse shadow-[0_0_25px_rgba(251,121,11,0.6)] relative z-10" />
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-md animate-ping" />
          </div>
          <p className="text-white text-base font-bold">Alex Chen</p>
          <p className="text-xs text-primary font-bold tracking-widest uppercase mt-1">Speaking</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 text-center pt-20">
        <h1 className="text-[12vw] md:text-[8.5rem] leading-[0.85] font-black tracking-tighter mb-8 uppercase flex flex-col items-center select-none">
          <span ref={title1Ref} className="text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.1)] block" style={{ transformStyle: 'preserve-3d' }}>Master The</span>
          <span ref={title2Ref} className="block mt-2" style={{ transformStyle: 'preserve-3d' }}>
            <span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.9)' }}>Real-</span>
            <span className="bg-gradient-to-r from-primary via-[#FFCC00] to-primary bg-clip-text text-transparent animate-gradient drop-shadow-[0_0_30px_rgba(251,121,11,0.6)]">Time</span>
          </span>
        </h1>
        
        <p className="text-lg md:text-2xl text-text-secondary max-w-2xl mx-auto mb-14 font-light tracking-wide drop-shadow-md">
          Elevate your discourse. Join the top 1% of thinkers in highly structured, real-time debates and dynamic polling arenas.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          {/* Enhanced Conic Gradient Glowing Button - Strictly Orange/Black */}
          <button 
            onClick={() => navigate('/auth?mode=register')}
            className="relative inline-flex h-16 w-full sm:w-64 overflow-hidden rounded-full p-[2px] focus:outline-none group transform hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(251,121,11,0.3)] hover:shadow-[0_0_80px_rgba(251,121,11,0.6)]"
            data-cursor="interactive"
          >
            <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#050505_0%,#FB790B_50%,#050505_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-[#0a0a0a] px-8 py-2 text-lg font-bold text-white backdrop-blur-3xl transition-colors group-hover:bg-[#000000]">
              Enter The Arena
            </span>
          </button>
          
          <button 
            onClick={() => navigate('/debates')}
            className="group px-8 py-4 rounded-full bg-surface/30 border border-primary/30 text-white font-bold text-lg hover:border-primary hover:bg-primary/10 transition-all duration-300 flex items-center justify-center gap-3 w-full sm:w-auto shadow-[0_0_20px_rgba(251,121,11,0.1)]"
            data-cursor="interactive"
          >
            Watch Live
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(251,121,11,1)]" />
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes grid {
          0% { transform: rotateX(60deg) translateY(-60px) scale(3); }
          100% { transform: rotateX(60deg) translateY(0px) scale(3); }
        }
      `}} />
    </div>
  );
}
