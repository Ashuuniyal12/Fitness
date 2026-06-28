"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Program {
  quote: string;
  name: string;
  designation: string;
  src: string;
}

const programsData: Program[] = [
  {
    name: "Strength Training",
    designation: "Power & Iron",
    quote: "Build absolute power, structural stability, and pure muscle mass. Access our premium collection of raw barbells, heavy dumbbells, and hammer-strength plate-loaded racks.",
    src: "/IMG_1219.JPG",
  },
  {
    name: "Cardio",
    designation: "Endurance & Speed",
    quote: "Elevate your heart rate and lung capacity. Train on self-powered curved treadmills, athletic climbers, and premium air bikes with real-time biometric loops.",
    src: "/IMG_1220.JPG",
  },
  {
    name: "Yoga",
    designation: "Zen & Mobility",
    quote: "Restore flexibility, align core muscles, and master mindful breathing. Our dedicated zen zone runs hot yoga, vinyasa flows, and recovery stretching classes.",
    src: "/yoga_dark.jpg",
  },
  {
    name: "Zumba",
    designation: "Rhythm & Burn",
    quote: "Fuse fitness with high-intensity Latin dance choreography. Burn calories in a high-octane club environment with cinematic light setups and heavy bass systems.",
    src: "/zumba_dark.jpg",
  },
  {
    name: "CrossFit",
    designation: "Functional Fitness",
    quote: "Forge complete athletic utility. Climb climbing ropes, flip heavy tractor tires, lift kettlebells, and execute high-repetition Olympic movements in the main cage.",
    src: "/IMG_1221.JPG",
  },
  {
    name: "HIIT",
    designation: "Metabolic Fire",
    quote: "Trigger long-lasting fat oxidization. Alternate short bursts of max energy sprints with brief recovery periods, designed to challenge your ultimate limits.",
    src: "/IMG_1224.JPG",
  },
  {
    name: "Personal Training",
    designation: "Elite Coaching",
    quote: "Get 1-on-1 coaching designed around your personal parameters. Receive personalized nutrition, form audits, and motivational guidance from certified master coaches.",
    src: "/IMG_1223.JPG",
  },
  {
    name: "Weight Loss",
    designation: "Caloric Target",
    quote: "Optimize your body composition. Our metabolic experts guide you through custom cardio-strength combos and strict daily deficit logs to shed body fat cleanly.",
    src: "/IMG_1225.JPG",
  },
  {
    name: "Muscle Gain",
    designation: "Hypertrophy Track",
    quote: "Unlock peak muscular size. Master targeted resistance structures, progressive overload logs, and optimal protein intake plans to trigger growth.",
    src: "/IMG_1228.JPG",
  },
  {
    name: "Senior Fitness",
    designation: "Longevity & Health",
    quote: "Retain agility, joint strength, and healthy bone density. Gentle resistance, stability drills, and range-of-motion routines designed for safety and long-term vitality.",
    src: "/senior_fitness_dark.jpg",
  },
  {
    name: "Kids Fitness",
    designation: "Agility & Play",
    quote: "Introduce young champions to the joy of movement. Agility ladder runs, dynamic obstacle courses, and basic bodyweight gymnastics in a safe and supportive layout.",
    src: "/kids_fitness_dark.jpg",
  },
];

function calculateGap(width: number) {
  const minWidth = 1024;
  const maxWidth = 1456;
  const minGap = 110;
  const maxGap = 160;
  if (width <= minWidth) return minGap;
  if (width >= maxWidth)
    return Math.max(minGap, maxGap + 0.06 * (width - maxWidth));
  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth));
}

export function CircularPrograms() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(600);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const length = programsData.length;
  const activeProgram = useMemo(() => programsData[activeIndex], [activeIndex]);

  useEffect(() => {
    function handleResize() {
      if (imageContainerRef.current) {
        setContainerWidth(imageContainerRef.current.offsetWidth);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const startAutoplay = useCallback(() => {
    if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
    autoplayIntervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % length);
    }, 6000);
  }, [length]);

  useEffect(() => {
    startAutoplay();
    return () => {
      if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
    };
  }, [startAutoplay]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % length);
    startAutoplay();
  }, [length, startAutoplay]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + length) % length);
    startAutoplay();
  }, [length, startAutoplay]);

  // Handle keyboard keys
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handlePrev, handleNext]);

  // Compute transforms for always showing Left, Center, Right images
  function getImageStyle(index: number): React.CSSProperties {
    const gap = calculateGap(containerWidth);
    const maxStickUp = gap * 0.45;
    const offset = (index - activeIndex + length) % length;
    const isActive = index === activeIndex;
    const isLeft = (activeIndex - 1 + length) % length === index;
    const isRight = (activeIndex + 1) % length === index;

    if (isActive) {
      return {
        zIndex: 3,
        opacity: 1,
        pointerEvents: "auto",
        transform: `translateX(0px) translateY(0px) scale(1.05) rotateY(0deg)`,
        transition: "all 0.8s cubic-bezier(.4,1.8,.3,1)",
      };
    }
    if (isLeft) {
      return {
        zIndex: 2,
        opacity: 0.5,
        pointerEvents: "auto",
        transform: `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.8) rotateY(25deg)`,
        transition: "all 0.8s cubic-bezier(.4,1.8,.3,1)",
      };
    }
    if (isRight) {
      return {
        zIndex: 2,
        opacity: 0.5,
        pointerEvents: "auto",
        transform: `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.8) rotateY(-25deg)`,
        transition: "all 0.8s cubic-bezier(.4,1.8,.3,1)",
      };
    }
    return {
      zIndex: 1,
      opacity: 0,
      pointerEvents: "none",
      transform: `translateX(${offset > length / 2 ? -gap * 1.5 : gap * 1.5}px) translateY(-100px) scale(0.6) rotateY(0deg)`,
      transition: "all 0.8s cubic-bezier(.4,1.8,.3,1)",
    };
  }

  const quoteVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
  };

  return (
    <section id="programs" className="py-24 bg-black border-t border-zinc-950 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 space-y-16 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-yellow-400">Our Training Services</span>
          <h2 className="grindy-brush text-[40px] md:text-[56px] leading-tight tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-white uppercase pb-1">
            Special Programs
          </h2>
          <p className="text-[14px] md:text-[16px] text-zinc-400 max-w-2xl mx-auto">
            Instead of standard generic gym features, discover specialized development programs designed to accelerate your performance limits.
          </p>
        </div>

        {/* 3D Circular Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center w-full max-w-5xl mx-auto">
          
          {/* Left Column: Interactive 3D Images */}
          <div className="md:col-span-6 flex items-center justify-center">
            <div 
              ref={imageContainerRef}
              className="relative w-full h-[280px] md:h-[350px] overflow-visible flex items-center justify-center"
              style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
            >
              {programsData.map((prog, index) => (
                <img
                  key={prog.name}
                  src={prog.src}
                  alt={prog.name}
                  style={getImageStyle(index)}
                  className="absolute w-[240px] h-[240px] md:w-[290px] md:h-[290px] object-cover rounded-2xl border border-zinc-900/60 shadow-[0_15px_40px_rgba(0,0,0,0.7)]"
                />
              ))}
            </div>
          </div>

          {/* Right Column: Descriptions & Details */}
          <div className="md:col-span-6 flex flex-col justify-center space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                variants={quoteVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="space-y-4"
              >
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-yellow-400">
                    {activeProgram.designation}
                  </span>
                  <h3 className="grindy-brush text-3xl md:text-4xl uppercase tracking-wide text-white mt-1">
                    {activeProgram.name}
                  </h3>
                </div>

                <div className="text-zinc-300 text-sm sm:text-base leading-relaxed min-h-[90px]">
                  {activeProgram.quote.split(" ").map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{ filter: "blur(8px)", opacity: 0, y: 5 }}
                      animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut", delay: 0.015 * i }}
                      className="inline-block"
                    >
                      {word}&nbsp;
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrow buttons */}
            <div className="flex gap-4 pt-2">
              <button
                onClick={handlePrev}
                className="w-12 h-12 rounded-full border border-zinc-800 bg-zinc-950/80 text-white flex items-center justify-center hover:border-yellow-400 hover:text-yellow-400 hover:bg-yellow-400/5 transition duration-300 active:scale-90"
                aria-label="Previous service"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="w-12 h-12 rounded-full border border-zinc-800 bg-zinc-950/80 text-white flex items-center justify-center hover:border-yellow-400 hover:text-yellow-400 hover:bg-yellow-400/5 transition duration-300 active:scale-90"
                aria-label="Next service"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
