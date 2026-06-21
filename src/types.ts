/**
 * Types representing the Carbon Footprint Platform state and parameters.
 */

export interface FootprintAssessment {
  hasCompleted: boolean;
  commuteMiles: number;
  vehicleType: "gas" | "hybrid" | "diesel" | "electric" | "none";
  flightsCount: number;
  publicTransitHours: number;
  dietType: "meat-heavy" | "mixed-diet" | "flexitarian" | "vegetarian" | "vegan";
  foodWasteScore: "never" | "some" | "moderate" | "high";
  buyLocalScore: "rarely" | "sometimes" | "mostly";
  energySource: "grid-standard" | "green-electricity" | "home-solar";
  thermostatSetting: "eco" | "moderate" | "comfort-high";
  heatingFuel: "heat-pump" | "electric" | "natural-gas" | "heating-oil";
  shoppingFrequency: "frugal" | "moderate" | "frequent";
  recyclingGrade: "full-separation" | "basic-recycling" | "minimal";
}

export interface PresetAction {
  id: string;
  title: string;
  description: string;
  category: "transportation" | "food" | "energy" | "waste";
  co2Saved: number; // in kg CO2e saved per occurrence
  iconName: string;
}

export interface LoggedAction {
  id: string;
  date: string; // YYYY-MM-DD
  actionId: string;
  title: string;
  category: "transportation" | "food" | "energy" | "waste";
  co2Saved: number;
}

export interface EcoChallenge {
  id: string;
  title: string;
  description: string;
  category: "transportation" | "food" | "energy" | "waste";
  co2SavedPerTick: number;
  actionVerb: string;
  targetCount: number;
  currentCount: number;
  isJoined: boolean;
  isCompleted: boolean;
  joinedAt?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface EcoBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: "footprint" | "challenges" | "logging" | "gemini";
  requirementText: string;
  unlocked: boolean;
  unlockedAt?: string;
}
