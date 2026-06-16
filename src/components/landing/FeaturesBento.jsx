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
        
        // Add subtle continuous floating to cards
        gsap.to(card, {
          y: "+=8",
          duration: 3 + Math.random(),
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: Math.random() * 2
        });
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
              <h3 className="text-3xl font-bold text-white tracking-tight mb-3">Structured Arenas</h3>
              <p className="text-white/60 leading-relaxed text-lg font-light">
                Move beyond chaotic chat rooms. Host organized 1v1, 2v2, or panel debates with enforced speaking times, turn-based rebuttals, and crystal-clear audio routing.
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
              <p className="text-sm text-white/50 font-light leading-relaxed">Capture audience sentiment in real-time before, during, and after arguments.</p>
            </div>
          </div>

          {/* Feature 3: AI Fact-Checking (Tall) */}
          <div ref={addToRefs} className="md:col-span-1 md:row-span-2 bg-gradient-to-b from-primary/10 to-transparent backdrop-blur-xl border border-primary/30 rounded-3xl p-6 flex flex-col justify-between group relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(251,121,11,0.4),0_0_30px_rgba(251,121,11,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(251,121,11,0.6),0_0_50px_rgba(251,121,11,0.15)] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-primary/5 to-transparent opacity-50 translate-y-full group-hover:-translate-y-full transition-transform duration-1000" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-black border border-primary/40 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(251,121,11,0.3)] group-hover:shadow-[0_0_25px_rgba(251,121,11,0.6)] transition-shadow">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FB790B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2"/></svg>
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight mb-3">AI Fact-Check</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6 font-light">
                Our integrated AI actively monitors transcripts and highlights potential fallacies or unverified claims for the audience seamlessly.
              </p>
            </div>
            
            {/* AI Visual element */}
            <div className="relative h-40 w-full border border-white/10 bg-black/50 rounded-xl overflow-hidden p-4 flex flex-col gap-3 group-hover:border-primary/30 transition-colors">
               <div className="h-2 w-[70%] bg-white/10 rounded-full" />
               <div className="h-2 w-[90%] bg-white/10 rounded-full" />
               <div className="flex items-center gap-2 mt-1">
                 <div className="h-2 w-[40%] bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(251,121,11,0.8)]" />
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FB790B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/></svg>
               </div>
               <div className="mt-auto flex justify-end">
                 <span className="text-[9px] text-primary font-bold uppercase tracking-widest border border-primary/30 bg-primary/10 px-2 py-1 rounded">Flagged Claim</span>
               </div>
            </div>
          </div>

          {/* Feature 4: Audience Reactions (Small) */}
          <div ref={addToRefs} className="md:col-span-1 md:row-span-1 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between group relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:border-white/20 transition-colors duration-500">
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center mb-6 shadow-inner group-hover:border-white/30 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FB790B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight mb-2">Audience Reactions</h3>
              <p className="text-sm text-white/50 font-light leading-relaxed">Cheer, boo, or throw tomatoes (virtually) without interrupting the audio.</p>
            </div>
          </div>

          {/* Feature 5: Global Rooms (Wide) */}
          <div ref={addToRefs} className="md:col-span-2 md:row-span-1 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 flex items-center justify-between group relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:border-primary/30 transition-colors duration-500">
            <div className="relative z-10 max-w-[60%]">
               <h3 className="text-2xl font-bold text-white tracking-tight mb-3">Global Arenas</h3>
               <p className="text-sm text-white/60 font-light leading-relaxed">Join open arenas sorted by topic, language, and skill level. Debate the entire world from your browser.</p>
            </div>
            
            {/* Visual element */}
            <div className="w-32 h-32 rounded-full border border-white/10 border-dashed animate-[spin_20s_linear_infinite] flex items-center justify-center relative group-hover:border-primary/30 transition-colors duration-500">
               <div className="w-20 h-20 rounded-full bg-black border border-white/10 absolute flex items-center justify-center z-10 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FB790B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
               </div>
               {/* Orbiting dot */}
               <div className="w-4 h-4 bg-primary rounded-full absolute -top-2 shadow-[0_0_15px_rgba(251,121,11,1)] border border-[#020202]" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
