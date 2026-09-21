// Pet state and its pure transitions. Persisted shape is Pet; no $ here.
import type { Stage, Mood } from "./sprites.ts";

export type Pet = {
  name: string;
  stage: Stage;
  streak: number;      // consecutive clean turns
  fed: number;         // ms epoch of the last feed
  born: number;        // ms epoch
  sessions: number;
  edits: number;
  tests: number;
  sulks: number;
};

export const STAGES: Stage[] = ["egg", "hatchling", "adult", "elder"];
// clean-turn streak needed to reach each stage; reached, a stage is kept
export const THRESHOLDS: Record<Stage, number> = { egg: 0, hatchling: 5, adult: 30, elder: 100 };
export const HUNGRY_MS = 24 * 60 * 60 * 1000;
export const NAMES = ["Pip", "Mochi", "Bit", "Nib", "Blip", "Tofu", "Kiwi", "Dot"];

export function hatch(now: number, name = NAMES[Math.floor(Math.random() * NAMES.length)]!): Pet {
  return { name, stage: "egg", streak: 0, fed: now, born: now, sessions: 0, edits: 0, tests: 0, sulks: 0 };
}

// a stored value that may be missing fields (older version) or garbage
export function load(raw: unknown, now: number): Pet {
  const p = (raw && typeof raw === "object" ? raw : {}) as Partial<Pet>;
  const base = hatch(now);
  return {
    ...base,
    ...p,
    name: typeof p.name === "string" && p.name.trim() ? p.name.trim().slice(0, 16) : base.name,
    stage: STAGES.includes(p.stage as Stage) ? (p.stage as Stage) : "egg",
  };
}

// the stage a streak has earned, never lower than the one already reached
export function grow(pet: Pet): Pet {
  const earned = [...STAGES].reverse().find(s => pet.streak >= THRESHOLDS[s])!;
  return STAGES.indexOf(earned) > STAGES.indexOf(pet.stage) ? { ...pet, stage: earned } : pet;
}

export const isHungry = (pet: Pet, now: number) => now - pet.fed > HUNGRY_MS;

// transient effects the session sets, each an expiry
export type Effects = { hop?: number; dance?: number; sulk?: number; yawn?: number };
export const EFFECT_MS = { hop: 1500, dance: 3000, sulk: 30_000, yawn: 2500 };

export type MoodInput = { effects: Effects; lastTurn: number; sleepAfterMs: number; hungry: boolean; quiet: boolean };

// priority: sulk > dance > hop > yawn > sleep > hungry > idle; quiet drops dance and yawn
export function mood(m: MoodInput, now: number): Mood {
  const on = (k: keyof Effects) => (m.effects[k] ?? 0) > now;
  if (on("sulk")) return "sulk";
  if (!m.quiet && on("dance")) return "dance";
  if (on("hop")) return "hop";
  if (!m.quiet && on("yawn")) return "yawn";
  if (now - m.lastTurn >= m.sleepAfterMs) return "sleep";
  if (m.hungry) return "hungry";
  return "idle";
}

export const ageDays = (pet: Pet, now: number) => Math.floor((now - pet.born) / 86_400_000);
