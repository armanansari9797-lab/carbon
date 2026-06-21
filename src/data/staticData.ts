import { FootprintAssessment, PresetAction, EcoChallenge, EcoBadge } from "../types";

/**
 * Carbon emission factor constants (derived from EPA, Carbon Trust & EEA statistical averages).
 * Expressed in kg CO2e per year or per specific unit.
 */
export const CARBON_FACTORS = {
  // TRANSPORTATION
  CommuteGasPerMile: 0.404,     // kg CO2e per mile
  CommuteDieselPerMile: 0.380,  // kg CO2e per mile
  CommuteHybridPerMile: 0.220,  // kg CO2e per mile
  CommuteElectricPerMile: 0.080, // kg CO2e per mile (grid average lifecycle)
  CommuteNonePerMile: 0.0,
  
  FlightAveragePerCount: 450.0, // kg CO2e per flight count
  PublicTransitSavingsPerHour: 1.2, // kg CO2e offset comparing to single passenger car

  // DIET & FOOD
  DietMeatHeavy: 2850.0,        // kg CO2e per year
  DietMixed: 2000.0,
  DietFlexitarian: 1550.0,
  DietVegetarian: 1150.0,
  DietVegan: 750.0,
  
  FoodWasteNever: 0.0,
  FoodWasteSome: 80.0,
  FoodWasteModerate: 230.0,
  FoodWasteHigh: 450.0,
  
  BuyLocalAlways: -120.0,       // Negative represents offset/discount
  BuyLocalSometimes: -50.0,
  BuyLocalRarely: 0.0,

  // HOME & ENERGY
  EnergyStandardGrid: 3300.0,   // kg CO2e per year average
  EnergyGreenTariff: 650.0,
  EnergyHomeSolar: 150.0,
  
  ThermostatEco: -250.0,
  ThermostatModerate: 100.0,
  ThermostatComfortHigh: 350.0,
  
  HeatingHeatPump: 350.0,
  HeatingElectricity: 1200.0,
  HeatingNaturalGas: 1600.0,
  HeatingOil: 2600.0,

  // SHOPPING & WASTE
  ShoppingFrugal: 950.0,
  ShoppingModerate: 2300.0,
  ShoppingFrequent: 4200.0,
  
  RecycleFull: -180.0,
  RecycleBasic: 80.0,
  RecycleMinimal: 350.0
};

/**
 * Calculates current total carbon footprint in kilograms of CO2e per year.
 */
export function calculateFootprint(assessment: FootprintAssessment): {
  total: number;
  transportation: number;
  food: number;
  energy: number;
  spending: number;
} {
  if (!assessment.hasCompleted) {
    return { total: 0, transportation: 0, food: 0, energy: 0, spending: 0 };
  }

  // 1. Transportation
  const milesFactor = 
    assessment.vehicleType === "gas" ? CARBON_FACTORS.CommuteGasPerMile :
    assessment.vehicleType === "diesel" ? CARBON_FACTORS.CommuteDieselPerMile :
    assessment.vehicleType === "hybrid" ? CARBON_FACTORS.CommuteHybridPerMile :
    assessment.vehicleType === "electric" ? CARBON_FACTORS.CommuteElectricPerMile : 
    0;
  // Convert weekly miles to yearly miles (* 52)
  const commuteYearly = (assessment.commuteMiles * 52) * milesFactor;
  const transitYearly = Math.max(0, 500 - (assessment.publicTransitHours * 52 * 0.5)); // Base transit baseline
  const flightsYearly = assessment.flightsCount * CARBON_FACTORS.FlightAveragePerCount;
  const transportation = commuteYearly + transitYearly + flightsYearly;

  // 2. Food / Diet
  const dietBase = 
    assessment.dietType === "meat-heavy" ? CARBON_FACTORS.DietMeatHeavy :
    assessment.dietType === "mixed-diet" ? CARBON_FACTORS.DietMixed :
    assessment.dietType === "flexitarian" ? CARBON_FACTORS.DietFlexitarian :
    assessment.dietType === "vegetarian" ? CARBON_FACTORS.DietVegetarian :
    CARBON_FACTORS.DietVegan;

  const foodWaste = 
    assessment.foodWasteScore === "never" ? CARBON_FACTORS.FoodWasteNever :
    assessment.foodWasteScore === "some" ? CARBON_FACTORS.FoodWasteSome :
    assessment.foodWasteScore === "moderate" ? CARBON_FACTORS.FoodWasteModerate :
    CARBON_FACTORS.FoodWasteHigh;

  const buyLocal = 
    assessment.buyLocalScore === "mostly" ? CARBON_FACTORS.BuyLocalAlways :
    assessment.buyLocalScore === "sometimes" ? CARBON_FACTORS.BuyLocalSometimes :
    CARBON_FACTORS.BuyLocalRarely;

  const food = Math.max(400, dietBase + foodWaste + buyLocal);

  // 3. Home Energy
  const electricitySource = 
    assessment.energySource === "home-solar" ? CARBON_FACTORS.EnergyHomeSolar :
    assessment.energySource === "green-electricity" ? CARBON_FACTORS.EnergyGreenTariff :
    CARBON_FACTORS.EnergyStandardGrid;

  const thermoUsage = 
    assessment.thermostatSetting === "eco" ? CARBON_FACTORS.ThermostatEco :
    assessment.thermostatSetting === "moderate" ? CARBON_FACTORS.ThermostatModerate :
    CARBON_FACTORS.ThermostatComfortHigh;

  const heatingSource = 
    assessment.heatingFuel === "heat-pump" ? CARBON_FACTORS.HeatingHeatPump :
    assessment.heatingFuel === "electric" ? CARBON_FACTORS.HeatingElectricity :
    assessment.heatingFuel === "natural-gas" ? CARBON_FACTORS.HeatingNaturalGas :
    CARBON_FACTORS.HeatingOil;

  const energy = Math.max(200, electricitySource + thermoUsage + heatingSource);

  // 4. Spending & Waste
  const spendingBase = 
    assessment.shoppingFrequency === "frugal" ? CARBON_FACTORS.ShoppingFrugal :
    assessment.shoppingFrequency === "moderate" ? CARBON_FACTORS.ShoppingModerate :
    CARBON_FACTORS.ShoppingFrequent;

  const recyclingFactor = 
    assessment.recyclingGrade === "full-separation" ? CARBON_FACTORS.RecycleFull :
    assessment.recyclingGrade === "basic-recycling" ? CARBON_FACTORS.RecycleBasic :
    CARBON_FACTORS.RecycleMinimal;

  const spending = Math.max(300, spendingBase + recyclingFactor);

  const total = transportation + food + energy + spending;
  
  return {
    total: Math.round(total),
    transportation: Math.round(transportation),
    food: Math.round(food),
    energy: Math.round(energy),
    spending: Math.round(spending)
  };
}

/**
 * Helper: Initial raw state of Footprint assessment
 */
export const DEFAULT_ASSESSMENT: FootprintAssessment = {
  hasCompleted: false,
  commuteMiles: 30,
  vehicleType: "gas",
  flightsCount: 2,
  publicTransitHours: 1,
  dietType: "mixed-diet",
  foodWasteScore: "moderate",
  buyLocalScore: "sometimes",
  energySource: "grid-standard",
  thermostatSetting: "moderate",
  heatingFuel: "natural-gas",
  shoppingFrequency: "moderate",
  recyclingGrade: "basic-recycling"
};

/**
 * Presets of carbon action logging items
 */
export const PRESET_ACTIONS: PresetAction[] = [
  {
    id: "plant_based_meal",
    title: "Eat Plant-Based Meal",
    description: "Swapped animal proteins for a delicious fully vegetarian or vegan meal.",
    category: "food",
    co2Saved: 2.2,
    iconName: "Salad"
  },
  {
    id: "public_transit",
    title: "Ride Transit or Bike",
    description: "Chose train, bus, biking, or walking instead of driving a solo gas car.",
    category: "transportation",
    co2Saved: 4.8,
    iconName: "Bus"
  },
  {
    id: "hang_dry",
    title: "Air Dry Laundry Load",
    description: "Line-dried clothes on a drying rack instead of using a heated tumble dryer.",
    category: "energy",
    co2Saved: 1.6,
    iconName: "Wind"
  },
  {
    id: "low_temp",
    title: "Wash Clothes in Cold Water",
    description: "Ran active laundry cycle under cold setting, preventing water heating load.",
    category: "energy",
    co2Saved: 0.9,
    iconName: "Droplets"
  },
  {
    id: "unplug_vampire",
    title: "Unplug Idle Electronics",
    description: "Switched off power strip and unplugged unused devices preventing standby drain.",
    category: "energy",
    co2Saved: 0.5,
    iconName: "ZapOff"
  },
  {
    id: "sorting_recycle",
    title: "Meticulous Waste Sort",
    description: "Completely separated plastics, metal, organic waste, and paper into optimal bins.",
    category: "waste",
    co2Saved: 1.1,
    iconName: "Trash2"
  },
  {
    id: "thermostat_eco_tweak",
    title: "Adjust Thermostat 2 Degrees",
    description: "Optimized temperature (down in winter, up in summer) for over 8 hours.",
    category: "energy",
    co2Saved: 2.0,
    iconName: "Thermometer"
  },
  {
    id: "buy_secondhand",
    title: "Choose Secondhand / Reuse",
    description: "Bought a thrifted item, borrowed, or repaired a tool instead of buying brand new.",
    category: "waste",
    co2Saved: 6.5,
    iconName: "ShoppingBag"
  }
];

/**
 * Gamified Eco Challenges
 */
export const DEFAULT_CHALLENGES: EcoChallenge[] = [
  {
    id: "meatless_week",
    title: "Vanguard Veggie Rush",
    description: "Commit to eating 7 plant-based meals this week.",
    category: "food",
    co2SavedPerTick: 2.4,
    actionVerb: "Eat plant-based meal",
    targetCount: 7,
    currentCount: 0,
    isJoined: false,
    isCompleted: false
  },
  {
    id: "car_free_commute",
    title: "Zero-Carb Commuter",
    description: "Ditch the car 4 times to commute using public transit, active walking, cycling, or pool.",
    category: "transportation",
    co2SavedPerTick: 5.2,
    actionVerb: "Log green trip",
    targetCount: 4,
    currentCount: 0,
    isJoined: false,
    isCompleted: false
  },
  {
    id: "cold_laundry",
    title: "Cold Washing Sweep",
    description: "Wash 4 consecutive laundry loads completely cold.",
    category: "energy",
    co2SavedPerTick: 1.0,
    actionVerb: "Wash cold load",
    targetCount: 4,
    currentCount: 0,
    isJoined: false,
    isCompleted: false
  },
  {
    id: "waste_less_hero",
    title: "Zero Waste Quest",
    description: "Go 5 items or transactions buy-free or strictly secondhand to eliminate production waste.",
    category: "waste",
    co2SavedPerTick: 6.0,
    actionVerb: "Opt for reuse/thrift",
    targetCount: 5,
    currentCount: 0,
    isJoined: false,
    isCompleted: false
  }
];

/**
 * Default badging criteria
 */
export const DEFAULT_BADGES: EcoBadge[] = [
  {
    id: "first_steps",
    title: "Eco Explorer",
    description: "Completed your initial carbon footprint assessment.",
    iconName: "Compass",
    category: "footprint",
    requirementText: "Complete Carbon Questionnaire",
    unlocked: false
  },
  {
    id: "logger_pro",
    title: "Carbon Crusader",
    description: "Logged 5 green daily actions in your tracking board.",
    iconName: "ListChecks",
    category: "logging",
    requirementText: "Log 5 Actions",
    unlocked: false
  },
  {
    id: "challenge_conqueror",
    title: "Champion of Earth",
    description: "Completed your first active weekly Eco-Challenge.",
    iconName: "Trophy",
    category: "challenges",
    requirementText: "Complete 1 Challenge",
    unlocked: false
  },
  {
    id: "ai_advisor_badge",
    title: "Polished Strategist",
    description: "Consulted your AI Coach for a tailored, climate-focused reduction plan.",
    iconName: "BrainCircuit",
    category: "gemini",
    requirementText: "Request personalized AI plan",
    unlocked: false
  },
  {
    id: "heavy_offsetter",
    title: "Mega-Emission Offsetter",
    description: "Saved an aggregate of over 50 kilograms of CO2 emissions.",
    iconName: "Leaf",
    category: "logging",
    requirementText: "Save 50kg CO2e total",
    unlocked: false
  }
];
