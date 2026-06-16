import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function DebateShowcase() {
  const containerRef = useRef(null);
  const lineRef = useRef(null);
  const dotRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the central line growing down
      gsap.fromTo(lineRef.current,
        { scaleY: 0, transformOrigin: "top center" },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top center",
            end: "bottom 80%",
            scrub: 1
          }
        }
      );

      // Animate the glowing dot moving down the line
      gsap.fromTo(dotRef.current,
        { top: "0%" },
        {
          top: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top center",
            end: "bottom 80%",
            scrub: 1
          }
        }
      );

      // Animate cards snapping in
      cardsRef.current.forEach((card, i) => {
        const isLeft = i % 2 === 0;
        gsap.fromTo(card,
          { x: isLeft ? -50 : 50, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: card,
              start: "top 60%",
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

  const steps = [
    {
      title: "Opening Statements",
      side: "Affirmative Team",
      desc: "Lay out the core arguments. 3 minutes uninterrupted. State your main thesis.",
      icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    },
    {
      title: "Cross-Examination",
      side: "Negative Team",
      desc: "Direct questioning to poke holes in the opening logic and challenge the premise.",
      icon: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>
    },
    {
      title: "Rebuttals",
      side: "Affirmative Team",
      desc: "Counter-arguments and defense. Defend against the cross-examination.",
      icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    },
    {
      title: "Closing Arguments",
      side: "Negative Team",
      desc: "Final appeals to the audience before voting closes. Summarize the debate.",
      icon: <><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>
    }
  ];

  return (
    <section ref={containerRef} className="relative w-full py-40 bg-[#020202]">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-32">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 uppercase">
            The Flow of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFCC00] to-primary">Combat</span>
          </h2>
          <p className="text-xl text-white/50 font-light max-w-2xl mx-auto">
            Experience highly structured 2v2 debates with strict timers, ensuring intellectual rigor over shouting matches.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative w-full max-w-4xl mx-auto">
          {/* Central Line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-white/10 hidden md:block" />
          
          {/* Animated Highlight Line */}
          <div ref={lineRef} className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-transparent hidden md:block rounded-full shadow-[0_0_15px_rgba(251,121,11,0.5)]" />
          
          {/* Glowing Dot */}
          <div ref={dotRef} className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary shadow-[0_0_20px_rgba(251,121,11,1)] hidden md:block -mt-2 z-20 border-2 border-[#020202]" />

          {/* Timeline Steps */}
          <div className="space-y-24 md:space-y-32">
            {steps.map((step, idx) => {
              const isLeft = idx % 2 === 0;
              return (
                <div key={idx} className={`flex flex-col md:flex-row items-center justify-between w-full ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                  {/* Empty space for the other side */}
                  <div className="hidden md:block w-5/12" />
                  
                  {/* Content Card */}
                  <div ref={addToRefs} className="w-full md:w-5/12">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:border-white/20 transition-colors duration-500 group relative overflow-hidden">
                      {/* Subtle Background Glow on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary/0 via-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-inner ${isLeft ? 'bg-blue-500/10 border-blue-500/30 shadow-[inset_0_0_15px_rgba(59,130,246,0.2)]' : 'bg-red-500/10 border-red-500/30 shadow-[inset_0_0_15px_rgba(239,68,68,0.2)]'}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isLeft ? "#3B82F6" : "#EF4444"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              {step.icon}
                            </svg>
                          </div>
                          <div>
                            <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-full border ${isLeft ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                              {step.side}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{step.title}</h3>
                        <p className="text-white/50 leading-relaxed font-light">{step.desc}</p>
                      </div>
                      
                      {/* Timer Mockup */}
                      <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full animate-pulse ${isLeft ? 'bg-blue-500' : 'bg-red-500'}`} />
                           <span className="text-xs text-white/40 uppercase tracking-widest font-mono font-bold">Stage {idx + 1}</span>
                        </div>
                        <span className="text-xl font-mono text-white/70 font-bold group-hover:text-white transition-colors tracking-widest">03:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
