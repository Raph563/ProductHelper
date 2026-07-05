const CYCLES = {
  standard: [
    { label: "Cadence stable", type: "steady", factor: 1.0, seconds: 24 },
    { label: "Pic intense", type: "intense", factor: 1.42, seconds: 14 },
    { label: "Ralenti tres lent", type: "slow", factor: 0.56, seconds: 16 },
    { label: "Reprise rapide", type: "fast", factor: 1.72, seconds: 12 },
    { label: "Phase de controle", type: "steady", factor: 0.94, seconds: 18 },
    { label: "Second pic", type: "intense", factor: 1.58, seconds: 12 },
    { label: "Chute lente", type: "slow", factor: 0.5, seconds: 15 },
    { label: "Sprint final", type: "fast", factor: 1.84, seconds: 14 }
  ],
  endurance: [
    { label: "Longue stabilite", type: "steady", factor: 0.92, seconds: 38 },
    { label: "Montee courte", type: "intense", factor: 1.32, seconds: 10 },
    { label: "Respiration lente", type: "slow", factor: 0.62, seconds: 18 },
    { label: "Recup active", type: "steady", factor: 0.88, seconds: 24 },
    { label: "Pointe rapide", type: "fast", factor: 1.54, seconds: 11 }
  ],
  chaos: [
    { label: "Impulsion brutale", type: "intense", factor: 1.64, seconds: 9 },
    { label: "Bloc lent", type: "slow", factor: 0.52, seconds: 11 },
    { label: "Flash rapide", type: "fast", factor: 1.9, seconds: 8 },
    { label: "Pivot stable", type: "steady", factor: 1.0, seconds: 14 },
    { label: "Drop extreme", type: "slow", factor: 0.45, seconds: 9 },
    { label: "Relance", type: "fast", factor: 1.74, seconds: 10 }
  ],
  pyramid: [
    { label: "Base", type: "steady", factor: 0.86, seconds: 14 },
    { label: "Marche 1", type: "steady", factor: 0.98, seconds: 14 },
    { label: "Marche 2", type: "intense", factor: 1.12, seconds: 14 },
    { label: "Sommet", type: "fast", factor: 1.36, seconds: 14 },
    { label: "Descente 1", type: "intense", factor: 1.14, seconds: 14 },
    { label: "Descente 2", type: "steady", factor: 0.95, seconds: 14 },
    { label: "Repos", type: "slow", factor: 0.72, seconds: 14 }
  ],
  boss: [
    { label: "Charge", type: "intense", factor: 1.58, seconds: 12 },
    { label: "Sprint", type: "fast", factor: 1.9, seconds: 10 },
    { label: "Freeze", type: "slow", factor: 0.48, seconds: 11 },
    { label: "Rafale", type: "fast", factor: 1.98, seconds: 9 },
    { label: "Cooldown", type: "steady", factor: 0.84, seconds: 13 }
  ],
  orbit: [
    { label: "Orbital stable", type: "steady", factor: 0.9, seconds: 16 },
    { label: "Poussee", type: "intense", factor: 1.24, seconds: 12 },
    { label: "Glisse", type: "slow", factor: 0.7, seconds: 12 },
    { label: "Acceleration", type: "fast", factor: 1.48, seconds: 12 },
    { label: "Apogee", type: "intense", factor: 1.34, seconds: 10 }
  ],
  storm: [
    { label: "Vent bas", type: "steady", factor: 0.94, seconds: 14 },
    { label: "Eclair", type: "intense", factor: 1.46, seconds: 11 },
    { label: "Pluie lourde", type: "slow", factor: 0.58, seconds: 13 },
    { label: "Rafale", type: "fast", factor: 1.76, seconds: 12 },
    { label: "Nouveau front", type: "intense", factor: 1.52, seconds: 11 }
  ],
  overload: [
    { label: "Compression", type: "steady", factor: 1.02, seconds: 12 },
    { label: "Survoltage", type: "intense", factor: 1.66, seconds: 10 },
    { label: "Trou d'air", type: "slow", factor: 0.52, seconds: 9 },
    { label: "Injection", type: "fast", factor: 1.94, seconds: 10 },
    { label: "Recalage", type: "steady", factor: 0.88, seconds: 11 }
  ],
  sniper: [
    { label: "Silence tendu", type: "slow", factor: 0.68, seconds: 16 },
    { label: "Cible fixee", type: "steady", factor: 0.94, seconds: 12 },
    { label: "Tir sec", type: "fast", factor: 1.82, seconds: 8 },
    { label: "Retenue", type: "slow", factor: 0.6, seconds: 13 },
    { label: "Tir double", type: "intense", factor: 1.42, seconds: 10 }
  ],
  blackout: [
    { label: "Noir complet", type: "slow", factor: 0.5, seconds: 12 },
    { label: "Impulse rouge", type: "intense", factor: 1.54, seconds: 10 },
    { label: "Faux calme", type: "steady", factor: 0.9, seconds: 11 },
    { label: "Flash blanc", type: "fast", factor: 1.96, seconds: 9 },
    { label: "Echo grave", type: "slow", factor: 0.58, seconds: 12 }
  ]
};

const LEVELS = [
  { id: "1", label: "Niveau 1 - Flow", baseBpm: 72, cycleKey: "standard", desc: "Progressif et regulier.", flavor: "le flow", signature: "la ligne reste propre" },
  { id: "2", label: "Niveau 2 - Pulse", baseBpm: 86, cycleKey: "standard", desc: "Plus de pics rapides.", flavor: "la pulsation", signature: "la cadence serre" },
  { id: "3", label: "Niveau 3 - Drive", baseBpm: 102, cycleKey: "standard", desc: "Rythme soutenu.", flavor: "la traction", signature: "la machine pousse" },
  { id: "4", label: "Niveau 4 - Rush", baseBpm: 118, cycleKey: "storm", desc: "Transitions rapides.", flavor: "la rafale", signature: "ca bascule vite" },
  { id: "5", label: "Niveau 5 - Turbo", baseBpm: 136, cycleKey: "overload", desc: "Haute intensite.", flavor: "la surchauffe", signature: "le plancher tremble" },
  { id: "6", label: "Niveau 6 - Orbit", baseBpm: 96, cycleKey: "orbit", desc: "Acceleration circulaire.", flavor: "l'orbite", signature: "ca tourne sans casser" },
  { id: "7", label: "Niveau 7 - Storm", baseBpm: 112, cycleKey: "storm", desc: "Vagues denses et coupures franches.", flavor: "l'orage", signature: "la pression vient par paquets" },
  { id: "8", label: "Niveau 8 - Overload", baseBpm: 144, cycleKey: "overload", desc: "Charge brutale et nerveuse.", flavor: "la surcharge", signature: "tout est sous tension" },
  { id: "S1", label: "Special - Endurance", baseBpm: 92, cycleKey: "endurance", desc: "Blocs longs avec micro-pics.", flavor: "la distance", signature: "on tient sans casser" },
  { id: "S2", label: "Special - Chaos", baseBpm: 108, cycleKey: "chaos", desc: "Alternance imprevisible rapide et lent.", flavor: "le chaos", signature: "personne n'annonce la suite" },
  { id: "S3", label: "Special - Pyramide", baseBpm: 104, cycleKey: "pyramid", desc: "Montee puis descente en etages.", flavor: "la pyramide", signature: "chaque marche compte" },
  { id: "S4", label: "Special - Boss Rush", baseBpm: 126, cycleKey: "boss", desc: "Pics frequents et pauses tres courtes.", flavor: "le boss rush", signature: "aucun round gratuit" },
  { id: "S5", label: "Special - Marathon", baseBpm: 88, cycleKey: "endurance", desc: "Longue tenue et relances dosees.", flavor: "le marathon", signature: "tu construis dans la duree" },
  { id: "S6", label: "Special - Sniper", baseBpm: 98, cycleKey: "sniper", desc: "Silences tendus puis tirs rapides.", flavor: "la visee", signature: "chaque acceleration doit tomber juste" },
  { id: "S7", label: "Special - Blackout", baseBpm: 118, cycleKey: "blackout", desc: "Contrastes sombres et flashs violents.", flavor: "le blackout", signature: "la lumiere coupe net" }
];

const ui = {
  levelSelect: document.getElementById("levelSelect"),
  durationRange: document.getElementById("durationRange"),
  durationValue: document.getElementById("durationValue"),
  volumeRange: document.getElementById("volumeRange"),
  volumeValue: document.getElementById("volumeValue"),
  volumeGaugeFill: document.getElementById("volumeGaugeFill"),
  levelHint: document.getElementById("levelHint"),
  startBtn: document.getElementById("startBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  resetBtn: document.getElementById("resetBtn"),
  statusText: document.getElementById("statusText"),
  timerText: document.getElementById("timerText"),
  momentBadge: document.getElementById("momentBadge"),
  currentBpm: document.getElementById("currentBpm"),
  progressBar: document.getElementById("progressBar"),
  segmentRail: document.getElementById("segmentRail"),
  upcomingList: document.getElementById("upcomingList"),
  coachText: document.getElementById("coachText"),
  coachBurst: document.getElementById("coachBurst"),
  coachBurstMeta: document.getElementById("coachBurstMeta"),
  coachBurstText: document.getElementById("coachBurstText"),
  pulseNode: document.getElementById("pulseNode"),
  pulseAura: document.getElementById("pulseAura"),
  pagePulseFrame: document.getElementById("pagePulseFrame")
};

const state = {
  running: false,
  finished: false,
  elapsedSec: 0,
  startedAtMs: 0,
  totalSec: 0,
  segments: [],
  activeSegmentIndex: 0,
  nextTickMs: 0,
  rafId: 0,
  tickId: 0,
  coachBurstId: 0,
  lastCountdownKey: "",
  audioCtx: null,
  volume: 68
};

init();

function init() {
  LEVELS.forEach((level) => {
    const option = document.createElement("option");
    option.value = level.id;
    option.textContent = `${level.label} (${level.baseBpm} BPM base)`;
    ui.levelSelect.appendChild(option);
  });

  ui.levelSelect.value = LEVELS[0].id;
  ui.durationValue.textContent = `${ui.durationRange.value} min`;

  ui.levelSelect.addEventListener("change", handleBlueprintChange);

  ui.durationRange.addEventListener("input", () => {
    ui.durationValue.textContent = `${ui.durationRange.value} min`;
    if (!state.running) {
      refreshSessionBlueprint();
    }
  });

  ui.volumeRange.addEventListener("input", () => {
    state.volume = Number(ui.volumeRange.value || 68);
    renderVolumeGauge();
  });

  ui.startBtn.addEventListener("click", startSession);
  ui.pauseBtn.addEventListener("click", pauseSession);
  ui.resetBtn.addEventListener("click", resetSession);

  renderVolumeGauge();
  refreshSessionBlueprint();
}

function handleBlueprintChange() {
  if (state.running) return;
  refreshSessionBlueprint();
}

function selectedLevel() {
  return LEVELS.find((level) => level.id === ui.levelSelect.value) || LEVELS[0];
}

function selectedTotalSeconds() {
  return Number(ui.durationRange.value) * 60;
}

function cycleForLevel(level) {
  return CYCLES[level.cycleKey] || CYCLES.standard;
}

function refreshSessionBlueprint() {
  const level = selectedLevel();
  state.totalSec = selectedTotalSeconds();
  state.segments = buildSegments(level, state.totalSec);
  state.lastCountdownKey = "";

  if (state.elapsedSec > state.totalSec) {
    state.elapsedSec = 0;
  }

  ui.levelHint.textContent = `Base ${level.baseBpm} BPM | ${level.desc}`;
  renderSegmentRail();
  renderVolumeGauge();
  updateDisplay(currentElapsedSeconds());
  setCountdownIdleText();
}

function buildSegments(level, totalSec) {
  const segments = [];
  const cycle = cycleForLevel(level);
  let cursor = 0;
  let cycleIndex = 0;

  while (cursor < totalSec) {
    const moment = cycle[cycleIndex % cycle.length];
    const seconds = Math.min(moment.seconds, totalSec - cursor);
    const bpm = Math.round(clamp(level.baseBpm * moment.factor, 34, 220));

    segments.push({
      index: segments.length,
      label: moment.label,
      type: moment.type,
      bpm,
      start: cursor,
      end: cursor + seconds,
      seconds
    });

    cursor += seconds;
    cycleIndex += 1;
  }

  return segments;
}

async function startSession() {
  if (state.running) return;

  if (state.finished) {
    state.elapsedSec = 0;
    state.activeSegmentIndex = 0;
    state.finished = false;
  }

  if (!state.segments.length) {
    refreshSessionBlueprint();
  }

  try {
    await ensureAudioContext();
  } catch {
    ui.statusText.textContent = "Audio bloque: verifie ton navigateur.";
    return;
  }

  state.running = true;
  state.startedAtMs = performance.now();
  state.nextTickMs = performance.now();
  state.lastCountdownKey = "";

  setButtons();
  loopDisplay();
  loopTicks();
}

function pauseSession() {
  if (!state.running) return;

  state.elapsedSec = currentElapsedSeconds();
  state.running = false;

  cancelAnimationFrame(state.rafId);
  clearTimeout(state.tickId);

  setButtons();
  updateDisplay(state.elapsedSec);
}

function resetSession() {
  state.running = false;
  state.finished = false;
  state.elapsedSec = 0;
  state.activeSegmentIndex = 0;
  state.lastCountdownKey = "";

  cancelAnimationFrame(state.rafId);
  clearTimeout(state.tickId);

  refreshSessionBlueprint();
  setButtons();
}

function finishSession() {
  state.running = false;
  state.finished = true;
  state.elapsedSec = state.totalSec;

  cancelAnimationFrame(state.rafId);
  clearTimeout(state.tickId);

  setButtons();
  updateDisplay(state.totalSec);
  setCountdownIdleText("Session terminee.");
}

function setButtons() {
  ui.startBtn.disabled = state.running;
  ui.pauseBtn.disabled = !state.running;
}

function renderVolumeGauge() {
  ui.volumeValue.textContent = `${state.volume}%`;
  ui.volumeGaugeFill.style.width = `${state.volume}%`;
}

function currentElapsedSeconds() {
  if (!state.running) {
    return state.elapsedSec;
  }
  return state.elapsedSec + (performance.now() - state.startedAtMs) / 1000;
}

function segmentForElapsed(elapsedSec) {
  if (!state.segments.length) return null;

  const clamped = clamp(elapsedSec, 0, Math.max(0, state.totalSec - 0.0001));
  const foundIndex = state.segments.findIndex((segment) => clamped >= segment.start && clamped < segment.end);

  if (foundIndex >= 0) {
    state.activeSegmentIndex = foundIndex;
    return state.segments[foundIndex];
  }

  state.activeSegmentIndex = state.segments.length - 1;
  return state.segments[state.activeSegmentIndex];
}

function loopDisplay() {
  if (!state.running) return;

  const elapsed = currentElapsedSeconds();
  if (elapsed >= state.totalSec) {
    finishSession();
    return;
  }

  updateDisplay(elapsed);
  state.rafId = requestAnimationFrame(loopDisplay);
}

function loopTicks() {
  if (!state.running) return;

  const elapsed = currentElapsedSeconds();
  if (elapsed >= state.totalSec) {
    finishSession();
    return;
  }

  const segment = segmentForElapsed(elapsed);
  const bpm = segment ? segment.bpm : selectedLevel().baseBpm;
  const intervalMs = 60000 / bpm;
  const now = performance.now();

  if (now >= state.nextTickMs) {
    playTick(segment ? segment.type : "steady");
    pulse(segment ? segment.type : "steady");
    state.nextTickMs = now + intervalMs;
  }

  state.tickId = window.setTimeout(loopTicks, 8);
}

function updateDisplay(elapsedSec) {
  const elapsed = clamp(elapsedSec, 0, state.totalSec);
  const segment = segmentForElapsed(elapsed);
  const nextSegment = segment ? state.segments[segment.index + 1] || null : null;
  const progress = state.totalSec > 0 ? (elapsed / state.totalSec) * 100 : 0;

  ui.timerText.textContent = `${formatClock(elapsed)} / ${formatClock(state.totalSec)}`;
  ui.progressBar.style.width = `${progress.toFixed(2)}%`;

  if (state.finished) {
    ui.statusText.textContent = "Session terminee";
  } else if (state.running) {
    ui.statusText.textContent = "Session en cours";
  } else if (elapsed > 0) {
    ui.statusText.textContent = "Session en pause";
  } else {
    ui.statusText.textContent = "Pret";
  }

  if (segment) {
    ui.currentBpm.textContent = `${segment.bpm}`;
    ui.momentBadge.textContent = segment.label;
    ui.momentBadge.className = `moment ${segment.type}`;
    applyMomentTheme(segment.type);

    maybeShowCountdown(segment, nextSegment, elapsed);
  }

  renderActiveSegment();
  renderUpcoming(segment ? segment.index : 0);
}

function renderSegmentRail() {
  ui.segmentRail.innerHTML = "";

  state.segments.forEach((segment) => {
    const chunk = document.createElement("span");
    chunk.className = `segment-block ${segment.type}`;
    chunk.dataset.index = String(segment.index);
    chunk.style.width = `${(segment.seconds / state.totalSec) * 100}%`;
    chunk.title = `${segment.label} - ${segment.bpm} BPM`;
    ui.segmentRail.appendChild(chunk);
  });
}

function renderActiveSegment() {
  const blocks = ui.segmentRail.querySelectorAll(".segment-block");
  blocks.forEach((block) => {
    const isActive = Number(block.dataset.index) === state.activeSegmentIndex;
    block.classList.toggle("active", isActive);
  });
}

function renderUpcoming(currentIndex) {
  const startAt = Math.min(currentIndex + 1, state.segments.length);
  const next = state.segments.slice(startAt, startAt + 3);

  ui.upcomingList.innerHTML = "";

  if (!next.length) {
    const item = document.createElement("li");
    item.textContent = "- Fin de session imminente";
    ui.upcomingList.appendChild(item);
    return;
  }

  next.forEach((segment) => {
    const item = document.createElement("li");
    item.textContent = `${segment.label} -> ${segment.bpm} BPM (${segment.seconds}s)`;
    ui.upcomingList.appendChild(item);
  });
}

function applyMomentTheme(type) {
  document.body.dataset.moment = type || "steady";
}

async function ensureAudioContext() {
  if (!state.audioCtx) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) {
      throw new Error("AudioContext unavailable");
    }
    state.audioCtx = new AudioCtor();
  }

  if (state.audioCtx.state === "suspended") {
    await state.audioCtx.resume();
  }
}

function playTick(type) {
  if (!state.audioCtx) return;

  const profile = {
    steady: { freq: 740, gain: 0.075, len: 0.055 },
    intense: { freq: 980, gain: 0.095, len: 0.05 },
    slow: { freq: 500, gain: 0.075, len: 0.07 },
    fast: { freq: 1220, gain: 0.088, len: 0.045 }
  }[type] || { freq: 740, gain: 0.075, len: 0.055 };

  const volumeFactor = clamp(state.volume / 100, 0, 1);
  if (volumeFactor <= 0) return;

  const now = state.audioCtx.currentTime;
  const oscillator = state.audioCtx.createOscillator();
  const gain = state.audioCtx.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(profile.freq, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, profile.gain * volumeFactor), now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + profile.len);

  oscillator.connect(gain);
  gain.connect(state.audioCtx.destination);

  oscillator.start(now);
  oscillator.stop(now + profile.len + 0.02);
}

function pulse(type) {
  applyMomentTheme(type);
  [ui.pulseNode, ui.pulseAura, ui.pagePulseFrame].forEach((node) => {
    node.classList.remove("beat");
  });
  window.requestAnimationFrame(() => {
    [ui.pulseNode, ui.pulseAura, ui.pagePulseFrame].forEach((node) => {
      node.classList.add("beat");
    });
  });
}

function setCoachMessage(message, options = {}) {
  const nextMessage = String(message || "").trim();
  const inlineText = String(options.inlineText || nextMessage).trim();
  const burst = options.burst !== false;
  const mode = options.mode || "countdown";
  const meta = String(options.meta || "").trim();
  const durationMs = 920;
  const changed = ui.coachText.textContent !== inlineText;

  ui.coachText.textContent = inlineText;

  if (!burst || !changed || !nextMessage) {
    return;
  }

  window.clearTimeout(state.coachBurstId);
  ui.coachBurst.dataset.mode = mode;
  ui.coachBurstMeta.textContent = meta;
  ui.coachBurstText.textContent = nextMessage;
  ui.coachBurst.classList.remove("show");
  document.body.classList.remove("coach-burst-live");

  void ui.coachBurst.offsetWidth;

  document.body.classList.add("coach-burst-live");
  ui.coachBurst.classList.add("show");
  state.coachBurstId = window.setTimeout(() => {
    ui.coachBurst.classList.remove("show");
    document.body.classList.remove("coach-burst-live");
  }, durationMs);
}

function setCountdownIdleText(message = "Le compte a rebours s'affiche dans les 3 dernieres secondes avant le changement.") {
  ui.coachText.textContent = message;
}

function maybeShowCountdown(segment, nextSegment, elapsed) {
  if (!state.running || !segment || !nextSegment) {
    state.lastCountdownKey = "";
    return;
  }

  const secondsLeft = segment.end - elapsed;
  if (secondsLeft <= 0 || secondsLeft > 3) {
    state.lastCountdownKey = "";
    setCountdownIdleText();
    return;
  }

  const value = Math.ceil(secondsLeft);
  const key = `${segment.index}:${value}`;
  if (state.lastCountdownKey === key) {
    return;
  }

  state.lastCountdownKey = key;
  const direction = cadenceDirectionLabel(segment, nextSegment);
  setCoachMessage(String(value), {
    burst: true,
    mode: "countdown",
    meta: direction,
    inlineText: `Prochain changement dans ${value} s · ${direction}`
  });
}

function cadenceDirectionLabel(currentSegment, nextSegment) {
  if (!currentSegment || !nextSegment) return "Changement";
  if (nextSegment.bpm > currentSegment.bpm) return "Accélère";
  if (nextSegment.bpm < currentSegment.bpm) return "Ralentit";
  return "Cadence stable";
}

function formatClock(rawSeconds) {
  const total = Math.max(0, Math.floor(rawSeconds));
  const mm = Math.floor(total / 60).toString().padStart(2, "0");
  const ss = (total % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
