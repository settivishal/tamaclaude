import { sprite, cells, DIMS, STAGE_COLOR, type Stage, type Mood, type Size } from "../hooks/sprites.ts";
const eq = (got: unknown, want: unknown, what: string) => {
  if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error(`${what}\n got  ${JSON.stringify(got)}\n want ${JSON.stringify(want)}`);
};
const STAGES: Stage[] = ["egg", "hatchling", "adult", "elder"];
const MOODS: Mood[] = ["idle", "hop", "dance", "sulk", "sleep", "yawn", "hungry"];
const b64len = (n: number) => Math.ceil((n * 12) / 3) * 4;
for (const size of ["small", "normal"] as Size[]) {
  const { columns, rows } = DIMS[size];
  for (const stage of STAGES) for (const mood of MOODS) for (const f of [0, 1]) {
    const s = sprite(size, stage, mood, f);
    eq(s.length, rows, `${size} ${stage} ${mood} f${f}: row count`);
    s.forEach((row, i) => eq([...row].length, columns, `${size} ${stage} ${mood} f${f} row ${i}: width`));
    for (const ch of s.join("")) eq(ch.codePointAt(0)! < 0x10000, true, `${size} ${stage} ${mood}: BMP only (${ch})`);
    eq(cells(s, stage, mood).length, b64len(columns * rows), `${size} ${stage} ${mood}: packed size`);
  }
}
eq(sprite("normal", "egg", "idle", 0) !== sprite("normal", "egg", "idle", 1), true, "two frames differ");
eq(sprite("normal", "hatchling", "sleep", 0).join("").includes("z"), true, "sleep has z");
eq(cells(sprite("normal", "hatchling", "idle", 0), "hatchling", "idle") !== cells(sprite("normal", "hatchling", "idle", 0), "elder", "idle"), true, "colour by stage");
eq(Object.keys(STAGE_COLOR).length, 4, "four stage colours");
console.log("ok sprites");
