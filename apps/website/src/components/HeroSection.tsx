"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Activity, Zap, Shield, Trophy } from "lucide-react";

// -------------------------------------------------------------------------
// 1. WEBGL LIGHTNING SHADER COMPONENT (Transparent Context)
// -------------------------------------------------------------------------
interface LightningProps {
  hue?: number;
  xOffset?: number;
  speed?: number;
  intensity?: number;
  size?: number;
}

const Lightning: React.FC<LightningProps> = ({
  hue = 50,
  xOffset = 0,
  speed = 1.6,
  intensity = 0.6,
  size = 2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Request WebGL context with transparent alpha support
    const gl = canvas.getContext("webgl", { alpha: true });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const vertexShaderSrc = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fragmentShaderSrc = `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform float uHue;
      uniform float uXOffset;
      uniform float uSpeed;
      uniform float uIntensity;
      uniform float uSize;
      
      #define OCTAVE_COUNT 10

      vec3 hsv2rgb(vec3 c) {
          vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
          return c.z * mix(vec3(1.0), rgb, c.y);
      }

      float hash11(float p) {
          p = fract(p * .1031);
          p *= p + 33.33;
          p *= p + p;
          return fract(p);
      }

      float hash12(vec2 p) {
          vec3 p3 = fract(vec3(p.xyx) * .1031);
          p3 += dot(p3, p3.yzx + 33.33);
          return fract((p3.x + p3.y) * p3.z);
      }

      mat2 rotate2d(float theta) {
          float c = cos(theta);
          float s = sin(theta);
          return mat2(c, -s, s, c);
      }

      float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 fp = fract(p);
          float a = hash12(ip);
          float b = hash12(ip + vec2(1.0, 0.0));
          float c = hash12(ip + vec2(0.0, 1.0));
          float d = hash12(ip + vec2(1.0, 1.0));
          
          vec2 t = smoothstep(0.0, 1.0, fp);
          return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
      }

      float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < OCTAVE_COUNT; ++i) {
              value += amplitude * noise(p);
              p *= rotate2d(0.45);
              p *= 2.0;
              amplitude *= 0.5;
          }
          return value;
      }

      void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
          vec2 uv = fragCoord / iResolution.xy;
          uv = 2.0 * uv - 1.0;
          uv.x *= iResolution.x / iResolution.y;
          uv.x += uXOffset;
          
          uv += 2.0 * fbm(uv * uSize + 0.8 * iTime * uSpeed) - 1.0;
          
          float dist = abs(uv.x);
          vec3 baseColor = hsv2rgb(vec3(uHue / 360.0, 0.9, 0.95));
          vec3 col = baseColor * pow(mix(0.0, 0.08, hash11(iTime * uSpeed)) / dist, 1.0) * uIntensity;
          
          // Calculate opacity from brightness of color so only the lightning bolt is visible, 
          // allowing the background workout image to bleed through transparently.
          float alpha = max(col.r, max(col.g, col.b));
          fragColor = vec4(col, clamp(alpha * 1.8, 0.0, 1.0));
      }

      void main() {
          mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `;

    const compileShader = (src: string, type: number): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(vertexShaderSrc, gl.VERTEX_SHADER);
    const fs = compileShader(fragmentShaderSrc, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const vertices = new Float32Array([
      -1, -1, 
       1, -1, 
      -1,  1, 
      -1,  1, 
       1, -1, 
       1,  1
    ]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, "iResolution");
    const uTime = gl.getUniformLocation(program, "iTime");
    const uHueLoc = gl.getUniformLocation(program, "uHue");
    const uXOffsetLoc = gl.getUniformLocation(program, "uXOffset");
    const uSpeedLoc = gl.getUniformLocation(program, "uSpeed");
    const uIntensityLoc = gl.getUniformLocation(program, "uIntensity");
    const uSizeLoc = gl.getUniformLocation(program, "uSize");

    const startTime = performance.now();
    let animationId: number;

    const render = () => {
      resizeCanvas();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      const elapsed = performance.now() - startTime;
      gl.uniform1f(uTime, elapsed / 1000);
      gl.uniform1f(uHueLoc, hue);
      gl.uniform1f(uXOffsetLoc, xOffset);
      gl.uniform1f(uSpeedLoc, speed);
      gl.uniform1f(uIntensityLoc, intensity);
      gl.uniform1f(uSizeLoc, size);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [hue, xOffset, speed, intensity, size]);

  return <canvas ref={canvasRef} className="w-full h-full relative" />;
};

// -------------------------------------------------------------------------
// 2. INTERACTIVE FLOATING TECH SPOT COMPONENT
// -------------------------------------------------------------------------
interface TechSpotProps {
  name: string;
  value: string;
  position: string;
  icon: React.ReactNode;
}

const TechSpot: React.FC<TechSpotProps> = ({ name, value, position, icon }) => {
  return (
    <div className={`absolute ${position} z-10 group transition-all duration-300 hover:scale-110`}>
      <div className="flex items-center gap-3 relative bg-black/50 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-3.5 shadow-xl hover:border-yellow-400/40">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-400/10 text-yellow-400 group-hover:bg-yellow-400 group-hover:text-black transition-colors duration-300">
          {icon}
          <div className="absolute -inset-1 bg-yellow-400/10 rounded-lg blur-sm opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="text-left">
          <div className="font-black text-white text-xs tracking-wider uppercase">{name}</div>
          <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">{value}</div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------------------
// 3. COLOR STEPS / PRESET SELECTOR COMPONENT
// -------------------------------------------------------------------------
interface ColorPresetsProps {
  currentHue: number;
  onSelect: (hue: number) => void;
}

const ColorPresets: React.FC<ColorPresetsProps> = ({ currentHue, onSelect }) => {
  const presets = [
    { name: "Gold", hue: 50, colorClass: "bg-yellow-400 shadow-yellow-400/45" },
    { name: "Amber", hue: 30, colorClass: "bg-amber-500 shadow-amber-500/45" },
    { name: "Crimson", hue: 0, colorClass: "bg-red-500 shadow-red-500/45" },
    { name: "Neon", hue: 200, colorClass: "bg-blue-400 shadow-blue-400/45" },
    { name: "Acid", hue: 110, colorClass: "bg-emerald-400 shadow-emerald-400/45" },
    { name: "Vortex", hue: 285, colorClass: "bg-purple-500 shadow-purple-500/45" },
  ];

  return (
    <div className="flex flex-col items-center space-y-2 mt-8">
      <span className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">Energy Color Selectors</span>
      <div className="flex items-center gap-3.5 bg-zinc-950/70 border border-zinc-900 rounded-full px-4 py-2 backdrop-blur-sm">
        {presets.map((p) => {
          const isSelected = Math.abs(currentHue - p.hue) < 10;
          return (
            <button
              key={p.name}
              onClick={() => onSelect(p.hue)}
              title={p.name}
              className={`w-4 h-4 rounded-full ${p.colorClass} shadow-md transition-all duration-300 relative ${
                isSelected ? "scale-125 ring-2 ring-white" : "hover:scale-110 opacity-70 hover:opacity-100"
              }`}
            >
              {isSelected && (
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-zinc-800 pointer-events-none">
                  {p.name}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// -------------------------------------------------------------------------
// 4. MAIN HERO SECTION COMPONENT
// -------------------------------------------------------------------------
export function HeroSection() {
  const [hue, setHue] = useState(50);
  const [intensity, setIntensity] = useState(0.6);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty("--brand-accent", `${hue} 95.8% 53.1%`);
      root.style.setProperty("--brand-accent-light", `${hue} 97.8% 63.5%`);
      root.style.setProperty("--brand-accent-dark", `${hue} 93.3% 47.1%`);
    }
  }, [hue]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="relative w-full h-[95vh] min-h-[650px] bg-black text-white overflow-hidden flex flex-col justify-center">
      <style>{`
        @font-face {
          font-family: 'Grindy Brush';
          src: url('/fonts/Grindy Brush.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
        }
        .hero-brush-font {
          font-family: 'Grindy Brush', sans-serif;
          letter-spacing: 0.03em;
        }
      `}</style>
      
      {/* 1. Backdrop workout athlete, WebGL Canvas overlay and vignettes */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        {/* Layer 1: Headless bodybuilder background photo */}
        <img 
          src="/hero_background.jpg" 
          alt="Bodybuilder pose workout"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-30 brightness-[0.55] select-none pointer-events-none" 
        />
        
        {/* Layer 2: WebGL Transparent lightning bolt */}
        <div className="absolute inset-0 w-full h-full z-10 mix-blend-screen">
          <Lightning hue={hue} xOffset={0} speed={1.6} intensity={intensity} size={2} />
        </div>

        {/* Layer 3: Giant vignette mask shading to pitch black around edges */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_10%,_#000000_90%)] z-20" />
      </div>



      {/* 3. Main Hero Content Layout */}
      <div className="relative z-30 max-w-5xl mx-auto px-6 text-center flex flex-col items-center w-full">
        {/* Floating Accent Badge */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center space-x-2 px-4 py-2 bg-yellow-400/5 hover:bg-yellow-400/10 border border-yellow-400/20 rounded-full text-xs font-bold text-yellow-400 tracking-wider mb-8 transition-colors duration-300 cursor-pointer group"
          onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
        >
          <span>Claim Your Free Pass</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-300" />
        </motion.div>

        {/* Dynamic Titles */}
        <motion.h1
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="hero-brush-font text-7xl sm:text-[100px] md:text-[156px] uppercase leading-none select-none bg-gradient-to-r from-yellow-400 to-white bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(250,204,21,0.35)] w-full py-4"
        >
          Maximus Fitness
        </motion.h1>
        
        <motion.h2
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold pb-3 tracking-wide uppercase bg-gradient-to-r from-yellow-400 via-white to-yellow-500 bg-clip-text text-transparent mt-2"
        >
          Evolve Your Limits
        </motion.h2>

        <motion.p
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="text-zinc-300 text-sm sm:text-base md:text-lg max-w-2xl mt-4 leading-relaxed font-medium bg-black/30 backdrop-blur-[2px] rounded-xl p-3"
        >
          A visual training ecosystem. Seamlessly book classes, verify attendance via smart widgets, check workouts, and log daily metrics. Designed to power your physical evolution.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center gap-4 mt-8"
        >
          <button
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-4 bg-yellow-400 text-black font-black uppercase tracking-wider text-xs rounded-xl hover:bg-yellow-300 active:scale-95 transition shadow-[0_0_20px_rgba(250,204,21,0.25)]"
          >
            Claim Free Pass
          </button>
          <button
            onClick={() => document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-4 bg-transparent border-2 border-zinc-800 hover:border-yellow-400 text-white font-black uppercase tracking-wider text-xs rounded-xl active:scale-95 transition"
          >
            Explore Facility
          </button>
        </motion.div>

        {/* Preset Selector Steps and Storm Tuning Sliders */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-2"
        >
          {/* Stepper dots select color preset immediately */}
          <ColorPresets currentHue={hue} onSelect={setHue} />

          {/* Slider for fine adjustment */}
          <div className="flex gap-4">
            <div className="relative w-full max-w-[200px] flex flex-col items-center mt-3 bg-zinc-950/70 border border-zinc-900 rounded-full px-4 py-2 backdrop-blur-sm">
              <label className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-1">Fine Tune Hue</label>
              <input
                type="range"
                min={0}
                max={360}
                value={hue}
                onChange={(e) => setHue(Number(e.target.value))}
                className="w-full h-1 appearance-none bg-zinc-900 rounded-full cursor-pointer accent-yellow-400 focus:outline-none"
              />
            </div>

            <div className="relative w-full max-w-[200px] flex flex-col items-center mt-3 bg-zinc-950/70 border border-zinc-900 rounded-full px-4 py-2 backdrop-blur-sm">
              <label className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-1">Storm Energy</label>
              <input
                type="range"
                min={10}
                max={100}
                value={intensity * 100}
                onChange={(e) => setIntensity(Number(e.target.value) / 100)}
                className="w-full h-1 appearance-none bg-zinc-900 rounded-full cursor-pointer accent-yellow-400 focus:outline-none"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
