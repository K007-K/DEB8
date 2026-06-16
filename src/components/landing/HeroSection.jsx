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

        // Tighter, more realistic parallax for glass cards
        gsap.to(card1Ref.current, { x: xPos * -25, y: yPos * -35, rotationY: xPos * 12, rotationX: yPos * -12, duration: 1.5, ease: "power2.out" });
        gsap.to(card2Ref.current, { x: xPos * 30, y: yPos * 20, rotationY: xPos * -12, rotationX: yPos * 12, duration: 1.5, ease: "power2.out" });
        gsap.to(card3Ref.current, { x: xPos * -20, y: yPos * 40, rotationY: xPos * 8, rotationX: yPos * -8, duration: 1.5, ease: "power2.out" });
      };

      window.addEventListener('mousemove', onMouseMove);

      gsap.fromTo([title1Ref.current, title2Ref.current],
        { y: 100, opacity: 0, rotateX: -20 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1.8, stagger: 0.2, ease: "expo.out", delay: 0.2 }
      );

      gsap.fromTo([card1Ref.current, card2Ref.current, card3Ref.current],
        { scale: 0.8, opacity: 0, y: 60, rotateZ: -5 },
        { scale: 1, opacity: 1, y: 0, rotateZ: 0, duration: 1.5, stagger: 0.15, ease: "back.out(1.2)", delay: 0.8 }
      );

      // Slower, more elegant breathing animation
      gsap.to([card1Ref.current, card2Ref.current, card3Ref.current], {
        y: "+=12",
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: 0.4,
        delay: 2.5
      });

      return () => window.removeEventListener('mousemove', onMouseMove);
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020202]" style={{ perspective: '1200px' }}>
      
      {/* Refined Grid: Thinner lines, less muddy */}
      <div className="absolute inset-0 z-0 opacity-[0.15]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(251,121,11,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(251,121,11,0.2)_1px,transparent_1px)] bg-[size:80px_80px] animate-[grid_20s_linear_infinite]" style={{ transformOrigin: 'top center', transform: 'rotateX(60deg) scale(3)' }} />
      </div>

      {/* Mouse Spotlight: Tighter and more intense in the center */}
      <div ref={spotlightRef} className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-primary/15 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* Realistic Premium Glass Cards */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        
        {/* Card 1: Live Poll */}
        <div ref={card1Ref} className="absolute top-[20%] left-[8%] md:left-[12%] w-56 h-auto bg-gradient-to-br from-white/[0.08] to-transparent backdrop-blur-xl border border-white/[0.12] rounded-2xl p-5 shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2),0_0_40px_rgba(251,121,11,0.1)] flex flex-col gap-4 hidden md:flex overflow-hidden group">
          {/* Subtle Glare */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.08] to-transparent opacity-50 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center shadow-inner backdrop-blur-md">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#orange-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="orange-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF9900" />
                    <stop offset="100%" stopColor="#FB790B" />
                  </linearGradient>
                </defs>
                <path d="M18 20V10M12 20V4M6 20v-6"/>
              </svg>
            </div>
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-full border border-primary/20">Live</span>
          </div>

          <div className="relative z-10">
            <p className="text-white text-base font-bold tracking-tight mb-4">AI vs Human Creativity?</p>
            
            {/* Poll Results UI */}
            <div className="space-y-3">
              {/* Option 1 */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-white/70 font-medium">AI</span>
                  <span className="text-white font-bold">78%</span>
                </div>
                <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
                  <div className="h-full bg-gradient-to-r from-[#FFCC00] to-primary rounded-full w-[78%] shadow-[0_0_10px_rgba(251,121,11,0.8)]" />
                </div>
              </div>
              
              {/* Option 2 */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-white/70 font-medium">Human</span>
                  <span className="text-white/50 font-bold">22%</span>
                </div>
                <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
                  <div className="h-full bg-white/20 rounded-full w-[22%]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Debate Match */}
        <div ref={card2Ref} className="absolute top-[60%] right-[8%] md:right-[12%] w-64 h-32 bg-gradient-to-br from-white/[0.08] to-transparent backdrop-blur-md border border-white/[0.08] rounded-2xl p-5 shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15),0_0_40px_rgba(251,121,11,0.1)] flex items-center gap-5 hidden md:flex overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent opacity-50 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center border border-primary/30 text-primary font-black text-xs shadow-[inset_0_0_15px_rgba(251,121,11,0.2)]">VS</div>
          <div className="relative z-10">
            <p className="text-white text-base font-medium tracking-tight mb-1">Live 2v2 Debate</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(251,121,11,1)]" />
              <p className="text-xs text-white/50 font-medium">4,230 watching</p>
            </div>
          </div>
        </div>

        {/* Card 3: Speaker */}
        <div ref={card3Ref} className="absolute top-[15%] right-[22%] md:right-[18%] w-40 h-40 bg-gradient-to-br from-white/[0.08] to-transparent backdrop-blur-md border border-white/[0.08] rounded-2xl p-5 shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15),0_0_30px_rgba(251,121,11,0.05)] flex flex-col items-center justify-center hidden lg:flex overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent opacity-50 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative w-14 h-14 mb-3">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-[#FF9900] shadow-[0_0_20px_rgba(251,121,11,0.4)]" />
              <div className="absolute inset-0 rounded-full bg-primary/40 blur-md animate-ping" />
            </div>
            <p className="text-white text-sm font-medium tracking-tight">Alex Chen</p>
            <p className="text-[10px] text-primary font-bold tracking-widest uppercase mt-1">Speaking</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 text-center pt-20">
        <h1 className="text-[12vw] md:text-[9rem] leading-[0.8] font-black tracking-tighter mb-8 uppercase flex flex-col items-center select-none">
          <span ref={title1Ref} className="text-white block" style={{ transformStyle: 'preserve-3d' }}>Master The</span>
          <span ref={title2Ref} className="block mt-1" style={{ transformStyle: 'preserve-3d' }}>
            <span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.9)' }}>Real-</span>
            {/* Sharper gradient text without muddy drop shadow */}
            <span className="bg-gradient-to-r from-white via-primary to-[#FF9900] bg-clip-text text-transparent">Time</span>
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-14 font-normal tracking-wide">
          Elevate your discourse. Join the top 1% of thinkers in highly structured, real-time debates and dynamic polling arenas.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* Ultra-crisp Conic Button */}
          <button 
            onClick={() => navigate('/auth?mode=register')}
            className="relative inline-flex h-16 w-full sm:w-64 overflow-hidden rounded-full p-[1px] focus:outline-none group transform hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_rgba(251,121,11,0.2)] hover:shadow-[0_0_50px_rgba(251,121,11,0.4)]"
            data-cursor="interactive"
          >
            <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000_0%,#FB790B_50%,#000_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-black/90 backdrop-blur-xl px-8 py-2 text-lg font-semibold text-white transition-colors group-hover:bg-black/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              Enter The Arena
            </span>
          </button>
          
          <button 
            onClick={() => navigate('/debates')}
            className="group px-8 py-4 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/10 text-white font-medium text-lg hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-3 w-full sm:w-auto shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
            data-cursor="interactive"
          >
            Watch Live
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(251,121,11,0.8)]" />
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes grid {
          0% { transform: rotateX(60deg) translateY(-80px) scale(3); }
          100% { transform: rotateX(60deg) translateY(0px) scale(3); }
        }
      `}} />
    </div>
  );
}
