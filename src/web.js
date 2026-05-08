const scoring = window.CognitiveDebtScoring;
const STORAGE_KEY = "cdt_web_turns";
const MEDIAPIPE_VERSION = "0.10.14";
const MEDIAPIPE_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}`;
const FACE_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";

const samplePrompts = {
  bad: "Give me startup ideas.",
  good: "I think remote workers need a wellness product for loneliness because they lack social feedback. Challenge this assumption, ask 2 clarifying questions, and give 3 counterarguments."
};

const state = {
  turns: loadTurns(),
  focusEnabled: true,
  webcamStream: null,
  mediaPipe: null,
  faceLandmarker: null,
  landmarkLoop: null,
  lastVideoTime: -1,
  blinkClosed: false,
  blinkEvents: [],
  focus: {
    score: 82,
    blinks: 16,
    gaze: 76
  }
};

const els = {
  form: document.getElementById("promptForm"),
  input: document.getElementById("promptInput"),
  conversation: document.getElementById("conversation"),
  debtRing: document.getElementById("debtRing"),
  debtScore: document.getElementById("debtScore"),
  debtLabel: document.getElementById("debtLabel"),
  impactText: document.getElementById("impactText"),
  effortScore: document.getElementById("effortScore"),
  bloomLevel: document.getElementById("bloomLevel"),
  sessionDebt: document.getElementById("sessionDebt"),
  rewriteText: document.getElementById("rewriteText"),
  provocationList: document.getElementById("provocationList"),
  trendChart: document.getElementById("trendChart"),
  turnCount: document.getElementById("turnCount"),
  bloomList: document.getElementById("bloomList"),
  topBloom: document.getElementById("topBloom"),
  pitchReceipt: document.getElementById("pitchReceipt"),
  focusToggle: document.getElementById("focusToggle"),
  focusScore: document.getElementById("focusScore"),
  blinkRate: document.getElementById("blinkRate"),
  gazeRate: document.getElementById("gazeRate"),
  combinedState: document.getElementById("combinedState"),
  focusGrid: document.getElementById("focusGrid"),
  tabButtons: Array.from(document.querySelectorAll("[data-tab-target]")),
  tabPanels: Array.from(document.querySelectorAll(".tab-panel")),
  webcamVideo: document.getElementById("webcamVideo"),
  landmarkCanvas: document.getElementById("landmarkCanvas"),
  webcamEmpty: document.getElementById("webcamEmpty"),
  startWebcam: document.getElementById("startWebcam"),
  stopWebcam: document.getElementById("stopWebcam"),
  cameraStatus: document.getElementById("cameraStatus"),
  presenceStatus: document.getElementById("presenceStatus"),
  webcamFocusScore: document.getElementById("webcamFocusScore"),
  landmarkStatus: document.getElementById("landmarkStatus"),
  loadBadPrompt: document.getElementById("loadBadPrompt"),
  loadGoodPrompt: document.getElementById("loadGoodPrompt")
};

function loadTurns() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveTurns() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.turns.slice(-60)));
}

function colorFor(score) {
  if (score >= 70) return "#dd5d4f";
  if (score >= 45) return "#c58a1d";
  return "#3aa17e";
}

function labelFor(score) {
  if (score >= 81) return "Autopilot risk";
  if (score >= 61) return "High cognitive debt";
  if (score >= 31) return "Watch zone";
  if (score > 0) return "Healthy AI use";
  return "Ready";
}

function combinedState(turn) {
  if (!state.focusEnabled) return "Paused";
  if (!turn) return "Ready";
  const focusDebt = 100 - state.focus.score;
  if (turn.turnDebt >= 61 && focusDebt >= 38) return "Drift risk";
  if (turn.turnDebt >= 61) return "Focused autopilot";
  if (focusDebt >= 38) return "Attention drift";
  return "Deep thinking";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function addMessage(kind, label, text) {
  const article = document.createElement("article");
  article.className = `message ${kind}-message`;
  article.innerHTML = `
    <div class="message-label">${escapeHtml(label)}</div>
    <p>${escapeHtml(text)}</p>
  `;
  els.conversation.appendChild(article);
  els.conversation.scrollTop = els.conversation.scrollHeight;
  return article;
}

async function analyzePrompt(prompt) {
  const clean = prompt.trim();
  if (!clean) return;
  const previous = state.turns[state.turns.length - 1] || null;
  const turn = scoring.scoreTurn(clean, previous);
  turn.focus = { ...state.focus, enabled: state.focusEnabled };
  state.turns.push(turn);
  saveTurns();

  addMessage("user", "Prompt", clean);
  addMessage("coach", "Thinking receipt", `${turn.impact} Try this next: ${turn.provocations[0]}`);
  render();
  await generateAiAnswer(clean);
}

async function generateAiAnswer(prompt) {
  const pending = addMessage("ai", "AI response", "Thinking...");
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Backend request failed.");
    pending.querySelector("p").textContent = data.answer;
  } catch (error) {
    pending.querySelector("p").textContent = fallbackAnswer(prompt, error);
  }
  els.conversation.scrollTop = els.conversation.scrollHeight;
}

function fallbackAnswer(prompt, error) {
  const reason = error instanceof Error ? error.message : "backend unavailable";
  return `Backend fallback: I could not reach the LLM (${reason}). For demo flow, keep using the debt score and intervention panel. Prompt received: "${prompt.slice(0, 120)}"`;
}

function switchTab(targetId) {
  els.tabButtons.forEach((button) => {
    const isActive = button.dataset.tabTarget === targetId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  els.tabPanels.forEach((panel) => {
    const isActive = panel.id === targetId;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });
}

async function startWebcam() {
  if (!navigator.mediaDevices?.getUserMedia) {
    setCameraStatus("Unavailable", "No camera API", "-", "Off");
    return;
  }

  try {
    if (state.webcamStream) stopWebcam();
    setCameraStatus("Requesting", "Waiting", "-", "Loading");
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user"
      },
      audio: false
    });
    state.webcamStream = stream;
    els.webcamVideo.srcObject = stream;
    els.webcamEmpty.classList.add("is-hidden");
    state.focusEnabled = true;
    els.focusToggle.checked = true;
    setCameraStatus("Live", "Detecting", state.focus.score, "Loading");
    renderFocus(state.turns[state.turns.length - 1] || null);
    await startMediaPipeLoop();
  } catch (error) {
    const message = error instanceof Error && error.name === "NotAllowedError" ? "Permission denied" : "Camera blocked";
    setCameraStatus(message, "Unknown", "-", "Off");
    els.webcamEmpty.classList.remove("is-hidden");
  }
}

function stopWebcam() {
  if (state.landmarkLoop) {
    cancelAnimationFrame(state.landmarkLoop);
    state.landmarkLoop = null;
  }
  if (state.webcamStream) {
    state.webcamStream.getTracks().forEach((track) => track.stop());
  }
  state.webcamStream = null;
  state.lastVideoTime = -1;
  state.blinkClosed = false;
  els.webcamVideo.srcObject = null;
  clearLandmarks();
  els.webcamEmpty.classList.remove("is-hidden");
  setCameraStatus("Paused", "Unknown", "-", "Off");
}

function setCameraStatus(camera, presence, focusScore, landmarks = els.landmarkStatus.textContent) {
  els.cameraStatus.textContent = camera;
  els.presenceStatus.textContent = presence;
  els.webcamFocusScore.textContent = focusScore;
  els.landmarkStatus.textContent = landmarks;
}

async function startMediaPipeLoop() {
  try {
    await initMediaPipe();
    setCameraStatus("Live", "Detecting", state.focus.score, "On");
    state.landmarkLoop = requestAnimationFrame(detectLandmarks);
  } catch (error) {
    console.warn("MediaPipe unavailable", error);
    setCameraStatus("Live", "Preview only", state.focus.score, "Unavailable");
  }
}

async function initMediaPipe() {
  if (state.faceLandmarker) return;
  const mediaPipe = await import(`${MEDIAPIPE_BASE}/+esm`);
  const vision = await mediaPipe.FilesetResolver.forVisionTasks(`${MEDIAPIPE_BASE}/wasm`);
  state.faceLandmarker = await mediaPipe.FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: FACE_MODEL_URL,
      delegate: "GPU"
    },
    outputFaceBlendshapes: true,
    runningMode: "VIDEO",
    numFaces: 1
  });
  state.mediaPipe = mediaPipe;
}

function detectLandmarks() {
  if (!state.webcamStream || !state.faceLandmarker) return;
  const video = els.webcamVideo;
  if (video.readyState >= 2 && video.currentTime !== state.lastVideoTime) {
    state.lastVideoTime = video.currentTime;
    const result = state.faceLandmarker.detectForVideo(video, performance.now());
    updateFocusFromLandmarks(result);
    drawLandmarks(result);
  }
  state.landmarkLoop = requestAnimationFrame(detectLandmarks);
}

function updateFocusFromLandmarks(result) {
  const face = result.faceLandmarks?.[0];
  const blendshapes = result.faceBlendshapes?.[0]?.categories || [];
  if (!face) {
    state.focus.score = 35;
    state.focus.gaze = 0;
    setCameraStatus("Live", "No face", state.focus.score, "On");
    renderFocusValues();
    return;
  }

  const blinkLeft = getBlendshapeScore(blendshapes, "eyeBlinkLeft");
  const blinkRight = getBlendshapeScore(blendshapes, "eyeBlinkRight");
  const blinkScore = (blinkLeft + blinkRight) / 2;
  updateBlinkRate(blinkScore);

  const nose = face[1] || face[4] || { x: 0.5, y: 0.5 };
  const eyeCenterX = ((face[33]?.x || 0.32) + (face[263]?.x || 0.68)) / 2;
  const gazeOffset = Math.abs(nose.x - eyeCenterX);
  const gazeOnTask = Math.max(35, Math.min(98, Math.round(100 - gazeOffset * 260)));
  const blinkHealth = state.focus.blinks >= 8 && state.focus.blinks <= 24 ? 92 : 72;

  state.focus.gaze = gazeOnTask;
  state.focus.score = Math.round(0.4 * 100 + 0.35 * gazeOnTask + 0.25 * blinkHealth);
  setCameraStatus("Live", "Face visible", state.focus.score, "On");
  renderFocusValues();
}

function updateBlinkRate(blinkScore) {
  const now = Date.now();
  const isClosed = blinkScore > 0.45;
  if (isClosed && !state.blinkClosed) state.blinkEvents.push(now);
  state.blinkClosed = isClosed;
  state.blinkEvents = state.blinkEvents.filter((time) => now - time < 60000);
  state.focus.blinks = state.blinkEvents.length;
}

function getBlendshapeScore(categories, name) {
  return categories.find((category) => category.categoryName === name)?.score || 0;
}

function drawLandmarks(result) {
  const canvas = els.landmarkCanvas;
  const video = els.webcamVideo;
  if (!video.videoWidth || !video.videoHeight) return;
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const face = result.faceLandmarks?.[0];
  if (!face || !state.mediaPipe?.FaceLandmarker) return;

  const sets = [
    state.mediaPipe.FaceLandmarker.FACE_LANDMARKS_TESSELATION,
    state.mediaPipe.FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
    state.mediaPipe.FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
    state.mediaPipe.FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
    state.mediaPipe.FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
    state.mediaPipe.FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
    state.mediaPipe.FaceLandmarker.FACE_LANDMARKS_LIPS
  ];

  ctx.lineWidth = 1;
  for (const connectors of sets) drawConnectors(ctx, face, connectors, "rgba(78, 214, 163, 0.42)");
  drawPoints(ctx, face, "rgba(255, 255, 255, 0.78)");
}

function drawConnectors(ctx, landmarks, connectors, color) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  for (const connector of connectors || []) {
    const start = landmarks[connector.start];
    const end = landmarks[connector.end];
    if (!start || !end) continue;
    ctx.moveTo(start.x * ctx.canvas.width, start.y * ctx.canvas.height);
    ctx.lineTo(end.x * ctx.canvas.width, end.y * ctx.canvas.height);
  }
  ctx.stroke();
}

function drawPoints(ctx, landmarks, color) {
  ctx.fillStyle = color;
  const step = Math.max(1, Math.floor(landmarks.length / 140));
  for (let index = 0; index < landmarks.length; index += step) {
    const point = landmarks[index];
    ctx.beginPath();
    ctx.arc(point.x * ctx.canvas.width, point.y * ctx.canvas.height, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function clearLandmarks() {
  const ctx = els.landmarkCanvas.getContext("2d");
  ctx.clearRect(0, 0, els.landmarkCanvas.width, els.landmarkCanvas.height);
}

function renderFocusValues() {
  els.focusGrid.style.opacity = "1";
  els.focusScore.textContent = state.focus.score;
  els.blinkRate.textContent = state.focus.blinks;
  els.gazeRate.textContent = `${state.focus.gaze}%`;
  els.combinedState.textContent = combinedState(state.turns[state.turns.length - 1] || null);
  els.webcamFocusScore.textContent = state.focus.score;
}

function render() {
  const latest = state.turns[state.turns.length - 1] || null;
  const score = latest ? latest.turnDebt : 0;
  const sessionDebt = scoring.sessionDebt(state.turns);
  const ring = colorFor(score);

  els.debtRing.style.setProperty("--score", score);
  els.debtRing.style.setProperty("--ring", ring);
  els.debtScore.textContent = score;
  els.debtLabel.textContent = labelFor(score);
  els.impactText.textContent = latest ? latest.impact : "Send a prompt to generate your first thinking receipt.";
  els.effortScore.textContent = latest ? latest.effort : "0";
  els.bloomLevel.textContent = latest ? latest.bloom.label : "-";
  els.sessionDebt.textContent = sessionDebt;
  els.rewriteText.textContent = latest ? latest.rewrite : "Add your hypothesis, constraints, and ask AI to challenge you before it answers.";
  els.provocationList.innerHTML = (latest ? latest.provocations : [
    "Which assumption are you about to outsource?",
    "What answer do you expect before asking AI?"
  ]).map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  renderTrend();
  renderBloom();
  renderFocus(latest);
  renderPitchReceipt(latest);
}

function renderTrend() {
  const recent = state.turns.slice(-10);
  els.turnCount.textContent = `${state.turns.length} ${state.turns.length === 1 ? "turn" : "turns"}`;
  if (!recent.length) {
    els.trendChart.innerHTML = Array.from({ length: 10 }, () => `<div class="bar" style="height:6%;background:#dce5df"></div>`).join("");
    return;
  }
  els.trendChart.innerHTML = recent.map((turn) => {
    const height = Math.max(8, turn.turnDebt);
    return `<div class="bar" title="${turn.turnDebt}" style="height:${height}%;background:${colorFor(turn.turnDebt)}"></div>`;
  }).join("");
}

function renderBloom() {
  const labels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
  const counts = Object.fromEntries(labels.map((label) => [label, 0]));
  state.turns.forEach((turn) => {
    counts[turn.bloom.label] = (counts[turn.bloom.label] || 0) + 1;
  });
  const max = Math.max(1, ...Object.values(counts));
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  els.topBloom.textContent = top && top[1] ? top[0] : "No data";
  els.bloomList.innerHTML = labels.map((label) => {
    const count = counts[label];
    const width = Math.round((count / max) * 100);
    return `
      <div class="bloom-row">
        <span>${label}</span>
        <div class="bloom-track"><div class="bloom-fill" style="width:${width}%"></div></div>
        <strong>${count}</strong>
      </div>
    `;
  }).join("");
}

function renderFocus(latest) {
  if (!state.focusEnabled) {
    els.focusGrid.style.opacity = "0.45";
    els.focusScore.textContent = "-";
    els.blinkRate.textContent = "-";
    els.gazeRate.textContent = "-";
    els.combinedState.textContent = "Paused";
    return;
  }

  if (state.webcamStream) {
    renderFocusValues();
    return;
  }

  const latestDebt = latest ? latest.turnDebt : 32;
  state.focus.score = Math.max(38, Math.min(96, Math.round(88 - latestDebt * 0.22 + Math.sin(Date.now() / 9000) * 5)));
  state.focus.blinks = Math.max(8, Math.min(28, Math.round(15 + latestDebt / 18)));
  state.focus.gaze = Math.max(42, Math.min(94, Math.round(state.focus.score - 6 + Math.cos(Date.now() / 7000) * 4)));

  els.focusGrid.style.opacity = "1";
  els.focusScore.textContent = state.focus.score;
  els.blinkRate.textContent = state.focus.blinks;
  els.gazeRate.textContent = `${state.focus.gaze}%`;
  els.combinedState.textContent = combinedState(latest);
}

function renderPitchReceipt(latest) {
  if (!latest) {
    els.pitchReceipt.textContent = "In the post-AGI era, the risk is not that AI thinks. The risk is that humans stop practicing thinking.";
    return;
  }
  if (latest.turnDebt >= 70) {
    els.pitchReceipt.textContent = "AI answered. But did you think? This turn outsourced the workout.";
    return;
  }
  if (latest.turnDebt >= 45) {
    els.pitchReceipt.textContent = "You brought some context, but the next prompt should make AI test your reasoning.";
    return;
  }
  els.pitchReceipt.textContent = "Good use: your prompt turns AI into a sparring partner, not a substitute for cognition.";
}

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  analyzePrompt(els.input.value);
  els.input.value = "";
  els.input.focus();
});

els.loadBadPrompt.addEventListener("click", () => {
  els.input.value = samplePrompts.bad;
  els.input.focus();
});

els.loadGoodPrompt.addEventListener("click", () => {
  els.input.value = samplePrompts.good;
  els.input.focus();
});

els.focusToggle.addEventListener("change", () => {
  state.focusEnabled = els.focusToggle.checked;
  render();
});

els.tabButtons.forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.tabTarget));
});

els.startWebcam.addEventListener("click", startWebcam);
els.stopWebcam.addEventListener("click", stopWebcam);

setInterval(() => renderFocus(state.turns[state.turns.length - 1] || null), 2400);
render();
