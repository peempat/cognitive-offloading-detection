const STORAGE_KEY = "cdt_turns";
const scoring = window.CognitiveDebtScoring;

function colorFor(score) {
  if (score >= 70) return "#dd5d4f";
  if (score >= 45) return "#c58a1d";
  return "#3aa17e";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function render(turns) {
  const sessionScore = scoring.sessionDebt(turns);
  const dailyDebt = scoring.accumulatedDebt(turns);
  const latest = turns[turns.length - 1];
  const bloomCounts = turns.reduce((counts, turn) => {
    counts[turn.bloom.label] = (counts[turn.bloom.label] || 0) + 1;
    return counts;
  }, {});
  const topBloom = Object.entries(bloomCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

  document.getElementById("session-score").textContent = sessionScore;
  document.getElementById("session-score").style.background = colorFor(sessionScore);
  document.getElementById("turn-count").textContent = turns.length;
  document.getElementById("daily-debt").textContent = dailyDebt;
  document.getElementById("top-bloom").textContent = topBloom;

  const recent = turns.slice(-10);
  document.getElementById("trend").innerHTML = recent.length
    ? recent.map((turn) => `<div class="bar" title="${turn.turnDebt}" style="height:${Math.max(6, turn.turnDebt)}%;background:${colorFor(turn.turnDebt)}"></div>`).join("")
    : `<div class="bar" style="height:6%;background:#dce5df"></div>`.repeat(10);

  document.getElementById("latest").innerHTML = latest
    ? `<strong>Latest:</strong> ${escapeHtml(latest.impact)}<br><br><strong>Try:</strong> ${escapeHtml(latest.rewrite)}`
    : "Use ChatGPT or Claude, then send a prompt to start tracking.";
}

chrome.storage.local.get([STORAGE_KEY], (result) => {
  render(Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY] : []);
});

document.getElementById("reset").addEventListener("click", () => {
  chrome.storage.local.set({ [STORAGE_KEY]: [] }, () => render([]));
});
