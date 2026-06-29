'use client';

import * as React from 'react';
import { Card, Button, Input } from '@maximus/ui';
import { calculateBMI, getBMICategory, formatCurrency } from '@maximus/utils';
import {
  Dumbbell, Shield, Trophy, Users, CheckCircle2, ChevronDown,
  Mail, Phone, ArrowUpRight, Zap, Target, Flame
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { CinematicFooter } from '../components/CinematicFooter';
import { HeroSection } from '../components/HeroSection';
import { PricingShader } from '../components/PricingShader';
import { LocationMap } from '../components/LocationMap';
import { CircularPrograms } from '../components/CircularPrograms';
import { BmiCalculatorComponent } from '../components/BmiCalculatorComponent';

interface PricingCardProps {
  titleBadge: string;
  priceLabel: number;
  priceSuffix: string;
  features: string[];
  cta: string;
  className?: string;
  popular?: boolean;
}

const PricingCard = ({ titleBadge, priceLabel, priceSuffix, features, cta, className, popular }: PricingCardProps) => {
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(priceLabel);

  return (
    <div className={`bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 backdrop-blur-[14px] backdrop-brightness-[0.91] relative overflow-hidden rounded-2xl flex flex-col p-6 h-full transition-all duration-500 hover:border-yellow-400/20 ${popular ? 'ring-2 ring-yellow-400/20 border-yellow-400/30' : ''} ${className}`}>
      {popular && (
        <div className="absolute -top-3.5 right-4 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-yellow-400 text-black">
          Most Popular
        </div>
      )}
      <div className="flex items-center justify-between gap-3 mb-5">
        <span className="inline-block px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-wider text-zinc-300">
          {titleBadge}
        </span>
        <button 
          onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: 'smooth' })}
          className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider transition ${
            popular 
              ? "bg-yellow-400 hover:bg-yellow-300 text-black shadow-[0_0_15px_rgba(250,204,21,0.2)]" 
              : "border border-white/10 hover:bg-white/5 text-white"
          }`}
        >
          {cta}
        </button>
      </div>
      <div className="flex items-baseline gap-1.5 mb-6">
        <span className="font-mono text-4xl font-extralight tracking-tight text-white">{formattedPrice}</span>
        <span className="text-zinc-500 text-xs font-bold uppercase">/{priceSuffix}</span>
      </div>
      <ul className="grid gap-3 text-[13px] text-zinc-300 mt-auto">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3">
            <div className="bg-yellow-400 text-black rounded-full p-0.5 flex-shrink-0">
              <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <span className="leading-relaxed text-left">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const testimonials = [
  {
    text: "The split routines and strength progression programs here completely redefined my approach. The atmosphere is pure intensity.",
    name: "Vikram Malhotra",
    rating: 5
  },
  {
    text: "Maximus is the only gym in the region with premium platforms and professional grade hardware. The baseline evaluation was spot on.",
    name: "Arjun Mehta",
    rating: 5
  },
  {
    text: "Best training facility. The staff portal updates workouts instantly, and the trainer consultation reshaped my entire macro split.",
    name: "Pooja Sharma",
    rating: 5
  },
  {
    text: "The zumba and CrossFit signature sessions are unmatched. High energy, highly professional, and an elite community base.",
    name: "Karan Johar",
    rating: 4
  },
  {
    text: "Been training here for 6 months. Lost 12kg and gained substantial muscle mass. The baseline audits keep you highly accountable.",
    name: "Rohan Verma",
    rating: 5
  },
  {
    text: "Top-tier cleanliness, great layout flow, and excellent crowd quality. Highly recommend the Annual Elite membership package.",
    name: "Sneha Reddy",
    rating: 5
  },
  {
    text: "The yoga classes combined with HIIT splits helped me restore flexibility while maintaining aerobic capacity. Brilliant coaches.",
    name: "Amit Singhal",
    rating: 5
  },
  {
    text: "Outstanding trainers who actually understand physical adaptations. The equipment ranges are state of the art.",
    name: "Neha Gupta",
    rating: 5
  },
  {
    text: "Excellent hygiene, helpful coaches, and elite platforms. Claiming the free walkthrough pass was the best decision.",
    name: "Rahul Bajaj",
    rating: 5
  }
];

const TestimonialColumn = ({ testimonials, duration, className }: { testimonials: { text: string; name: string; rating: number }[], duration: number, className?: string }) => {
  return (
    <div className={className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration: duration || 15,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop"
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...Array(2)].map((_, uidx) => (
          <React.Fragment key={uidx}>
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 backdrop-blur-[14px] p-6 rounded-2xl max-w-xs w-full space-y-4">
                <div className="flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, sidx) => (
                    <svg
                      key={sidx}
                      className={`w-3.5 h-3.5 ${sidx < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-600'}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                <p className="text-zinc-300 text-[13px] leading-relaxed text-left font-sans">
                  "{t.text}"
                </p>
                
                <div className="pt-2 border-t border-white/5 font-sans">
                  <div className="font-bold text-white text-[12px] uppercase tracking-wider text-left">{t.name}</div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-left mt-0.5">Verified Member</div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};

export default function MarketingPage() {
  // Vault Loader States
  const [loadingProgress, setLoadingProgress] = React.useState(0);
  const [loaderWord, setLoaderWord] = React.useState('POWER');
  const [loaderFinished, setLoaderFinished] = React.useState(false);

  const tiles = Array.from({ length: 48 }, (_, i) => ({ r: Math.floor(i / 8), c: i % 8 }));

  const fadeInUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  };



  // Lead Form State
  const [leadName, setLeadName] = React.useState('');
  const [leadEmail, setLeadEmail] = React.useState('');
  const [leadPhone, setLeadPhone] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  // FAQ State
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);



  // Vault Loader Simulation
  React.useEffect(() => {
    const words = ["POWER", "DISCIPLINE", "GRIT", "ADRENALINE", "MAXIMUS"];
    let wordIdx = 0;

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setLoaderFinished(true), 500);
          return 100;
        }
        // Change words periodically based on progress stages
        const threshold = Math.floor(100 / words.length);
        const currentWordIdx = Math.min(Math.floor(prev / threshold), words.length - 1);
        setLoaderWord(words[currentWordIdx]);
        return prev + 1;
      });
    }, 25);

    return () => clearInterval(progressInterval);
  }, []);



  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (leadName && leadPhone) {
      try {
        await fetch('http://localhost:5000/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: leadName,
            email: leadEmail || undefined,
            phone: leadPhone,
            source: 'WEBSITE',
          }),
        });
        setSubmitted(true);
        setLeadName('');
        setLeadEmail('');
        setLeadPhone('');
      } catch (error) {
        console.error('Failed to submit lead', error);
      }
    }
  };



  const faqs = [
    { q: 'Can I freeze my membership if I travel?', a: 'Yes! Memberships can be frozen for up to 30 days once a year directly from your member portal.' },
    { q: 'Is there personal training available?', a: 'Absolutely. We offer customized 1-on-1 coaching packages with certified trainers designed around your specific fitness goals.' },
    { q: 'What payment methods do you accept?', a: 'We accept UPI, major credit/debit cards, net banking, and offer EMI facilities on annual subscriptions.' }
  ];

  return (
    <div className="bg-black text-white min-h-screen selection:bg-yellow-400 selection:text-black">
      {/* Intro Vault Loader */}
      <AnimatePresence>
        {!loaderFinished && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ delay: 0.6 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
            style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
          >
            {/* 3D Flipping Tiles Grid */}
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 pointer-events-none z-0">
              {tiles.map((tile, idx) => {
                const delay = (tile.c * 0.05) + (tile.r * 0.035);
                return (
                  <motion.div
                    key={idx}
                    initial={{ rotateY: 0, opacity: 1, scale: 1 }}
                    exit={{ 
                      rotateY: -90, 
                      opacity: 0, 
                      scale: 0.85
                    }}
                    transition={{ 
                      duration: 0.6, 
                      ease: [0.76, 0, 0.24, 1], 
                      delay: delay 
                    }}
                    className="bg-neutral-950 border border-zinc-900/10 w-full h-full"
                  />
                );
              })}
            </div>

            {/* Centered Vault Lock Text Overlay */}
            <motion.div
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              transition={{ ease: [0.76, 0, 0.24, 1], duration: 0.55 }}
              className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 px-6 pointer-events-none"
            >
              <div className="text-center md:text-right">
                <span className="text-xs font-black tracking-widest text-zinc-500 uppercase">SYS_INITIALIZING</span>
                <h2 className="text-4xl md:text-5xl font-black text-yellow-400 tracking-tight mt-1">{loaderWord}</h2>
              </div>
              <div className="w-px h-12 bg-zinc-950 hidden md:block border-l border-zinc-900/60" />
              <div className="text-center md:text-left">
                <span className="text-xs font-black tracking-widest text-zinc-500 uppercase">VAULT_LOCK</span>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-1">
                  {Math.floor(loadingProgress)}%
                </h2>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-zinc-900/60 bg-black/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Maximus Logo" className="h-14 w-auto object-contain" />
          </div>
          <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-zinc-400">
            <a href="#about" className="hover:text-yellow-400 transition">About</a>
            <a href="#programs" className="hover:text-yellow-400 transition">Programs</a>
            <a href="#plans" className="hover:text-yellow-400 transition">Plans</a>
            <a href="#bmi" className="hover:text-yellow-400 transition">BMI Calculator</a>
            <a href="#contact" className="hover:text-yellow-400 transition">Contact</a>
          </nav>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.open(process.env.NEXT_PUBLIC_MEMBER_PORTAL_URL || 'https://maximus-fitness-member.vercel.app/', '_blank')}
              className="px-4 py-2 text-xs font-bold uppercase border border-zinc-800 rounded-lg hover:border-yellow-400 transition"
            >
              Member Login
            </button>
            <button
              onClick={() => window.open(process.env.NEXT_PUBLIC_ADMIN_PORTAL_URL || 'https://maximus-fitness-admin.vercel.app/', '_blank')}
              className="px-4 py-2 text-xs font-bold uppercase bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.25)] transition"
            >
              Staff Portal
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* Motivational Marquee Ribbon */}
      <section className="py-8 bg-zinc-950 border-t border-b border-zinc-900 overflow-hidden relative select-none">
        <style>{`
          @keyframes marqueeLoop {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee-loop {
            animation: marqueeLoop 30s linear infinite;
          }
          html, body {
            cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cg transform='rotate(45 16 16)'%3E%3Cline x1='2' y1='16' x2='30' y2='16' stroke='%23eab308' stroke-width='2' stroke-linecap='round'/%3E%3Crect x='5' y='14' width='2' height='4' rx='0.5' fill='%23eab308'/%3E%3Crect x='7' y='10' width='2.5' height='12' rx='1' fill='%2327272a' stroke='%23eab308' stroke-width='1'/%3E%3Crect x='10' y='8' width='3' height='16' rx='1' fill='%2318181b' stroke='%23eab308' stroke-width='1'/%3E%3Crect x='25' y='14' width='2' height='4' rx='0.5' fill='%23eab308'/%3E%3Crect x='22.5' y='10' width='2.5' height='12' rx='1' fill='%2327272a' stroke='%23eab308' stroke-width='1'/%3E%3Crect x='19' y='8' width='3' height='16' rx='1' fill='%2318181b' stroke='%23eab308' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E") 6 6, auto !important;
          }
          a, button, [role="button"], select, input, textarea, label {
            cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cg transform='rotate(45 16 16)'%3E%3Cline x1='2' y1='16' x2='30' y2='16' stroke='%23ffffff' stroke-width='2.5' stroke-linecap='round'/%3E%3Crect x='5' y='14' width='2' height='4' rx='0.5' fill='%23ffffff'/%3E%3Crect x='7' y='10' width='2.5' height='12' rx='1' fill='%23eab308' stroke='%23ffffff' stroke-width='1'/%3E%3Crect x='10' y='8' width='3' height='16' rx='1' fill='%23eab308' stroke='%23ffffff' stroke-width='1'/%3E%3Crect x='25' y='14' width='2' height='4' rx='0.5' fill='%23ffffff'/%3E%3Crect x='22.5' y='10' width='2.5' height='12' rx='1' fill='%23eab308' stroke='%23ffffff' stroke-width='1'/%3E%3Crect x='19' y='8' width='3' height='16' rx='1' fill='%23eab308' stroke='%23ffffff' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E") 6 6, pointer !important;
          }
        `}</style>
        
        {/* Yellow neon glow bar behind the text */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-yellow-400/10 blur-xs pointer-events-none" />

        <div className="flex w-[200%] items-center whitespace-nowrap animate-marquee-loop gap-8">
          {/* Double content row to secure infinite loop scrolling */}
          {Array.from({ length: 2 }).map((_, loopIdx) => (
            <div key={loopIdx} className="flex justify-around items-center min-w-full gap-8">
              {[
                "NEVER GIVE UP",
                "EVOLVE YOUR LIMITS",
                "DISCIPLINE OVER MOTIVATION",
                "NO PAIN NO GAIN",
                "MAXIMUM EFFORT",
                "SUFFER NOW AND LIVE A CHAMPION",
                "UNLEASH THE BEAST",
                "PAIN IS WEAKNESS LEAVING THE BODY"
              ].map((phrase, phraseIdx) => (
                <div key={phraseIdx} className="flex items-center gap-6">
                  <span className="text-2xl md:text-3xl font-black uppercase tracking-wider text-zinc-700 italic hover:text-yellow-400 transition-colors duration-300">
                    {phrase}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0 animate-pulse shadow-yellow-400/50 shadow-md" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Programs / Services Circular Slideshow */}
      <CircularPrograms />

      {/* Ground Zero Facility Gallery */}
      <section id="gallery" className="py-24 border-t border-zinc-900 bg-zinc-950/20">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-yellow-400">Ground Zero Facility</span>
            <h2 className="grindy-brush text-[40px] md:text-[56px] leading-tight tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-white uppercase pb-1">
              Train in the Zone
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-sm">Peek inside our premium training setups built to accelerate physical adaptations.</p>
          </div>

          <div className="flex flex-row items-center gap-2 md:gap-3 h-[380px] md:h-[480px] w-full max-w-6xl mx-auto mt-10 px-4 overflow-hidden">
            {[
              '/IMG_1219.JPG',
              '/IMG_1220.JPG',
              '/IMG_1221.JPG',
              '/IMG_1222.JPG',
              '/IMG_1223.JPG',
              '/IMG_1224.JPG'
            ].map((src, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                className="relative group flex-grow transition-all rounded-2xl overflow-hidden h-[340px] md:h-[450px] duration-500 border border-zinc-900 bg-zinc-950 w-8 hover:w-[260px] md:w-36 md:hover:w-[480px]"
              >
                <img
                  className="h-full w-full object-cover object-center transition-transform duration-700"
                  src={src}
                  alt={`facility-${idx}`}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Plans */}
      <section id="plans" className="py-24 bg-black border-t border-zinc-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 space-y-16 relative z-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-yellow-400">Membership Options</span>
            <h2 className="grindy-brush text-[40px] md:text-[56px] leading-tight tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-white uppercase pb-1">
              Join Our Membership
            </h2>
            <p className="text-[14px] md:text-[16px] text-zinc-400 max-w-2xl mx-auto">
              Start your training journey today. Flexible options tailored to match your evolution.
            </p>
          </div>
          
          <div className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden p-2">
            {/* WebGL background rotating rings shader - kept strictly within the bento grid boundary */}
            <PricingShader />
            
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-8 w-full"
            >
              {/* 1. Large Featured Card (Annual Elite) - lg:col-span-5 */}
              <motion.div
                variants={fadeInUpVariant}
                className="bg-gradient-to-br from-white/5 to-white/[0.01] border border-yellow-400/30 ring-2 ring-yellow-400/20 backdrop-blur-[14px] backdrop-brightness-[0.91] relative w-full overflow-hidden rounded-2xl p-6 lg:col-span-5 flex flex-col justify-between transition-all duration-300 min-h-[300px]"
              >
                {/* Grid backdrop patterns */}
                <div className="pointer-events-none absolute inset-0 z-0 opacity-10 bg-[linear-gradient(to_right,rgba(250,204,21,0.08)_1px,transparent_1px)] bg-[size:24px]" />
                
                <div className="relative z-10 flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-3 py-1 rounded-full border border-yellow-400/20 bg-yellow-400/10 text-[10px] font-black uppercase tracking-wider text-yellow-400">
                      ANNUAL ELITE
                    </span>
                    <span className="hidden sm:inline-block px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-wider text-zinc-300">
                      ⚡ Most Recommended
                    </span>
                  </div>
                  <button 
                    onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-wider bg-yellow-400 hover:bg-yellow-300 text-black shadow-[0_0_15px_rgba(250,204,21,0.3)] transition"
                  >
                    Join Elite
                  </button>
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row gap-6 mt-4">
                  <div className="lg:w-[35%] flex flex-col justify-center">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-5xl font-extralight tracking-tight text-white">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(9000)}
                      </span>
                      <span className="text-zinc-500 text-xs font-bold uppercase">/year</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-2 uppercase tracking-wider font-semibold">
                      Equivalent to ₹750/month
                    </p>
                  </div>
                  <ul className="grid gap-3 text-[13px] text-zinc-300 lg:w-[65%]">
                    {[
                      'All Premium Gym Access & Utilities',
                      '10 Personal Trainer 1-on-1 Sessions',
                      'Free Shaker & Premium Gym Wear bundle',
                      'Regular 3D Body Composition Audits'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div className="bg-yellow-400 text-black rounded-full p-0.5 flex-shrink-0">
                          <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                        <span className="leading-relaxed text-left">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* 2. Monthly Core Card - lg:col-span-3 */}
              <motion.div variants={fadeInUpVariant} className="lg:col-span-3">
                <PricingCard
                  titleBadge="MONTHLY CORE"
                  priceLabel={1000}
                  priceSuffix="month"
                  cta="Join Core"
                  features={[
                    'Full Gym Floor Access',
                    'Basic Workout Chart',
                    'Locker Room Access',
                    'Standard Gym Hours'
                  ]}
                />
              </motion.div>

              {/* 3. Quarterly Premium Card - lg:col-span-4 */}
              <motion.div variants={fadeInUpVariant} className="lg:col-span-4">
                <PricingCard
                  titleBadge="QUARTERLY PREMIUM"
                  priceLabel={2700}
                  priceSuffix="3 months"
                  cta="Join Premium"
                  features={[
                    '24/7 Unlimited Gym Access',
                    'AI Trainer Workout Builder',
                    '2 Diet Consultations/mo',
                    'Free Gym Shaker Cup'
                  ]}
                />
              </motion.div>

              {/* 4. Couple Elite Card - lg:col-span-4 */}
              <motion.div variants={fadeInUpVariant} className="lg:col-span-4">
                <PricingCard
                  titleBadge="COUPLE ELITE"
                  priceLabel={16000}
                  priceSuffix="year"
                  cta="Join Couple"
                  features={[
                    'All Elite Access for 2 Members',
                    'Joint Trainer Audit Reviews',
                    'Double Streak XP Multipliers',
                    'Dual Shakers & Gym Wear Pack'
                  ]}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* BMI Calculator Section */}
      <section id="bmi" className="py-24 border-t border-zinc-950 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,#1c1917_0%,transparent_50%)]" />
        <div className="max-w-6xl mx-auto px-6 relative z-10 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-yellow-400">Body Mass Index</span>
            <h2 className="grindy-brush text-[40px] md:text-[56px] leading-tight tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-white uppercase pb-1">
              BMI Calculator
            </h2>
            <p className="text-[14px] md:text-[16px] text-zinc-400 max-w-2xl mx-auto">
              Body Mass Index (BMI) evaluates body weight relative to height. Calculate your baseline to trace goals.
            </p>
          </div>

          <BmiCalculatorComponent />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 border-t border-zinc-950">
        <div className="max-w-3xl mx-auto px-6 space-y-12">
          <div className="text-center">
            <h2 className="grindy-brush text-[32px] md:text-[44px] leading-tight tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-white uppercase pb-1">
              FAQs
            </h2>
          </div>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4"
          >
            {faqs.map((faq, idx) => (
              <motion.div 
                key={idx} 
                variants={fadeInUpVariant}
                className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/40"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-sm hover:bg-zinc-900/20 transition uppercase tracking-wider"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 pt-1 text-sm text-zinc-400 border-t border-zinc-900/60 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 border-t border-zinc-950 relative overflow-hidden bg-black/40">
        <div className="max-w-6xl mx-auto px-6 space-y-12 relative z-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-yellow-400">Brotherhood Reviews</span>
            <h2 className="grindy-brush text-[40px] md:text-[56px] leading-tight tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-white uppercase pb-1 mt-2">
              Grit & Adaptation
            </h2>
            <p className="text-[14px] md:text-[16px] text-zinc-400 max-w-2xl mx-auto font-sans">
              See how our custom logging tools and signature strength setups helped members adapt.
            </p>
          </div>

          <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] max-h-[580px] overflow-hidden w-full">
            <TestimonialColumn testimonials={testimonials.slice(0, 3)} duration={15} />
            <TestimonialColumn testimonials={testimonials.slice(3, 6)} duration={19} className="hidden md:block" />
            <TestimonialColumn testimonials={testimonials.slice(6, 9)} duration={17} className="hidden lg:block" />
          </div>
        </div>
      </section>

      {/* Contact & Inquiries */}
      <section id="contact" className="py-24 border-t border-zinc-950 bg-zinc-950/20 relative">
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="relative w-full">
            {/* Corner Crosshairs - positioned outside main box */}
            {["-top-3.5 -left-3", "-top-3.5 -right-3", "-bottom-3 -left-3", "-bottom-3 -right-3"].map((corner, cidx) => (
              <div key={cidx} className={`absolute ${corner} text-yellow-400 font-light text-[22px] z-20 pointer-events-none select-none`}>+</div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative w-full bg-transparent border border-zinc-800 border-dashed p-6 sm:p-10 transition-all rounded-none overflow-hidden"
            >
              {/* Grid Backdrop */}
              <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{
                backgroundImage: `
                  linear-gradient(to right, #27272a 1px, transparent 1px),
                  linear-gradient(to bottom, #27272a 1px, transparent 1px)
                `,
                backgroundSize: "32px 32px",
                WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, #000 50%, transparent 90%)",
                maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, #000 50%, transparent 90%)"
              }} />

              {/* Terminal Header */}
              <div className="relative z-10 mb-8 text-left">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-yellow-400 mb-2 flex border-b border-yellow-400/40 pb-3 items-center gap-2 font-sans">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                  <span>SECURE TRANSMISSION NODE</span>
                </h2>
                <h1 className="grindy-brush text-[32px] md:text-[46px] leading-tight tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-white uppercase pb-1 mt-3">
                  Commence Transformation
                </h1>
                <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                  Connect with our coordination specialist to schedule your facility walkthrough. Complete protocol inputs below.
                </p>
              </div>

              {/* Form / Submitted state */}
              {submitted ? (
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10 space-y-4 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-wider text-white font-sans">HANDSHAKE ACCEPTED</h3>
                  <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">
                    Secure route established. A training coordinator has logged your details and will execute contact shortly.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-4 relative z-10">
                  {/* Name Input */}
                  <div className="relative group">
                    <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2 border-yellow-400 opacity-0 group-focus-within:opacity-100 transition-all z-10" />
                    <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2 border-yellow-400 opacity-0 group-focus-within:opacity-100 transition-all z-10" />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-yellow-400 transition-colors z-10 font-sans text-[11px] uppercase tracking-wider">
                      NAME &gt;&gt;
                    </div>
                    <input
                      type="text"
                      placeholder="ENTER FULL NAME"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      required
                      className="w-full bg-zinc-950/40 border border-zinc-900 rounded-none h-12 font-sans text-[13px] p-3 pl-24 outline-none transition-all placeholder:text-zinc-700 text-zinc-100 focus:bg-yellow-400/5 focus:ring-1 focus:ring-yellow-400/20 focus:border-yellow-400 border-dashed"
                    />
                  </div>

                  {/* Phone Input */}
                  <div className="relative group">
                    <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2 border-yellow-400 opacity-0 group-focus-within:opacity-100 transition-all z-10" />
                    <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2 border-yellow-400 opacity-0 group-focus-within:opacity-100 transition-all z-10" />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-yellow-400 transition-colors z-10 font-sans text-[11px] uppercase tracking-wider">
                      PHONE &gt;&gt;
                    </div>
                    <input
                      type="text"
                      placeholder="ENTER PHONE DIGITS"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      required
                      className="w-full bg-zinc-950/40 border border-zinc-900 rounded-none h-12 font-sans text-[13px] p-3 pl-24 outline-none transition-all placeholder:text-zinc-700 text-zinc-100 focus:bg-yellow-400/5 focus:ring-1 focus:ring-yellow-400/20 focus:border-yellow-400 border-dashed"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="relative group">
                    <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2 border-yellow-400 opacity-0 group-focus-within:opacity-100 transition-all z-10" />
                    <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2 border-yellow-400 opacity-0 group-focus-within:opacity-100 transition-all z-10" />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-yellow-400 transition-colors z-10 font-sans text-[11px] uppercase tracking-wider">
                      EMAIL &gt;&gt;
                    </div>
                    <input
                      type="email"
                      placeholder="ENTER EMAIL ADDRESS (OPTIONAL)"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      className="w-full bg-zinc-950/40 border border-zinc-900 rounded-none h-12 font-sans text-[13px] p-3 pl-24 outline-none transition-all placeholder:text-zinc-700 text-zinc-100 focus:bg-yellow-400/5 focus:ring-1 focus:ring-yellow-400/20 focus:border-yellow-400 border-dashed"
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={!leadName.trim() || !leadPhone.trim()}
                    className="w-full h-12 border bg-zinc-950 hover:bg-yellow-400/5 text-yellow-400 border-yellow-400/30 hover:border-yellow-400 font-bold uppercase text-[12px] tracking-[0.25em] font-sans transition-all flex items-center justify-center gap-2 rounded-none active:scale-98 border-dashed disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>[ CLAIM FREE WORKOUT PASS ]</span>
                  </button>
                </form>
              )}

              {/* Bottom Panel */}
              <div className="mt-8 flex items-center justify-between z-10 relative text-[11px] font-sans uppercase tracking-widest text-zinc-500 border-t border-zinc-900 pt-4">
                <span>
                  ROUTE_STATUS: {submitted ? (
                    <span className="text-zinc-400 font-bold">CONNECTED</span>
                  ) : (
                    <span className="text-yellow-400 border border-yellow-400/30 px-1.5 py-0.5 font-bold">READY</span>
                  )}
                </span>
                <span>SECURE_ID: 0xMAXIMUS</span>
              </div>

              {/* Communication Coordinates */}
              <div className="flex flex-col sm:flex-row justify-between pt-4 mt-2 text-[11px] text-zinc-500 font-sans gap-2 border-t border-dashed border-zinc-900/60">
                <div>DIAL_ROUTE: +91 98765 43210</div>
                <div>MAIL_ROUTE: inquiries@maximusfitness.com</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Location Map */}
      <LocationMap />

      {/* Cinematic Footer */}
      <CinematicFooter />

      {/* Floating Scroll Elements */}
      <FloatingScrollElements />
    </div>
  );
}

function FloatingScrollElements() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { scrollYProgress } = useScroll();

  const yTrack = useTransform(scrollYProgress, [0, 1], ["8vh", "88vh"]);
  const freq = 4.5 * 2 * Math.PI; // 4.5 oscillations down the page
  const amp = 36; // Swing amplitude
  const center = 50; // Center offset

  // Helper to generate helical path animations with unique phase shifts & prime frequency wobbles
  const useHelicalTransform = (phase: number, wobbleFreq1: number, wobbleFreq2: number, opacityBase: number, opacityMax: number) => {
    // Left horizontal sweep with wobbles
    const left = useTransform(scrollYProgress, (progress) => {
      const base = Math.sin(progress * freq + phase);
      const noise = 0.16 * Math.sin(progress * freq * wobbleFreq1 + 1.2) + 0.08 * Math.cos(progress * freq * wobbleFreq2);
      const xVal = center + (base + noise) * amp;
      return `${xVal}%`;
    });

    // 3D Depth Scaling
    const scale = useTransform(scrollYProgress, (progress) => {
      const baseScale = Math.cos(progress * freq + phase);
      const scaleNoise = 0.1 * Math.sin(progress * freq * wobbleFreq1);
      return 0.85 + (baseScale + scaleNoise) * 0.35;
    });

    // Opacity Depth Mapping
    const opacity = useTransform(scrollYProgress, (progress) => {
      const factor = Math.cos(progress * freq + phase);
      return opacityBase + (1.0 + factor) * 0.5 * (opacityMax - opacityBase);
    });

    // Rotation & rocking
    const rotate = useTransform(scrollYProgress, (progress) => {
      const dir = (phase % (2 * Math.PI) > Math.PI ? -1 : 1);
      const spin = dir * progress * 1080;
      const wobble = Math.sin(progress * 40 + phase) * 12;
      return spin + wobble;
    });

    return { left, scale, opacity, rotate };
  };

  // Generate 5 balanced phases (72 degrees or 0.4 * PI intervals)
  const dBell = useHelicalTransform(0, 2.7, 5.8, 0.18, 0.45);
  const wPlate = useHelicalTransform(0.4 * Math.PI, 3.1, 6.3, 0.18, 0.45);
  const kBell = useHelicalTransform(0.8 * Math.PI, 2.3, 7.1, 0.15, 0.38);
  const shaker = useHelicalTransform(1.2 * Math.PI, 2.9, 6.7, 0.15, 0.38);
  const shoes = useHelicalTransform(1.6 * Math.PI, 3.3, 5.4, 0.15, 0.38);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden select-none">
      {/* 1. Helical Dumbbell */}
      <motion.div 
        style={{ y: yTrack, left: dBell.left, scale: dBell.scale, opacity: dBell.opacity, rotate: dBell.rotate }} 
        className="absolute w-12 h-12 -ml-6 md:w-24 md:h-24 md:-ml-12 filter drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]"
      >
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="10" width="20" height="4" rx="1" fill="#eab308" />
          <rect x="5" y="6" width="3" height="12" rx="1" fill="#18181b" stroke="#eab308" strokeWidth="1.5" />
          <rect x="3" y="8" width="2" height="8" rx="0.5" fill="#09090b" stroke="#52525b" strokeWidth="1" />
          <rect x="16" y="6" width="3" height="12" rx="1" fill="#18181b" stroke="#eab308" strokeWidth="1.5" />
          <rect x="19" y="8" width="2" height="8" rx="0.5" fill="#09090b" stroke="#52525b" strokeWidth="1" />
        </svg>
      </motion.div>

      {/* 2. Helical Bumper Weight Plate */}
      <motion.div 
        style={{ y: yTrack, left: wPlate.left, scale: wPlate.scale, opacity: wPlate.opacity, rotate: wPlate.rotate }} 
        className="absolute w-16 h-16 -ml-8 md:w-32 md:h-32 md:-ml-16 filter drop-shadow-[0_0_20px_rgba(234,179,8,0.25)]"
      >
        <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="46" fill="#18181b" stroke="#27272a" strokeWidth="4" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="#eab308" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="16" fill="none" stroke="#27272a" strokeWidth="6" />
          <circle cx="50" cy="50" r="10" fill="none" stroke="#eab308" strokeWidth="2" />
          <text x="50" y="32" fill="#52525b" fontSize="7" fontWeight="800" textAnchor="middle" letterSpacing="0.1em">MAXIMUS</text>
          <text x="50" y="74" fill="#eab308" fontSize="10" fontWeight="900" textAnchor="middle">25 KG</text>
        </svg>
      </motion.div>

      {/* 3. Helical Cast Iron Kettlebell */}
      <motion.div 
        style={{ y: yTrack, left: kBell.left, scale: kBell.scale, opacity: kBell.opacity, rotate: kBell.rotate }} 
        className="absolute w-14 h-14 -ml-7 md:w-28 md:h-28 md:-ml-14 filter drop-shadow-[0_0_15px_rgba(234,179,8,0.2)]"
      >
        <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
          <path d="M35 45 C35 25 65 25 65 45" stroke="#eab308" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M40 45 C40 32 60 32 60 45" stroke="#18181b" strokeWidth="4" fill="none" />
          <circle cx="50" cy="65" r="28" fill="#18181b" stroke="#eab308" strokeWidth="3" />
          <text x="50" y="68" fill="#eab308" fontSize="11" fontWeight="900" textAnchor="middle">16</text>
          <text x="50" y="77" fill="#52525b" fontSize="6" fontWeight="700" textAnchor="middle">KG</text>
        </svg>
      </motion.div>

      {/* 4. Helical Shaker Bottle */}
      <motion.div 
        style={{ y: yTrack, left: shaker.left, scale: shaker.scale, opacity: shaker.opacity, rotate: shaker.rotate }} 
        className="absolute w-14 h-14 -ml-7 md:w-28 md:h-28 md:-ml-14 filter drop-shadow-[0_0_15px_rgba(234,179,8,0.2)]"
      >
        <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
          <path d="M35 30 L65 30 L60 85 L40 85 Z" fill="#18181b" stroke="#eab308" strokeWidth="2.5" />
          <rect x="32" y="22" width="36" height="8" rx="2" fill="#27272a" stroke="#eab308" strokeWidth="2" />
          <path d="M46 22 L46 14 C46 11 54 11 54 14 L54 22" fill="none" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="42" y1="42" x2="48" y2="42" stroke="#52525b" strokeWidth="2" />
          <line x1="42" y1="54" x2="52" y2="54" stroke="#eab308" strokeWidth="2" />
          <line x1="42" y1="66" x2="48" y2="66" stroke="#52525b" strokeWidth="2" />
          <line x1="42" y1="78" x2="52" y2="78" stroke="#eab308" strokeWidth="2" />
        </svg>
      </motion.div>

      {/* 5. Helical Training Shoes */}
      <motion.div 
        style={{ y: yTrack, left: shoes.left, scale: shoes.scale, opacity: shoes.opacity, rotate: shoes.rotate }} 
        className="absolute w-16 h-16 -ml-8 md:w-32 md:h-32 md:-ml-16 filter drop-shadow-[0_0_20px_rgba(234,179,8,0.25)]"
      >
        <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
          <path d="M15 72 C35 76 65 76 85 70 L82 78 C65 82 35 82 15 78 Z" fill="#27272a" stroke="#eab308" strokeWidth="2" />
          <path d="M15 72 C10 65 18 55 30 52 C35 44 45 35 60 38 C70 40 75 50 85 70 Z" fill="#18181b" stroke="#eab308" strokeWidth="2.5" strokeLinejoin="round" />
          <line x1="46" y1="48" x2="54" y2="44" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
          <line x1="42" y1="54" x2="50" y2="50" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
          <path d="M30 68 C45 60 60 62 72 68" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
      </motion.div>
    </div>
  );
}
