[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Kenim1/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Kenim1/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Night — GTA 6 Trophy Guide & Tracker

An offline web app that guides and tracks all **55 PlayStation 5 trophies** of
Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden.
Built for the make.fun bounty
[Build the best GTA 6 trophy guide](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **Tracker + data** — every trophy with its exact official name, description
  and grade, a checklist saved in `localStorage`, export to a JSON file and
  import back, filters by grade and kind (story / missable / collectible /
  activity), and a spoiler setting that hides story trophy names and
  descriptions until they are earned.
- **Next-up planner** — missable first, then the earliest unfinished roadmap
  stage in order (max 5), each with a reason line; click a row to open its guide.
- **Roadmap to the platinum** — 3 stages: story (60–80 h), the 100% checklist
  (~100 h), cleanup (~10 h), each with earned/total and a progress bar, plus an
  overall platinum bar. Published guides disagree on the total (about 200 h in
  some, 300+ in others); the guide says so instead of picking one number.
- **Missables** — exactly **one** potentially missable trophy:
  **Positive Mental Attitude**: meditate on the balcony with Lucia after the
  mission Down to Earth, in Chapter 1. Everything else can be earned in free
  roam after the story.
- **Cited guidance** — every trophy has a full guide and a short guide
  (≤240 characters) written in our own words, with its sources named beside
  it: PowerPyx (GTA 6 Trophy Guide & Roadmap), Push Square (GTA 6 Trophy Guide
  & Roadmap), Exophase (GTA 6 trophy list), PSNProfiles (GTA 6 trophy list)
  and the official PlayStation trophy list. Sources are cited, never copied.
  Where sources disagree, the guide says so (for example, Maximum Withdrawal
  is silver on the official list).
- **Per-trophy notes** — write a note in the detail pane; it is saved in
  `localStorage`, flagged in the list, and included in export/import.
- **Search** — a prominent search box at the top of the checklist filters live
  by name, description, guide and sources; `?q=` prefills it.
- **Demo view** — `?demo=13` ticks the first 13 trophies for display only
  (nothing is saved).

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

- `1-checklist.jpg` — checklist with the Next-up planner, missable guide open
- `2-roadmap.jpg` — the 3-stage roadmap with progress bars
- `3-missables.jpg` — the one missable trophy, with the warning
- `4-detail.jpg` — live search for "vault", Maximum Withdrawal guide open

All four are real renders of this app, taken at 1280×800.

## License

MIT — see `LICENSE`.

<sub>Entered on [make.fun](https://make.fun/?ref=jcghz3v3&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
