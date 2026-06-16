import React from 'react';

const TECH_STACK_1 = [
  "React 18", "Node.js", "Express", "MongoDB", "Socket.io", 
  "Tailwind CSS", "Framer Motion", "JWT Auth", "Vite", "GSAP"
];

const TECH_STACK_2 = [
  "Zero-Latency", "Real-Time Polling", "WebSockets", "2v2 Debates",
  "Role-Based Access", "Secure Arenas", "Live Sentiment", "Global Scale"
];

const MarqueeRow = ({ items, reverse }) => {
  // Duplicate items to ensure smooth infinite loop
  const duplicatedItems = [...items, ...items, ...items];
  
  return (
    <div className="flex overflow-hidden relative w-full mb-8 select-none">
      <div 
        className={`flex whitespace-nowrap gap-8 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}
      >
        {duplicatedItems.map((item, idx) => (
          <div 
            key={idx} 
            className="flex items-center justify-center px-8 py-4 bg-white/[0.02] border border-white/5 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-colors duration-300 group cursor-default"
          >
            <span className="text-white/40 font-mono text-sm tracking-widest uppercase group-hover:text-white transition-colors duration-300">
              {item}
            </span>
          </div>
        ))}
      </div>
      
      {/* Gradient Fades for Smooth Entry/Exit */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#020202] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#020202] to-transparent z-10 pointer-events-none" />
    </div>
  );
};

export default function TechMarquee() {
  return (
    <section className="relative w-full py-32 bg-[#020202] overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4 uppercase">
          Powered By <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#FFCC00]">Modern Tech</span>
        </h2>
        <p className="text-white/50 max-w-xl mx-auto font-light">
          Built on a highly optimized MERN stack and powered by a robust WebSockets engine for zero-latency interactions.
        </p>
      </div>

      <div className="relative w-full flex flex-col items-center rotate-[-1deg] scale-105">
        <MarqueeRow items={TECH_STACK_1} reverse={false} />
        <MarqueeRow items={TECH_STACK_2} reverse={true} />
      </div>
      
      {/* Final CTA Footer */}
      <div className="mt-40 mb-20 max-w-4xl mx-auto text-center px-6 relative z-10">
        <div className="absolute inset-0 bg-primary/10 rounded-[100%] blur-[100px] -z-10 pointer-events-none" />
        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 uppercase leading-tight">
          Ready to enter the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFCC00] to-primary">Arena?</span>
        </h2>
        <button className="px-10 py-5 rounded-full bg-white text-black font-bold text-xl hover:bg-primary hover:text-white transition-all duration-300 transform hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(251,121,11,0.6)]">
          Create Your First Debate
        </button>
      </div>
    </section>
  );
}
