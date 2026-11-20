// Leonida Trophy Guide: checklist tracker, roadmap and missables for GTA VI on PS5.
// Loads the trophy data, keeps earned ticks in localStorage, and renders three hash views:
// #/ (checklist with a guide detail pane), #/trophy/<id>, #/roadmap, #/missables.
// A ?demo=N query ticks the first N trophies for screenshots only; real users start at 0.
const STORAGE_KEY = 'gta6-trophy-checklist';
const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detailPane');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('gradeFilter');
const kindEl = document.getElementById('kindFilter');
const earnedEl = document.getElementById('earnedFilter');
const spoilerEl = document.getElementById('spoilerToggle');
const countsEl = document.getElementById('countsLine');
const emptyEl = document.getElementById('emptyNote');

const params = new URLSearchParams(location.search);
const demoCount = Math.max(0, Math.min(55, Number(params.get('demo')) || 0));
let trophies = [];
let earned = loadEarned();
let selectedId = null;

function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(raw)) return new Set();
    // The starter stored trophy names; this build stores ids. Accept both.
    const ids = new Set();
    for (const v of raw) {
      if (typeof v === 'number') ids.add(v);
    }
    if (ids.size === 0) {
      for (const v of raw) {
        const t = trophies.find((x) => x.name === v);
        if (t) ids.add(t.id);
      }
    }
    return ids;
  } catch {
    return new Set();
  }
}

function saveEarned() {
  if (demoCount > 0) return; // demo ticks are display-only, never saved
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function displayEarned() {
  if (demoCount > 0) return new Set(trophies.slice(0, demoCount).map((t) => t.id));
  return earned;
}

function gradeLabel(t) {
  return t.grade.charAt(0).toUpperCase() + t.grade.slice(1);
}

function kindLabel(t) {
  if (t.kind === 'missable') return 'Missable';
  if (t.kind === 'collectible') return 'Collectible';
  if (t.kind === 'story') return 'Story';
  return 'Activity';
}

function isHiddenBySpoiler(t) {
  return spoilerEl.checked && t.kind === 'story' && !displayEarned().has(t.id);
}

function trophyMatches(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide} ${kindLabel(t)}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (kindEl.value !== 'all') {
    if (kindEl.value === 'collectible' && t.kind !== 'collectible') return false;
    if (kindEl.value !== 'collectible' && t.kind !== kindEl.value) return false;
  }
  const got = displayEarned().has(t.id);
  if (earnedEl.value === 'earned' && !got) return false;
  if (earnedEl.value === 'remaining' && got) return false;
  return true;
}

function renderProgress() {
  const got = displayEarned().size;
  const total = trophies.length || 55;
  const pct = Math.round((got / total) * 100);
  document.getElementById('progressCount').textContent = `${got} / ${total} earned`;
  document.getElementById('progressPct').textContent = `${pct}% to platinum`;
  document.getElementById('progressFill').style.width = `${pct}%`;
  document.getElementById('progressBar').setAttribute('aria-valuenow', String(got));
  document.getElementById('progressNote').textContent =
    got === total
      ? 'Platinum earned — Vice Got a Price! You are a Leonida Legend.'
      : got === 0
        ? 'Tick a trophy when you earn it — progress is saved in this browser.'
        : `${total - got} to go. Next: finish the story, then the 100% checklist.`;
}

function renderList() {
  const shown = trophies.filter(trophyMatches);
  listEl.replaceChildren();
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = displayEarned().has(t.id) ? 'earned' : '';
    if (selectedId === t.id) li.classList.add('selected');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = displayEarned().has(t.id);
    box.setAttribute('aria-label', `Earned: ${t.name}`);
    box.addEventListener('change', () => {
      if (demoCount > 0) {
        box.checked = !box.checked; // demo mode: ticks are display-only
        return;
      }
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      saveEarned();
      renderAll();
    });
    box.addEventListener('click', (e) => e.stopPropagation());
    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'trophy-name';
    if (isHiddenBySpoiler(t)) {
      name.textContent = 'Hidden story trophy — earn it to reveal';
    } else {
      name.textContent = t.name;
      if (t.missable) {
        const flag = document.createElement('span');
        flag.className = 'missable-flag';
        flag.textContent = 'MISSABLE';
        name.append(flag);
      }
    }
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = isHiddenBySpoiler(t) ? 'Story trophy — name and description hidden by the spoiler setting.' : t.description;
    const snippet = document.createElement('div');
    snippet.className = 'trophy-guide-snippet';
    snippet.textContent = isHiddenBySpoiler(t) ? '' : t.guide.slice(0, 160) + (t.guide.length > 160 ? '…' : '');
    body.append(name, desc, snippet);
    const badge = document.createElement('span');
    badge.className = `badge ${t.grade}`;
    badge.textContent = gradeLabel(t);
    li.append(box, body, badge);
    li.addEventListener('click', () => {
      location.hash = `#/trophy/${t.id}`;
    });
    listEl.append(li);
  }
  emptyEl.hidden = shown.length !== 0;
  countsEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies · ${displayEarned().size} earned · ${trophies.filter((t) => t.missable).length} missable · ${trophies.filter((t) => t.kind === 'story').length} story · ${trophies.filter((t) => t.kind === 'collectible').length} collectibles · ${trophies.filter((t) => t.kind === 'activity').length} activities`;
}

function renderDetail() {
  const t = trophies.find((x) => x.id === selectedId);
  if (!t) {
    detailEl.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'empty-detail';
    p.textContent = 'Click any trophy to open its full guide here — what to do, where, when it can be missed, and the sources each fact was checked against.';
    const hint = document.createElement('p');
    hint.className = 'empty-detail';
    hint.textContent = 'Start with the one trophy that can be missed: Positive Mental Attitude, in Chapter 1.';
    detailEl.append(p, hint);
    return;
  }
  detailEl.innerHTML = '';
  const h = document.createElement('h2');
  h.textContent = isHiddenBySpoiler(t) ? 'Hidden story trophy' : t.name;
  const meta = document.createElement('div');
  meta.className = 'meta';
  const badge = document.createElement('span');
  badge.className = `badge ${t.grade}`;
  badge.textContent = gradeLabel(t);
  meta.append(badge);
  const kind = document.createElement('span');
  kind.className = 'kind-line';
  kind.textContent = `${kindLabel(t)} · Roadmap stage ${t.stage} · ${t.missable ? 'MISSABLE — see warning below' : 'Not missable'}`;
  meta.append(kind);
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = isHiddenBySpoiler(t)
    ? 'Official name and description hidden by the spoiler setting until this trophy is earned.'
    : `Official description: “${t.description}”`;
  const guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = isHiddenBySpoiler(t) ? '' : t.guide;
  detailEl.append(h, meta, official, guide);
  if (t.missable) {
    const warn = document.createElement('p');
    warn.className = 'missable-card';
    warn.textContent = '⚠ MISSABLE: do the Chapter 1 balcony meditation with Lucia after the mission Down to Earth, before leaving Chapter 1. It is still unconfirmed whether this first meditation is required for the trophy — do it anyway to be safe.';
    detailEl.append(warn);
  }
  if (!isHiddenBySpoiler(t)) {
    const srcTitle = document.createElement('p');
    srcTitle.textContent = 'Sources — where each fact above was checked:';
    const srcList = document.createElement('ul');
    srcList.className = 'sources';
    for (const s of t.sources || []) {
      const li = document.createElement('li');
      li.textContent = s;
      srcList.append(li);
    }
    detailEl.append(srcTitle, srcList);
  }
}

const STAGES = [
  {
    n: 1,
    title: 'Stage 1 — Story (60–80 hours)',
    text: 'Play the story and enjoy it. Finish every chapter and main mission, do the questlines for Andy, Kenton, Billy, Randy and Tyrone as they appear, and grab the Chapter 1 meditation. Keep a manual save at the start and end of each chapter. There are no mission gold medals and no mission replay, so saves are your safety net.',
  },
  {
    n: 2,
    title: 'Stage 2 — 100% checklist (about 100 hours)',
    text: 'After the story, open Progress, then Stats, then 100% Completion. Work the checklist: 300 stunts, 42 shooting-range golds, 14 drone-race locations, 15 of 18 card sets, 100 of 255 animals studied, 200 of 277 vehicles scanned, all 8 bank vaults, all 39 gang operations, any 70 of 80 challenges, any 100 optional missions. Most of this is partial credit — the checklist is closer to 60% true completion.',
  },
  {
    n: 3,
    title: 'Stage 3 — Cleanup (about 10 hours)',
    text: 'Finish what is left: the 8 stranger strands, the partner trophies (4-star escape, 3 shops in a row), the one-off stunts (plane at VCIA, tank at Mile Zero, blue Banshee through the showroom window), the UFO easter egg, max strength with both characters, and the money trophies. The platinum pops when the last one lands.',
  },
];

function renderRoadmap() {
  const wrap = document.getElementById('roadmapStages');
  wrap.replaceChildren();
  for (const s of STAGES) {
    const card = document.createElement('div');
    card.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = s.title;
    const count = document.createElement('p');
    count.className = 'stage-count';
    const members = trophies.filter((t) => t.stage === s.n);
    count.textContent = `${members.length} trophies in this stage`;
    const p = document.createElement('p');
    p.textContent = s.text;
    const ul = document.createElement('ul');
    for (const t of members) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#/trophy/${t.id}`;
      a.textContent = displayEarned().has(t.id) ? `✓ ${t.name}` : t.name;
      li.append(a);
      ul.append(li);
    }
    card.append(h, count, p, ul);
    wrap.append(card);
  }
}

function renderMissables() {
  const wrap = document.getElementById('missablesList');
  wrap.replaceChildren();
  const miss = trophies.filter((t) => t.missable);
  for (const t of miss) {
    const card = document.createElement('div');
    card.className = 'missable-card';
    const h = document.createElement('h3');
    h.textContent = `${t.name} — ${gradeLabel(t)}`;
    const p = document.createElement('p');
    p.textContent = t.guide;
    const a = document.createElement('a');
    a.href = `#/trophy/${t.id}`;
    a.textContent = 'Open the full guide →';
    card.append(h, p, a);
    wrap.append(card);
  }
  const note = document.createElement('p');
  note.textContent = `That is the whole list: ${miss.length} missable trophy out of ${trophies.length}. The other 54 can all be earned after the story in free-roam.`;
  wrap.append(note);
}

function setActiveTab(view) {
  for (const [id, on] of [['tabChecklist', view === 'checklist'], ['tabRoadmap', view === 'roadmap'], ['tabMissables', view === 'missables']]) {
    document.getElementById(id).classList.toggle('active', on);
  }
  document.getElementById('viewChecklist').hidden = view !== 'checklist';
  document.getElementById('viewRoadmap').hidden = view !== 'roadmap';
  document.getElementById('viewMissables').hidden = view !== 'missables';
}

function route() {
  const hash = location.hash || '#/';
  const m = hash.match(/^#\/trophy\/(\d+)/);
  if (m) {
    selectedId = Number(m[1]);
    setActiveTab('checklist');
    renderList();
    renderDetail();
    return;
  }
  if (hash.startsWith('#/roadmap')) {
    setActiveTab('roadmap');
    renderRoadmap();
    return;
  }
  if (hash.startsWith('#/missables')) {
    setActiveTab('missables');
    renderMissables();
    return;
  }
  selectedId = null;
  setActiveTab('checklist');
  renderList();
  renderDetail();
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
}

document.getElementById('exportBtn').addEventListener('click', () => {
  const data = { game: 'Grand Theft Auto VI', exported: new Date().toISOString(), earned: [...displayEarned()].sort((a, b) => a - b) };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('importInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const next = new Set();
    for (const v of ids || []) {
      if (typeof v === 'number' && trophies.some((t) => t.id === v)) next.add(v);
      if (typeof v === 'string') {
        const t = trophies.find((x) => x.name === v);
        if (t) next.add(t.id);
      }
    }
    earned = next;
    saveEarned();
    renderAll();
  } catch {
    countsEl.textContent = 'That file could not be imported — it is not a progress file from this guide.';
  }
  e.target.value = '';
});

for (const el of [searchEl, gradeEl, kindEl, earnedEl, spoilerEl]) {
  el.addEventListener('input', () => {
    renderList();
    renderDetail();
  });
}
window.addEventListener('hashchange', route);

const doc = await (await fetch('data/trophies.json')).json();
trophies = doc.trophies || [];
earned = loadEarned(); // re-run now that trophy names are known (starter stored names)
if (demoCount > 0) {
  document.getElementById('progressNote').textContent = `Demo view: first ${demoCount} trophies ticked for the screenshot. Real progress starts at 0.`;
}
renderProgress();
route();
