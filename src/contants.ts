import { type Config } from "./interfaces";
import { randomSeed } from "./lib/random";

export const VEGETABLES: Record<string, string> = {
    "🥦": "Broccoli",
    "🥕": "Carrot",
    "🧅": "Onion",
    "🌶️": "Pepper",
    "🍆": "Eggplant",
    "🥔": "Potato",
    "🍄": "Mushroom",
    "🧄": "Garlic",
    "🥬": "Lettuce",
    "🥒": "Cucumber",
    "🥑": "Avocado",
    "🌽": "Corn",
    "🫘": "Beans",
    "🫚": "Ginger",
    "🫛": "Pea",
    "🫜": "Radish",
};

export const DEFAULT_CONFIG: Config = {
    startTime: "21:00",
    endTime: "03:00",
    duration: "30",
    seed: randomSeed(),
    candidates: "",
    endWithAll: true,
    mix: "25",
};
