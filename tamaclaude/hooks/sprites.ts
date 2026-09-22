// Sprite data: one string per row, one char per cell. Pure; no $ here.
// Glyphs: blocks are the body (stage colour); ● ─ eyes, ╥ crying, ◡ ∩ ○ ~ mouths, · cheeks, ' a tear or sweat, z Z sleep, ▒ egg speckles and the elder's beard.
import { pack, DEFAULT, type Cell } from "./raster.ts";

export type Stage = "egg" | "hatchling" | "adult" | "elder";
export type Mood = "idle" | "hop" | "dance" | "sulk" | "sleep" | "yawn" | "hungry" | "worry";
export type Size = "small" | "normal";
export type Sprite = readonly string[];

export const DIMS: Record<Size, { columns: number; rows: number }> = { small: { columns: 8, rows: 2 }, normal: { columns: 16, rows: 4 } };

export const STAGE_COLOR: Record<Stage, number> = { egg: 0xf5deb3, hatchling: 0xfacc15, adult: 0x22c55e, elder: 0xa855f7 };
const Z_COLOR = 0x60a5fa, TEAR = 0x38bdf8, CHEEK = 0xf9a8d4, EYE = DEFAULT;

// normal 16×4 — two frames per state; second frame is the blink / wobble / drift
const N: Record<Stage, Partial<Record<Mood, [Sprite, Sprite]>>> = {
  egg: {
    idle: [
      ["      ▄████▄    ",
       "     ██▒███████ ",
       "     ██████▒███ ",
       "      ▀██████▀  "],
      ["       ▄████▄   ",
       "      ██▒███████",
       "      ██████▒███",
       "       ▀██████▀ "],
    ],
    hop: [
      ["     ██████████ ",
       "     ██▒███████ ",
       "      ▀██████▀  ",
       "                "],
      ["      ▄████▄    ",
       "     ██▒███████ ",
       "     ██████▒███ ",
       "      ▀██████▀  "],
    ],
    sleep: [
      ["      ▄████▄  z ",
       "     ██▒███████ ",
       "     ██████▒███ ",
       "      ▀██████▀  "],
      ["      ▄████▄   Z",
       "     ██▒███████ ",
       "     ██████▒███ ",
       "      ▀██████▀  "],
    ],
    hungry: [
      ["      ▄████▄    ",
       "     ████  ████ ",
       "     ██████▒███ ",
       "      ▀██████▀  "],
      ["      ▄████▄    ",
       "     ████  ████ ",
       "     ██████▒███ ",
       "      ▀██████▀  "],
    ],
  },
  hatchling: {
    idle: [
      ["     ▄████▄     ",
       "    █ ●  ● █    ",
       "    █ ·◡ · █    ",
       "     ▀████▀     "],
      ["     ▄████▄     ",
       "    █ ─  ─ █    ",
       "    █ ·◡ · █    ",
       "     ▀████▀     "],
    ],
    hop: [
      ["    █ ●  ● █    ",
       "    █ ·◡ · █    ",
       "     ▀████▀     ",
       "                "],
      ["     ▄████▄     ",
       "    █ ●  ● █    ",
       "    █ ·◡ · █    ",
       "     ▀████▀     "],
    ],
    sleep: [
      ["     ▄████▄  z  ",
       "    █ ─  ─ █    ",
       "    █  ◡   █    ",
       "     ▀████▀     "],
      ["     ▄████▄    Z",
       "    █ ─  ─ █    ",
       "    █  ◡   █    ",
       "     ▀████▀     "],
    ],
    hungry: [
      ["     ▄████▄     ",
       "    █ ●  ● █    ",
       "    █  ∩   █    ",
       "     ▀████▀     "],
      ["     ▄████▄     ",
       "    █ ─  ─ █    ",
       "    █  ∩   █    ",
       "     ▀████▀     "],
    ],
    dance: [
      ["    ▘▄████▄▝    ",
       "    █ ●  ● █    ",
       "    █ ·◡ · █    ",
       "     ▀████▀     "],
      ["    █ ●  ● █    ",
       "   ▗█ ·◡ · █▖   ",
       "     ▀████▀     ",
       "                "],
    ],
    sulk: [
      ["     ▄████▄     ",
       "    █ ╥  ╥ █    ",
       "    █ ' ∩  █    ",
       "     ▀████▀     "],
      ["     ▄████▄     ",
       "    █ ╥  ╥ █    ",
       "    █   ∩ '█    ",
       "     ▀████▀     "],
    ],
    yawn: [
      ["     ▄████▄     ",
       "    █ ─  ─ █    ",
       "    █  ○   █    ",
       "     ▀████▀     "],
      ["     ▄████▄     ",
       "    █ ─  ─ █    ",
       "    █  ◡   █    ",
       "     ▀████▀     "],
    ],
    worry: [
      ["     ▄████▄  '  ",
       "    █ ●  ● █    ",
       "    █  ~   █    ",
       "     ▀████▀     "],
      ["     ▄████▄     ",
       "    █ ●  ● █ '  ",
       "    █  ~   █    ",
       "     ▀████▀     "],
    ],
  },
  adult: {
    idle: [
      ["    ▄██████▄    ",
       "   █ ●    ● █   ",
       "  ▐█ · ◡  · █▌  ",
       "    ▀██████▀    "],
      ["    ▄██████▄    ",
       "   █ ─    ─ █   ",
       "  ▐█ · ◡  · █▌  ",
       "    ▀██████▀    "],
    ],
    hop: [
      ["   █ ●    ● █   ",
       "  ▐█ · ◡  · █▌  ",
       "    ▀██████▀    ",
       "                "],
      ["    ▄██████▄    ",
       "   █ ●    ● █   ",
       "  ▐█ · ◡  · █▌  ",
       "    ▀██████▀    "],
    ],
    dance: [
      ["  ▘ ▄██████▄ ▝  ",
       "   █ ●    ● █   ",
       "   █ · ◡  · █   ",
       "    ▀██████▀    "],
      ["    ▄██████▄    ",
       "  ▗█ ●    ● █▖  ",
       "   █ · ◡  · █   ",
       "    ▀██████▀    "],
    ],
    sulk: [
      ["    ▄██████▄    ",
       "   █ ╥    ╥ █   ",
       "  ▐█ '  ∩   █▌  ",
       "    ▀██████▀    "],
      ["    ▄██████▄    ",
       "   █ ╥    ╥ █   ",
       "  ▐█    ∩  '█▌  ",
       "    ▀██████▀    "],
    ],
    yawn: [
      ["    ▄██████▄    ",
       "   █ ─    ─ █   ",
       "  ▐█   ○    █▌  ",
       "    ▀██████▀    "],
      ["    ▄██████▄    ",
       "   █ ─    ─ █   ",
       "  ▐█   ◡    █▌  ",
       "    ▀██████▀    "],
    ],
    sleep: [
      ["    ▄██████▄ z  ",
       "   █ ─    ─ █   ",
       "  ▐█   ◡    █▌  ",
       "    ▀██████▀    "],
      ["    ▄██████▄   Z",
       "   █ ─    ─ █   ",
       "  ▐█   ◡    █▌  ",
       "    ▀██████▀    "],
    ],
    hungry: [
      ["    ▄██████▄    ",
       "   █ ●    ● █   ",
       "  ▐█   ∩    █▌  ",
       "    ▀██████▀    "],
      ["    ▄██████▄    ",
       "   █ ─    ─ █   ",
       "  ▐█   ∩    █▌  ",
       "    ▀██████▀    "],
    ],
    worry: [
      ["    ▄██████▄ '  ",
       "   █ ●    ● █   ",
       "  ▐█   ~    █▌  ",
       "    ▀██████▀    "],
      ["    ▄██████▄    ",
       "   █ ●    ● █'  ",
       "  ▐█   ~    █▌  ",
       "    ▀██████▀    "],
    ],
  },
  elder: {
    idle: [
      ["    ▄█▀██▀█▄    ",
       "   █ ●    ● █   ",
       "  ▐█ · ◡  · █▌  ",
       "    ▀█▒▒▒▒█▀    "],
      ["    ▄█▀██▀█▄    ",
       "   █ ─    ─ █   ",
       "  ▐█ · ◡  · █▌  ",
       "    ▀█▒▒▒▒█▀    "],
    ],
    hop: [
      ["   █ ●    ● █   ",
       "  ▐█ · ◡  · █▌  ",
       "    ▀█▒▒▒▒█▀    ",
       "                "],
      ["    ▄█▀██▀█▄    ",
       "   █ ●    ● █   ",
       "  ▐█ · ◡  · █▌  ",
       "    ▀█▒▒▒▒█▀    "],
    ],
    dance: [
      ["  ▘ ▄█▀██▀█▄ ▝  ",
       "   █ ●    ● █   ",
       "   █ · ◡  · █   ",
       "    ▀█▒▒▒▒█▀    "],
      ["    ▄█▀██▀█▄    ",
       "  ▗█ ●    ● █▖  ",
       "   █ · ◡  · █   ",
       "    ▀█▒▒▒▒█▀    "],
    ],
    sulk: [
      ["    ▄█▀██▀█▄    ",
       "   █ ╥    ╥ █   ",
       "  ▐█ '  ∩   █▌  ",
       "    ▀█▒▒▒▒█▀    "],
      ["    ▄█▀██▀█▄    ",
       "   █ ╥    ╥ █   ",
       "  ▐█    ∩  '█▌  ",
       "    ▀█▒▒▒▒█▀    "],
    ],
    yawn: [
      ["    ▄█▀██▀█▄    ",
       "   █ ─    ─ █   ",
       "  ▐█   ○    █▌  ",
       "    ▀█▒▒▒▒█▀    "],
      ["    ▄█▀██▀█▄    ",
       "   █ ─    ─ █   ",
       "  ▐█   ◡    █▌  ",
       "    ▀█▒▒▒▒█▀    "],
    ],
    sleep: [
      ["    ▄█▀██▀█▄ z  ",
       "   █ ─    ─ █   ",
       "  ▐█   ◡    █▌  ",
       "    ▀█▒▒▒▒█▀    "],
      ["    ▄█▀██▀█▄   Z",
       "   █ ─    ─ █   ",
       "  ▐█   ◡    █▌  ",
       "    ▀█▒▒▒▒█▀    "],
    ],
    hungry: [
      ["    ▄█▀██▀█▄    ",
       "   █ ●    ● █   ",
       "  ▐█   ∩    █▌  ",
       "    ▀█▒▒▒▒█▀    "],
      ["    ▄█▀██▀█▄    ",
       "   █ ─    ─ █   ",
       "  ▐█   ∩    █▌  ",
       "    ▀█▒▒▒▒█▀    "],
    ],
    worry: [
      ["    ▄█▀██▀█▄ '  ",
       "   █ ●    ● █   ",
       "  ▐█   ~    █▌  ",
       "    ▀█▒▒▒▒█▀    "],
      ["    ▄█▀██▀█▄    ",
       "   █ ●    ● █'  ",
       "  ▐█   ~    █▌  ",
       "    ▀█▒▒▒▒█▀    "],
    ],
  },
};

// small 8×2 — adult and elder reuse the hatchling art, told apart by colour
const S: Record<Stage, Partial<Record<Mood, [Sprite, Sprite]>>> = {
  egg: {
    idle: [[" ▄████▄ ", " ██████ "], ["  ▄████▄", "  ██████"]],
    hop: [[" ██████ ", "        "], [" ▄████▄ ", " ██████ "]],
    sleep: [[" ▄████▄z", " ██████ "], [" ▄████▄Z", " ██████ "]],
    hungry: [[" ▄████▄ ", " ██  ██ "], [" ▄████▄ ", " ██  ██ "]],
  },
  hatchling: {
    idle: [[" ▄████▄ ", "█ ●◡● █ "], [" ▄████▄ ", "█ ─◡─ █ "]],
    hop: [["█ ●◡● █ ", " ▀████▀ "], [" ▄████▄ ", "█ ●◡● █ "]],
    sleep: [[" ▄████▄z", "█ ─◡─ █ "], [" ▄████▄Z", "█ ─◡─ █ "]],
    hungry: [[" ▄████▄ ", "█ ●∩● █ "], [" ▄████▄ ", "█ ─∩─ █ "]],
    dance: [["▘▄████▄▝", "█ ●◡● █ "], ["█ ●◡● █ ", " ▀████▀ "]],
    sulk: [[" ▄████▄ ", "█ ╥∩╥'█ "], [" ▄████▄ ", "█'╥∩╥ █ "]],
    yawn: [[" ▄████▄ ", "█ ─○─ █ "], [" ▄████▄ ", "█ ─◡─ █ "]],
    worry: [[" ▄████▄'", "█ ●~● █ "], [" ▄████▄ ", "█ ●~● █'"]],
  },
  adult: {}, // small: hatchling art, stage colour
  elder: {},
};

const SHEETS: Record<Size, typeof N> = { normal: N, small: S };

// the frame for a state; a mood or stage without art falls back to the nearest that has it
export function sprite(size: Size, stage: Stage, mood: Mood, frame: number): Sprite {
  const sheet = SHEETS[size];
  const stages: Stage[] = [stage, "hatchling", "egg"];
  const moods: Mood[] = [mood, "idle"];
  for (const s of stages) for (const m of moods) {
    const f = sheet[s][m];
    if (f) return f[frame & 1]!;
  }
  return sheet.egg.idle![frame & 1]!;
}

export const BLOCKS = new Set("▄▀█▘▝▖▗▌▐");
const dim = (c: number) => ((c >> 1) & 0x7f7f7f);

// colour by char: body blocks in the stage colour (dimmed asleep), z's blue, tears cyan, the rest default
export function cells(rows: Sprite, stage: Stage, mood: Mood): string {
  const body = mood === "sleep" ? dim(STAGE_COLOR[stage]) : STAGE_COLOR[stage];
  const out: Cell[] = [];
  for (const row of rows) for (const ch of row) {
    const cp = ch.codePointAt(0)!;
    out.push([cp, BLOCKS.has(ch) ? body : ch === "z" || ch === "Z" ? Z_COLOR : ch === "'" ? TEAR : ch === "·" ? CHEEK : EYE]);
  }
  return pack(out);
}
