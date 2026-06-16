import React from 'react';
import SmoothScroller from '../components/layout/SmoothScroller';
import FloatingNav from '../components/landing/FloatingNav';
import HeroSection from '../components/landing/HeroSection';
import FeaturesBento from '../components/landing/FeaturesBento';
import CustomCursor from '../components/layout/CustomCursor';

function LandingPage() {
  return (
    <SmoothScroller>
      <div className="min-h-screen bg-[#020202] text-white selection:bg-primary/30 selection:text-white">
        <CustomCursor />
        <FloatingNav />
        <main>
          <HeroSection />
          <FeaturesBento />
          {/* We will add Showcase, and Tech Marquee here later */}
        </main>
      </div>
    </SmoothScroller>
  );
}

export default LandingPage;