import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

export const INTER = loadInter("normal", { weights: ["400", "600", "800"], subsets: ["latin"] }).fontFamily;
export const MONO = loadMono("normal", { weights: ["500", "700"], subsets: ["latin"] }).fontFamily;

export const C = {
  bg: "#070b12",
  grid: "#122036",
  texto: "#e8f1ff",
  tenue: "#7d8fa8",
  cian: "#3de0ff",
  ambar: "#ffb547",
  cobre: "#c98a4b",
  metal: "#b9c3cf",
  cable: "#5b6b82",
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
