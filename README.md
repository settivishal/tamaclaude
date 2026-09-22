# tamaclaude

A pixel pet that lives above the Claude Code prompt. It hatches, blinks, hops when Claude edits a file, falls asleep when you leave, and gets hungry if you forget it.

```
     ▄████▄
    █ ●  ● █      “ooh, an edit!”
    █ ·◡ · █      Pip · hatchling · excited · streak 7   8: pet  9: feed
     ▀████▀
```

## Install

```
claude plugin marketplace add settivishal/tamaclaude
claude plugin install tamaclaude@tamaclaude
```

Requires Claude Code 2.1.278+ and a terminal (the band is terminal-only).

## Stages

It grows on a streak of clean turns (no abort, no refusal, no error). A stage once reached is kept; an error only resets the streak.

| stage | streak | colour | sprite |
|---|---|---|---|
| egg | 0 | beige | see below |
| hatchling | 5 | yellow | see below |
| adult | 30 | green | see below |
| elder | 100 | purple | see below |

```
egg                 hatchling           adult               elder
      ▄████▄             ▄████▄            ▄██████▄            ▄█▀██▀█▄
     ██▒███████         █ ●  ● █          █ ●    ● █          █ ●    ● █
     ██████▒███         █ ·◡ · █         ▐█ · ◡  · █▌        ▐█ · ◡  · █▌
      ▀██████▀           ▀████▀            ▀██████▀            ▀█▒▒▒▒█▀

asleep              hungry              sulking             dancing             worried
     ▄████▄  z           ▄████▄              ▄████▄            ▘▄████▄▝            ▄████▄  '
    █ ─  ─ █            █ ●  ● █            █ ╥  ╥ █           █ ●  ● █           █ ●  ● █
    █ ·◡ · █            █  ∩   █            █ ' ∩  █           █ ·◡ · █           █  ~   █
     ▀████▀              ▀████▀              ▀████▀             ▀████▀             ▀████▀
```

`small` (8×2) draws the hatchling art for every stage, told apart by colour.

## What it reacts to

- `Write` / `Edit` → hops for 1.5 s (the egg too)
- a test runner in `Bash` (pytest, jest, vitest, cargo test, go test, npm test, …) that comes back clean → a happy dance when the turn ends; `FAIL` / `error` in its output → sulks
- a tool call another plugin denies, or a turn that ends in a refusal → sulks 30 s
- a streak of clean turns → it grows (see stages); an aborted, errored or refused turn resets the streak, never the stage
- no turn for 10 min (`Sleep after` setting) → sleeps; z's drift up; any prompt wakes it
- a session past 2 h → yawns every few minutes
- context 85 % full → sweats and says so
- unfed for 24 h → droopy. It never dies. Press `9` with an empty prompt, or `/tamaclaude feed`
- `8` pets it → a dance (a hop under `quiet`); praise in a prompt (thanks, good job, well done) → a dance too
- it talks: a line above its name for each mood, a word when fed, petted or praised, and some idle chatter every 5 min (`quiet` mutes the chatter)
- hover the pet for its stats: sessions, edits witnessed, tests seen, sulks

## Commands

| | |
|---|---|
| `/tamaclaude` | status line |
| `/tamaclaude feed` | feed it |
| `/tamaclaude name <x>` | rename it |
| `/tamaclaude reset` | a fresh egg |

## Settings (`/config`)

| key | default | |
|---|---|---|
| `enabled` | `true` | off hides the pet |
| `size` | `normal` | `small` is 8×2, `normal` 16×4 |
| `sleepAfterMin` | `10` | minutes idle before sleep |
| `quiet` | `false` | no dance, yawn or idle chatter |

The pet is stored in the plugin's store, so it follows you across sessions and repos.

## Develop

```
claude --plugin-dir ./tamaclaude
claude plugin validate tamaclaude
for t in tamaclaude/tests/*.test.ts; do npx -y tsx "$t"; done
```

Sprites are plain strings in `tamaclaude/hooks/sprites.ts`, one char per cell; add a mood or stage there.

Two plugins drawing the band? Each `AbovePrompt` hook must `await next(e)` and stack the result, or the outer one hides the rest.
