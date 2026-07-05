import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function createElement() {
  return {
    textContent: "",
    className: "",
    dataset: {},
    style: {},
    children: [],
    disabled: false,
    value: "8",
    classList: {
      add() {},
      remove() {},
      toggle() {}
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    addEventListener() {},
    querySelectorAll() {
      return [];
    },
    get offsetWidth() {
      return 0;
    }
  };
}

function loadApp() {
  const elements = new Map();
  const document = {
    body: createElement(),
    createElement,
    getElementById(id) {
      if (!elements.has(id)) {
        elements.set(id, createElement());
      }
      return elements.get(id);
    }
  };

  const context = {
    console,
    document,
    performance: { now: () => 0 },
    window: {
      setTimeout,
      clearTimeout,
      requestAnimationFrame() {
        return 0;
      }
    }
  };
  context.globalThis = context;
  context.window.window = context.window;
  context.window.document = document;
  context.window.performance = context.performance;

  const source = fs.readFileSync("app.js", "utf8");
  vm.runInNewContext(
    `${source}
globalThis.__pulseForgeTest = {
  ui,
  state,
  maybeShowCountdown,
  buildSegments,
  cadenceDirectionLabel
};`,
    context,
    { filename: "app.js" }
  );
  return context.__pulseForgeTest;
}

const html = fs.readFileSync("index.html", "utf8");
const app = fs.readFileSync("app.js", "utf8");

assert(!html.includes("versionSelect"), "version selector should be removed");
assert(!/narration|Commentaire live|commentaire live/i.test(html), "narration copy should be removed from HTML");
assert(!app.includes("COMMENTARY_PACKS"), "commentary packs should be removed");
assert(!app.includes("buildCoachMessage"), "segment narration builder should be removed");

const runtime = loadApp();
runtime.state.running = true;
runtime.state.segments = [
  { index: 0, label: "Cadence stable", type: "steady", bpm: 72, start: 0, end: 10, seconds: 10 },
  { index: 1, label: "Pic intense", type: "intense", bpm: 102, start: 10, end: 20, seconds: 10 },
  { index: 2, label: "Ralenti tres lent", type: "slow", bpm: 40, start: 20, end: 30, seconds: 10 }
];

runtime.maybeShowCountdown(runtime.state.segments[0], runtime.state.segments[1], 7.2);
assert.equal(runtime.ui.coachBurstText.textContent, "3", "countdown should show only the number");
assert.equal(runtime.ui.coachBurstMeta.textContent, "Accélère", "faster next cadence should say acceleration");
assert.equal(runtime.ui.coachText.textContent, "Prochain changement dans 3 s · Accélère", "inline text should stay countdown-only");

runtime.state.lastCountdownKey = "";
runtime.maybeShowCountdown(runtime.state.segments[1], runtime.state.segments[2], 17.2);
assert.equal(runtime.ui.coachBurstText.textContent, "3", "slowdown countdown should show only the number");
assert.equal(runtime.ui.coachBurstMeta.textContent, "Ralentit", "slower next cadence should say slowdown");
assert.equal(runtime.ui.coachText.textContent, "Prochain changement dans 3 s · Ralentit", "inline text should describe only countdown and direction");
