import { hatch, load, grow, mood, isHungry, THRESHOLDS, HUNGRY_MS, PRAISE, type Pet } from "../hooks/pet.ts";
const eq = (got: unknown, want: unknown, what: string) => {
  if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error(`${what}\n got  ${JSON.stringify(got)}\n want ${JSON.stringify(want)}`);
};
const T0 = 1_000_000;
const p = hatch(T0, "Pip");
eq(p.stage, "egg", "hatches as egg");
eq(load(undefined, T0).stage, "egg", "empty store hatches");
eq(load({ name: "  Zed ", stage: "bogus", streak: 3 }, T0), { ...load({}, T0), name: "Zed", stage: "egg", streak: 3, fed: load({}, T0).fed }, "load sanitises");

// stage thresholds
const at = (streak: number, stage: Pet["stage"] = "egg") => grow({ ...p, streak, stage }).stage;
eq(at(THRESHOLDS.hatchling - 1), "egg", "below hatchling");
eq(at(THRESHOLDS.hatchling), "hatchling", "hatches at threshold");
eq(at(THRESHOLDS.adult), "adult", "adult");
eq(at(THRESHOLDS.elder), "elder", "elder");
eq(at(0, "adult"), "adult", "never regresses");

// hunger
eq(isHungry(p, T0 + HUNGRY_MS), false, "fed within 24h");
eq(isHungry(p, T0 + HUNGRY_MS + 1), true, "unfed past 24h");

// mood table: [effects, msSinceTurn, hungry, quiet, want]
const SLEEP = 600_000;
const rows: [Record<string, number>, number, boolean, boolean, string, boolean?][] = [
  [{}, 0, false, false, "idle"],
  [{}, 0, true, false, "hungry"],
  [{}, SLEEP, true, false, "sleep"],
  [{ hop: 1 }, 0, false, false, "hop"],
  [{ hop: 1 }, SLEEP, false, false, "hop"],
  [{ dance: 1 }, 0, false, false, "dance"],
  [{ dance: 1 }, 0, false, true, "idle"],
  [{ dance: 1, hop: 1 }, 0, false, true, "hop"],
  [{ sulk: 1, dance: 1, hop: 1 }, 0, false, false, "sulk"],
  [{ yawn: 1 }, 0, false, false, "yawn"],
  [{ yawn: 1 }, 0, false, true, "idle"],
  [{ hop: -1 }, 0, false, false, "idle"],
  [{}, 0, true, false, "worry", true],
  [{}, SLEEP, false, false, "sleep", true],
  [{ hop: 1 }, 0, false, false, "hop", true],
];
for (const [fx, since, hungry, quiet, want, worried = false] of rows) {
  const now = T0 + since;
  const effects = Object.fromEntries(Object.entries(fx).map(([k, v]) => [k, now + v]));
  eq(mood({ effects, lastTurn: T0, sleepAfterMs: SLEEP, hungry, quiet, worried }, now), want, `mood ${JSON.stringify(fx)} since=${since} hungry=${hungry} quiet=${quiet} worried=${worried}`);
}
console.log("ok pet");

// praise
eq(PRAISE.test("thanks, good job"), true, "praise matches");
eq(PRAISE.test("fix the thanksgiving bug"), false, "no praise in a word");
