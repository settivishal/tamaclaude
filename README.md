# tamaclaude

A pixel pet that lives above the Claude Code prompt. It hatches, blinks, hops when Claude edits a file, falls asleep when you leave, and gets hungry if you forget it.

```
     ▄████▄
    █ ●  ● █      Pip · hatchling · content · streak 7   9: feed
    █  ◡   █
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
| adult | 30 | green | (0.2) |
| elder | 100 | purple | (0.2) |

```
egg                 hatchling           asleep              hungry
      ▄████▄             ▄████▄              ▄████▄  z           ▄████▄
     ██████████         █ ●  ● █            █ ─  ─ █           █ ●  ● █
     ██████████         █  ◡   █            █  ◡   █           █  ∩   █
      ▀██████▀           ▀████▀              ▀████▀             ▀████▀
```

## What it reacts to

- `Write` / `Edit` → hops once
- no turn for 10 min (`Sleep after` setting) → sleeps; z's drift up; any prompt wakes it
- unfed for 24 h → droopy. It never dies. Press `9` with an empty prompt, or `/tamaclaude feed`
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
| `quiet` | `false` | no dance or yawn; only idle, hop and sleep |

The pet is stored in the plugin's store, so it follows you across sessions and repos.

## Develop

```
claude --plugin-dir ./tamaclaude
claude plugin validate tamaclaude
for t in tamaclaude/tests/*.test.ts; do npx -y tsx "$t"; done
```

Sprites are plain strings in `tamaclaude/hooks/sprites.ts`, one char per cell; add a mood or stage there.
