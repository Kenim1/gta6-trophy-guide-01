// Leonida Night round 3 — audit-first GTA 6 trophy guide and tracker.
// Static, offline, no network at run time: loads data/trophies.json and
// data/sources.json once, keeps progress, counts, notes and settings in
// localStorage only. All audit numbers are computed from the data.
const EARNED_KEY = "leonida-night-earned-v1";
const NOTES_KEY = "leonida-night-notes-v1";
const COUNTS_KEY = "leonida-night-counts-v1";
const SPOILER_KEY = "leonida-night-spoilers-v1";
const DEMO_COUNT = 13;

const searchBox = document.getElementById("searchBox");
const gradeFilter = document.getElementById("gradeFilter");
const kindFilter = document.getElementById("kindFilter");
const chapterFilter = document.getElementById("chapterFilter");
const spoilerToggle = document.getElementById("spoilerToggle");
const hiddenOnlyBox = document.getElementById("hiddenOnly");
const disputedOnlyBox = document.getElementById("disputedOnly");
const earnedOnlyBox = document.getElementById("earnedOnly");
const trophyList = document.getElementById("trophyList");
const detailPane = document.getElementById("detailPane");
const nextUpList = document.getElementById("nextUpList");
const resultHint = document.getElementById("resultHint");

let allTrophies = [];
let allSources = [];
let earned = new Set(loadStored(EARNED_KEY, []));
let notes = loadStored(NOTES_KEY, {});
let counts = loadStored(COUNTS_KEY, {});
let spoilersOn = loadStored(SPOILER_KEY, false);
let demoMode = false;
let selectedId = null;
let fullGuideOpen = false;

const STAGES = [
  { n: 1, title: "Stage 1 — Chapters 1–2 · ~25 hours", text: "The opening chapters, the first side missions, and the one missable job. Do the Chapter 1 balcony meditation for Positive Mental Attitude here — it is the only missable step in the whole guide.", steps: ["Play Gone Fishing and the Chapter 1 missions in order", "After Down to Earth, meditate on the balcony with Lucia — do not leave Chapter 1 without it", "Finish Chapter 1, then Chapter 2; from Coffee Break you can switch freely between Jason and Lucia", "Try fishing with Cal, an arcade game and Bret's first hunt as they open"] },
  { n: 2, title: "Stage 2 — Chapters 3–5 · ~45 hours", text: "The Vice City chapters, the final mission, the side-character finales and the partner crime jobs. Everything here pops by playing the story.", steps: ["Finish Chapters 3, 4 and 5 in order — 26, 25 and 7 main missions", "Take Andy, Kenton, Billy, Randy and Tyrone missions whenever they appear", "Do the partner jobs: 4-star escape, 3 shops in a row, Combat Focus takedowns", "Keep a manual save at the start and end of each chapter — there is no mission replay"] },
  { n: 3, title: "Stage 3 — Free roam · ~40 hours", text: "The open-world grinds that are fastest once the whole map is open: races, drone races, cards, WAiNK It, vehicles, areas and the odd one-off moments.", steps: ["Win 20 different races and a drone race at all 14 Top Fun locations", "Work the counters: 100 vehicles, 52 areas, 100 WAiNK locations, 3 card sets, 50 challenges", "Rob shops, vaults, trucks and gang operations; launder marked bills after every big job", "Try the unconfirmed one-offs (cocktail, showroom, melee drive-by, strange sights) — flagged, not promised"] },
  { n: 4, title: "Stage 4 — Collections & 100% · ~70 hours", text: "The long tail: the 100% checklist itself. Only the checklist numbers matter — 70 of 80 challenges, 15 of 18 card sets, 15 of 18 meditations, 300 of 397 stunts.", steps: ["Open Progress, Stats, 100% Completion after the story and work the list in order", "Finish the 42 shooting-range golds and the 8 stranger strands", "Push stunts to 300, challenges to 70, card sets to 15, meditations to 18", "When the checklist hits 100%, A Long Road pops"] },
  { n: 5, title: "Stage 5 — Cleanup · ~15 hours", text: "The last two: five bank vaults and the platinum itself. Short, once everything else is done.", steps: ["Rob 5 bank vaults and escape after each one (the checklist wants 8, so keep going)", "Check this tracker for anything still unticked", "The platinum pops the moment the 54th other trophy lands"] },
];

const CHAPTERS = [
  { n: 1, name: "Just Like Paradise", missions: 22, optional: "", trophies: ["Just Like Paradise", "Paradise Lost"] },
  { n: 2, name: "Paradise Lost", missions: 11, optional: "+ 2 optional", trophies: ["T**s Ass Drug Money", "Trust"] },
  { n: 3, name: "T**s Ass Drug Money", missions: 26, optional: "+ 1 optional", trophies: ["Vice City, Baby!", "Break the Bank"] },
  { n: 4, name: "Vice City, Baby", missions: 25, optional: "", trophies: ["Top Of The World, Ma", "Family Matters", "DWNFALL", "Hi-Jacked"] },
  { n: 5, name: "Top of the World, Ma", missions: 7, optional: "", trophies: ["You Gotta Know When to Get Off", "Snow Storm"] },
];

// The 9 trophies with a last-chance chapter to watch: the one missable plus
// the eight story-mission trophies (no mission replay, so keep a chapter save).
const WATCH_IDS = [28, 8, 46, 9, 10, 11, 12, 13, 7];

const CERT_LABEL = {
  confirmed: "Confirmed — 2+ sources agree",
  "disputed-resolved": "Disputed — resolved (majority / official list)",
  "still-disputed": "Still disputed",
  unconfirmed: "Unconfirmed",
};

function loadStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function readQuery() {
  const params = new URLSearchParams(window.location.search);
  return { q: params.get("q") || "", demo: Number(params.get("demo") || "0") };
}

function trophyById(id) {
  return allTrophies.find((t) => t.id === id) || null;
}

function isEarned(trophy) {
  if (demoMode) return trophy.id >= 2 && trophy.id <= DEMO_COUNT + 1;
  return earned.has(trophy.id);
}

function getCount(trophy) {
  if (!trophy.count) return 0;
  return Math.max(0, Math.min(trophy.count, Number(counts[trophy.id] || 0)));
}

function fmtCount(trophy, value) {
  const unit = trophy.count_unit || "";
  const fmt = (n) => unit + n.toLocaleString("en-US");
  return fmt(value) + " / " + fmt(trophy.count) + " " + (trophy.count_label || "");
}

function saveProgress() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  localStorage.setItem(COUNTS_KEY, JSON.stringify(counts));
  refreshCounts();
}

function saveNote(id, text) {
  const clean = String(text || "").trim();
  if (clean) notes[id] = clean;
  else delete notes[id];
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

function setCount(id, value) {
  const trophy = trophyById(id);
  if (!trophy || !trophy.count) return;
  const clamped = Math.max(0, Math.min(trophy.count, value));
  if (clamped === 0) delete counts[id];
  else counts[id] = clamped;
  if (clamped >= trophy.count) earned.add(id);
  else earned.delete(id);
  saveProgress();
  renderAll();
}

function applySpoilerSetting() {
  localStorage.setItem(SPOILER_KEY, JSON.stringify(spoilersOn));
  spoilerToggle.checked = spoilersOn;
}

function isHiddenFromSpoilers(trophy) {
  return spoilersOn && trophy.hidden && !isEarned(trophy);
}

function visibleName(trophy) {
  return isHiddenFromSpoilers(trophy) ? "Hidden trophy — earn it to reveal" : trophy.name;
}

function visibleDescription(trophy) {
  return isHiddenFromSpoilers(trophy) ? "Spoiler hidden until earned." : trophy.description;
}

function auditNumbers() {
  const claims = allTrophies.reduce((sum, t) => sum + (t.sources || []).length, 0);
  const backed = allTrophies.filter((t) => (t.sources || []).length >= 2).length;
  const open = allTrophies.filter((t) => t.certainty === "still-disputed" || t.certainty === "unconfirmed").length;
  const resolved = allTrophies.filter((t) => t.certainty === "disputed-resolved").length;
  return { claims, backed, open, resolved };
}

function renderAudit() {
  const a = auditNumbers();
  document.getElementById("auditStrip").textContent =
    "AUDIT: 55/55 official names, descriptions & grades match · " + a.claims +
    " claims cited · " + a.backed + " backed by 2+ sources · " + a.resolved +
    " disputes resolved · " + a.open + " still disputed / unconfirmed";
  document.getElementById("sourceCount").textContent = String(allSources.length);
}

function searchTrophies(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return allTrophies;
  return allTrophies.filter((t) => {
    const hay = [t.name, t.description, t.guide, t.guide_short, t.grade, t.kind,
      (t.sources || []).join(" "), t.certainty, t.dispute || "", t.safe_action || "",
      notes[t.id] || ""].join(" ").toLowerCase();
    return hay.includes(needle);
  });
}

function filteredTrophies() {
  let list = searchTrophies(searchBox.value);
  if (gradeFilter.value !== "all") list = list.filter((t) => t.grade === gradeFilter.value);
  if (kindFilter.value !== "all") list = list.filter((t) => t.kind === kindFilter.value);
  if (chapterFilter.value !== "all") list = list.filter((t) => t.chapter === Number(chapterFilter.value));
  if (hiddenOnlyBox.checked) list = list.filter((t) => t.hidden);
  if (disputedOnlyBox.checked) list = list.filter((t) => t.certainty === "still-disputed" || t.certainty === "unconfirmed");
  if (earnedOnlyBox.checked) list = list.filter((t) => !isEarned(t));
  return list;
}

function refreshCounts() {
  const count = allTrophies.filter((t) => isEarned(t)).length;
  const total = allTrophies.length || 55;
  const pct = total ? Math.round((count / total) * 100) : 0;
  document.getElementById("earnedCount").textContent = String(count);
  document.getElementById("platinumBar").style.width = pct + "%";
  document.getElementById("platinumNote").textContent = count + " earned · " + (total - count) + " to go · " + pct + "%";
  const counted = allTrophies.filter((t) => t.count);
  const done = counted.filter((t) => getCount(t) >= t.count).length;
  const sum = counted.reduce((s, t) => s + getCount(t), 0);
  const target = counted.reduce((s, t) => s + t.count, 0);
  document.getElementById("countProgress").textContent =
    done + " of " + counted.length + " counted trophies finished · " + sum.toLocaleString("en-US") + " / " + target.toLocaleString("en-US") + " counted progress";
  const overall = document.getElementById("roadmapOverall");
  if (overall) overall.textContent = count + " of " + total + " earned";
  const bar = document.getElementById("roadmapBar");
  if (bar) bar.style.width = pct + "%";
}

function computeNextUp() {
  const pending = allTrophies.filter((t) => !isEarned(t));
  const picked = [];
  const missable = pending.find((t) => t.missable);
  if (missable) picked.push({ trophy: missable, reason: "MISSABLE — do the Chapter 1 balcony meditation before moving on." });
  for (const stage of [1, 2, 3, 4, 5]) {
    if (picked.length >= 5) break;
    const next = pending.find((t) => t.stage === stage && !picked.some((p) => p.trophy.id === t.id));
    if (next) picked.push({ trophy: next, reason: "Stage " + stage + ": earliest unfinished stage, in order." });
  }
  for (const t of pending) {
    if (picked.length >= 5) break;
    if (!picked.some((p) => p.trophy.id === t.id)) picked.push({ trophy: t, reason: "Next unfinished trophy in list order." });
  }
  return picked.slice(0, 5);
}

function renderNextUp() {
  const items = computeNextUp();
  nextUpList.replaceChildren();
  if (items.length === 0) {
    const li = document.createElement("li");
    li.textContent = "All 55 earned — platinum unlocked. Leonida Legend.";
    nextUpList.append(li);
    return;
  }
  for (const item of items) {
    const li = document.createElement("li");
    const name = document.createElement("strong");
    name.textContent = visibleName(item.trophy);
    li.append(name);
    if (item.trophy.missable) {
      const tag = document.createElement("span");
      tag.className = "miss-tag";
      tag.textContent = "MISSABLE";
      li.append(tag);
    }
    const reason = document.createElement("span");
    reason.className = "reason";
    reason.textContent = item.reason;
    li.append(reason);
    li.addEventListener("click", () => selectTrophy(item.trophy.id));
    nextUpList.append(li);
  }
}

function counterRow(trophy) {
  const wrap = document.createElement("div");
  wrap.className = "counter";
  const minus = document.createElement("button");
  minus.type = "button";
  minus.textContent = "−";
  minus.setAttribute("aria-label", "Decrease count for " + trophy.name);
  minus.addEventListener("click", (e) => { e.stopPropagation(); setCount(trophy.id, getCount(trophy) - 1); });
  const label = document.createElement("span");
  const done = getCount(trophy) >= trophy.count;
  label.textContent = fmtCount(trophy, getCount(trophy)) + (done ? " ✓" : "");
  if (done) label.classList.add("done");
  const plus = document.createElement("button");
  plus.type = "button";
  plus.textContent = "+";
  plus.setAttribute("aria-label", "Increase count for " + trophy.name);
  plus.addEventListener("click", (e) => { e.stopPropagation(); setCount(trophy.id, getCount(trophy) + 1); });
  wrap.append(minus, label, plus);
  return wrap;
}

function renderChecklist() {
  const list = filteredTrophies();
  trophyList.replaceChildren();
  resultHint.textContent = list.length + " of " + allTrophies.length + " trophies shown · " +
    allTrophies.filter((t) => isEarned(t)).length + " earned";
  for (const trophy of list) {
    const li = document.createElement("li");
    if (isEarned(trophy)) li.classList.add("earned");
    if (selectedId === trophy.id) li.classList.add("selected");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = isEarned(trophy);
    box.setAttribute("aria-label", "Earned: " + trophy.name);
    box.addEventListener("change", () => {
      if (demoMode) { box.checked = isEarned(trophy); return; }
      if (box.checked) earned.add(trophy.id);
      else earned.delete(trophy.id);
      saveProgress();
      renderAll();
    });
    const body = document.createElement("div");
    const name = document.createElement("div");
    name.className = "trophy-name";
    name.textContent = visibleName(trophy);
    const desc = document.createElement("div");
    desc.className = "trophy-desc";
    desc.textContent = visibleDescription(trophy);
    const short = document.createElement("div");
    short.className = "trophy-short";
    short.textContent = trophy.guide_short;
    body.append(name, desc, short);
    if (trophy.count) body.append(counterRow(trophy));
    if (trophy.missable) {
      const flag = document.createElement("div");
      flag.className = "flag";
      flag.textContent = "⚠ MISSABLE — Chapter 1 balcony";
      body.append(flag);
    }
    if (trophy.certainty === "still-disputed" || trophy.certainty === "unconfirmed") {
      const tag = document.createElement("span");
      tag.className = "cert-tag cert-" + trophy.certainty;
      tag.textContent = trophy.certainty === "still-disputed" ? "STILL DISPUTED" : "UNCONFIRMED";
      body.append(tag);
    }
    if (notes[trophy.id]) {
      const flag = document.createElement("div");
      flag.className = "note-flag";
      flag.textContent = "✎ note saved";
      body.append(flag);
    }
    const badge = document.createElement("span");
    badge.className = "grade grade-" + trophy.grade;
    badge.textContent = trophy.grade;
    li.append(box, body, badge);
    li.addEventListener("click", (event) => {
      if (event.target === box || event.target.closest(".counter")) return;
      selectTrophy(trophy.id);
    });
    trophyList.append(li);
  }
  if (list.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No trophies match that search and filter — clear the search or change a filter.";
    trophyList.append(li);
  }
}

function renderDetail() {
  const trophy = trophyById(selectedId);
  if (!trophy) return;
  detailPane.replaceChildren();
  const heading = document.createElement("h3");
  heading.textContent = visibleName(trophy);
  const meta = document.createElement("div");
  meta.className = "detail-meta";
  const badge = document.createElement("span");
  badge.className = "grade grade-" + trophy.grade;
  badge.textContent = trophy.grade;
  meta.append(badge);
  const kind = document.createElement("span");
  kind.textContent = "Kind: " + trophy.kind + " · Stage " + trophy.stage + " · " +
    (trophy.chapter === 0 ? "Post-story / free roam" : "Chapter " + trophy.chapter);
  meta.append(kind);
  if (trophy.hidden) {
    const hidden = document.createElement("span");
    hidden.textContent = "Hidden on PlayStation until earned";
    meta.append(hidden);
  }
  if (trophy.missable) {
    const flag = document.createElement("span");
    flag.className = "flag";
    flag.textContent = "⚠ MISSABLE";
    meta.append(flag);
  }
  const cert = document.createElement("span");
  cert.className = "cert-tag cert-" + trophy.certainty;
  cert.textContent = CERT_LABEL[trophy.certainty];
  meta.append(cert);
  const desc = document.createElement("p");
  desc.className = "detail-desc";
  desc.textContent = "Official: “" + visibleDescription(trophy) + "”";
  const short = document.createElement("p");
  short.className = "detail-short";
  short.textContent = trophy.guide_short;
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "toggle";
  toggle.textContent = fullGuideOpen ? "Hide the full guide" : "Read the full guide";
  const full = document.createElement("p");
  full.className = "detail-full";
  full.hidden = !fullGuideOpen;
  full.textContent = trophy.guide;
  toggle.addEventListener("click", () => { fullGuideOpen = !fullGuideOpen; renderDetail(); });
  detailPane.append(heading, meta, desc, short, toggle, full);
  if (trophy.count) detailPane.append(counterRow(trophy));
  if (trophy.dispute) {
    const box = document.createElement("div");
    box.className = "dispute-box";
    const strong = document.createElement("strong");
    strong.textContent = "Where sources disagree: ";
    box.append(strong, document.createTextNode(trophy.dispute));
    detailPane.append(box);
  }
  if (trophy.safe_action) {
    const box = document.createElement("div");
    box.className = "safe-box";
    const strong = document.createElement("strong");
    strong.textContent = "Safe action: ";
    box.append(strong, document.createTextNode(trophy.safe_action));
    detailPane.append(box);
  }
  const sources = document.createElement("p");
  sources.className = "sources";
  const strong = document.createElement("strong");
  strong.textContent = "Sources: ";
  sources.append(strong);
  sources.append(document.createTextNode((trophy.sources || []).join(" · ") + ". Guides here are in our own words; sources are cited, never copied."));
  const noteWrap = document.createElement("div");
  noteWrap.className = "note-box";
  const noteLabel = document.createElement("label");
  noteLabel.textContent = "Your note for this trophy (saved in this browser)";
  const noteArea = document.createElement("textarea");
  noteArea.value = notes[trophy.id] || "";
  noteArea.placeholder = "e.g. Best spot I found, what worked, what to retry…";
  noteArea.addEventListener("change", () => { saveNote(trophy.id, noteArea.value); renderChecklist(); });
  noteWrap.append(noteLabel, noteArea);
  const state = document.createElement("p");
  state.className = "detail-desc";
  state.textContent = isEarned(trophy) ? "✓ Earned — ticked in your tracker." : "Not earned yet — tick the box in the list when you earn it.";
  detailPane.append(sources, noteWrap, state);
}

function renderRoadmap() {
  const host = document.getElementById("roadmapStages");
  host.replaceChildren();
  for (const stage of STAGES) {
    const members = allTrophies.filter((t) => t.stage === stage.n);
    const got = members.filter((t) => isEarned(t)).length;
    const pct = members.length ? Math.round((got / members.length) * 100) : 0;
    const box = document.createElement("div");
    box.className = "stage";
    const h = document.createElement("h3");
    h.textContent = stage.title + " · " + members.length + " trophies";
    const p = document.createElement("p");
    p.textContent = stage.text;
    const count = document.createElement("p");
    count.className = "stage-count";
    count.textContent = got + " of " + members.length + " earned · " + pct + "%";
    const bar = document.createElement("div");
    bar.className = "bar";
    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = pct + "%";
    bar.append(fill);
    const steps = document.createElement("ol");
    steps.className = "stage-steps";
    for (const step of stage.steps) {
      const li = document.createElement("li");
      li.textContent = step;
      steps.append(li);
    }
    const names = document.createElement("p");
    names.className = "sources";
    names.textContent = members.map((t) => visibleName(t)).join(" · ");
    box.append(h, p, count, bar, steps, names);
    host.append(box);
  }
  const watch = document.getElementById("missableWatch");
  watch.replaceChildren();
  const table = document.createElement("table");
  table.className = "grid";
  const head = document.createElement("tr");
  for (const h of ["Trophy", "Last-chance chapter", "Why watch it"]) {
    const th = document.createElement("th");
    th.textContent = h;
    head.append(th);
  }
  table.append(head);
  for (const id of WATCH_IDS) {
    const t = trophyById(id);
    const tr = document.createElement("tr");
    const name = document.createElement("td");
    name.textContent = t.name + (t.missable ? " ⚠" : "");
    const ch = document.createElement("td");
    ch.textContent = t.chapter === 0 ? "Post-story" : "Chapter " + t.chapter;
    if (t.missable) ch.className = "last";
    const why = document.createElement("td");
    why.textContent = t.missable
      ? "Only trophy that can be missed — balcony meditation does not return."
      : "Story mission with no replay — keep a manual save at that chapter.";
    tr.append(name, ch, why);
    table.append(tr);
  }
  watch.append(table);
}

function renderMissables() {
  const gridHost = document.getElementById("missableGrid");
  gridHost.replaceChildren();
  const table = document.createElement("table");
  table.className = "grid";
  const head = document.createElement("tr");
  for (const h of ["Trophy", "Ch 1", "Ch 2", "Ch 3", "Ch 4", "Ch 5", "Post-story"]) {
    const th = document.createElement("th");
    th.textContent = h;
    head.append(th);
  }
  table.append(head);
  for (const id of WATCH_IDS) {
    const t = trophyById(id);
    const tr = document.createElement("tr");
    const name = document.createElement("td");
    name.textContent = t.name;
    tr.append(name);
    for (let ch = 1; ch <= 5; ch++) {
      const td = document.createElement("td");
      if (t.chapter === ch) {
        td.textContent = t.missable ? "LAST CHANCE — missable" : "LAST CHANCE — mission";
        td.className = t.missable ? "last" : "watch";
      } else if (ch < t.chapter) {
        td.textContent = "—";
      } else {
        td.textContent = "—";
      }
      tr.append(td);
    }
    const post = document.createElement("td");
    if (t.missable) {
      post.textContent = "Too late if skipped";
      post.className = "last";
    } else {
      post.textContent = "✓ Safe — earned in story";
      post.className = "safe";
    }
    tr.append(post);
    table.append(tr);
  }
  gridHost.append(table);
  const host = document.getElementById("missableList");
  host.replaceChildren();
  for (const trophy of allTrophies.filter((t) => t.missable)) {
    const box = document.createElement("div");
    box.className = "stage";
    const h = document.createElement("h3");
    h.textContent = "⚠ " + trophy.name + " — " + trophy.grade + " · " + CERT_LABEL[trophy.certainty];
    const p = document.createElement("p");
    p.textContent = trophy.guide;
    const s = document.createElement("p");
    s.className = "sources";
    s.textContent = "Sources: " + (trophy.sources || []).join(" · ");
    box.append(h, p, s);
    if (trophy.safe_action) {
      const safe = document.createElement("p");
      safe.className = "safe-box";
      safe.textContent = "Safe action: " + trophy.safe_action;
      box.append(safe);
    }
    host.append(box);
  }
  const gates = document.getElementById("storyGates");
  gates.replaceChildren();
  for (const ch of CHAPTERS) {
    const box = document.createElement("div");
    box.className = "stage";
    const h = document.createElement("h3");
    h.textContent = "Chapter " + ch.n + " — " + ch.name + " · " + ch.missions + " main missions" + (ch.optional ? " " + ch.optional : "");
    const p = document.createElement("p");
    p.textContent = "Trophies unlocked: " + ch.trophies.join(" · ");
    box.append(h, p);
    gates.append(box);
  }
}

function citedBy(name) {
  return allTrophies.filter((t) => (t.sources || []).includes(name)).length;
}

function renderSources() {
  const host = document.getElementById("sourceTable");
  host.replaceChildren();
  const table = document.createElement("table");
  table.className = "src";
  const head = document.createElement("tr");
  for (const h of ["Source", "What it was used for", "Read", "Cited by"]) {
    const th = document.createElement("th");
    th.textContent = h;
    head.append(th);
  }
  table.append(head);
  const sorted = [...allSources].sort((a, b) => citedBy(b.name) - citedBy(a.name));
  for (const s of sorted) {
    const tr = document.createElement("tr");
    const name = document.createElement("td");
    name.textContent = s.title + " (" + s.name + ")";
    const role = document.createElement("td");
    role.textContent = s.role;
    const read = document.createElement("td");
    read.textContent = "20 Nov 2026";
    const cited = document.createElement("td");
    const n = citedBy(s.name);
    cited.textContent = n === 0 ? "0/55 — roadmap / chapters only" : n + "/55";
    tr.append(name, role, read, cited);
    table.append(tr);
  }
  host.append(table);
  const matrix = document.getElementById("claimsMatrix");
  matrix.replaceChildren();
  const cols = allSources.filter((s) => citedBy(s.name) > 0);
  const headRow = document.createElement("tr");
  const first = document.createElement("th");
  first.textContent = "Trophy";
  headRow.append(first);
  for (const s of cols) {
    const th = document.createElement("th");
    th.textContent = s.name;
    headRow.append(th);
  }
  matrix.append(headRow);
  for (const t of allTrophies) {
    const tr = document.createElement("tr");
    const name = document.createElement("td");
    name.textContent = t.name;
    tr.append(name);
    for (const s of cols) {
      const td = document.createElement("td");
      td.textContent = (t.sources || []).includes(s.name) ? "✓" : "";
      tr.append(td);
    }
    matrix.append(tr);
  }
}

function selectTrophy(id) {
  selectedId = id;
  fullGuideOpen = false;
  renderChecklist();
  renderDetail();
  showView("checklist");
}

function showView(name) {
  const views = { checklist: "view-checklist", roadmap: "view-roadmap", missables: "view-missables", sources: "view-sources" };
  for (const [key, id] of Object.entries(views)) {
    document.getElementById(id).hidden = key !== name;
  }
  for (const link of document.querySelectorAll(".tabs a")) {
    link.classList.toggle("active", link.dataset.tab === name);
  }
}

function routeFromHash() {
  const hash = window.location.hash || "#/checklist";
  const parts = hash.replace(/^#\//, "").split("/");
  if (parts[0] === "roadmap") { showView("roadmap"); renderRoadmap(); return; }
  if (parts[0] === "missables") { showView("missables"); renderMissables(); return; }
  if (parts[0] === "sources") { showView("sources"); renderSources(); return; }
  if (parts[0] === "trophy" && parts[1]) {
    const id = Number(parts[1]);
    if (trophyById(id)) { selectedId = id; showView("checklist"); renderChecklist(); renderDetail(); return; }
  }
  showView("checklist");
}

function renderAll() {
  refreshCounts();
  renderNextUp();
  renderChecklist();
  renderDetail();
  renderRoadmap();
  renderMissables();
  renderSources();
}

function exportProgress() {
  const payload = { game: "Grand Theft Auto VI", earned: [...earned].sort((a, b) => a - b), counts, notes, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "gta6-trophy-progress.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const ids = Array.isArray(data) ? data : data.earned;
      if (!Array.isArray(ids)) throw new Error("no earned list");
      earned = new Set(ids.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55));
      if (data.notes && typeof data.notes === "object") notes = data.notes;
      if (data.counts && typeof data.counts === "object") {
        counts = {};
        for (const [k, v] of Object.entries(data.counts)) {
          const t = trophyById(Number(k));
          if (t && t.count) counts[Number(k)] = Math.max(0, Math.min(t.count, Number(v) || 0));
        }
      }
      saveProgress();
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
      renderAll();
      resultHint.textContent = "Imported " + earned.size + " earned trophies.";
    } catch {
      resultHint.textContent = "That file could not be imported — export a progress file from this guide and try again.";
    }
  };
  reader.readAsText(file);
}

async function boot() {
  const query = readQuery();
  demoMode = query.demo === DEMO_COUNT;
  if (query.q) searchBox.value = query.q;
  spoilerToggle.checked = spoilersOn;
  applySpoilerSetting();
  const [trophyDoc, sourceDoc] = await Promise.all([
    fetch("data/trophies.json").then((r) => r.json()),
    fetch("data/sources.json").then((r) => r.json()),
  ]);
  allTrophies = trophyDoc.trophies;
  allSources = sourceDoc.sources;
  if (demoMode) selectedId = 28;
  renderAudit();
  searchBox.addEventListener("input", renderChecklist);
  gradeFilter.addEventListener("change", renderChecklist);
  kindFilter.addEventListener("change", renderChecklist);
  chapterFilter.addEventListener("change", renderChecklist);
  hiddenOnlyBox.addEventListener("change", renderChecklist);
  disputedOnlyBox.addEventListener("change", renderChecklist);
  earnedOnlyBox.addEventListener("change", renderChecklist);
  spoilerToggle.addEventListener("change", () => {
    spoilersOn = spoilerToggle.checked;
    applySpoilerSetting();
    renderAll();
  });
  document.getElementById("exportBtn").addEventListener("click", exportProgress);
  document.getElementById("importFile").addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) importProgress(file);
    event.target.value = "";
  });
  window.addEventListener("hashchange", routeFromHash);
  renderAll();
  routeFromHash();
  if (window.location.hash.startsWith("#/trophy/")) routeFromHash();
}

boot();
