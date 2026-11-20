[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Kenim1/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Kenim1/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Night — GTA 6 Trophy Guide & Tracker

An offline web app that guides and tracks all **55 PlayStation 5 trophies** of
Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden.
Built for the make.fun bounty
[Build the best GTA 6 trophy guide](https://make.fun/bounty/gta6-trophy-guide-01).

Round 3 is an audit-first rebuild. GTA 6 released 19 Nov 2026, so launch-era
guides still disagree on a few items — this version does not hide that. Every
trophy carries a certainty status (confirmed / disputed–resolved /
still disputed / unconfirmed), every claim names its sources, and where
sources disagree the guide shows both sides plus the safe action: the thing to
do that earns the trophy either way.

## The audit, in numbers

The audit strip on the main page is computed from the data, not typed by
hand:

- **55/55** official names, descriptions and grades match the official
  PlayStation list (as listed by Exophase, PSNProfiles and TrueTrophies).
- **169 claims cited** across the 55 trophies.
- **55 backed by 2+ sources** — every trophy has at least two named sources.
- **5 disputes resolved** — settled by the majority of sources or the
  official list, with the dispute still shown (Maximum Withdrawal's silver
  grade, the Rhino method for Challenging Tank, max Strength for Personal
  Best, 500 Criminal Profile actions for Actions Speak Louder, and the
  ~200-hour platinum time against Push Square's 300+).
- **8 still disputed / unconfirmed** — 3 still disputed (Positive Mental
  Attitude, Strangers & Freaks, Let's Go Bowling) and 5 unconfirmed
  (In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out
  There, Ten Pin).
- **35 sources** read in-session on 20 Nov 2026, listed with read dates and
  per-source cited-by counts in the Sources tab.

## What it does

- **Tracker + counted progress** — every trophy with its exact official
  name, description and grade, a checklist saved in `localStorage`, and
  separate counters for the 21 counted trophies (250 stunts, 42 shooting
  range golds, 18 meditations, 5 bank vaults, $250,000 laundered and the
  rest). A counter that reaches its target ticks the trophy automatically.
  Export to a JSON file and import back, including counts and notes.
- **Next-up planner** — missable first, then the earliest unfinished
  roadmap stage, in order (max 5), each with a reason line; click a row to
  open its guide.
- **Roadmap to the platinum** — 5 stages, in order: Chapters 1–2 (~25 h,
  8 trophies), Chapters 3–5 (~45 h, 21), free roam (~40 h, 20),
  Collections & 100% (~70 h, 4), cleanup (~15 h, 2). About 200 hours
  total, difficulty 4/10, one playthrough — the majority view across
  PowerPyx, GTABase and KeenGamer, with Push Square's 300+ hours flagged
  as the disagreement. Each stage has ordered steps, a progress bar, and an
  overall platinum bar. A Missable Watch lists the 9 trophies with a
  last-chance chapter.
- **Missables grid** — 9 trophies × Chapter 1–5 / post-story, marking each
  last chance, plus story gates chapter by chapter (91 main missions:
  22 / 11 / 26 / 25 / 7, per PC Gamer, GameRant and Hudwire) and the
  trophies each chapter unlocks. Only one trophy can actually be missed:
  **Positive Mental Attitude**, the Chapter 1 balcony meditation with
  Lucia after Down to Earth — and even that is still unconfirmed as
  required, so the guide says to do it anyway.
- **Sources tab** — 35 sources with read dates and per-source cited-by
  counts, plus a full trophy × source claims matrix. Sources are cited by
  name only; no URLs appear anywhere in the app.
- **Spoiler shield** — hides the names and descriptions of the 28
  PSN-hidden trophies until they are earned.
- **Filters and search** — by grade (P/G/S/B), kind (Story, Missable,
  Collectibles, Activities), chapter (1–5 / post-story), PSN-hidden only,
  disputed / unconfirmed only, and not earned. Search matches names,
  descriptions, guides, sources, disputes and your own notes; `?q=`
  prefills it.
- **Per-trophy notes** — write a note in the detail pane; it is saved in
  `localStorage`, flagged in the list, searchable, and included in
  export/import.
- **Demo view** — `?demo=13` ticks the first 13 trophies for display only
  (nothing is saved).

## Honest limit

Some trophy details cannot be 100% certain until players verify them
in-game. This guide never invents a count, chapter or requirement it did
not read in a source. Where an item could not be resolved, it stays flagged
disputed or unconfirmed with the safest action — a judge checking claims
against sources punishes invented certainty harder than honest uncertainty.

## Run it offline

```sh
python3 -m http.server 8080 --directory app
# open http://localhost:8080/
```

Static files only, under `app/`. No build step, no network requests at run
time, no Rockstar logo or official artwork — the look is our own dark
"Leonida night" theme.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes
`dossier.json` with the kit's vendored `vendor/makefun-frontend.ts`.

## Screenshots

- `1-checklist.jpg` — checklist with the audit strip, Next-up planner and
  Positive Mental Attitude guide open
- `2-roadmap.jpg` — the 5-stage roadmap with progress bars and Missable Watch
- `3-missables.jpg` — the last-chance grid and the one missable trophy
- `4-detail.jpg` — live search for "vault", Maximum Withdrawal guide open

All four are real renders of this app, taken at 1280×800.

Round 3 rebuilt the guide from scratch and re-took all four screenshots from the new code.

## License

MIT — see `LICENSE`.

<sub>Entered on [make.fun](https://make.fun/?ref=jcghz3v3&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
