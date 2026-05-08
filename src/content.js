(function bootCognitiveDebtTracker() {
  const STORAGE_KEY = "cdt_turns";
  const scoring = window.CognitiveDebtScoring;
  let turns = [];
  let expanded = true;
  let lastPrompt = "";
  let lastPromptAt = 0;

  const root = document.createElement("div");
  root.id = "cdt-root";
  document.documentElement.appendChild(root);

  chrome.storage.local.get([STORAGE_KEY], (result) => {
    turns = Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY] : [];
    render();
  });

  function colorFor(score) {
    if (score >= 70) return "#dd5d4f";
    if (score >= 45) return "#c58a1d";
    return "#3aa17e";
  }

  function labelFor(score) {
    if (score >= 70) return "High debt";
    if (score >= 45) return "Watch zone";
    if (score > 0) return "Thinking fit";
    return "Ready";
  }

  function latestTurn() {
    return turns[turns.length - 1] || null;
  }

  function saveTurns() {
    const trimmed = turns.slice(-80);
    turns = trimmed;
    chrome.storage.local.set({ [STORAGE_KEY]: trimmed });
  }

  function addTurn(prompt) {
    const clean = prompt.trim();
    if (clean.length < 3) return;
    const now = Date.now();
    if (clean === lastPrompt && now - lastPromptAt < 2500) return;
    lastPrompt = clean;
    lastPromptAt = now;

    const previous = latestTurn();
    const turn = scoring.scoreTurn(clean, previous);
    turns.push(turn);
    saveTurns();
    render();
    if (turn.turnDebt >= 70) showToast("Autopilot alert: " + turn.impact);
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "cdt-toast";
    toast.textContent = message;
    document.documentElement.appendChild(toast);
    setTimeout(() => toast.remove(), 4200);
  }

  function getLikelyPrompt() {
    const selectors = [
      "#prompt-textarea",
      "textarea[data-id='root']",
      "textarea",
      "[contenteditable='true'][role='textbox']",
      "[contenteditable='true']",
      ".ProseMirror"
    ];
    for (const selector of selectors) {
      const nodes = Array.from(document.querySelectorAll(selector)).reverse();
      const node = nodes.find((candidate) => {
        const text = readNodeText(candidate);
        return text && text.trim().length > 0 && candidate.offsetParent !== null;
      });
      if (node) return readNodeText(node);
    }
    const selection = window.getSelection ? String(window.getSelection()).trim() : "";
    return selection;
  }

  function readNodeText(node) {
    if (!node) return "";
    if ("value" in node) return node.value || "";
    return node.innerText || node.textContent || "";
  }

  function analyzeManualText() {
    const textarea = root.querySelector("[data-cdt-manual]");
    const typed = textarea ? textarea.value : "";
    addTurn(typed || getLikelyPrompt());
    if (textarea) textarea.value = "";
  }

  function resetToday() {
    turns = [];
    saveTurns();
    render();
  }

  function render() {
    const latest = latestTurn();
    const score = latest ? latest.turnDebt : 0;
    const session = scoring.sessionDebt(turns);
    const accumulated = scoring.accumulatedDebt(turns);
    const color = colorFor(score);
    const body = latest ? renderLatest(latest, session, accumulated) : renderEmpty();

    root.innerHTML = `
      <div class="cdt-shell ${expanded ? "" : "cdt-collapsed"}">
        <div class="cdt-header">
          <div class="cdt-brand">
            <span class="cdt-dot" style="background:${color};box-shadow:0 0 0 4px ${color}24"></span>
            <span class="cdt-title">Cognitive Debt</span>
          </div>
          <div class="cdt-controls">
            <button class="cdt-icon-button" type="button" title="Analyze current prompt" data-cdt-analyze>↵</button>
            <button class="cdt-icon-button" type="button" title="${expanded ? "Collapse" : "Expand"}" data-cdt-toggle>${expanded ? "−" : "+"}</button>
          </div>
        </div>
        ${expanded ? body : renderCollapsed(score)}
      </div>
    `;

    root.querySelector("[data-cdt-toggle]")?.addEventListener("click", () => {
      expanded = !expanded;
      render();
    });
    root.querySelector("[data-cdt-analyze]")?.addEventListener("click", analyzeManualText);
    root.querySelector("[data-cdt-submit]")?.addEventListener("click", analyzeManualText);
    root.querySelector("[data-cdt-reset]")?.addEventListener("click", resetToday);
  }

  function renderCollapsed(score) {
    return `
      <div class="cdt-body">
        <div class="cdt-ring" style="--cdt-score:${score};--cdt-color:${colorFor(score)}">
          <span class="cdt-score">${score}</span>
        </div>
      </div>
    `;
  }

  function renderEmpty() {
    return `
      <div class="cdt-body">
        <div class="cdt-meter-row">
          <div class="cdt-ring" style="--cdt-score:0;--cdt-color:#3aa17e"><span class="cdt-score">0</span></div>
          <div>
            <p class="cdt-kicker">Status</p>
            <p class="cdt-state">Ready</p>
            <p class="cdt-impact">Send a prompt or paste one below to measure whether AI is helping your thinking or replacing it.</p>
          </div>
        </div>
        ${renderManualBox()}
      </div>
    `;
  }

  function renderLatest(turn, session, accumulated) {
    return `
      <div class="cdt-body">
        <div class="cdt-meter-row">
          <div class="cdt-ring" style="--cdt-score:${turn.turnDebt};--cdt-color:${colorFor(turn.turnDebt)}"><span class="cdt-score">${turn.turnDebt}</span></div>
          <div>
            <p class="cdt-kicker">Latest turn</p>
            <p class="cdt-state">${labelFor(turn.turnDebt)}</p>
            <p class="cdt-impact">${escapeHtml(turn.impact)}</p>
          </div>
        </div>
        <div class="cdt-grid">
          <div class="cdt-metric"><div class="cdt-label">Effort</div><div class="cdt-value">${turn.effort}</div></div>
          <div class="cdt-metric"><div class="cdt-label">Bloom</div><div class="cdt-value">${turn.bloom.label}</div></div>
          <div class="cdt-metric"><div class="cdt-label">Session</div><div class="cdt-value">${session}</div></div>
        </div>
        <div class="cdt-section">
          <p class="cdt-section-title">Rewrite prompt</p>
          <p class="cdt-card">${escapeHtml(turn.rewrite)}</p>
        </div>
        <div class="cdt-section">
          <p class="cdt-section-title">Provocations</p>
          <ul class="cdt-list">${turn.provocations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
        <div class="cdt-section">
          <div class="cdt-grid">
            <div class="cdt-metric"><div class="cdt-label">Turns</div><div class="cdt-value">${turns.length}</div></div>
            <div class="cdt-metric"><div class="cdt-label">Daily debt</div><div class="cdt-value">${accumulated}</div></div>
            <div class="cdt-metric"><div class="cdt-label">Mode</div><div class="cdt-value">Local</div></div>
          </div>
        </div>
        ${renderManualBox()}
        <button class="cdt-button" type="button" data-cdt-reset>Reset session</button>
      </div>
    `;
  }

  function renderManualBox() {
    return `
      <div class="cdt-section">
        <p class="cdt-section-title">Manual analyze</p>
        <textarea class="cdt-textarea" data-cdt-manual placeholder="Paste a prompt if auto-capture misses the page."></textarea>
        <button class="cdt-button" type="button" data-cdt-submit>Analyze prompt</button>
      </div>
    `;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
    const target = event.target;
    if (!target || !target.closest) return;
    if (target.closest("#cdt-root")) return;
    const text = readNodeText(target);
    if (text.trim().length > 2 && (target.matches("textarea") || target.matches("[contenteditable='true']") || target.closest("[contenteditable='true']"))) {
      setTimeout(() => addTurn(text), 20);
    }
  }, true);

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!target || !target.closest || target.closest("#cdt-root")) return;
    const button = target.closest("button, [role='button']");
    if (!button) return;
    const label = [
      button.getAttribute("aria-label"),
      button.getAttribute("data-testid"),
      button.textContent
    ].filter(Boolean).join(" ").toLowerCase();
    if (/send|submit|ส่ง|ส่งข้อความ/.test(label)) {
      const prompt = getLikelyPrompt();
      setTimeout(() => addTurn(prompt), 20);
    }
  }, true);
})();
