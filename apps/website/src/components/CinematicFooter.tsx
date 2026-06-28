"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Dumbbell } from "lucide-react";

// Register ScrollTrigger safely for React
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

// -------------------------------------------------------------------------
// 1. THEME-ADAPTIVE INLINE STYLES FOR YELLOW & BLACK ATHLETIC LOOK
// -------------------------------------------------------------------------
const STYLES = `
.cinematic-footer-wrapper {
  -webkit-font-smoothing: antialiased;
  
  --pill-bg-1: rgba(255, 255, 255, 0.02);
  --pill-bg-2: rgba(255, 255, 255, 0.01);
  --pill-shadow: rgba(0, 0, 0, 0.7);
  --pill-highlight: rgba(255, 255, 255, 0.05);
  --pill-inset-shadow: rgba(0, 0, 0, 0.8);
  --pill-border: rgba(255, 255, 255, 0.06);
  
  --pill-bg-1-hover: rgba(250, 204, 21, 0.05);
  --pill-bg-2-hover: rgba(250, 204, 21, 0.02);
  --pill-border-hover: rgba(250, 204, 21, 0.3);
  --pill-shadow-hover: rgba(250, 204, 21, 0.05);
  --pill-highlight-hover: rgba(250, 204, 21, 0.1);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.85; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(250, 204, 21, 0.3)); }
  15%, 45% { transform: scale(1.15); filter: drop-shadow(0 0 10px rgba(250, 204, 21, 0.6)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 30s linear infinite;
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

/* Grid Background */
.footer-bg-grid {
  background-size: 60px 60px;
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 25%, black 75%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 25%, black 75%, transparent);
}

/* Aurora Glow */
.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%, 
    rgba(250, 204, 21, 0.08) 0%, 
    rgba(24, 24, 27, 0.05) 45%, 
    transparent 70%
  );
}

/* Glass Pill Theming */
.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow: 
      0 10px 30px -10px var(--pill-shadow), 
      inset 0 1px 1px var(--pill-highlight), 
      inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow: 
      0 20px 40px -10px var(--pill-shadow-hover), 
      inset 0 1px 1px var(--pill-highlight-hover);
  color: #ffffff;
}

/* Giant Background Text Masking */
.footer-giant-bg-text {
  font-size: 26vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 2px rgba(250, 204, 21, 0.12);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
  -webkit-background-clip: text;
  background-clip: text;
}

/* Metallic Text Glow */
.footer-text-glow {
  background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.3) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 20px rgba(255, 255, 255, 0.05));
}
`;

// -------------------------------------------------------------------------
// 2. MAGNETIC BUTTON PRIMITIVE
// -------------------------------------------------------------------------
export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & 
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const element = localRef.current;
      if (!element) return;

      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const h = rect.width / 2;
          const w = rect.height / 2;
          const x = e.clientX - rect.left - h;
          const y = e.clientY - rect.top - w;

          gsap.to(element, {
            x: x * 0.35,
            y: y * 0.35,
            rotationX: -y * 0.1,
            rotationY: x * 0.1,
            scale: 1.04,
            ease: "power2.out",
            duration: 0.4,
          });
        };

        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: "elastic.out(1, 0.3)",
            duration: 1.2,
          });
        };

        element.addEventListener("mousemove", handleMouseMove as any);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          element.removeEventListener("mousemove", handleMouseMove as any);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }, element);

      return () => ctx.revert();
    }, []);

    return (
      <Component
        ref={(node: HTMLElement) => {
          (localRef as any).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) (forwardedRef as any).current = node;
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

// -------------------------------------------------------------------------
// 3. MARQUEE ELEMENT
// -------------------------------------------------------------------------
const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6">
    <span>ADRENALINE POWER</span> <span className="text-yellow-400">✦</span>
    <span>DISCIPLINE WINS</span> <span className="text-zinc-600">✦</span>
    <span>NO EXUSES LIMITS</span> <span className="text-yellow-400">✦</span>
    <span>SMART LOGGING</span> <span className="text-zinc-600">✦</span>
    <span>ELITE STANDARDS</span> <span className="text-yellow-400">✦</span>
  </div>
);

// -------------------------------------------------------------------------
// 4. EXPORTED COMPONENT
// -------------------------------------------------------------------------
export function CinematicFooter() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!wrapperRef.current) return;

    const ctx = gsap.context(() => {
      // Background Parallax
      gsap.fromTo(
        giantTextRef.current,
        { y: "8vh", scale: 0.9, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 85%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      // Staggered Content Reveal
      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          duration: 0.8,
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      
      {/* 
        The "Curtain Reveal" Wrapper:
        It sits in standard flow. Because it has clip-path, its contents
        are ONLY visible within its bounding box. 
      */}
      <div
        ref={wrapperRef}
        className="relative h-screen w-full mt-24"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        {/* The actual footer stays fixed to the viewport underneath everything */}
        <footer className="fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden bg-black text-zinc-100 cinematic-footer-wrapper border-t border-zinc-900">
          
          {/* Ambient Light & Grid Background */}
          <div className="footer-aurora absolute left-1/2 top-1/2 h-[60vh] w-[85vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px] pointer-events-none z-0" />
          <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none" />

          {/* Giant background text */}
          <div
            ref={giantTextRef}
            className="footer-giant-bg-text absolute -bottom-[3vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none"
          >
            MAXIMUS
          </div>

          {/* 1. Diagonal Sleek Marquee (Top of footer) */}
          <div className="absolute top-16 md:top-24 left-0 w-full overflow-hidden border-y border-zinc-900 bg-black/60 backdrop-blur-md py-3.5 md:py-4 z-10 -rotate-1 scale-105 shadow-2xl">
            <div className="flex w-max animate-footer-scroll-marquee text-xs md:text-sm font-black tracking-[0.3em] text-zinc-500 uppercase">
              <MarqueeItem />
              <MarqueeItem />
            </div>
          </div>

          {/* 2. Main Center Content */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-16 md:mt-20 w-full max-w-5xl mx-auto">
            <h2
              ref={headingRef}
              className="text-4xl sm:text-6xl md:text-8xl font-black footer-text-glow tracking-tighter mb-6 md:mb-12 text-center uppercase"
            >
              Ready to evolve?
            </h2>

            {/* Interactive Magnetic Pills Layout */}
            <div ref={linksRef} className="flex flex-col items-center gap-4 md:gap-6 w-full">
              {/* App Store / Portal Links */}
              <div className="flex flex-wrap justify-center gap-3 md:gap-4 w-full">
                <MagneticButton as="a" href="http://localhost:3002" target="_blank" className="footer-glass-pill px-5 py-3.5 md:px-8 md:py-4.5 rounded-full text-zinc-100 font-black text-[10px] md:text-xs md:text-sm uppercase tracking-widest flex items-center gap-3 group">
                  <Dumbbell className="w-4 h-4 text-yellow-400 group-hover:rotate-45 transition-transform" />
                  Member Portal
                </MagneticButton>
                
                <MagneticButton as="a" href="http://localhost:3001" target="_blank" className="footer-glass-pill px-5 py-3.5 md:px-8 md:py-4.5 rounded-full text-zinc-100 font-black text-[10px] md:text-xs md:text-sm uppercase tracking-widest flex items-center gap-3 group">
                  <svg className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 17V9l7 4-7 4z" />
                  </svg>
                  Staff Portal
                </MagneticButton>

                <MagneticButton as="a" href="#contact" className="footer-glass-pill px-5 py-3.5 md:px-8 md:py-4.5 rounded-full text-white bg-yellow-400 font-black text-[10px] md:text-xs md:text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-yellow-300">
                  Claim Free Pass
                </MagneticButton>
              </div>

              {/* Secondary Links */}
              <div className="flex flex-wrap justify-center gap-3 md:gap-6 w-full mt-2">
                <a href="#about" className="text-zinc-500 hover:text-white transition text-xs font-bold uppercase tracking-wider">About</a>
                <a href="#programs" className="text-zinc-500 hover:text-white transition text-xs font-bold uppercase tracking-wider">Programs</a>
                <a href="#plans" className="text-zinc-500 hover:text-white transition text-xs font-bold uppercase tracking-wider">Plans</a>
                <a href="#bmi" className="text-zinc-500 hover:text-white transition text-xs font-bold uppercase tracking-wider">BMI Calculator</a>
              </div>
            </div>
          </div>

          {/* 3. Bottom Bar / Credits */}
          <div className="relative z-20 w-full pb-8 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Copyright */}
            <div className="text-zinc-500 text-[10px] md:text-xs font-bold tracking-widest uppercase order-2 md:order-1">
              © 2026 MAXIMUS FITNESS. ALL RIGHTS RESERVED.
            </div>

            {/* "Made with Love" Badge */}
            <div className="footer-glass-pill px-6 py-3 rounded-full flex items-center gap-2 order-1 md:order-2 cursor-default border-zinc-900">
              <span className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">Crafted with</span>
              <span className="animate-footer-heartbeat text-sm md:text-base text-yellow-400">❤</span>
              <span className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">for</span>
              <span className="text-white font-black text-xs md:text-sm tracking-normal ml-1">MAXIMUS</span>
            </div>

            {/* Back to top */}
            <MagneticButton
              as="button"
              onClick={scrollToTop}
              className="w-12 h-12 rounded-full footer-glass-pill flex items-center justify-center text-zinc-400 hover:text-white group order-3"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-y-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
              </svg>
            </MagneticButton>

          </div>
        </footer>
      </div>
    </>
  );
}
