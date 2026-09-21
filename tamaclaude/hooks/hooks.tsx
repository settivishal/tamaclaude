import type { EngineInterface, Register } from "claude-code";
import { sprite, cells, DIMS, type Size, type Mood } from "./sprites.ts";
import { hatch, load, grow, isHungry, mood, ageDays, EFFECT_MS, type Pet, type Effects } from "./pet.ts";

type Cfg = { enabled: boolean; size: Size; sleepAfterMs: number; quiet: boolean };
const cfg: Cfg = { enabled: true, size: "normal", sleepAfterMs: 600_000, quiet: false };

let pet: Pet = hatch(0);
let effects: Effects = {};
let lastTurn = 0;
let bandId: string | undefined; // the AbovePrompt requestId the Raster is mounted under
let tick = 0;
let drawnMood: Mood = "idle";
let sessionStart = 0;
let lastYawn = 0;
let testsPassed = false; // a test run this turn came back clean

const TEST_RUNNER = /\b(pytest|jest|vitest|mocha|cargo test|go test|npm test|pnpm test|yarn test|bun test|tsx .*\.test\.|node --test|rspec|phpunit|mvn test|gradle test|dotnet test|make test)\b/;
const TEST_FAIL = /\bFAIL(ED|URE)?\b|\berror\b/i;
const LONG_SESSION_MS = 2 * 60 * 60 * 1000, YAWN_EVERY_MS = 4 * 60 * 1000;

const MOOD_LABEL: Record<Mood, string> = { idle: "content", hop: "excited", dance: "dancing", sulk: "sulking", sleep: "asleep", yawn: "yawning", hungry: "hungry" };

async function save($: EngineInterface): Promise<void> {
  await $.store.set("pet", pet);
}

function currentMood(now: number): Mood {
  return mood({ effects, lastTurn, sleepAfterMs: cfg.sleepAfterMs, hungry: isHungry(pet, now), quiet: cfg.quiet }, now);
}

function frame(m: Mood, t: number): string {
  // idle blinks briefly every 3 s; the other moods alternate every other tick
  const f = m === "idle" ? (t % 12 === 11 ? 1 : 0) : (t >> 1) & 1;
  return cells(sprite(cfg.size, pet.stage, m, f), pet.stage, m);
}

function poke(k: keyof Effects, now: number): void {
  effects = { ...effects, [k]: now + EFFECT_MS[k] };
}

async function feed($: EngineInterface): Promise<string> {
  pet = { ...pet, fed: await $.clock.now() };
  await save($);
  $.ui.invalidate("ui.render");
  return `${pet.name} munches happily.`;
}

async function sulk($: EngineInterface, now: number): Promise<void> {
  poke("sulk", now);
  pet = { ...pet, sulks: pet.sulks + 1 };
  await save($);
}

async function step($: EngineInterface): Promise<void> {
  const now = await $.clock.now();
  if (now - sessionStart >= LONG_SESSION_MS && now - lastYawn >= YAWN_EVERY_MS) { lastYawn = now; poke("yawn", now); }
  const m = currentMood(now);
  tick++;
  if (m !== drawnMood) { drawnMood = m; $.ui.invalidate("ui.render"); return; } // text line changes with the mood
  if (bandId) void $.ui.blit({ requestId: bandId, key: "pet", cells: frame(m, tick) });
}

async function command($: EngineInterface, args: string): Promise<string> {
  const [verb, ...rest] = args.trim().split(/\s+/);
  const now = await $.clock.now();
  if (verb === "feed") return feed($);
  if (verb === "name") {
    const name = rest.join(" ").trim().slice(0, 16);
    if (!name) return "usage: /tamaclaude name <name>";
    pet = { ...pet, name };
    await save($);
    $.ui.invalidate("ui.render");
    return `Your pet is now called ${name}.`;
  }
  if (verb === "reset") {
    pet = hatch(now);
    effects = {};
    await save($);
    $.ui.invalidate("ui.render");
    return `A new egg. Say hi to ${pet.name}.`;
  }
  return `${pet.name} · ${pet.stage} · ${MOOD_LABEL[currentMood(now)]} · streak ${pet.streak} · age ${ageDays(pet, now)}d · ${pet.sessions} sessions · ${pet.edits} edits · ${pet.tests} tests · ${pet.sulks} sulks\n` +
    `/tamaclaude feed | name <x> | reset`;
}

export const register: Register = (on, options) => {
  cfg.enabled = options.enabled !== false;
  cfg.size = options.size === "small" ? "small" : "normal";
  cfg.sleepAfterMs = Math.max(1, Number(options.sleepAfterMin) || 10) * 60_000;
  cfg.quiet = options.quiet === true;

  on("session.start", async ($, e, next) => {
    const now = await $.clock.now();
    pet = load(await $.store.get("pet"), now);
    pet = { ...pet, sessions: pet.sessions + 1 };
    lastTurn = sessionStart = lastYawn = now;
    await save($);
    await $.command.register({ name: "tamaclaude", description: "Your pixel pet: status, feed, name <x>, reset.", argumentHint: "[feed|name <x>|reset]" });
    if (cfg.enabled) $.clock.every(250, () => void step($));
    return next(e);
  });

  on("command.run", { command: "tamaclaude" }, async ($, e) => ({ text: await command($, e.args) }));

  on("prompt.submit", async ($, e, next) => { lastTurn = await $.clock.now(); return next(e); });
  on("turn.complete", async ($, e, next) => {
    const now = lastTurn = await $.clock.now();
    if (e.agentId) return next(e); // subagent turns do not count
    if (e.reason === "refusal") await sulk($, now);
    else if (e.reason === "answer" && testsPassed) poke("dance", now);
    testsPassed = false;
    const before = pet.stage;
    pet = grow({ ...pet, streak: e.reason === "answer" ? pet.streak + 1 : 0 });
    if (pet.stage !== before) $.ui.toast(`${pet.name} grew into ${pet.stage === "hatchling" ? "a hatchling" : `an ${pet.stage}`}!`);
    await save($);
    $.ui.invalidate("ui.render"); // streak shows on the text line
    return next(e);
  });

  on("tool.call", async ($, e, next) => {
    const now = await $.clock.now();
    const isTest = e.tool === "Bash" && TEST_RUNNER.test(e.command);
    if (e.tool === "Write" || e.tool === "Edit") { poke("hop", now); pet = { ...pet, edits: pet.edits + 1 }; }
    if (isTest) pet = { ...pet, tests: pet.tests + 1 };
    const r = await next(e);
    if (r.deny !== undefined) await sulk($, await $.clock.now()); // a plugin beneath refused it
    else if (isTest) {
      if (r.isError || TEST_FAIL.test(r.text ?? "")) await sulk($, await $.clock.now());
      else testsPassed = true;
    }
    return r;
  });

  on("ui.render", { component: "AbovePrompt" }, ($, e, next) => {
    if (!cfg.enabled || e.props.hasSurvey || e.surface !== "terminal") return next(e); // Raster is terminal-only
    const { Box, Text, Button, Raster } = $.ui.resolve(e);
    bandId = e.requestId;
    const m = drawnMood;
    const { columns, rows } = DIMS[cfg.size];
    const hungry = m === "hungry";
    return (
      <Box key="tama" flexDirection="column">
        <Box gap={1}>
          <Raster key="pet" columns={columns} rows={rows} cells={frame(m, tick)} />
          <Box flexDirection="column" justifyContent="flex-end">
            <Box gap={1}>
              <Text dimColor wrap="truncate">{`${pet.name} · ${pet.stage} · ${MOOD_LABEL[m]} · streak ${pet.streak}`}</Text>
              <Button key="feed" plain dimColor={!hungry} hotkey="9" onPress={() => void feed($)}>feed</Button>
            </Box>
          </Box>
        </Box>
        <Box display="none" hover={{ display: "flex" }} paddingLeft={columns + 1}>
          <Text dimColor wrap="truncate">{`${pet.sessions} sessions · ${pet.edits} edits · ${pet.tests} tests · ${pet.sulks} sulks · /tamaclaude`}</Text>
        </Box>
      </Box>
    );
  });
};
