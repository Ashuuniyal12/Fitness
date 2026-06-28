"use client";

import React, { useState, useMemo } from "react";
import { Plus, Minus, ArrowRight, Flame, Scale } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateBMI, getBMICategory } from "@maximus/utils";

export function BmiCalculatorComponent() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [heightVal, setHeightVal] = useState<number>(170);
  const [weightVal, setWeightVal] = useState<number>(70);
  const [ageVal, setAgeVal] = useState<number>(25);

  const [bmiResult, setBmiResult] = useState<number | null>(null);
  const [bmiCat, setBmiCat] = useState<string>("");

  const handleCalculate = () => {
    const res = calculateBMI(weightVal, heightVal);
    setBmiResult(res);
    setBmiCat(getBMICategory(res));
  };

  // Generate ticks for ruler centering around current height
  const rulerTicks = useMemo(() => {
    const ticks = [];
    for (let h = heightVal - 8; h <= heightVal + 8; h++) {
      ticks.push(h);
    }
    return ticks;
  }, [heightVal]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full max-w-5xl mx-auto mt-10">
      
      {/* Left Column: Interactive Skeuomorphic Controller (Mobile Phone Form Factor inside container) */}
      <div className="lg:col-span-6 bg-zinc-950/80 border border-zinc-900 rounded-[32px] p-6 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-yellow-400/5 blur-3xl pointer-events-none" />
        
        {/* 1. Gender Switcher */}
        <div className="w-full bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-900 flex">
          <button
            onClick={() => setGender("male")}
            className={`flex-1 py-3 text-sm font-black uppercase tracking-wider rounded-xl transition duration-300 ${
              gender === "male"
                ? "bg-zinc-800 text-yellow-400 shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-zinc-700/30"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Male
          </button>
          <button
            onClick={() => setGender("female")}
            className={`flex-1 py-3 text-sm font-black uppercase tracking-wider rounded-xl transition duration-300 ${
              gender === "female"
                ? "bg-zinc-800 text-yellow-400 shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-zinc-700/30"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Female
          </button>
        </div>

        {/* 2. Height Slider Card with Ruler */}
        <div className="bg-zinc-900/40 border border-zinc-900/80 rounded-2xl p-5 flex flex-col items-center space-y-4">
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Height</span>
            <span className="text-[10px] text-zinc-600 font-medium ml-1">(in cm)</span>
          </div>

          {/* Numbers View */}
          <div className="flex items-end justify-center space-x-5 h-12 relative overflow-hidden w-full select-none">
            {rulerTicks.map((val) => {
              const isSelected = val === heightVal;
              return (
                <div
                  key={val}
                  className={`transition-all duration-300 flex-shrink-0 text-center ${
                    isSelected
                      ? "text-3xl font-black text-yellow-400 scale-110"
                      : "text-sm text-zinc-600 scale-85 opacity-40"
                  }`}
                  style={{ width: "28px" }}
                >
                  {val}
                </div>
              );
            })}
          </div>

          {/* Ruler Ticks Visual */}
          <div className="w-full flex justify-between px-2 h-8 relative select-none">
            {rulerTicks.map((val) => {
              const isSelected = val === heightVal;
              const isMajor = val % 5 === 0;
              return (
                <div key={val} className="flex flex-col items-center flex-shrink-0" style={{ width: "28px" }}>
                  <div
                    className={`w-0.5 rounded-full transition-all duration-300 ${
                      isSelected
                        ? "h-8 bg-yellow-400"
                        : isMajor
                        ? "h-6 bg-zinc-700"
                        : "h-4 bg-zinc-800"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Range Slider Overlay */}
          <div className="w-full px-2 pt-2">
            <input
              type="range"
              min="120"
              max="220"
              value={heightVal}
              onChange={(e) => setHeightVal(Number(e.target.value))}
              className="w-full accent-yellow-400 bg-zinc-850 h-1.5 rounded-full cursor-ew-resize appearance-none"
            />
          </div>
        </div>

        {/* 3. Weight and Age segment */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Weight Card */}
          <div className="bg-zinc-900/40 border border-zinc-900/80 rounded-2xl p-4 flex flex-col items-center justify-between space-y-4">
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Weight</span>
              <span className="text-[10px] text-zinc-600 font-medium ml-1">(kg)</span>
            </div>

            {/* Weights strip */}
            <div className="flex items-center justify-center space-x-3 select-none">
              <span className="text-xs text-zinc-600 opacity-40">{weightVal - 1}</span>
              <span className="text-2xl font-black text-white px-2">{weightVal}</span>
              <span className="text-xs text-zinc-600 opacity-40">{weightVal + 1}</span>
            </div>

            {/* Incrementor Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setWeightVal((prev) => Math.max(30, prev - 1))}
                className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/40 flex items-center justify-center text-zinc-400 hover:text-white transition duration-200"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setWeightVal((prev) => Math.min(200, prev + 1))}
                className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/40 flex items-center justify-center text-zinc-400 hover:text-white transition duration-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Age Card */}
          <div className="bg-zinc-900/40 border border-zinc-900/80 rounded-2xl p-4 flex flex-col items-center justify-between space-y-4">
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Age</span>
            </div>

            {/* Age strip */}
            <div className="flex items-center justify-center space-x-3 select-none">
              <span className="text-xs text-zinc-600 opacity-40">{ageVal - 1}</span>
              <span className="text-2xl font-black text-white px-2">{ageVal}</span>
              <span className="text-xs text-zinc-600 opacity-40">{ageVal + 1}</span>
            </div>

            {/* Incrementor Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setAgeVal((prev) => Math.max(1, prev - 1))}
                className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/40 flex items-center justify-center text-zinc-400 hover:text-white transition duration-200"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setAgeVal((prev) => Math.min(120, prev + 1))}
                className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/40 flex items-center justify-center text-zinc-400 hover:text-white transition duration-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 4. Large round Calculate Button in dedicated base panel */}
        <div className="flex flex-col items-center pt-2">
          <button
            onClick={handleCalculate}
            className="w-16 h-16 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black flex items-center justify-center shadow-[0_6px_20px_rgba(250,204,21,0.3)] hover:scale-105 active:scale-95 transition duration-300 group"
            aria-label="Calculate BMI"
          >
            <ArrowRight className="w-6 h-6 transform group-hover:translate-x-0.5 transition-transform duration-300" />
          </button>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-2">
            Calculate
          </span>
        </div>

      </div>

      {/* Right Column: Dynamic Results Presentation */}
      <div className="lg:col-span-6 bg-zinc-950/40 border border-zinc-900/60 rounded-[32px] p-6 flex flex-col justify-center items-center relative overflow-hidden min-h-[350px]">
        
        {/* Neon Backdrop Gradient Ring */}
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-yellow-400/5 blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {bmiResult ? (
            <motion.div
              key="result"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="space-y-6 text-center w-full max-w-sm"
            >
              <div>
                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                  Your BMI Index
                </span>
                <div className="text-7xl font-black text-yellow-400 mt-1 drop-shadow-[0_0_20px_rgba(250,204,21,0.25)] font-sans">
                  {bmiResult.toFixed(1)}
                </div>
              </div>

              {/* Glowing Badge */}
              <div className="inline-block px-5 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-xs font-black uppercase tracking-wider text-yellow-400">
                {bmiCat}
              </div>

              {/* Progress bar visualizer */}
              <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden relative">
                {/* Standard color blocks (underweight, normal, overweight, obese) */}
                <div className="absolute inset-0 flex">
                  <div className="w-[18.5%] bg-blue-500/30 h-full border-r border-black/20" />
                  <div className="w-[6.5%] bg-green-500/30 h-full border-r border-black/20" />
                  <div className="w-[5%] bg-yellow-500/30 h-full border-r border-black/20" />
                  <div className="w-[70%] bg-red-500/30 h-full" />
                </div>
                
                {/* Active marker needle */}
                <motion.div
                  initial={{ left: 0 }}
                  animate={{ left: `${Math.min(100, Math.max(0, ((bmiResult - 15) / 25) * 100))}%` }}
                  transition={{ type: "spring", stiffness: 60, damping: 15 }}
                  className="absolute top-0 bottom-0 w-1.5 bg-yellow-400 shadow-yellow-400/50 shadow-md -ml-0.5 rounded-full"
                />
              </div>

              {/* Context Summary Advice */}
              <p className="text-xs text-zinc-400 leading-relaxed px-4">
                {bmiResult < 18.5 && "Your weight index is lower than optimal. Consider consulting with our nutrition specialists to structure a clean caloric surplus diet."}
                {bmiResult >= 18.5 && bmiResult < 25 && "Perfect! Your weight index is in the optimal healthy zone. Maintain your training split and high-protein intake parameters."}
                {bmiResult >= 25 && bmiResult < 30 && "Your weight index indicates light overweight. Combine structural resistance splits with daily metabolic cardio loops."}
                {bmiResult >= 30 && "Your weight index is in the high-risk zone. We highly recommend booking custom 1-on-1 programs to optimize body composition safely."}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 text-center max-w-xs"
            >
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto shadow-inner animate-pulse">
                <Scale className="w-6 h-6 text-zinc-600" />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase text-white tracking-wider">
                  Evaluate Health Metrics
                </h4>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                  Enter your gender, height slider, weight, and age in the controllers to generate your personalized health parameters.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
