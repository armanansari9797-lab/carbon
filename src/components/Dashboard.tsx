import React from "react";
import { FootprintAssessment, LoggedAction, EcoChallenge, EcoBadge } from "../types";
import { calculateFootprint } from "../data/staticData";
import { motion } from "motion/react";
import { 
  Leaf, ArrowRight, Award, Trophy, Bus, Salad, 
  Tv, Trash2, Calendar, Sparkles, TrendingDown, RefreshCw, Zap
} from "lucide-react";

interface DashboardProps {
  assessment: FootprintAssessment;
  logs: LoggedAction[];
  challenges: EcoChallenge[];
  badges: EcoBadge[];
  onNavigate: (tab: string) => void;
  onResetAssessment: () => void;
}

export default function Dashboard({ 
  assessment, 
  logs, 
  challenges, 
  badges, 
  onNavigate,
  onResetAssessment 
}: DashboardProps) {
  
  // Calculate current emissions profile
  const metrics = calculateFootprint(assessment);
  const totalTonnes = (metrics.total / 1000).toFixed(1);

  // Total saved CO2 so far from logged actions
  const totalSavedKg = logs.reduce((sum, log) => sum + log.co2Saved, 0);
  
  // Completed challenges count
  const completedChallengesCount = challenges.filter(c => c.isCompleted).length;
  
  // Active/Joined challenges
  const activeChallenges = challenges.filter(c => c.isJoined && !c.isCompleted);
  
  // Unlocked badges
  const unlockedBadgesCount = badges.filter(b => b.unlocked).length;

  // Pie chart parameters
  const categories = [
    { label: "Transportation", value: metrics.transportation, color: "bg-amber-500", svgColor: "#f59e0b", icon: <Bus size={14} /> },
    { label: "Diet & Food", value: metrics.food, color: "bg-emerald-600", svgColor: "#059669", icon: <Salad size={14} /> },
    { label: "Home Energy", value: metrics.energy, color: "bg-sky-500", svgColor: "#0ea5e9", icon: <Zap size={14} /> },
    { label: "Consumption & Waste", value: metrics.spending, color: "bg-purple-500", svgColor: "#a855f7", icon: <Trash2 size={14} /> },
  ];

  const totalValue = metrics.total || 1;

  // Quick climate recommendations based on highest carbon contributor
  const sortedCategories = [...categories].sort((a, b) => b.value - a.value);
  const primaryCulprit = sortedCategories[0];

  return (
    <div className="space-y-8 font-sans text-emerald-950">
      
      {/* 1. Header Banner & High Impact Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Footprint Hero Card */}
        <div className="lg:col-span-2 bg-white rounded-[40px] p-8 sm:p-10 relative overflow-hidden shadow-2xl shadow-emerald-900/10 flex flex-col justify-between min-h-[260px] border border-emerald-100/60">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 right-10 w-48 h-48 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-2">Annual Footprint</p>
              <h2 className="text-3xl font-black mt-1 tracking-tight text-emerald-900">Your Carbon Metric Overview</h2>
            </div>
            <button 
              onClick={onResetAssessment}
              title="Recalculate Assessment"
              className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-2xl transition-all border border-emerald-150 text-emerald-700 hover:text-emerald-900 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="my-6 z-10">
            <h2 className="text-7xl font-black leading-tight text-emerald-900 tracking-tight">
              {totalTonnes} <span className="text-2xl font-semibold text-emerald-400">tonnes CO2e / Year</span>
            </h2>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-600 rounded-full font-bold text-xs mt-3 select-none">
              <span>↑ {((primaryCulprit.value / totalValue) * 100).toFixed(0)}% from {primaryCulprit.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-emerald-100 text-emerald-800/80 text-xs font-bold font-mono">
            <span>Primary Reduction Avenue:</span>
            <span className="text-emerald-500 font-black uppercase">{primaryCulprit.label}</span>
          </div>
        </div>

        {/* Global Standings Box */}
        <div className="bg-emerald-50 rounded-[40px] p-8 border border-emerald-100/80 flex flex-col justify-between shadow-lg shadow-emerald-900/5">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 block">Comparison Statistics</span>
            <h3 className="text-xl font-black text-emerald-900 mt-1 mb-5">How You Stack Up</h3>
            
            <div className="space-y-4">
              {/* User Standing Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-bold">
                  <span className="text-emerald-900">Your Index</span>
                  <span className="text-emerald-600 font-black">{totalTonnes} t</span>
                </div>
                <div className="w-full h-6 bg-white rounded-full overflow-hidden p-1 border border-emerald-100">
                  <div 
                    className="h-full bg-emerald-500 rounded-full shadow-sm transition-all duration-500" 
                    style={{ width: `${Math.min(100, (metrics.total / 16000) * 100)}%` }} 
                  />
                </div>
              </div>

              {/* National Standard */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-bold text-emerald-700/60">
                  <span>US Average</span>
                  <span>16.0 t</span>
                </div>
                <div className="w-full h-4 bg-white/50 rounded-full overflow-hidden p-0.5 border border-emerald-100/40">
                  <div className="h-full bg-amber-400 rounded-full w-[100%]" />
                </div>
              </div>

              {/* Target Sustainable */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-bold text-emerald-700/60">
                  <span>UN Paris Goal</span>
                  <span className="text-emerald-600 font-extrabold">2.0 t</span>
                </div>
                <div className="w-full h-4 bg-white/50 rounded-full overflow-hidden p-0.5 border border-emerald-100/40">
                  <div className="h-full bg-sky-400 rounded-full w-[12.5%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-emerald-200/50 text-xs text-emerald-900/80 italic leading-relaxed">
            {metrics.total < 4500 ? (
              <span className="text-emerald-600 font-bold block">"Outstanding, Alex! You are safely within the sustainable global threshold framework."</span>
            ) : metrics.total < 16000 ? (
              <span className="text-emerald-800 block">"You and 78% of people in Seattle sit safely below the national high. Maintain the trend!"</span>
            ) : (
              <span className="text-rose-600 font-bold block">"Note: emissions currently exceed US averages. Join basic quests below to start offsetting today."</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Offset Metrics Ticker & Micro Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-emerald-500 rounded-[30px] p-6 text-white relative overflow-hidden group shadow-lg shadow-emerald-500/10 flex flex-col justify-between min-h-[140px]">
          <div className="absolute -bottom-4 -right-4 text-7xl opacity-15 select-none font-sans">🥗</div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">Daily Offsets</p>
          <div>
            <h4 className="text-3xl font-black font-mono leading-none">
              {totalSavedKg.toFixed(1)} <span className="text-base font-medium">kg</span>
            </h4>
            <p className="text-[10px] text-emerald-100/80 mt-1">Validated emission shaving</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-amber-400 rounded-[30px] p-6 text-amber-950 relative overflow-hidden group shadow-lg shadow-amber-400/10 flex flex-col justify-between min-h-[140px]">
          <div className="absolute -bottom-4 -right-4 text-7xl opacity-15 select-none font-sans">🌿</div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-900/80">Quests Won</p>
          <div>
            <h4 className="text-3xl font-black font-mono leading-none">
              {completedChallengesCount} <span className="text-base font-medium">/ {challenges.length}</span>
            </h4>
            <p className="text-[10px] text-amber-900/70 mt-1">Community challenges met</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-sky-450 bg-sky-400 rounded-[30px] p-6 text-white relative overflow-hidden group shadow-lg shadow-sky-400/10 flex flex-col justify-between min-h-[140px]">
          <div className="absolute -bottom-4 -right-4 text-7xl opacity-15 select-none font-sans">🏆</div>
          <p className="text-xs font-bold uppercase tracking-widest text-sky-100">Unlocked Badges</p>
          <div>
            <h4 className="text-3xl font-black font-mono leading-none">
              {unlockedBadgesCount} <span className="text-base font-medium">unlocked</span>
            </h4>
            <p className="text-[10px] text-sky-100/80 mt-1">Platform milestones earned</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-purple-500 rounded-[30px] p-6 text-white relative overflow-hidden group shadow-lg shadow-purple-500/10 flex flex-col justify-between min-h-[140px]">
          <div className="absolute -bottom-4 -right-4 text-7xl opacity-15 select-none font-sans">⚡</div>
          <p className="text-xs font-bold uppercase tracking-widest text-purple-100">Adherence Streak</p>
          <div>
            <h4 className="text-3xl font-black font-mono leading-none">
              {logs.length > 0 ? Math.min(30, Math.ceil(logs.length / 1.5)) : 0} <span className="text-base font-medium">days</span>
            </h4>
            <p className="text-[10px] text-purple-100/80 mt-1">Consecutive activity logs</p>
          </div>
        </div>
      </div>

      {/* 3. Visual Breakdown & Category Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Category breakdown List & Custom Local SVG Chart */}
        <div className="lg:col-span-3 bg-white rounded-[40px] p-8 border border-emerald-100 flex flex-col justify-between shadow-xl shadow-emerald-900/5">
          <div>
            <h3 className="text-2xl font-black text-emerald-900 mb-1">Source Breakdown</h3>
            <p className="text-xs text-emerald-600/70 mb-8 font-mono font-bold uppercase tracking-wider">Normalized to Yearly Tonnes (kg CO2e)</p>
 
            {/* Custom SVG Bar breakdown chart */}
            <div className="grid grid-cols-4 gap-6">
              {categories.map((cat, idx) => {
                const percentage = (cat.value / totalValue) * 100;
                
                // Color mapping styles
                let barBg = "bg-emerald-500";
                let capBg = "bg-emerald-100";
                if (cat.label.includes("Diet")) { barBg = "bg-rose-450 bg-rose-400"; capBg = "bg-rose-50"; }
                else if (cat.label.includes("Energy")) { barBg = "bg-amber-400"; capBg = "bg-amber-50"; }
                else if (cat.label.includes("Waste")) { barBg = "bg-sky-400"; capBg = "bg-sky-50"; }

                return (
                  <div key={idx} className="flex flex-col items-center gap-3">
                    <div className={`w-full h-40 ${capBg} rounded-[24px] flex items-end p-2 border border-emerald-100/30 overflow-hidden`}>
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(5, percentage)}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`w-full ${barBg} rounded-[16px] shadow-sm`}
                      />
                    </div>
                    <div className="text-center">
                      <span className="font-extrabold text-xs text-emerald-950 block">{cat.label.split(" ")[0]}</span>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold block">{(cat.value / 1000).toFixed(1)}t ({percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex gap-4 items-center p-5 bg-emerald-50 rounded-3xl border border-emerald-100 shadow-inner">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-xl shrink-0 select-none">💡</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-900 leading-tight">
                Top Recommendation Insight: <span className="font-semibold text-emerald-750">Switching {primaryCulprit.label.toLowerCase()} can unlock up to 32% offsets. Ask our Eco Advisor.</span>
              </p>
            </div>
            <button 
              onClick={() => onNavigate("ai")}
              className="text-xs flex items-center gap-1.5 text-white bg-emerald-500 hover:bg-emerald-600 py-2.5 px-4 rounded-xl font-bold transition-all cursor-pointer shadow-md shadow-emerald-500/10 active:scale-95"
            >
              Consult AI
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Dynamic customized recommendation module */}
        <div className="lg:col-span-2 bg-emerald-50 rounded-[40px] p-8 border border-emerald-100/80 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-emerald-600 animate-pulse" size={18} />
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 font-mono">Suggested Micro Habit</h4>
            </div>
            <h3 className="text-2xl font-black text-emerald-900 mb-3">Targeting: {primaryCulprit.label}</h3>
            
            <p className="text-emerald-850 text-xs sm:text-sm leading-relaxed mb-5">
              Because <strong>{primaryCulprit.label}</strong> makes up {((primaryCulprit.value / totalValue) * 100).toFixed(0)}% of your footprint, focusing small daily actions here saves more carbon than standard lifestyle shifts. Let's start with these:
            </p>

            <ul className="space-y-4 text-xs font-medium text-emerald-900/90 leading-relaxed bg-white/50 p-4 rounded-2xl border border-emerald-100">
              {primaryCulprit.label === "Transportation" && (
                <>
                  <li className="flex gap-2 items-start">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span><strong>Commuting Options:</strong> Walk, bike, or ride public transit twice a week to reduce up to ~340 kg CO2e yearly.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span><strong>Eco Driving:</strong> Constant highway speeds and progressive deceleration boosts mileage savings instantly.</span>
                  </li>
                </>
              )}
              {primaryCulprit.label === "Diet & Food" && (
                <>
                  <li className="flex gap-2 items-start">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span><strong>Veggie Focus:</strong> Substituting meat protein for local organic lentils or beans once weekly saves over ~180 kg CO2e.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span><strong>Produce Preservation:</strong> Aligning fresh meals before deterioration avoids organic home waste.</span>
                  </li>
                </>
              )}
              {primaryCulprit.label === "Home Energy" && (
                <>
                  <li className="flex gap-2 items-start">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span><strong>Thermostat Optimization:</strong> Lowering baseline heat by 1.5°C during sleep hours trims 5% off utility bills.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span><strong>Dryer Bypass:</strong> Line drying heavy laundry eliminates excessive grid electricity cycles.</span>
                  </li>
                </>
              )}
              {primaryCulprit.label === "Consumption & Waste" && (
                <>
                  <li className="flex gap-2 items-start">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span><strong>Secondhand Loop:</strong> Prefer reusable materials and clothing swaps over brand-new fast manufacturing line purchases.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span><strong>Sort Assurance:</strong> Properly clean plastics and food residue to guarantee successful municipal sorting.</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => onNavigate("tracker")}
              className="flex-1 text-center text-xs font-black py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-95"
            >
              Log Shaving Actions
            </button>
            <button 
              onClick={() => onNavigate("challenges")}
              className="flex-1 text-center text-xs font-black py-3 px-4 bg-white hover:bg-emerald-100/30 border-2 border-emerald-200 text-emerald-800 rounded-2xl transition-all cursor-pointer active:scale-95"
            >
              Weekly Quests
            </button>
          </div>
        </div>
      </div>

      {/* 4. Active Challenges Progress Bar */}
      {activeChallenges.length > 0 && (
        <div className="bg-white rounded-[40px] p-8 border border-emerald-100 shadow-xl shadow-emerald-900/5">
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-500 mb-4 font-mono">Active Joined Campaigns ({activeChallenges.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {activeChallenges.map((ch, idx) => {
              const chPercentage = (ch.currentCount / ch.targetCount) * 100;
              return (
                <div key={idx} className="bg-emerald-50/55 p-6 rounded-3xl border border-emerald-100 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div>
                      <h4 className="text-base font-black text-emerald-900">{ch.title}</h4>
                      <p className="text-xs text-emerald-700/80 mt-0.5">{ch.description}</p>
                    </div>
                    <span className="text-[11px] font-mono font-bold px-3 py-1 bg-emerald-100 border border-emerald-200 text-emerald-805 rounded-xl block shrink-0">
                      {ch.currentCount} / {ch.targetCount}
                    </span>
                  </div>
                  <div className="w-full h-5 bg-white rounded-full overflow-hidden p-1 border border-emerald-100 mt-4">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${chPercentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
