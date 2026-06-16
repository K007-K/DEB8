import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function FeaturesBento() {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        gsap.fromTo(card, 
          { y: 100, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "expo.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  const addToRefs = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  return (
    <section ref={containerRef} className="relative w-full py-32 bg-[#020202] overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 rounded-[100%] blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 uppercase">
            The Arsenal of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFCC00] to-primary">Debate</span>
          </h2>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto font-light tracking-wide">
            Everything you need to host, participate, and analyze high-stakes intellectual clashes in real-time.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-6 auto-rows-[250px]">
          
          {/* Feature 1: Structured Arenas (Large) */}
          <div ref={addToRefs} className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 flex flex-col justify-between group overflow-hidden relative shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:border-primary/30 transition-colors duration-500">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/0 via-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center mb-6 shadow-[inset_0_0_15px_rgba(251,121,11,0.2)] group-hover:shadow-[inset_0_0_20px_rgba(251,121,11,0.5)] transition-shadow duration-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FB790B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 14H3M21 10H3M10 3L7 21M17 3l-3 18"/></svg>
              </div>
              <h3 className="text-3xl font-bold text-white tracking-tight mb-3">2v2 & Free-For-All Arenas</h3>
              <p className="text-white/60 leading-relaxed text-lg font-light">
                Move beyond chaotic chat rooms. Host highly structured 2v2 team debates or open Free-for-All discussions. Enter arenas securely with password protection.
              </p>
            </div>
            
            {/* Decorative Visual */}
            <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-black/40 border border-white/5 rounded-full flex items-center justify-center group-hover:border-primary/20 transition-colors duration-500">
              <div className="w-56 h-56 rounded-full border border-primary/20 flex items-center justify-center animate-[spin_15s_linear_infinite]">
                 <div className="w-3 h-3 bg-primary rounded-full absolute top-0 shadow-[0_0_15px_rgba(251,121,11,1)]" />
                 <div className="w-40 h-40 rounded-full border border-white/5 flex items-center justify-center animate-[spin_10s_linear_infinite_reverse]">
                   <div className="w-2 h-2 bg-white/50 rounded-full absolute bottom-0 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                 </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Live Polling (Small) */}
          <div ref={addToRefs} className="md:col-span-1 md:row-span-1 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between group relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:border-white/20 transition-colors duration-500">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center shadow-inner group-hover:border-white/30 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FB790B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                </div>
                <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2 py-1 rounded-full uppercase font-bold tracking-widest">Instant</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight mb-2">Live Polling</h3>
              <p className="text-sm text-white/50 font-light leading-relaxed">Capture audience sentiment instantly. Create multi-option polls and watch votes update in real-time.</p>
            </div>
          </div>

          {/* Feature 3: Real-Time Engine (Tall) */}
          <div ref={addToRefs} className="md:col-span-1 md:row-span-2 bg-gradient-to-b from-primary/10 to-transparent backdrop-blur-xl border border-primary/30 rounded-3xl p-6 flex flex-col justify-between group relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(251,121,11,0.4),0_0_30px_rgba(251,121,11,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(251,121,11,0.6),0_0_50px_rgba(251,121,11,0.15)] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-primary/5 to-transparent opacity-50 translate-y-full group-hover:-translate-y-full transition-transform duration-1000" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-black border border-primary/40 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(251,121,11,0.3)] group-hover:shadow-[0_0_25px_rgba(251,121,11,0.6)] transition-shadow">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FB790B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight mb-3">Socket.io Engine</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6 font-light">
                Powered by a robust WebSocket engine. Every message, vote, and participant status is broadcasted globally with zero-latency.
              </p>
            </div>
            
            {/* Socket Visual element */}
            <div className="relative h-40 w-full border border-white/10 bg-black/50 rounded-xl overflow-hidden p-4 flex flex-col gap-3 group-hover:border-primary/30 transition-colors">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                 <span className="text-[10px] text-white/50">WSS:// Connected</span>
               </div>
               <div className="h-px w-full bg-white/10" />
               <div className="flex flex-col gap-2 opacity-50">
                 <div className="h-1.5 w-[70%] bg-primary/40 rounded-full" />
                 <div className="h-1.5 w-[40%] bg-primary/40 rounded-full" />
               </div>
               <div className="flex flex-col gap-2 mt-auto">
                 <div className="h-1.5 w-[80%] bg-white/40 rounded-full" />
                 <div className="h-1.5 w-[50%] bg-white/40 rounded-full" />
               </div>
            </div>
          </div>

          {/* Feature 4: Role-Based Entry (Small) */}
          <div ref={addToRefs} className="md:col-span-1 md:row-span-1 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between group relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:border-white/20 transition-colors duration-500">
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center mb-6 shadow-inner group-hover:border-white/30 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FB790B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight mb-2">Role-Based Entry</h3>
              <p className="text-sm text-white/50 font-light leading-relaxed">Enter rooms as an active debater or spectate and vote as an audience member.</p>
            </div>
          </div>

          {/* Feature 5: Dedicated Team Channels (Full Width) */}
          <div ref={addToRefs} className="md:col-span-4 md:row-span-1 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 md:px-16 flex items-center justify-between group relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:border-primary/30 transition-colors duration-500">
            <div className="relative z-10 max-w-2xl">
               <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-3">Dedicated Team Channels</h3>
               <p className="text-base text-white/60 font-light leading-relaxed">Strategy happens behind the scenes. Use private team chats to coordinate rebuttals and arguments with your partner during a live 2v2 debate.</p>
            </div>
            
            {/* Visual element */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border border-white/10 bg-black/50 flex items-center justify-center relative group-hover:border-primary/30 transition-colors duration-500 shadow-inner flex-shrink-0">
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FB790B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
               <div className="absolute top-6 right-6 md:top-8 md:right-8 w-4 h-4 bg-red-500 rounded-full border-[3px] border-black" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
