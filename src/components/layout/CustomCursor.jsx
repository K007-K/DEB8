import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    // Hide default cursor on body
    document.body.style.cursor = 'none';
    const cursor = cursorRef.current;
    
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });

    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.to(cursor, {
        x: mouseX,
        y: mouseY,
        duration: 0.15,
        ease: "power2.out"
      });
    };

    const attachHoverEffects = () => {
      const interactives = document.querySelectorAll('button, a, input, [data-cursor="interactive"]');
      interactives.forEach(el => {
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
        el.style.cursor = 'none';
      });
    };

    const handleMouseEnter = () => {
      gsap.to(cursor, { 
        scale: 3, 
        backgroundColor: "transparent", 
        border: "1px solid rgba(251, 121, 11, 0.8)", 
        duration: 0.3 
      });
    };

    const handleMouseLeave = () => {
      gsap.to(cursor, { 
        scale: 1, 
        backgroundColor: "rgba(251, 121, 11, 1)", 
        border: "none", 
        duration: 0.3 
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    
    // Small delay to allow react elements to render before attaching listeners
    const timeout = setTimeout(attachHoverEffects, 500);

    return () => {
      document.body.style.cursor = 'auto';
      window.removeEventListener('mousemove', onMouseMove);
      clearTimeout(timeout);
      const interactives = document.querySelectorAll('button, a, input, [data-cursor="interactive"]');
      interactives.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
        el.style.cursor = 'auto';
      });
    };
  }, []);

  return (
    <div 
      ref={cursorRef} 
      className="fixed top-0 left-0 w-4 h-4 bg-primary rounded-full pointer-events-none z-[9999] hidden md:block mix-blend-screen"
      style={{ willChange: 'transform' }}
    />
  );
}
