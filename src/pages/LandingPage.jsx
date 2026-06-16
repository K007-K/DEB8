import React from 'react';
import SmoothScroller from '../components/layout/SmoothScroller';
import FloatingNav from '../components/landing/FloatingNav';
import HeroSection from '../components/landing/HeroSection';
import CustomCursor from '../components/layout/CustomCursor';

function LandingPage() {
  return (
    <SmoothScroller>
      <div className="min-h-screen bg-background text-text-primary selection:bg-primary/30 selection:text-white">
        <CustomCursor />
        <FloatingNav />
        <main>
          <HeroSection />
          {/* We will add Features, Showcase, and Tech Marquee here later */}
        </main>
      </div>
    </SmoothScroller>
  );
}

export default LandingPage;