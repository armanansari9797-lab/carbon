import React, { useState } from "react";
import { LoggedAction, PresetAction } from "../types";
import { PRESET_ACTIONS } from "../data/staticData";
import { motion } from "motion/react";
import { 
  Bus, Salad, Wind, Droplets, ZapOff, Trash2, 
  ShoppingBag, Thermometer, Plus, Calendar, Leaf, CheckCircle
} from "lucide-react";

interface ActionTrackerProps {
  logs: LoggedAction[];
  onAddLog: (action: Omit<LoggedAction, "id" | "date">) => void;
  onDeleteLog: (id: string) => void;
}

export default function ActionTracker({ logs, onAddLog, onDeleteLog }: ActionTrackerProps) {
  const [customTitle, setCustomTitle] = useState("");
  const [customCo2, setCustomCo2] = useState("1.0");
  const [customCategory, setCustomCategory] = useState<"transportation" | "food" | "energy" | "waste">("food");
  const [logNotification, setLogNotification] = useState<string | null>(null);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "transportation": return <Bus size={18} />;
      case "food": return <Salad size={18} />;
      case "energy": return <Wind size={18} />;
      case "waste": return <ShoppingBag size={18} />;
      default: return <Leaf size={18} />;
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "transportation": return "bg-amber-100 text-amber-800 border-amber-200";
      case "food": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "energy": return "bg-sky-100 text-sky-800 border-sky-200";
      case "waste": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-emerald-100 text-emerald-800 border-emerald-250";
    }
  };

  const handleLogPreset = (preset: PresetAction) => {
    onAddLog({
      actionId: preset.id,
      title: preset.title,
      category: preset.category,
      co2Saved: preset.co2Saved
    });

    setLogNotification(`Logged: "${preset.title}" (Saved ${preset.co2Saved} kg CO2e)`);
    setTimeout(() => setLogNotification(null), 3000);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const numericCo2 = parseFloat(customCo2) || 1.0;
    onAddLog({
      actionId: "custom",
      title: customTitle.trim(),
      category: customCategory,
      co2Saved: numericCo2
    });

    setLogNotification(`Custom Action Logged: "${customTitle.trim()}" (saved ${numericCo2} kg CO2e)`);
    setCustomTitle("");
    setCustomCo2("1.0");

    setTimeout(() => setLogNotification(null), 3000);
  };

  // Sort logs: latest first
  const latestLogs = [...logs].reverse();
  const totalOffsetSaved = logs.reduce((sum, item) => sum + item.co2Saved, 0);

  return (
    <div className="space-y-8 font-sans text-emerald-950">
      
      {/* Dynamic Toast Notification for visual feedback */}
      {logNotification && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-emerald-950 border border-emerald-800 text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 z-50 text-xs font-black tracking-wide"
        >
          <CheckCircle className="text-emerald-400" size={16} />
          <span>{logNotification}</span>
        </motion.div>
      )}

      {/* 1. Introductory Ticker */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 rounded-3xl p-8 border border-emerald-100 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-sm">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-mono font-black text-emerald-600 uppercase tracking-widest bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200">Action Console</span>
          <h3 className="text-2xl font-black text-emerald-950 leading-tight">Offset Micro Habits</h3>
          <p className="text-xs text-emerald-850/80 max-w-lg leading-relaxed font-medium">
            Perform green micro habits in your everyday schedule (such as walking, vegetarian meals, or temperature regulation) and check them off here to calculate your real-time CO2 savings.
          </p>
        </div>
        <div className="text-center sm:text-right bg-white py-4 px-6 rounded-[24px] border border-emerald-100 shadow-md shadow-emerald-900/5">
          <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-650 block font-black mb-1">Accumulated Offsets</span>
          <span className="text-3xl font-mono font-black text-emerald-600 leading-none">{totalOffsetSaved.toFixed(1)} kg</span>
          <span className="text-[10px] text-emerald-500 font-semibold block mt-1.5">CO2 avoided</span>
        </div>
      </div>

      {/* 2. Logging Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Preset list & quick checks (Covers 2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-xs font-black uppercase font-mono tracking-wider text-emerald-800/80 bg-emerald-50 px-3 py-1.5 rounded-xl inline-block border border-emerald-100/50">Quick-Log Preset Actions</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PRESET_ACTIONS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleLogPreset(preset)}
                className="bg-white p-5 rounded-2xl border border-emerald-100 transition-all duration-300 hover:border-emerald-400 hover:shadow-lg hover:scale-[1.02] text-left flex flex-col justify-between h-[135px] group cursor-pointer"
              >
                <div className="flex gap-3 items-start">
                  <span className={`p-2.5 rounded-xl border ${getCategoryStyle(preset.category)}`}>
                    {getCategoryIcon(preset.category)}
                  </span>
                  <div className="leading-tight">
                    <span className="text-sm font-black text-emerald-950 block">{preset.title}</span>
                    <span className="text-[10px] text-emerald-600/80 line-clamp-2 leading-relaxed mt-1 block font-medium">{preset.description}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center w-full mt-2 pt-2 border-t border-emerald-50">
                  <span className="text-xs font-mono text-emerald-700 bg-emerald-100/60 px-3 py-0.5 rounded-xl font-black border border-emerald-150">
                    -{preset.co2Saved} kg CO2e
                  </span>
                  <span className="text-[10px] text-emerald-500 group-hover:text-emerald-700 font-black flex items-center gap-0.5 transition-all uppercase tracking-wider">
                    + Log Action 
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Actions form */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase font-mono tracking-wider text-emerald-800/80 bg-emerald-50 px-3 py-1.5 rounded-xl inline-block border border-emerald-100/50">Log a Custom Action</h4>
          
          <form onSubmit={handleCustomSubmit} className="bg-white rounded-3xl p-6 border border-emerald-100 space-y-4 shadow-sm">
            
            {/* Title INPUT */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-emerald-900">
                Action description / Title
              </label>
              <input
                type="text"
                placeholder="e.g. Carpooled with friends, Shared leftovers"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                maxLength={45}
                className="w-full text-xs p-3 rounded-xl border border-emerald-100 bg-emerald-50/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-950 font-sans font-semibold placeholder-emerald-600/40"
              />
            </div>

            {/* Approximate Carbon savings slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-emerald-900">
                  Approx carbon offset
                </label>
                <span className="text-xs font-mono font-black text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-lg border border-emerald-150">
                  {customCo2} kg CO2e
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="15.0"
                step="0.1"
                value={customCo2}
                onChange={(e) => setCustomCo2(e.target.value)}
                className="w-full accent-emerald-500 h-2 bg-emerald-100 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-emerald-600 font-mono mt-0.5 font-bold">
                <span>0.1 kg (low)</span>
                <span>5.0 kg (mid)</span>
                <span>15 kg (high)</span>
              </div>
            </div>

            {/* Category Select Radio Groups */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-emerald-900">
                Primary Category
              </label>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {[
                  { value: "food", label: "Diet & Food" },
                  { value: "transportation", label: "Transportation" },
                  { value: "energy", label: "Energy" },
                  { value: "waste", label: "Waste" },
                ].map((catOpt) => (
                  <label
                    key={catOpt.value}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                      customCategory === catOpt.value 
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-black" 
                        : "border-emerald-100 bg-white text-emerald-700 hover:bg-emerald-50/40 font-bold"
                    }`}
                  >
                    <input
                      type="radio"
                      name="customCategory"
                      value={catOpt.value}
                      checked={customCategory === catOpt.value}
                      onChange={() => setCustomCategory(catOpt.value as any)}
                      className="sr-only" // Screen-reader-only
                    />
                    {getCategoryIcon(catOpt.value)}
                    {catOpt.label}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!customTitle.trim()}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-100 disabled:text-emerald-400 disabled:cursor-not-allowed text-white font-extrabold rounded-xl text-xs leading-none transition-all cursor-pointer shadow-md shadow-emerald-500/10 hover:scale-[1.02] active:scale-95"
            >
              Log Custom Offset
            </button>
            
          </form>
        </div>
      </div>

      {/* 3. Historical logs timeline (Latest first) */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase font-mono tracking-wider text-emerald-800/80 bg-emerald-50 px-3 py-1.5 rounded-xl inline-block border border-emerald-100/50">Activity & Savings History</h4>
        
        {logs.length === 0 ? (
          <div className="bg-white rounded-3xl py-12 text-center border-2 border-dashed border-emerald-100">
            <Calendar className="text-emerald-200 mx-auto mb-2" size={36} />
            <span className="text-sm font-bold text-emerald-900 block">No saving activities logged yet</span>
            <span className="text-xs text-emerald-600/70">Logs will be grouped here in real-time.</span>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-emerald-100 divide-y divide-emerald-50 overflow-hidden max-h-[440px] overflow-y-auto shadow-sm">
            {latestLogs.map((log) => (
              <div 
                key={log.id} 
                className="p-4 flex items-center justify-between hover:bg-emerald-50/35 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className={`p-2.5 rounded-xl border ${getCategoryStyle(log.category)}`}>
                    {getCategoryIcon(log.category)}
                  </span>
                  <div>
                    <span className="text-sm font-extrabold text-emerald-950 block leading-tight">{log.title}</span>
                    <span className="text-[10px] text-emerald-600 font-mono uppercase tracking-widest font-bold">
                      {log.category} • {log.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono font-black text-emerald-800 bg-emerald-50 py-0.5 px-2.5 rounded-lg border border-emerald-100">
                    -{log.co2Saved.toFixed(1)} kg CO2e
                  </span>
                  <button
                    onClick={() => onDeleteLog(log.id)}
                    title="Remove item"
                    className="p-2 text-emerald-600/50 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
