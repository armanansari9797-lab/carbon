import React, { useState, useRef, useEffect } from "react";
import { FootprintAssessment, ChatMessage } from "../types";
import { motion } from "motion/react";
import Markdown from "react-markdown";
import { 
  Sparkles, BrainCircuit, Send, RefreshCw, User, 
  HelpCircle, ArrowRight, BookOpen, ShieldAlert, Loader
} from "lucide-react";

interface AiAdvisorProps {
  assessment: FootprintAssessment;
  savedCo2: number;
  onPlanGenerated: () => void; // Triggered when plan is fetched (for Badge unlocks)
}

export default function AiAdvisor({ assessment, savedCo2, onPlanGenerated }: AiAdvisorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am your AI Climate & Sustainability Coach. I can analyze your custom diagnostic answers, suggest high-impact carbon offsets, or answer questions you have about recyclables, heat-pump optimization, green tariffs, and diet. \n\nClick **\"Generate Custom Clean Plan\"** below to get a full science-backed strategic path, or ask me any question directly!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  
  const [analysisPlan, setAnalysisPlan] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [activeSegment, setActiveSegment] = useState<"coach" | "plan">("coach");
  const [loadingTipIndex, setLoadingTipIndex] = useState(0);

  const endOfChatRef = useRef<HTMLDivElement>(null);

  const ecoLoadingTips = [
    "Analyzing transportation commute grids...",
    "Calibrating diet-protein carbon equivalents...",
    "Sourcing green energy grid offsets...",
    "Weighing local organic grocery indices...",
    "Reviewing household heating thermal efficiencies...",
    "Formatting custom weekly eco campaigns..."
  ];

  // Rotate loading tips during Gemini generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (planLoading || chatLoading) {
      interval = setInterval(() => {
        setLoadingTipIndex(prev => (prev + 1) % ecoLoadingTips.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [planLoading, chatLoading]);

  // Scroll chat to bottom when messages update
  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Request Personalized Carbon Reduction Plan
  const handleGeneratePlan = async () => {
    setPlanLoading(true);
    setAnalysisPlan(null);
    setActiveSegment("plan");
    setLoadingTipIndex(0);

    try {
      const response = await fetch("/api/gemini/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment, savedCo2 })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server failed to bundle emissions plan.");
      }

      const data = await response.json();
      setAnalysisPlan(data.plan);
      onPlanGenerated(); // Unlock badge
    } catch (err: any) {
      console.error(err);
      setAnalysisPlan(`### ⚠ Strategy Generation Failed\n\nCould not fetch customized insights: ${err.message}. Please verify your server connection and that your \`GEMINI_API_KEY\` is registered in the Secrets panel.`);
    } finally {
      setPlanLoading(false);
    }
  };

  // Submit Interactive Chat message
  const handleSendChat = async (textToSend?: string) => {
    const rawText = textToSend || inputMessage;
    if (!rawText.trim() || chatLoading) return;

    if (!textToSend) {
      setInputMessage("");
    }

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: rawText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setChatLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          assessment 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "API Route failed.");
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: "assistant",
        content: `### ⚠ Connectivity Issue\n\nI failed to fetch a response from the coach server: **${err.message}**. Ensure your server dev pipeline is running containing \`GEMINI_API_KEY\`.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const PROMPT_CHIPS = [
    "Should I buy glass or plastic?",
    "Suggest simple organic snack swaps.",
    "Draft 3 low-carbon travel hacks.",
    "Are heat pumps worth it compared to gas?"
  ];

  return (
    <div className="space-y-6 font-sans text-emerald-950">
      
      {/* Upper Selector tabs */}
      <div className="flex border-b border-emerald-100 bg-emerald-50/20 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveSegment("coach")}
          className={`flex-1 py-3 px-6 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeSegment === "coach" 
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10 font-black" 
              : "text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50/40"
          }`}
        >
          Coach Interactive Chat
        </button>
        <button
          onClick={() => {
            setActiveSegment("plan");
            if (!analysisPlan && !planLoading) {
              handleGeneratePlan();
            }
          }}
          className={`flex-1 py-3 px-6 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSegment === "plan" 
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10 font-black" 
              : "text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50/40"
          }`}
        >
          <BrainCircuit size={15} />
          Tailored Reduction Strategy
        </button>
      </div>

      {/* Main active segment screen */}
      {activeSegment === "coach" ? (
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px]">
          
          {/* Main Chat Box - Covers 3 Columns */}
          <div className="lg:col-span-3 bg-emerald-50/20 rounded-3xl border border-emerald-100 flex flex-col justify-between h-[520px] overflow-hidden shadow-sm">
            
            {/* Header Status */}
            <div className="bg-white p-3.5 border-b border-emerald-100 flex items-center justify-between text-xs font-mono px-5">
              <span className="flex items-center gap-1.5 text-emerald-800 font-extrabold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Sustainability Advisor
              </span>
              <span className="text-emerald-600/70 font-bold uppercase tracking-wider text-[10px]">Context: Calibrated</span>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((m) => (
                <div 
                  key={m.id} 
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-[24px] p-5 text-xs sm:text-sm shadow-sm ${
                    m.role === "user" 
                      ? "bg-emerald-950 text-white rounded-br-none" 
                      : "bg-white border border-emerald-100 rounded-bl-none text-emerald-950"
                  }`}>
                    
                    {/* Role Icon Row */}
                    <div className={`flex items-center gap-2 mb-2 pb-1.5 text-[10px] font-mono select-none border-b ${
                      m.role === "user" ? "border-emerald-900 text-emerald-300" : "border-emerald-50 text-emerald-600 font-bold"
                    }`}>
                      {m.role === "user" ? (
                        <>
                          <User size={12} className="text-emerald-300" />
                          <span>You ({m.timestamp})</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} className="text-emerald-500" />
                          <span>Eco Coach ({m.timestamp})</span>
                        </>
                      )}
                    </div>

                    {/* Markdown rendering wrappers with specific child alignments */}
                    <div className={`markdown-body space-y-2 [&>h1]:text-base [&>h1]:font-black [&>h1]:mt-4 [&>h2]:text-sm [&>h2]:font-bold [&>h2]:mt-3 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1 [&>li]:leading-normal [&>strong]:font-black border-none bg-transparent ${m.role === "user" ? "[&>strong]:text-white" : "[&>strong]:text-emerald-950"}`}>
                      <Markdown>{m.content}</Markdown>
                    </div>

                  </div>
                </div>
              ))}
              
              {/* Spinning status for loading */}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-emerald-100 rounded-[20px] rounded-bl-none p-4 max-w-[85%] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 font-black">
                      <Loader className="animate-spin text-emerald-500" size={13} />
                      <span>{ecoLoadingTips[loadingTipIndex]}</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={endOfChatRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="p-3 bg-white border-t border-emerald-100 overflow-x-auto whitespace-nowrap flex gap-2 no-scrollbar px-4">
              {PROMPT_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChat(chip)}
                  disabled={chatLoading}
                  className="inline-block text-[11px] font-black border border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 px-3.5 py-1.5 rounded-full transition-all text-emerald-800 cursor-pointer disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Text input footer form */}
            <div className="bg-white p-3 border-t border-emerald-100 px-4">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask any sustainability or action-shaving question..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={chatLoading}
                  className="flex-1 text-xs p-3.5 rounded-xl border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50/20 text-emerald-950 font-semibold placeholder-emerald-600/40"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || chatLoading}
                  className="p-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-100 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 hover:scale-105 active:scale-95"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>

          </div>

          {/* Quick-Help sidebar info box - 1 Column */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 flex flex-col justify-between h-[520px] shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-emerald-50 pb-3">
                <BookOpen className="text-emerald-500 animate-pulse" size={18} />
                <h4 className="text-xs font-black uppercase tracking-wider font-mono text-emerald-800">Eco-Guidance</h4>
              </div>
              <p className="text-xs text-emerald-950 font-semibold leading-relaxed">
                The Coach integrates details from your diagnostic assessment (such as driving mileage, dietary styles, and house thermal setups) to construct precise responses.
              </p>
              
              <div className="space-y-2 pt-2 bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100 text-[11px] text-emerald-800 font-mono font-bold leading-relaxed">
                <span className="font-extrabold text-emerald-950 uppercase tracking-wider block text-[10px]">Prompt Suggestions:</span>
                <ul className="list-disc pl-4 space-y-1.5">
                  <li>"Is a gas heating fuel worth swapping now?"</li>
                  <li>"Draft a 1-week vegan shopping budget."</li>
                  <li>"Explain eco-friendly travel options."</li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleGeneratePlan}
              className="w-full py-4.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10 hover:scale-105 active:scale-95 transition-all text-center leading-none"
            >
              <BrainCircuit size={15} />
              Generate Strategy Plan
            </button>
          </div>

        </div>

      ) : (
        
        /* Strat analysis display page */
        <div className="bg-white rounded-3xl p-8 border border-emerald-100 min-h-[500px] shadow-sm">
          
          {planLoading ? (
            
            <div className="text-center py-20 space-y-5">
              <div className="relative inline-block">
                <Loader className="animate-spin text-emerald-600 mx-auto" size={42} />
                <Sparkles className="absolute top-0 right-[-10px] text-amber-500 animate-pulse" size={14} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-emerald-950">Formulating custom blueprint...</h3>
                <p className="text-xs text-emerald-600/70 font-mono font-bold">{ecoLoadingTips[loadingTipIndex]}</p>
              </div>
            </div>

          ) : analysisPlan ? (
            
            <div className="space-y-6">
              
              <div className="flex justify-between items-center border-b border-emerald-100 pb-5">
                <div className="flex items-center gap-3">
                  <BrainCircuit className="text-emerald-500" size={24} />
                  <div>
                    <h3 className="text-lg font-black text-emerald-950 leading-tight">Custom Carbon Clean Plan</h3>
                    <span className="text-[10px] text-emerald-600/70 font-mono uppercase tracking-widest font-bold">Generative Intelligence Blueprint</span>
                  </div>
                </div>
                <button
                  onClick={handleGeneratePlan}
                  className="text-xs font-black flex items-center gap-1.5 py-1.5 px-3 border border-emerald-250 hover:bg-emerald-50 rounded-xl text-emerald-700 cursor-pointer"
                >
                  <RefreshCw size={12} />
                  Re-evaluate Plan
                </button>
              </div>

              {/* Wrapped formatted generative text */}
              <div className="markdown-body text-xs sm:text-sm text-emerald-950 space-y-4 leading-relaxed antialiased [&>h1]:text-lg [&>h1]:font-black [&>h1]:text-emerald-950 [&>h1]:mt-6 [&>h1]:border-b [&>h1]:border-emerald-100 [&>h1]:pb-1.5 [&>h2]:text-base [&>h2]:font-bold [&>h2]:text-emerald-950 [&>h2]:mt-5 [&>h3]:text-sm [&>h3]:font-bold [&>h3]:text-emerald-950 [&>h3]:mt-4 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1.5 [&>li]:leading-normal [&>strong]:font-black [&>blockquote]:border-l-4 [&>blockquote]:border-emerald-400 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:bg-emerald-50/50 [&>blockquote]:py-2 [&>blockquote]:rounded-r-xl font-medium">
                <Markdown>{analysisPlan}</Markdown>
              </div>

            </div>

          ) : (
            
            <div className="text-center py-20 max-w-md mx-auto space-y-5">
              <BrainCircuit className="text-emerald-200 mx-auto animate-bounce" size={48} />
              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-emerald-950">Strategic action footprint plan</h3>
                <p className="text-xs text-emerald-700/80 font-semibold leading-relaxed">
                  Click below to package your diagnostics metrics and logged accomplishments. Our server-side Gemini intelligence will generate an actionable progressive strategy.
                </p>
              </div>
              <button
                onClick={handleGeneratePlan}
                className="inline-flex items-center gap-1.5 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-emerald-500/10 hover:scale-105 active:scale-95"
              >
                Assemble Strategy Now
                <ArrowRight size={13} />
              </button>
            </div>

          )}

        </div>

      )}

    </div>
  );
}
