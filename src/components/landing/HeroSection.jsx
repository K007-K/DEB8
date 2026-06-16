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
          duration: 1,
          ease: "power2.out"
        });

        // Parallax Floating Cards
        gsap.to(card1Ref.current, { x: xPos * -30, y: yPos * -40, rotationY: xPos * 10, rotationX: yPos * -10, duration: 1.5, ease: "power2.out" });
        gsap.to(card2Ref.current, { x: xPos * 40, y: yPos * 20, rotationY: xPos * -10, rotationX: yPos * 10, duration: 1.5, ease: "power2.out" });
        gsap.to(card3Ref.current, { x: xPos * -20, y: yPos * 50, rotationY: xPos * 5, rotationX: yPos * -5, duration: 1.5, ease: "power2.out" });
      };

      window.addEventListener('mousemove', onMouseMove);

      // Entry Animations
      gsap.fromTo([title1Ref.current, title2Ref.current],
        { y: 100, opacity: 0, rotateX: -20 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1.5, stagger: 0.2, ease: "expo.out", delay: 0.2 }
      );

      gsap.fromTo([card1Ref.current, card2Ref.current, card3Ref.current],
        { scale: 0.8, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 1.5, stagger: 0.15, ease: "back.out(1.5)", delay: 0.8 }
      );

      return () => window.removeEventListener('mousemove', onMouseMove);
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505]" style={{ perspective: '1000px' }}>
      
      {/* Dynamic Animated Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.15]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-[grid_20s_linear_infinite]" style={{ transformOrigin: 'top center', transform: 'rotateX(60deg) scale(2.5)' }} />
      </div>

      {/* Mouse Spotlight */}
      <div ref={spotlightRef} className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      {/* Floating Cards (Parallax Elements) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Card 1: Live Poll */}
        <div ref={card1Ref} className="absolute top-[20%] left-[10%] md:left-[15%] w-48 h-56 bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_0_40px_rgba(251,121,11,0.15)] flex flex-col justify-between hidden md:flex">
          <div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center text-sm">📊</div>
          <div>
            <div className="h-2 w-full bg-white/10 rounded mb-2 overflow-hidden">
              <div className="h-full bg-primary rounded w-[70%]" />
            </div>
            <p className="text-xs text-text-secondary font-medium">Trending Poll</p>
            <p className="text-white text-sm font-bold">AI vs Human?</p>
          </div>
        </div>

        {/* Card 2: Debate Match */}
        <div ref={card2Ref} className="absolute top-[60%] right-[10%] md:right-[15%] w-56 h-32 bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_0_40px_rgba(0,102,255,0.15)] flex items-center gap-4 hidden md:flex">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 text-white font-bold text-xs">VS</div>
          <div>
            <p className="text-white text-sm font-bold">Live 2v2 Debate</p>
            <p className="text-xs text-text-secondary">4,230 watching</p>
          </div>
        </div>

        {/* Card 3: Speaker */}
        <div ref={card3Ref} className="absolute top-[15%] right-[25%] md:right-[20%] w-40 h-40 bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col items-center justify-center hidden lg:flex">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary mb-3 animate-pulse shadow-[0_0_20px_rgba(251,121,11,0.5)]" />
          <p className="text-white text-sm font-bold">Alex Chen</p>
          <p className="text-xs text-primary font-medium tracking-wide uppercase mt-1">Speaking</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 text-center pt-20">
        <h1 className="text-[12vw] md:text-[8rem] leading-[0.85] font-black tracking-tighter mb-8 uppercase flex flex-col items-center select-none">
          <span ref={title1Ref} className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] block" style={{ transformStyle: 'preserve-3d' }}>Master The</span>
          <span ref={title2Ref} className="block mt-2" style={{ transformStyle: 'preserve-3d' }}>
            <span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.8)' }}>Real-</span>
            <span className="bg-gradient-to-r from-primary via-[#FF3366] to-secondary bg-clip-text text-transparent animate-gradient">Time</span>
          </span>
        </h1>
        
        <p className="text-lg md:text-2xl text-text-secondary max-w-2xl mx-auto mb-12 font-light tracking-wide">
          Elevate your discourse. Join the top 1% of thinkers in highly structured, real-time debates and dynamic polling arenas.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* Conic Gradient Glowing Button */}
          <button 
            onClick={() => navigate('/auth?mode=register')}
            className="relative inline-flex h-16 w-full sm:w-64 overflow-hidden rounded-full p-[2px] focus:outline-none group transform hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(251,121,11,0.2)] hover:shadow-[0_0_60px_rgba(251,121,11,0.4)]"
            data-cursor="interactive"
          >
            <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#050505_0%,#FB790B_50%,#0066FF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-surface px-8 py-2 text-lg font-bold text-white backdrop-blur-3xl transition-colors group-hover:bg-surface/80">
              Enter The Arena
            </span>
          </button>
          
          <button 
            onClick={() => navigate('/debates')}
            className="group px-8 py-4 rounded-full bg-transparent border border-white/20 text-white font-semibold text-lg hover:border-white/60 transition-all duration-300 flex items-center justify-center gap-3 w-full sm:w-auto"
            data-cursor="interactive"
          >
            Watch Live
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes grid {
          0% { transform: rotateX(60deg) translateY(-50px) scale(2.5); }
          100% { transform: rotateX(60deg) translateY(0px) scale(2.5); }
        }
      `}} />
    </div>
  );
}
