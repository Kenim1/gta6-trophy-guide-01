# gta6-trophy-guide-01 — Leonida Trophy Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/kenim1/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/kenim1/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze, 0 online): every trophy with its official name, description and grade, a guide written in our own words that names its sources, a checklist saved in the browser, export/import, filters by grade and kind, a spoiler setting, a 3-stage roadmap to the platinum, and a missables page.

Entry for the [make.fun bounty “Build the best GTA 6 trophy guide”](https://make.fun/bounty/gta6-trophy-guide-01).

## What is inside

- `app/index.html` + `app/style.css` + `app/app.js` — the guide itself: checklist, detail pane, roadmap and missables views, hash-routed (`#/`, `#/trophy/<id>`, `#/roadmap`, `#/missables`). Dark “Leonida night” look of our own; no Rockstar logo or artwork, no network requests at run time.
- `app/data/trophies.json` — the official 55-trophy list (frozen 2026-11-18) with, per trophy, a guide in our own words, a `sources` field, a `kind` (story / missable / collectible / activity), a `missable` flag and a roadmap `stage` (1 story, 2 100%-checklist, 3 cleanup).

## Round 2 — what to do next, not just what exists

Round 1 was a good checklist; round 2 turns it into a planner:

- **Next up** — a section at the top of the checklist that recommends the next trophies to earn: the missable one first (“Do this now — missable in Chapter 1”), then the earliest unfinished roadmap stage in order, skipping earned trophies, with a reason line per suggestion. Click a suggestion to open its guide.
- **Search** — a prominent search box at the top of the checklist that filters trophies live by name, description, guide text or sources as you type (`?q=` pre-fills it).
- **Per-trophy notes** — a notes field in every trophy’s detail pane, saved in localStorage, shown with a “✎ note” flag in the list, and included in export/import.
- **Roadmap progress** — the roadmap page now shows earned/total and a progress bar per stage, plus overall platinum progress.
- **Compact detail pane** — each trophy now has a short guide (`guide_short` in the data) shown first with a “Read the full guide” toggle, a larger grade badge, compact sources and progress visible, so guide + sources fit in an 800 px-tall view without scrolling.
- `screenshots/` — four real renders of this app in desktop Chrome at 1280×800 (see `shots.json`).
- `main.ts` — hands the entry in: copies `app/` and `screenshots/` to the output dir and writes `output/dossier.json` with the vendored make.fun library.

## The one thing to do first

Only **one** trophy is potentially missable: **Positive Mental Attitude**. In Chapter 1, after the mission Down to Earth, talk to Lucia in the kitchen in the morning, follow her to the balcony and choose Accept to meditate. Once you leave Chapter 1 it is gone. Everything else can be earned after the story in free-roam. (Whether that first meditation is actually required for the trophy is still unconfirmed — both guides we checked say so — so do it anyway.)

## Roadmap at a glance

1. **Story (60–80 h)** — finish the chapters and main missions, do the Andy / Kenton / Billy / Randy / Tyrone questlines as they appear, keep a manual save per chapter.
2. **100% checklist (~100 h)** — after the story, work the in-game 100% Completion list. It is lenient: roughly 60% true completion (e.g. any 200 of 277 vehicles, any 100 of 255 animals, any 15 of 18 card sets, any 70 of 80 challenges).
3. **Cleanup (~10 h)** — stranger strands, partner trophies, one-off stunts and easter eggs, money trophies. Platinum pops with the last one. Total: about 200–300 hours (PowerPyx says ~200, Push Square 300+).

## Sources

Guides are our own words; facts were cross-checked against two published guides, which agree on the counts used here (18 meditation spots, 397 stunts, 42 shooting-range challenges, 14 drone races, 18 card sets, 80 challenges, 8 garages, 9 gangs, 8 bank vaults):

- PowerPyx — GTA 6 Trophy Guide & Roadmap (powerpyx.com)
- Push Square — GTA 6 Trophy Guide & Roadmap (pushsquare.com)
- The official PS5 trophy list, as published by PlayStation.

Where the sources disagree, the guide says so: the total-time estimate (200 vs 300+ hours) and the grade of Maximum Withdrawal (official list: silver; Push Square lists bronze — the official grade wins). Two trophies are flagged unconfirmed rather than guessed at: Bad Luck, I Guess and, in part, the Chapter 1 meditation for Positive Mental Attitude.

## Run it

```sh
node serve.ts   # serves app/ at http://localhost:8080
```

Or open `app/index.html` in desktop Chrome — the app is plain static files and works with the network off. Progress is saved in localStorage under `gta6-trophy-checklist`; export and import it from the checklist page. For screenshots only, `?demo=13` ticks the first 13 trophies for display without saving anything.

## Build the dossier

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # writes out/dossier.json
```

Run it twice to two directories and compare the `dossier.json` bytes — they must be identical.

---

<sub>Entered on [make.fun](https://make.fun/?ref=jcghz3v3&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
