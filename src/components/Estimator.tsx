import React, { useState } from "react";
import { FootprintAssessment } from "../types";
import { DEFAULT_ASSESSMENT, calculateFootprint } from "../data/staticData";
import { motion } from "motion/react";
import { 
  ArrowRight, ArrowLeft, CheckCircle, Leaf 
} from "lucide-react";

interface EstimatorProps {
  assessment: FootprintAssessment;
  onSave: (updated: FootprintAssessment) => void;
}

type StepKey = "intro" | "transport" | "food" | "energy" | "shopping" | "result";

export default function Estimator({ assessment, onSave }: EstimatorProps) {
  const [currentStep, setCurrentStep] = useState<StepKey>("intro");
  const [tempState, setTempState] = useState<FootprintAssessment>({ ...assessment });

  const updateField = <K extends keyof FootprintAssessment>(key: K, value: FootprintAssessment[K]) => {
    setTempState(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNext = (nextStep: StepKey) => {
    setCurrentStep(nextStep);
  };

  const handleFinish = () => {
    const finalState = { ...tempState, hasCompleted: true };
    onSave(finalState);
    setCurrentStep("result");
  };

  const calculated = calculateFootprint(tempState);
  const totalTonnes = (calculated.total / 1000).toFixed(1);

  // Global Averaging for Context
  const usAverage = 16.0;
  const worldAverage = 4.5;
  const targetAverage = 2.0;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 font-sans text-emerald-950">
      {/* Step Container */}
      <div className="bg-white rounded-[40px] border border-emerald-100 shadow-2xl shadow-emerald-900/10 p-8 sm:p-12 relative overflow-hidden">
        
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-amber-400 to-sky-450" />

        {currentStep === "intro" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-6"
          >
            <div className="inline-flex p-5 bg-emerald-100 rounded-[24px] text-emerald-800 mb-6 shadow-inner">
              <Leaf size={40} className="text-emerald-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-emerald-950 tracking-tight leading-none mb-4">
              Discover Your Carbon Blueprint
            </h2>
            <p className="text-emerald-850 text-sm max-w-lg mx-auto mb-8 leading-relaxed">
              Before we can craft a meaningful path to lower emissions, we must measure your current impact. 
              This 2-minute, EPAs-aligned diagnostic provides a baseline across travel, food, thermal energy, and consumption.
            </p>

            <button
              onClick={() => handleNext("transport")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl transition-all font-black text-sm shadow-xl shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer active:scale-95"
            >
              Begin Calculator
              <ArrowRight size={18} />
            </button>

            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-emerald-100 pt-8 max-w-md mx-auto text-xs text-emerald-600/80 font-mono font-bold">
              <div>
                <span className="block text-emerald-900 text-xl font-black">100%</span>
                Science-Backed
              </div>
              <div>
                <span className="block text-emerald-900 text-xl font-black">No Logins</span>
                Privacy-First
              </div>
              <div>
                <span className="block text-emerald-900 text-xl font-black">Instant II</span>
                AI Coaching Plan
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === "transport" && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center pb-6 border-b border-emerald-100">
              <div>
                <span className="text-xs font-mono text-emerald-600 tracking-wider font-extrabold uppercase mb-1 block">Category 1 of 4</span>
                <h3 className="text-2xl font-black text-emerald-900 leading-none">Movement Summary</h3>
              </div>
              <div className="h-4 w-28 bg-emerald-50 rounded-full overflow-hidden p-0.5 border border-emerald-100/50">
                <div className="h-full bg-emerald-500 w-1/4 rounded-full" />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-stone-800 mb-2">
                  What is your primary commuting method?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { key: "gas", label: "Gas Vehicle", desc: "Standard Petrol/SUV" },
                    { key: "diesel", label: "Diesel", desc: "Diesel Engine" },
                    { key: "hybrid", label: "Hybrid / HEV", desc: "High fuel efficiency" },
                    { key: "electric", label: "Electric / EV", desc: "Zero direct emissions" },
                    { key: "none", label: "None / Transit", desc: "Rely solely on walking/bus" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => updateField("vehicleType", opt.key as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        tempState.vehicleType === opt.key 
                          ? "border-emerald-500 bg-emerald-50 shadow-sm outline-2 outline-emerald-500 font-extrabold" 
                          : "border-emerald-100 bg-white hover:border-emerald-250 hover:bg-emerald-50/20"
                      }`}
                    >
                      <span className="text-xs font-bold text-emerald-950 leading-tight">{opt.label}</span>
                      <span className="text-[10px] text-emerald-600/70 mt-1 lines-clamp-2 leading-snug">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {tempState.vehicleType !== "none" && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-emerald-900">
                      Weekly individual vehicle driving mileage
                    </label>
                    <span className="text-xs font-mono text-emerald-700 bg-emerald-100/60 py-1 px-3 rounded-xl font-bold border border-emerald-150">
                      {tempState.commuteMiles} miles
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="400"
                    step="5"
                    value={tempState.commuteMiles}
                    onChange={(e) => updateField("commuteMiles", parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-emerald-100 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-emerald-600 font-mono mt-1 font-bold">
                    <span>0 mi</span>
                    <span>100 mi (Low)</span>
                    <span>200 mi (Avg)</span>
                    <span>400+ mi</span>
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-emerald-900">
                    How many hours per week do you use public transit, walk, or ride a bicycle?
                  </label>
                  <span className="text-xs font-mono text-emerald-700 bg-emerald-100/60 py-1 px-3 rounded-xl font-bold border border-emerald-150">
                    {tempState.publicTransitHours} hrs
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={tempState.publicTransitHours}
                  onChange={(e) => updateField("publicTransitHours", parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-emerald-100 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-emerald-600 font-mono mt-1 font-bold">
                  <span>None</span>
                  <span>10 hrs</span>
                  <span>20 hrs</span>
                  <span>40+ hrs</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-emerald-900 mb-2">
                  Roughly how many commercial/private flights do you take annually?
                </label>
                <div className="flex items-center gap-4">
                  {[0, 1, 2, 4, 8, 12].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => updateField("flightsCount", num)}
                      className={`h-11 w-11 sm:h-12 sm:w-12 rounded-xl border flex items-center justify-center font-mono font-bold transition-all cursor-pointer ${
                        tempState.flightsCount === num
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                          : "bg-white border-emerald-100 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-50/50"
                      }`}
                    >
                      {num === 12 ? "12+" : num}
                    </button>
                  ))}
                  <span className="text-xs text-emerald-600/70 font-semibold leading-snug">
                    (Includes short regional and transatlantic roundtrips)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-5 border-t border-emerald-100 transition-all">
              <button
                onClick={() => handleNext("food")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all font-bold text-xs cursor-pointer shadow-md shadow-emerald-500/10 hover:scale-105 active:scale-95"
              >
                Next (Nutritional Footprint)
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === "food" && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center pb-6 border-b border-emerald-100">
              <div>
                <span className="text-xs font-mono text-emerald-600 tracking-wider font-extrabold uppercase mb-1 block">Category 2 of 4</span>
                <h3 className="text-2xl font-black text-emerald-950 leading-none">Dietary Baseline</h3>
              </div>
              <div className="h-4 w-28 bg-emerald-50 rounded-full overflow-hidden p-0.5 border border-emerald-100/50">
                <div className="h-full bg-emerald-500 w-2/4 rounded-full" />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-emerald-900 mb-2.5">
                  Which dietary categorization represents your daily eating habits best?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {[
                    { key: "meat-heavy", label: "Meat Focus", desc: "Eat poultry or beef daily" },
                    { key: "mixed-diet", label: "Mixed Diet", desc: "Moderate meat, dairy & base carb" },
                    { key: "flexitarian", label: "Flexitarian", desc: "Occasional animal protein" },
                    { key: "vegetarian", label: "Vegetarian", desc: "Dairy & eggs, zero meats" },
                    { key: "vegan", label: "Fully Vegan", desc: "Strictly plant elements" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => updateField("dietType", opt.key as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        tempState.dietType === opt.key 
                          ? "border-emerald-500 bg-emerald-50 shadow-sm outline-2 outline-emerald-500 font-extrabold" 
                          : "border-emerald-100 bg-white hover:border-emerald-250 hover:bg-emerald-50/20"
                      }`}
                    >
                      <span className="text-xs font-bold text-emerald-950 leading-tight">{opt.label}</span>
                      <span className="text-[10px] text-emerald-600/70 mt-1 leading-snug">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-emerald-900 mb-2">
                  What is your average domestic food waste rate?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {[
                    { key: "never", label: "Completely Zero", desc: "Always finish leftovers & compost" },
                    { key: "some", label: "Minimal / Rare", desc: "Under 10% food thrown away" },
                    { key: "moderate", label: "Moderate Standard", desc: "Throw out stale items weekly" },
                    { key: "high", label: "Relatively High", desc: "Often discard unused groceries" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => updateField("foodWasteScore", opt.key as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        tempState.foodWasteScore === opt.key 
                          ? "border-emerald-500 bg-emerald-50 shadow-sm outline-2 outline-emerald-500 font-extrabold" 
                          : "border-emerald-100 bg-white hover:border-emerald-250 hover:bg-emerald-50/20"
                      }`}
                    >
                      <span className="text-xs font-bold text-emerald-950 leading-tight">{opt.label}</span>
                      <span className="text-[10px] text-emerald-600/70 mt-1 leading-snug">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-emerald-900 mb-2">
                  How often do you make an effort to buy local / regionally grown ingredients?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: "rarely", label: "Rarely/Convenient", desc: "Supermarket imports" },
                    { key: "sometimes", label: "Sometimes", desc: "Farmer's market visits" },
                    { key: "mostly", label: "Mostly / Exclusive", desc: "Local co-ops & farms" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => updateField("buyLocalScore", opt.key as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        tempState.buyLocalScore === opt.key 
                          ? "border-emerald-500 bg-emerald-50 shadow-sm outline-2 outline-emerald-500 font-extrabold" 
                          : "border-emerald-100 bg-white hover:border-emerald-250 hover:bg-emerald-50/20"
                      }`}
                    >
                      <span className="text-xs font-bold text-emerald-950 leading-tight">{opt.label}</span>
                      <span className="text-[10px] text-emerald-600/70 mt-1 leading-snug">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-5 border-t border-emerald-100">
              <button
                onClick={() => handleNext("transport")}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-emerald-250 hover:bg-emerald-50 text-emerald-800 rounded-xl transition-all font-bold text-xs cursor-pointer active:scale-95"
              >
                <ArrowLeft size={14} />
                Back
              </button>
              <button
                onClick={() => handleNext("energy")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all font-bold text-xs cursor-pointer shadow-md shadow-emerald-500/10 hover:scale-105 active:scale-95"
              >
                Next (Grid & Thermal Energy)
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === "energy" && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center pb-6 border-b border-emerald-100">
              <div>
                <span className="text-xs font-mono text-emerald-600 tracking-wider font-extrabold uppercase mb-1 block">Category 3 of 4</span>
                <h3 className="text-2xl font-black text-emerald-950 leading-none">Home & Thermal Energy</h3>
              </div>
              <div className="h-4 w-28 bg-emerald-50 rounded-full overflow-hidden p-0.5 border border-emerald-100/50">
                <div className="h-full bg-emerald-500 w-3/4 rounded-full" />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-emerald-900 mb-2">
                  What is your home electricity source?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: "grid-standard", label: "Standard Grid Power", desc: "Utility default (often coal/gas)" },
                    { key: "green-electricity", label: "Green Energy Contract", desc: "Offset/Renewable bundle subscription" },
                    { key: "home-solar", label: "Rooftop Solar Array", desc: "Mainly self-sustained photovoltaic" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => updateField("energySource", opt.key as any)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        tempState.energySource === opt.key 
                          ? "border-emerald-500 bg-emerald-50 shadow-sm outline-2 outline-emerald-500 font-extrabold" 
                          : "border-emerald-100 bg-white hover:border-emerald-250 hover:bg-emerald-50/20"
                      }`}
                    >
                      <span className="text-xs font-bold text-emerald-950 leading-tight">{opt.label}</span>
                      <span className="text-[10px] text-emerald-600/70 mt-1 leading-snug">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-emerald-900 mb-2">
                  What fuel is used to heat your home?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: "heat-pump", label: "Geothermal / Heat Pump", desc: "Best electric coefficient" },
                    { key: "electric", label: "Electric Space Heater", desc: "High baseline grid usage" },
                    { key: "natural-gas", label: "Natural Gas", desc: "Furnace pipelines" },
                    { key: "heating-oil", label: "Heating Oil / Coal", desc: "High carbon intensity fossil" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => updateField("heatingFuel", opt.key as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        tempState.heatingFuel === opt.key 
                          ? "border-emerald-500 bg-emerald-50 shadow-sm outline-2 outline-emerald-500 font-extrabold" 
                          : "border-emerald-100 bg-white hover:border-emerald-250 hover:bg-emerald-50/20"
                      }`}
                    >
                      <span className="text-xs font-bold text-emerald-950 leading-tight">{opt.label}</span>
                      <span className="text-[10px] text-emerald-600/70 mt-1 leading-snug">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-emerald-900 mb-2">
                  How conservative are your heating and cooling thermostat defaults?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: "eco", label: "Thrifty & Eco", desc: "Wear sweaters (winter 18°C / summer 25°C)" },
                    { key: "moderate", label: "Moderate Standard", desc: "Average level (winter 20°C / summer 22°C)" },
                    { key: "comfort-high", label: "Generous Comfort", desc: "Cozy hot winters / ice cold summers" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => updateField("thermostatSetting", opt.key as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        tempState.thermostatSetting === opt.key 
                          ? "border-emerald-500 bg-emerald-50 shadow-sm outline-2 outline-emerald-500 font-extrabold" 
                          : "border-emerald-100 bg-white hover:border-emerald-250 hover:bg-emerald-50/20"
                      }`}
                    >
                      <span className="text-xs font-bold text-emerald-950 leading-tight">{opt.label}</span>
                      <span className="text-[10px] text-emerald-600/70 mt-1 leading-snug">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-5 border-t border-emerald-100">
              <button
                onClick={() => handleNext("food")}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-emerald-250 hover:bg-emerald-50 text-emerald-800 rounded-xl transition-all font-bold text-xs cursor-pointer active:scale-95"
              >
                <ArrowLeft size={14} />
                Back
              </button>
              <button
                onClick={() => handleNext("shopping")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all font-bold text-xs cursor-pointer shadow-md shadow-emerald-500/10 hover:scale-105 active:scale-95"
              >
                Next (Shopping Habits)
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === "shopping" && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center pb-6 border-b border-emerald-100">
              <div>
                <span className="text-xs font-mono text-emerald-600 tracking-wider font-extrabold uppercase mb-1 block">Category 4 of 4</span>
                <h3 className="text-2xl font-black text-emerald-950 leading-none">Shopping & Waste Management</h3>
              </div>
              <div className="h-4 w-28 bg-emerald-50 rounded-full overflow-hidden p-0.5 border border-emerald-100/50">
                <div className="h-full bg-emerald-500 w-full rounded-full" />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-emerald-900 mb-2">
                  What describes your general household purchasing rate?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: "frugal", label: "Minimalist / Frugal", desc: "Rarely buy toys, new electronics, or clothes" },
                    { key: "moderate", label: "Moderate & Casual", desc: "Replace/upgrade items when broken or requested" },
                    { key: "frequent", label: "Frequent / Avid Shopper", desc: "Enjoy buying trends, fast fashion & direct imports" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => updateField("shoppingFrequency", opt.key as any)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        tempState.shoppingFrequency === opt.key 
                          ? "border-emerald-500 bg-emerald-50 shadow-sm outline-2 outline-emerald-500 font-extrabold" 
                          : "border-emerald-100 bg-white hover:border-emerald-250 hover:bg-emerald-50/20"
                      }`}
                    >
                      <span className="text-xs font-bold text-emerald-950 leading-tight">{opt.label}</span>
                      <span className="text-[10px] text-emerald-600/70 mt-1 leading-snug">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-emerald-900 mb-2">
                  How structured are your household recycling habits?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: "full-separation", label: "Highly Disciplined", desc: "Separate dry paper, plastics, glass, and compost organic pulp" },
                    { key: "basic-recycling", label: "Standard Recycling", desc: "Toss plastics & paper into recycling, but organic pulp as trash" },
                    { key: "minimal", label: "Minimal / Basic", desc: "Almost all waste combined into single standard dumpster" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => updateField("recyclingGrade", opt.key as any)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        tempState.recyclingGrade === opt.key 
                          ? "border-emerald-500 bg-emerald-50 shadow-sm outline-2 outline-emerald-500 font-extrabold" 
                          : "border-emerald-100 bg-white hover:border-emerald-250 hover:bg-emerald-50/20"
                      }`}
                    >
                      <span className="text-xs font-bold text-emerald-950 leading-tight">{opt.label}</span>
                      <span className="text-[10px] text-emerald-600/70 mt-1 leading-snug">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-5 border-t border-emerald-100">
              <button
                onClick={() => handleNext("energy")}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-emerald-250 hover:bg-emerald-50 text-emerald-800 rounded-xl transition-all font-bold text-xs cursor-pointer active:scale-95"
              >
                <ArrowLeft size={14} />
                Back
              </button>
              <button
                onClick={handleFinish}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-650 text-white rounded-xl transition-all font-bold text-xs shadow-md shadow-emerald-500/10 cursor-pointer hover:scale-105 active:scale-95"
              >
                Calculate Results
                <CheckCircle size={15} />
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === "result" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-4"
          >
            <div className="inline-flex p-4 bg-emerald-100 rounded-full text-emerald-800 shadow-md animate-bounce">
              <CheckCircle size={40} />
            </div>
            
            <div>
              <h2 className="text-3xl font-black text-emerald-950 mb-1 tracking-tight">Diagnosis Completed!</h2>
              <p className="text-xs text-emerald-600/80 font-mono font-bold uppercase tracking-wider">Calculation calibrated according to global greenhouse norms.</p>
            </div>

            <div className="bg-emerald-50/80 p-8 rounded-3xl max-w-sm mx-auto border border-emerald-100/60 shadow-inner my-4">
              <span className="text-xs uppercase font-mono tracking-widest text-emerald-800/70 block mb-1 font-bold">Your Total Footprint</span>
              <div className="text-6xl font-black text-emerald-900 leading-none tracking-tighter">
                {totalTonnes} <span className="text-xl font-bold tracking-normal text-emerald-700">tonnes</span>
              </div>
              <span className="text-xs text-emerald-600 font-medium block mt-2">of CO2 equivalent / year ({calculated.total.toLocaleString()} kg)</span>
            </div>

            <p className="text-emerald-900/80 text-sm max-w-md mx-auto leading-relaxed">
              To put this in perspective, {tempState.dietType === "meat-heavy" || tempState.commuteMiles > 150 ? "your patterns exceed standard carbon limits, but represent substantial room for offsets!" : "your footprint lies within clean moderate ranges. Let's find minor changes to reach global quotas!"}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setCurrentStep("intro")}
                className="px-5 py-2.5 border border-emerald-200 hover:bg-emerald-50 text-emerald-800 rounded-xl transition-all font-bold text-xs cursor-pointer"
              >
                Re-diagnose / Tweak Answers
              </button>
              <button
                onClick={() => {
                  onSave({ ...tempState, hasCompleted: true });
                }}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl transition-all text-xs shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 cursor-pointer"
              >
                Enter Eco-Dashboard
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
