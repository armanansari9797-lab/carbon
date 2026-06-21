import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const PORT = 3000;
const app = express();

// Middleware for parsing JSON requests
app.use(express.json());

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is missing. Please add it in the Secrets / Settings panel of AI Studio.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// System Instruction for the AI Climate Coach
const SYSTEM_INSTRUCTION = `
You are the highly knowledgeable, compassionate, and precise "Eco-Advisor", an AI-powered Sustainability and Carbon Reduction Coach.
Your goal is to help individuals understand, track, and dramatically reduce their carbon footprint through progressive, simple, high-reward habits.

- Speak in a motivating, supportive tone. Avoid lecturing or shaming the user; celebrate small steps.
- Provide concrete, quantified estimates of carbon savings wherever possible (e.g., "Saves ~2.4 kg CO2e per day").
- Offer realistic alternatives rather than absolute prohibitions (e.g., recommend "one meat-free day per week" or "adding 50% plant-based food" rather than forcing strict veganism immediately).
- Provide highly descriptive, visually rich markdown formatting with headers, clean bullet points, and highlight metrics.
- Keep your answers direct and action-oriented.
`;

// API Endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Endpoint: Generate Personalized Carbon Reduction Plan
app.post("/api/gemini/plan", async (req, res) => {
  try {
    const { assessment, savedCo2 } = req.body;
    
    if (!assessment) {
      res.status(400).json({ error: "Assessment data is required to construct a reduction plan." });
      return;
    }

    const ai = getGeminiClient();

    const prompt = `
Generate a highly personalized Carbon Reduction Strategy Plan.
Here is the user's current carbon footprint data:

1. TRANSPORTATION PROFILE:
- Commute mileage per week: ${assessment.commuteMiles ?? 0} miles
- Vehicle Type: ${assessment.vehicleType ?? "None / Public transit"}
- Flights per year: ${assessment.flightsCount ?? 0} flights
- Public transit usage: ${assessment.publicTransitHours ?? 0} hours/week

2. DIET & FOOD PROFILE:
- Dietary preference: ${assessment.dietType ?? "Standard mixed diet"}
- Food waste frequency: ${assessment.foodWasteScore ?? "Moderate"}
- Local organic grocery sharing: ${assessment.buyLocalScore ?? "Sometimes"}

3. HOME & ENERGY PROFILE:
- Home electricity source: ${assessment.energySource ?? "Grid (standard coal/gas mixture)"}
- Thermostat management: ${assessment.thermostatSetting ?? "Standard comfort"}
- Home heating fuel: ${assessment.heatingFuel ?? "Natural gas"}

4. CONSUMPTION & HOUSEHOLD PROFILE:
- General shopping frequency: ${assessment.shoppingFrequency ?? "Moderate"}
- Recycling and composting habits: ${assessment.recyclingGrade ?? "Moderate / Partial"}

5. HISTORICAL PROGRESS:
- Carbon dioxide emissions avoided so far: ${savedCo2 ?? 0} kg CO2e

Based on this, generate a beautiful, comprehensive, and encouraging Markdown plan. It must contain:
1. **FOOTPRINT SUMMARY & EVALUATION**: Break down where their highest emissions likely reside and compare their profile with the national average (~16 tons per year) and global target (<2.5 tons per year in carbon budget targets).
2. **THE TOP 3 HIGHEST IMPACT ACTIONS**: Explicitly list 3 primary actions they can take based on their choices, detailing the expected kg CO2e savings.
3. **CUSTOM EMISSION CUTTING TIMELINE**: A clear progressive timeline (Week 1, Month 1, Month 3) detailing actionable micro-habits.
4. **RECOMMENDED ECO-CHALLENGES**: Suggest specific challenges from our catalog (e.g., 'Meatless Week', 'Car-free commute', 'Plugs Out') they would excel at.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    res.json({ plan: response.text });
  } catch (error: any) {
    console.error("Gemini Plan Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate reduction plan due to server error." });
  }
});

// Endpoint: Sustainability Coach Interactive Chat
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, assessment } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Messages array is required." });
      return;
    }

    const ai = getGeminiClient();

    // Prepare contextual system prompt including user profile if available
    let contextualInstruction = SYSTEM_INSTRUCTION;
    if (assessment) {
      contextualInstruction += `\n\nContext about the current user you are talking to:
      - Primary vehicle: ${assessment.vehicleType ?? "None"}
      - Diet preference: ${assessment.dietType ?? "Mixed"}
      - Public transit hours/week: ${assessment.publicTransitHours ?? 0}
      - Energy source: ${assessment.energySource ?? "Grid"}`;
    }

    // Format chat history for @google/genai SDK
    // The Gemini chats structure expects contents in standard message parts.
    // We can also just send it directly to generateContent with historical context, which is simple and reliable.
    const contents = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: contextualInstruction,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed to communicate with AI due to server error." });
  }
});

// Serve frontend assets in production / mount dev compiler in development
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite Dev Server Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production assets from /dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Carbon Footprint Awareness Platform running at http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error("Bootstrap failure:", err);
});
