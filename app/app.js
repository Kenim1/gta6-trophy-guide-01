// Leonida Night — GTA 6 trophy guide and tracker.
// Static, offline, no network at run time: it loads data/trophies.json once
// and keeps progress, notes and settings in localStorage only.
const EARNED_KEY = "leonida-night-earned-v1";
const NOTES_KEY = "leonida-night-notes-v1";
const SPOILER_KEY = "leonida-night-spoilers-v1";
const DEMO_COUNT = 13;

const searchBox = document.getElementById("searchBox");
const gradeFilter = document.getElementById("gradeFilter");
const kindFilter = document.getElementById("kindFilter");
const spoilerToggle = document.getElementById("spoilerToggle");
const earnedOnlyBox = document.getElementById("earnedOnly");
const trophyList = document.getElementById("trophyList");
const detailPane = document.getElementById("detailPane");
const nextUpList = document.getElementById("nextUpList");
const resultHint = document.getElementById("resultHint");

let allTrophies = [];
let earned = new Set(loadStored(EARNED_KEY, []));
let notes = loadStored(NOTES_KEY, {});
let spoilersOn = loadStored(SPOILER_KEY, false);
let demoMode = false;
let selectedId = null;
let fullGuideOpen = false;

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
  return {
    q: params.get("q") || "",
    demo: Number(params.get("demo") || "0"),
  };
}

function trophyById(id) {
  return allTrophies.find((t) => t.id === id) || null;
}

function isEarned(trophy) {
  // Demo seeds the first 13 non-platinum trophies (ids 2-14): the platinum
  // itself can never be earned before the other 54, so it stays unticked.
  if (demoMode) return trophy.id >= 2 && trophy.id <= DEMO_COUNT + 1;
  return earned.has(trophy.id);
}

function saveProgress() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  refreshCounts();
}

function saveNote(id, text) {
  const clean = String(text || "").trim();
  if (clean) notes[id] = clean;
  else delete notes[id];
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

function applySpoilerSetting() {
  localStorage.setItem(SPOILER_KEY, JSON.stringify(spoilersOn));
  spoilerToggle.checked = spoilersOn;
}

function visibleName(trophy) {
  const hiddenStory = spoilersOn && trophy.kind === "story" && !isEarned(trophy);
  return hiddenStory ? "Hidden story trophy — earn it to reveal" : trophy.name;
}

function visibleDescription(trophy) {
  const hiddenStory = spoilersOn && trophy.kind === "story" && !isEarned(trophy);
  return hiddenStory ? "Spoiler hidden until earned." : trophy.description;
}

function searchTrophies(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return allTrophies;
  return allTrophies.filter((t) => {
    const hay = [t.name, t.description, t.guide, t.guide_short, t.grade, t.kind, (t.sources || []).join(" ")].join(" ").toLowerCase();
    return hay.includes(needle);
  });
}

function filteredTrophies() {
  let list = searchTrophies(searchBox.value);
  if (gradeFilter.value !== "all") list = list.filter((t) => t.grade === gradeFilter.value);
  if (kindFilter.value !== "all") list = list.filter((t) => t.kind === kindFilter.value);
  if (earnedOnlyBox.checked) list = list.filter((t) => isEarned(t));
  return list;
}

function refreshCounts() {
  const count = allTrophies.filter((t) => isEarned(t)).length;
  const total = allTrophies.length || 55;
  const pct = total ? Math.round((count / total) * 100) : 0;
  document.getElementById("earnedCount").textContent = String(count);
  document.getElementById("platinumBar").style.width = pct + "%";
  document.getElementById("platinumNote").textContent = count + " earned · " + (total - count) + " to go · " + pct + "%";
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
  for (const stage of [1, 2, 3]) {
    if (picked.length >= 5) break;
    const next = pending.find((t) => t.stage === stage && !picked.some((p) => p.trophy.id === t.id));
    if (next) {
      const label = stage === 1 ? "Stage 1 — story" : stage === 2 ? "Stage 2 — 100% checklist" : "Stage 3 — cleanup";
      picked.push({ trophy: next, reason: label + ": earliest unfinished stage, in order." });
    }
  }
  // Fill any remaining slots with the next unfinished trophies in list order.
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

function renderChecklist() {
  const list = filteredTrophies();
  trophyList.replaceChildren();
  resultHint.textContent = list.length + " of " + allTrophies.length + " trophies shown · " + allTrophies.filter((t) => isEarned(t)).length + " earned";
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
    if (trophy.missable) {
      const flag = document.createElement("div");
      flag.className = "flag";
      flag.textContent = "⚠ MISSABLE — Chapter 1 balcony";
      body.append(flag);
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
      if (event.target === box) return;
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
  kind.textContent = "Kind: " + trophy.kind + " · Stage " + trophy.stage;
  meta.append(kind);
  if (trophy.hidden) {
    const hidden = document.createElement("span");
    hidden.className = "hidden-tag";
    hidden.textContent = "Hidden on PlayStation until earned";
    meta.append(hidden);
  }
  if (trophy.missable) {
    const flag = document.createElement("span");
    flag.className = "flag";
    flag.textContent = "⚠ MISSABLE";
    meta.append(flag);
  }
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
  toggle.addEventListener("click", () => {
    fullGuideOpen = !fullGuideOpen;
    renderDetail();
  });
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
  noteArea.addEventListener("change", () => {
    saveNote(trophy.id, noteArea.value);
    renderChecklist();
  });
  noteWrap.append(noteLabel, noteArea);
  const state = document.createElement("p");
  state.className = "detail-desc";
  state.textContent = isEarned(trophy) ? "✓ Earned — ticked in your tracker." : "Not earned yet — tick the box in the list when you earn it.";
  detailPane.append(heading, meta, desc, short, toggle, full, sources, noteWrap, state);
}

function renderRoadmap() {
  const stages = [
    { n: 1, title: "Stage 1 — Story · 60–80 hours", text: "Chapters 1–4, the final mission, and the side-character finales. Do the Chapter 1 balcony meditation for Positive Mental Attitude here — it is the only missable step in the whole guide." },
    { n: 2, title: "Stage 2 — 100% checklist · about 100 hours", text: "Stranger strands, shooting-range golds, stunts, races, drone races, cards, WAiNK It, vehicles, areas and the 100% completion gold. The longest stage; start its counts during Stage 1." },
    { n: 3, title: "Stage 3 — Cleanup · about 10 hours", text: "The small jobs that are fastest in free roam: vaults, armored trucks, partner escapes, showroom smash, bowling, cocktail on Ocean Beach and the odd one-off moments." },
  ];
  const host = document.getElementById("roadmapStages");
  host.replaceChildren();
  for (const stage of stages) {
    const members = allTrophies.filter((t) => t.stage === stage.n);
    const got = members.filter((t) => isEarned(t)).length;
    const pct = members.length ? Math.round((got / members.length) * 100) : 0;
    const box = document.createElement("div");
    box.className = "stage";
    const h = document.createElement("h3");
    h.textContent = stage.title;
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
    const names = document.createElement("p");
    names.textContent = members.map((t) => visibleName(t)).join(" · ");
    box.append(h, p, count, bar, names);
    host.append(box);
  }
}

function renderMissables() {
  const host = document.getElementById("missableList");
  host.replaceChildren();
  for (const trophy of allTrophies.filter((t) => t.missable)) {
    const box = document.createElement("div");
    box.className = "stage";
    const h = document.createElement("h3");
    h.textContent = "⚠ " + trophy.name + " — " + trophy.grade;
    const p = document.createElement("p");
    p.textContent = trophy.guide;
    const s = document.createElement("p");
    s.className = "sources";
    s.textContent = "Sources: " + (trophy.sources || []).join(" · ");
    box.append(h, p, s);
    host.append(box);
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
  const views = { checklist: "view-checklist", roadmap: "view-roadmap", missables: "view-missables", about: "view-about" };
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
  if (parts[0] === "about") { showView("about"); return; }
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
}

function exportProgress() {
  const payload = { game: "Grand Theft Auto VI", earned: [...earned].sort((a, b) => a - b), notes, exportedAt: new Date().toISOString() };
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
  const response = await fetch("data/trophies.json");
  const doc = await response.json();
  allTrophies = doc.trophies;
  if (demoMode) selectedId = 28;
  searchBox.addEventListener("input", renderChecklist);
  gradeFilter.addEventListener("change", renderChecklist);
  kindFilter.addEventListener("change", renderChecklist);
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
  // A hash that names a trophy must win over the demo default.
  if (window.location.hash.startsWith("#/trophy/")) routeFromHash();
}

boot();
