import React, { useState, useEffect } from "react";
import { FootprintAssessment, LoggedAction, EcoChallenge, EcoBadge } from "./types";
import { 
  DEFAULT_ASSESSMENT, DEFAULT_CHALLENGES, DEFAULT_BADGES, calculateFootprint 
} from "./data/staticData";
import { motion, AnimatePresence } from "motion/react";
import Estimator from "./components/Estimator";
import Dashboard from "./components/Dashboard";
import ActionTracker from "./components/ActionTracker";
import Challenges from "./components/Challenges";
import AiAdvisor from "./components/AiAdvisor";
import { 
  Leaf, LayoutDashboard, ListChecks, Trophy, 
  BrainCircuit, Compass, RefreshCw 
} from "lucide-react";

export default function App() {
  // --- 1. Persistent State Management ---
  const [assessment, setAssessment] = useState<FootprintAssessment>(() => {
    const saved = localStorage.getItem("carbon_footprint_assessment");
    return saved ? JSON.parse(saved) : DEFAULT_ASSESSMENT;
  });

  const [logs, setLogs] = useState<LoggedAction[]>(() => {
    const saved = localStorage.getItem("carbon_footprint_logs");
    return saved ? JSON.parse(saved) : [];
  });

  const [challenges, setChallenges] = useState<EcoChallenge[]>(() => {
    const saved = localStorage.getItem("carbon_footprint_challenges");
    return saved ? JSON.parse(saved) : DEFAULT_CHALLENGES;
  });

  const [badges, setBadges] = useState<EcoBadge[]>(() => {
    const saved = localStorage.getItem("carbon_footprint_badges");
    return saved ? JSON.parse(saved) : DEFAULT_BADGES;
  });

  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Save states to LocalStorage dynamically on change
  useEffect(() => {
    localStorage.setItem("carbon_footprint_assessment", JSON.stringify(assessment));
    // Evaluate initial questionnaire completion badge
    if (assessment.hasCompleted) {
      triggerBadgeUnlock("first_steps");
    }
  }, [assessment]);

  useEffect(() => {
    localStorage.setItem("carbon_footprint_logs", JSON.stringify(logs));
    
    // Evaluate total CO2 offsets saved & total actions logged criteria for badges
    const totalOffset = logs.reduce((sum, item) => sum + item.co2Saved, 0);
    if (logs.length >= 5) {
      triggerBadgeUnlock("logger_pro");
    }
    if (totalOffset >= 50.0) {
      triggerBadgeUnlock("heavy_offsetter");
    }
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("carbon_footprint_challenges", JSON.stringify(challenges));
    
    // Evaluate challenge conqueror badge
    const anyCompleted = challenges.some(c => c.isCompleted);
    if (anyCompleted) {
      triggerBadgeUnlock("challenge_conqueror");
    }
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem("carbon_footprint_badges", JSON.stringify(badges));
  }, [badges]);

  // --- 2. Action Handlers ---
  
  // Trigger specific badge unlock securely
  const triggerBadgeUnlock = (badgeId: string) => {
    setBadges(prevBadges => {
      return prevBadges.map(bg => {
        if (bg.id === badgeId && !bg.unlocked) {
          return {
            ...bg,
            unlocked: true,
            unlockedAt: new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
          };
        }
        return bg;
      });
    });
  };

  // Add a newly checked activity to log
  const handleAddLog = (newAction: Omit<LoggedAction, "id" | "date">) => {
    const freshLog: LoggedAction = {
      ...newAction,
      id: Math.random().toString(),
      date: new Date().toISOString().split("T")[0] // YYYY-MM-DD
    };

    const updatedLogs = [...logs, freshLog];
    setLogs(updatedLogs);

    // If an action corresponds to an active joined quest, progress it!
    setChallenges(prev => 
      prev.map(ch => {
        if (ch.isJoined && !ch.isCompleted) {
          // Check core challenge category matching
          if (ch.category === newAction.category) {
            const nextCount = ch.currentCount + 1;
            const isFinished = nextCount >= ch.targetCount;
            return {
              ...ch,
              currentCount: Math.min(ch.targetCount, nextCount),
              isCompleted: isFinished
            };
          }
        }
        return ch;
      })
    );
  };

  // Remove a log entry
  const handleDeleteLog = (id: string) => {
    setLogs(prev => prev.filter(log => log.id !== id));
  };

  // Join a weekly quest
  const handleJoinChallenge = (challengeId: string) => {
    setChallenges(prev => 
      prev.map(ch => {
        if (ch.id === challengeId) {
          return { ...ch, isJoined: true, joinedAt: new Date().toLocaleDateString() };
        }
        return ch;
      })
    );
  };

  // Manually progress a specific challenge
  const handleIncrementChallenge = (challengeId: string) => {
    setChallenges(prev => 
      prev.map(ch => {
        if (ch.id === challengeId && ch.isJoined && !ch.isCompleted) {
          const nextCount = ch.currentCount + 1;
          const isFinished = nextCount >= ch.targetCount;
          
          if (isFinished) {
            // Give standard completed reward log
            setTimeout(() => {
              handleAddLog({
                actionId: `completed_quest_${ch.id}`,
                title: `Completed Campaign: "${ch.title}"`,
                category: ch.category,
                co2Saved: ch.co2SavedPerTick * ch.targetCount
              });
            }, 100);
          }

          return {
            ...ch,
            currentCount: Math.min(ch.targetCount, nextCount),
            isCompleted: isFinished
          };
        }
        return ch;
      })
    );
  };

  // Triggered when their AI Advisor plan finishes generating
  const handlePlanUnlocked = () => {
    triggerBadgeUnlock("ai_advisor_badge");
  };

  // Restart diagnosis questionnaire
  const handleResetAssessment = () => {
    if (window.confirm("Are you sure you want to reset your emissions diagnostic responses? Your logs and badges will be preserved.")) {
      setAssessment({ ...DEFAULT_ASSESSMENT, hasCompleted: false });
      setActiveTab("dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 text-emerald-950 flex flex-col selection:bg-emerald-200 selection:text-emerald-950 font-sans">
      
      {/* 1. Primary Header Navigation */}
      <header className="bg-white/80 border-b border-emerald-100 sticky top-0 z-45 backdrop-blur-md shadow-sm shadow-emerald-900/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md shadow-emerald-500/20">
              <Leaf size={20} className="text-white" />
            </span>
            <div className="leading-none">
              <h1 className="text-2xl font-black tracking-tight text-emerald-900 leading-none">
                Carbon Aware
              </h1>
              <span className="text-[10px] text-emerald-500/80 font-mono tracking-wider font-bold uppercase">Awareness & Reduction</span>
            </div>
          </div>

          {/* Navigation Links (displayed if questionnaire has completed) */}
          {assessment.hasCompleted && (
            <nav className="flex items-center gap-1 sm:gap-3 font-semibold text-emerald-700/70">
              {[
                { tab: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={14} /> },
                { tab: "tracker", label: "Action Log", icon: <ListChecks size={14} /> },
                { tab: "challenges", label: "Quests", icon: <Trophy size={14} /> },
                { tab: "ai", label: "Eco AI Advisor", icon: <BrainCircuit size={14} /> },
              ].map((item) => (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-2xl transition-all cursor-pointer ${
                    activeTab === item.tab
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                      : "text-emerald-700/70 hover:text-emerald-900 hover:bg-emerald-100/50"
                  }`}
                >
                  {item.icon}
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              ))}
            </nav>
          )}

          {/* Right Indicator (Self Account) */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-805 font-bold">
            <span className="text-emerald-600">Status:</span>
            <span className="text-emerald-600 font-extrabold bg-emerald-100 border-2 border-emerald-200 px-3 py-1 rounded-full uppercase tracking-widest text-[10px]">
              ONLINE
            </span>
          </div>

        </div>
      </header>

      {/* 2. Main Content Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {!assessment.hasCompleted ? (
          
          /* Show step-by-step diagnostic until completed */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-8 max-w-2xl mx-auto">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-2 block">Personal Annual Footprint Coach</span>
              <h1 className="text-4xl sm:text-5xl font-black text-emerald-900 tracking-tight leading-none mb-3">Carbon Footprint Awareness</h1>
              <p className="text-sm text-emerald-700/80 leading-relaxed max-w-xl mx-auto">
                Understand, track, and offset household and travel greenhouse emission points through custom metrics, rewards, quests and real-time interactive AI coaching.
              </p>
            </div>
            
            <Estimator 
              assessment={assessment} 
              onSave={(updated) => setAssessment(updated)} 
            />
          </motion.div>

        ) : (
          
          /* Core Tabs interface */
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="outline-none"
            >
              {activeTab === "dashboard" && (
                <Dashboard 
                  assessment={assessment} 
                  logs={logs}
                  challenges={challenges}
                  badges={badges}
                  onNavigate={(tab) => {
                    setActiveTab(tab);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onResetAssessment={handleResetAssessment}
                />
              )}

              {activeTab === "tracker" && (
                <ActionTracker 
                  logs={logs}
                  onAddLog={handleAddLog}
                  onDeleteLog={handleDeleteLog}
                />
              )}

              {activeTab === "challenges" && (
                <Challenges 
                  challenges={challenges}
                  badges={badges}
                  onJoinChallenge={handleJoinChallenge}
                  onIncrementChallenge={handleIncrementChallenge}
                />
              )}

              {activeTab === "ai" && (
                <AiAdvisor 
                  assessment={assessment}
                  savedCo2={logs.reduce((sum, item) => sum + item.co2Saved, 0)}
                  onPlanGenerated={handlePlanUnlocked}
                />
              )}
            </motion.div>
          </AnimatePresence>

        )}

      </main>

      {/* 3. Footer branding */}
      <footer className="bg-emerald-900 border-t border-emerald-950 py-8 text-center text-xs font-mono text-emerald-100/60 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>
            Carbon Footprint Awareness & Reduction Hub © {new Date().getFullYear()} — Powered by Vibrant Palette
          </span>
          <span className="flex items-center gap-1.5 uppercase tracking-widest text-[9px] text-emerald-400 font-bold bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-800/40">
            Calibrated Greenhouse Gas Protocols
          </span>
        </div>
      </footer>

    </div>
  );
}
