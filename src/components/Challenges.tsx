import React from "react";
import { EcoChallenge, EcoBadge } from "../types";
import { motion } from "motion/react";
import { 
  Trophy, Award, Leaf, Compass, ListChecks, 
  BrainCircuit, Bus, Salad, Trash2, Zap, HelpCircle, Flame, CheckCircle, Crosshair
} from "lucide-react";

interface ChallengesProps {
  challenges: EcoChallenge[];
  badges: EcoBadge[];
  onJoinChallenge: (id: string) => void;
  onIncrementChallenge: (id: string) => void;
}

export default function Challenges({ 
  challenges, 
  badges, 
  onJoinChallenge, 
  onIncrementChallenge
}: ChallengesProps) {

  const getBadgeIcon = (id: string, color: string) => {
    switch (id) {
      case "first_steps": return <Compass className={color} size={24} />;
      case "logger_pro": return <ListChecks className={color} size={24} />;
      case "challenge_conqueror": return <Trophy className={color} size={24} />;
      case "ai_advisor_badge": return <BrainCircuit className={color} size={24} />;
      case "heavy_offsetter": return <Leaf className={color} size={24} />;
      default: return <Award className={color} size={24} />;
    }
  };

  const getCategoryColorClass = (category: string) => {
    switch (category) {
      case "transportation": return "from-amber-50 to-amber-100/40 border-amber-200 text-amber-800";
      case "food": return "from-emerald-50 to-emerald-100/40 border-emerald-250 text-emerald-900";
      case "energy": return "from-sky-50 to-sky-100/40 border-sky-200 text-sky-800";
      case "waste": return "from-purple-50 to-purple-100/40 border-purple-200 text-purple-800";
      default: return "from-emerald-50 to-teal-50 border-emerald-200 text-emerald-950";
    }
  };

  const getCategoryBarClass = (category: string) => {
    switch (category) {
      case "transportation": return "bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/10";
      case "food": return "bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/10";
      case "energy": return "bg-sky-500 hover:bg-sky-600 shadow-md shadow-sky-500/10";
      case "waste": return "bg-purple-500 hover:bg-purple-600 shadow-md shadow-purple-500/10";
      default: return "bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/10";
    }
  };

  return (
    <div className="space-y-10 font-sans text-emerald-950">
      
      {/* Introduction */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white rounded-[32px] p-8 sm:p-10 relative overflow-hidden shadow-xl shadow-emerald-950/10">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400/20 rounded-full blur-[80px] pointer-events-none" />
        <span className="text-xs font-mono font-black uppercase tracking-widest text-emerald-200 bg-emerald-100/10 px-3 py-1 rounded-full border border-emerald-200/20 inline-block mb-3">Eco Campaigns</span>
        <h3 className="text-3xl font-black tracking-tight text-white leading-none mb-3">Sustainability Quests</h3>
        <p className="text-emerald-100/80 text-xs sm:text-sm max-w-xl leading-relaxed font-medium">
          Unlock achievements by aligning your routing, diet, and utility setups. Join active challenges to focus on structured goals and accumulate critical badge unlocks in your global achievements wall.
        </p>
      </div>

      {/* Grid of Quests */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase font-mono tracking-wider text-emerald-800/80 bg-emerald-50 px-3 py-1.5 rounded-xl inline-block border border-emerald-100/50">Active Weekly Challenges</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((ch) => {
            const percentage = (ch.currentCount / ch.targetCount) * 100;
            
            return (
              <div 
                key={ch.id}
                className={`bg-white rounded-[24px] border transition-all duration-300 p-6 flex flex-col justify-between overflow-hidden shadow-sm hover:scale-[1.01] hover:shadow-md ${
                  ch.isCompleted 
                    ? "border-emerald-300 bg-emerald-50/10" 
                    : ch.isJoined 
                      ? "border-emerald-500 ring-4 ring-emerald-500/5" 
                      : "border-emerald-100"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-600 font-black">
                      {ch.category} Quest
                    </span>
                    <span className="text-[10px] font-mono font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-150">
                      -{ch.co2SavedPerTick * ch.targetCount} kg CO2e est.
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-emerald-950 flex items-center gap-1.5 leading-snug">
                    {ch.title}
                    {ch.isCompleted && (
                      <CheckCircle className="text-emerald-500 shrink-0" size={18} />
                    )}
                  </h3>
                  <p className="text-xs text-emerald-800/70 mt-1.5 leading-relaxed font-semibold">
                    {ch.description}
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  {/* Joined Progress details */}
                  {ch.isJoined && (
                    <div>
                      <div className="flex justify-between text-[11px] mb-1.5 font-mono font-bold text-emerald-800">
                        <span>Campaign progress</span>
                        <span>{ch.currentCount}/{ch.targetCount} tick {ch.isCompleted ? "Completed" : ""}</span>
                      </div>
                      <div className="h-2.5 bg-emerald-100/50 rounded-full overflow-hidden p-0.5 border border-emerald-100/20">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${getCategoryBarClass(ch.category)}`}
                          style={{ width: `${Math.min(100, percentage)}%` }} 
                        />
                      </div>
                    </div>
                  )}

                  {/* Operational Action Buttons */}
                  {!ch.isJoined ? (
                    <button
                      onClick={() => onJoinChallenge(ch.id)}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer leading-none hover:shadow-md active:scale-95 shadow-md shadow-emerald-500/10"
                    >
                      Join Challenge
                    </button>
                  ) : ch.isCompleted ? (
                    <div className="py-2.5 text-center text-emerald-800 bg-emerald-100 rounded-xl text-xs font-black border border-emerald-200 leading-none shadow-sm uppercase tracking-wider font-mono">
                      ★ Quest Completed!
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onIncrementChallenge(ch.id)}
                        className={`flex-1 py-3 rounded-xl text-xs font-extrabold transition-all text-white cursor-pointer active:scale-95 leading-none flex items-center justify-center gap-1.5 ${getCategoryBarClass(ch.category)}`}
                      >
                        <Crosshair size={14} />
                        {ch.actionVerb}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Badges Trophy Room */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase font-mono tracking-wider text-emerald-800/80 bg-emerald-50 px-3 py-1.5 rounded-xl inline-block border border-emerald-100/50">Unlocked Achievements ({badges.filter(b => b.unlocked).length} / {badges.length})</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {badges.map((bdg) => (
            <div 
              key={bdg.id}
              className={`p-6 rounded-[24px] border text-center transition-all flex flex-col justify-between items-center ${
                bdg.unlocked 
                  ? "bg-white border-emerald-100 shadow-sm shadow-emerald-100/20 hover:shadow-md hover:scale-[1.02]" 
                  : "bg-emerald-50/10 border-emerald-100/40 opacity-60"
              }`}
            >
              <div className="flex flex-col items-center">
                
                {/* Circle Container */}
                <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-3.5 shadow-inner border ${
                  bdg.unlocked 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                    : "bg-emerald-50/20 text-emerald-600/30 border-dashed border-emerald-100"
                }`}>
                  {getBadgeIcon(bdg.id, bdg.unlocked ? "text-emerald-500" : "text-emerald-700/20")}
                </div>

                <h5 className={`text-xs font-black ${bdg.unlocked ? "text-emerald-950" : "text-emerald-950/40"}`}>
                  {bdg.title}
                </h5>
                <p className="text-[10px] text-emerald-800/70 font-semibold leading-relaxed mt-2 max-w-[120px] mx-auto">
                  {bdg.description}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-emerald-50 w-full">
                {bdg.unlocked ? (
                  <span className="text-[9px] font-mono text-emerald-500 font-bold block uppercase tracking-wider">
                    COMPLETED: {bdg.unlockedAt}
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-emerald-700/50 block font-bold leading-tight">
                    REQ: {bdg.requirementText}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
