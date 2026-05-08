const TASKS_VERSION = "0.10.22-rc.20250304";
const TASKS_BUNDLE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VERSION}/vision_bundle.mjs`;
const WASM_ROOT = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VERSION}/wasm`;

const MODEL_URLS = {
  face: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
  pose: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
  hand: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
};

const POSE_CONNECTIONS = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
];

const HAND_CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
];

const FACE_POINTS = [1, 10, 33, 61, 133, 152, 263, 291, 362, 468, 473];
const PRESETS = {
  strict: { label: "Strict", gaze: 16, posture: 12, action: 18 },
  balanced: { label: "Balanced", gaze: 22, posture: 16, action: 24 },
  relaxed: { label: "Relaxed", gaze: 29, posture: 22, action: 32 },
};

const DEFAULT_BEHAVIOR_LANG = "th";
const BEHAVIOR_COPY = {
  en: {
    analyze: "Analyze",
    assistantName: "Behavior AI",
    behaviorSignal: "Behavior signal",
    chatLabel: "Check-in text",
    chars: "chars",
    clear: "Clear",
    disclaimer:
      "Behavioral screening only. This assistant summarizes patterns from typing and prior usage. It is not a diagnosis.",
    editRatio: "Edit ratio",
    idle: "Idle",
    intro:
      "Share a short update about what you are doing. I will record the window from first typing until Analyze, then combine timing, wording, and previous behavior into a screening summary.",
    messageLength: "Message length",
    placeholder: "Example: I keep jumping between tabs and rewriting the same sentence.",
    recordingWindow: "Recording window",
    reviewing: "Reviewing",
    signalLabels: { Elevated: "Elevated", High: "High", Low: "Low", Moderate: "Moderate" },
    startedAt: "Started at",
    title: "Behavior AI",
    typing: "Typing",
    typingSpeed: "Typing speed",
    userName: "You",
  },
  th: {
    analyze: "วิเคราะห์",
    assistantName: "AI วิเคราะห์พฤติกรรม",
    behaviorSignal: "สัญญาณพฤติกรรม",
    chatLabel: "ข้อความเช็กอิน",
    chars: "ตัวอักษร",
    clear: "ล้าง",
    disclaimer:
      "เป็นการคัดกรองเชิงพฤติกรรมเท่านั้น ระบบสรุปรูปแบบจากการพิมพ์และประวัติการใช้งาน ไม่ใช่การวินิจฉัยทางการแพทย์",
    editRatio: "สัดส่วนการแก้ไข",
    idle: "ว่าง",
    intro:
      "พิมพ์อัปเดตสั้น ๆ เกี่ยวกับสิ่งที่กำลังทำ ระบบจะบันทึกช่วงตั้งแต่เริ่มพิมพ์จนถึงกดวิเคราะห์ แล้วสรุปจากเวลา รูปแบบคำ และพฤติกรรมก่อนหน้า",
    messageLength: "ความยาวข้อความ",
    placeholder: "ตัวอย่าง: ผมสลับแท็บไปมา แล้วลบประโยคเดิมซ้ำก่อนเขียนจบ",
    recordingWindow: "ช่วงเวลาที่บันทึก",
    reviewing: "กำลังประเมิน",
    signalLabels: { Elevated: "สูงขึ้น", High: "สูง", Low: "ต่ำ", Moderate: "ปานกลาง" },
    startedAt: "เริ่มพิมพ์",
    title: "AI วิเคราะห์พฤติกรรม",
    typing: "กำลังพิมพ์",
    typingSpeed: "ความเร็วพิมพ์",
    userName: "คุณ",
  },
};

Object.assign(BEHAVIOR_COPY.th, {
  analyze: "วิเคราะห์",
  assistantName: "AI วิเคราะห์พฤติกรรม",
  behaviorSignal: "สัญญาณพฤติกรรม",
  chatLabel: "ข้อความเช็กอิน",
  chars: "ตัวอักษร",
  clear: "ล้าง",
  disclaimer:
    "เป็นการคัดกรองเชิงพฤติกรรมเท่านั้น ระบบสรุปรูปแบบจากการพิมพ์และประวัติการใช้งาน ไม่ใช่การวินิจฉัยทางการแพทย์",
  editRatio: "สัดส่วนการแก้ไข",
  idle: "ว่าง",
  intro:
    "พิมพ์อัปเดตสั้น ๆ เกี่ยวกับสิ่งที่กำลังทำ ระบบจะบันทึกช่วงตั้งแต่เริ่มพิมพ์จนถึงกดวิเคราะห์ แล้วสรุปจากเวลา รูปแบบคำ และพฤติกรรมก่อนหน้า",
  messageLength: "ความยาวข้อความ",
  placeholder: "ตัวอย่าง: ผมสลับแท็บไปมา แล้วลบประโยคเดิมซ้ำก่อนเขียนจบ",
  recordingWindow: "ช่วงเวลาที่บันทึก",
  reviewing: "กำลังประเมิน",
  signalLabels: { Elevated: "สูงขึ้น", High: "สูง", Low: "ต่ำ", Moderate: "ปานกลาง" },
  startedAt: "เริ่มพิมพ์",
  title: "AI วิเคราะห์พฤติกรรม",
  typing: "กำลังพิมพ์",
  typingSpeed: "ความเร็วพิมพ์",
  userName: "คุณ",
});

const APP_COPY = {
  en: {
    action: "Actions",
    actionWaiting: "Actions: waiting",
    actionTolerance: "Action tolerance",
    calibrate: "Calibrate",
    calibrationHint: "Set the neutral baseline from your current sitting position and gaze.",
    calibrationNotReady: "Not calibrated yet",
    cameraEmptyHint: "Processing happens in this browser.",
    cameraEmptyTitle: "Ready to open camera",
    currentScore: "Current score",
    events: "Events",
    eye: "Eye tracking",
    eyeWaiting: "Eye: waiting",
    eyeTolerance: "Eye tolerance",
    focus: "Focus",
    focusHintIdle: "Open the camera to start estimating gaze, posture, and actions.",
    focusLabelIdle: "Not started",
    liveSignals: "Live signals",
    mode: "Mode",
    posture: "Posture",
    postureTolerance: "Posture tolerance",
    postureWaiting: "Posture: waiting",
    presence: "Presence",
    reset: "Reset",
    start: "Start",
    stop: "Stop",
    export: "Export",
    noEvents: "No events yet",
    calibrated: "Calibrated",
    cameraBlocked: "Camera unavailable",
    cameraPermissionHint: "The browser needs camera permission on localhost.",
    modelError: "Models failed to load",
    modelNotReady: "Models are not ready",
    modelNetworkHint: "Check your internet connection and refresh the page.",
    scoreGood: "Focused",
    scoreGoodHint: "Overall signals look steady.",
    scoreLow: "Low focus",
    scoreLowHint: "Gaze, posture, or actions are pulling the score down.",
    scoreWarn: "Focus drifting",
    scoreWarnHint: "Some signals are starting to drift.",
    waiting: "waiting",
    statusLoading: "Loading models",
    statusReady: "Ready",
    statusMeasuring: "Measuring",
    statusPartial: "Partially ready",
    trend: "Focus trend",
  },
  th: {
    action: "แอ็กชัน",
    actionWaiting: "แอ็กชัน: รอข้อมูล",
    actionTolerance: "ความไวต่อแอ็กชัน",
    calibrate: "คาลิเบรต",
    calibrationHint: "ตั้งค่ากึ่งกลางจากท่านั่งและสายตาปัจจุบัน",
    calibrationNotReady: "ยังไม่ได้คาลิเบรต",
    cameraEmptyHint: "การประมวลผลเกิดบนเบราว์เซอร์นี้",
    cameraEmptyTitle: "พร้อมเปิดกล้อง",
    currentScore: "คะแนนปัจจุบัน",
    events: "เหตุการณ์",
    eye: "สายตา",
    eyeWaiting: "สายตา: รอข้อมูล",
    eyeTolerance: "ความไวต่อสายตา",
    focus: "โฟกัส",
    focusHintIdle: "เปิดกล้องเพื่อเริ่มประเมินสายตา ท่าทาง และแอ็กชัน",
    focusLabelIdle: "ยังไม่เริ่มวัด",
    liveSignals: "กล้องและสัญญาณ",
    mode: "โหมด",
    posture: "ท่าทาง",
    postureTolerance: "ความไวต่อท่าทาง",
    postureWaiting: "ท่าทาง: รอข้อมูล",
    presence: "การอยู่หน้ากล้อง",
    reset: "รีเซ็ต",
    start: "เริ่มวัด",
    stop: "หยุด",
    export: "ส่งออก",
    noEvents: "ยังไม่มีเหตุการณ์",
    calibrated: "คาลิเบรตแล้ว",
    cameraBlocked: "เปิดกล้องไม่ได้",
    cameraPermissionHint: "เบราว์เซอร์ต้องได้รับสิทธิ์ใช้กล้องบน localhost",
    modelError: "โหลดโมเดลไม่สำเร็จ",
    modelNotReady: "โมเดลยังไม่พร้อม",
    modelNetworkHint: "ตรวจการเชื่อมต่ออินเทอร์เน็ตแล้วรีเฟรชหน้า",
    scoreGood: "โฟกัสดี",
    scoreGoodHint: "สัญญาณโดยรวมค่อนข้างนิ่ง",
    scoreLow: "โฟกัสต่ำ",
    scoreLowHint: "สายตา ท่าทาง หรือแอ็กชันกำลังรบกวนคะแนน",
    scoreWarn: "โฟกัสแกว่ง",
    scoreWarnHint: "มีบางสัญญาณที่เริ่มหลุด",
    waiting: "รอข้อมูล",
    statusLoading: "กำลังโหลดโมเดล",
    statusReady: "พร้อมใช้งาน",
    statusMeasuring: "กำลังวัด",
    statusPartial: "พร้อมใช้งานบางส่วน",
    trend: "แนวโน้มโฟกัส",
  },
};

const SIGNAL_COPY = {
  en: {
    calibratedEvent: "Baseline reset",
    eyesClosed: "Eyes closed",
    eyesClosedEvent: "Eyes closed unusually long",
    fidget: "Frequent hand movement",
    fidgetLabel: "Moving often",
    handFace: "Hand near face",
    handOptional: "Partial hand tracking",
    lookingAtScreen: "Looking at screen",
    lookingAway: "Looking away",
    lookAwayEvent: "Gaze away from screen",
    lowFocusEvent: "Low focus score",
    noFace: "No face detected",
    postureBad: "Leaning/slouching too much",
    postureGood: "Posture steady",
    posturePartial: "Body not clearly visible",
    postureEvent: "Posture drifting",
    recovered: "Focus recovered",
    still: "Still",
    waiting: "waiting",
  },
  th: {
    calibratedEvent: "ตั้งค่ากึ่งกลางใหม่",
    eyesClosed: "หลับตา",
    eyesClosedEvent: "หลับตานานผิดปกติ",
    fidget: "มือเคลื่อนไหวบ่อย",
    fidgetLabel: "เคลื่อนไหวบ่อย",
    handFace: "มือใกล้ใบหน้า",
    handOptional: "วัดมือบางส่วน",
    lookingAtScreen: "มองจออยู่",
    lookingAway: "มองออกนอกจอ",
    lookAwayEvent: "สายตาออกนอกจอ",
    lowFocusEvent: "คะแนนโฟกัสต่ำ",
    noFace: "ไม่พบใบหน้า",
    postureBad: "เอน/ก้มมากไป",
    postureGood: "ท่าทางนิ่ง",
    posturePartial: "เห็นลำตัวไม่ชัด",
    postureEvent: "ท่าทางเริ่มเสีย",
    recovered: "กลับมาโฟกัส",
    still: "นิ่ง",
    waiting: "รอข้อมูล",
  },
};

const $ = (selector) => document.querySelector(selector);

const els = {
  actionBadge: $("#actionBadge"),
  actionMeter: $("#actionMeter"),
  actionScore: $("#actionScore"),
  actionTolerance: $("#actionTolerance"),
  actionToleranceValue: $("#actionToleranceValue"),
  calibrateBtn: $("#calibrateBtn"),
  calibrationState: $("#calibrationState"),
  cameraEmpty: $("#cameraEmpty"),
  cameraPanel: $(".camera-panel"),
  behaviorSignalLabel: $("#behaviorSignalLabel"),
  behaviorSignalValue: $("#behaviorSignalValue"),
  behaviorTitle: $("#behaviorTitle"),
  chatInput: $("#chatInput"),
  chatInputLabel: $("#chatInputLabel"),
  chatDisclaimer: $("#chatDisclaimer"),
  chatThread: $("#chatThread"),
  clearChatLabel: $("#clearChatLabel"),
  clearChatBtn: $("#clearChatBtn"),
  eventCount: $("#eventCount"),
  eventList: $("#eventList"),
  editRatioLabel: $("#editRatioLabel"),
  editRatioValue: $("#editRatioValue"),
  exportBtn: $("#exportBtn"),
  eyeMeter: $("#eyeMeter"),
  eyeScore: $("#eyeScore"),
  focusHint: $("#focusHint"),
  focusLabel: $("#focusLabel"),
  focusScore: $("#focusScore"),
  gazeBadge: $("#gazeBadge"),
  gazeTolerance: $("#gazeTolerance"),
  gazeToleranceValue: $("#gazeToleranceValue"),
  modeLabel: $("#modeLabel"),
  modelStatus: $("#modelStatus"),
  overlay: $("#overlay"),
  postureBadge: $("#postureBadge"),
  postureMeter: $("#postureMeter"),
  postureScore: $("#postureScore"),
  postureTolerance: $("#postureTolerance"),
  postureToleranceValue: $("#postureToleranceValue"),
  presenceMeter: $("#presenceMeter"),
  presenceScore: $("#presenceScore"),
  recordingWindowLabel: $("#recordingWindowLabel"),
  recordingWindowValue: $("#recordingWindowValue"),
  resetBtn: $("#resetBtn"),
  sampleCount: $("#sampleCount"),
  scoreRing: $("#scoreRing"),
  sendChatLabel: $("#sendChatLabel"),
  sendChatBtn: $("#sendChatBtn"),
  sessionClock: $("#sessionClock"),
  startBtn: $("#startBtn"),
  stopBtn: $("#stopBtn"),
  languageButtons: document.querySelectorAll(".lang-option"),
  messageLengthLabel: $("#messageLengthLabel"),
  messageLengthValue: $("#messageLengthValue"),
  typingStartedLabel: $("#typingStartedLabel"),
  typingStartedValue: $("#typingStartedValue"),
  typingSpeedLabel: $("#typingSpeedLabel"),
  typingSpeedValue: $("#typingSpeedValue"),
  typingStatus: $("#typingStatus"),
  trendCanvas: $("#trendCanvas"),
  video: $("#video"),
};

const state = {
  active: false,
  baseline: {
    calibrated: false,
    gazeX: 0.5,
    headPitch: 0,
    headYaw: 0,
    headDrop: -0.2,
    lean: 0,
    shoulderSlope: 0,
  },
  events: [],
  focus: 0,
  handOptional: true,
  history: [],
  lastEventAt: new Map(),
  lastFaceSeen: 0,
  lastHandCenters: [],
  lastInferenceAt: 0,
  lastMetrics: null,
  models: null,
  previousIssues: new Set(),
  sessionStart: 0,
  stats: freshStats(),
  stream: null,
  behaviorLanguage: DEFAULT_BEHAVIOR_LANG,
  behavior: freshBehaviorState(),
  thresholds: {
    action: 0.24,
    gaze: 0.22,
    posture: 0.16,
  },
};

function freshStats() {
  return {
    actionSum: 0,
    eyeSum: 0,
    focusSum: 0,
    postureSum: 0,
    presenceSum: 0,
    samples: 0,
  };
}

function freshBehaviorState() {
  return {
    history: [],
    live: {
      backspaces: 0,
      burstCount: 0,
      inputStartedAt: 0,
      inputStartedWallAt: 0,
      intervals: [],
      lastInputAt: 0,
      lastInputWallAt: 0,
      pauseCount: 0,
      sendCount: 0,
      totalKeydowns: 0,
    },
    thread: [
      {
        key: "intro",
        role: "assistant",
      },
    ],
  };
}

function behaviorCopy() {
  return BEHAVIOR_COPY[state?.behaviorLanguage || DEFAULT_BEHAVIOR_LANG];
}

function appCopy() {
  return APP_COPY[state?.behaviorLanguage || DEFAULT_BEHAVIOR_LANG];
}

function signalCopy() {
  return SIGNAL_COPY[state?.behaviorLanguage || DEFAULT_BEHAVIOR_LANG];
}

function setNodeText(selector, text) {
  const node = document.querySelector(selector);
  if (node) node.textContent = text;
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function lerp(from, to, amount) {
  return from + (to - from) * amount;
}

function distance(a, b) {
  if (!a || !b) return 0;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a, b) {
  if (!a && !b) return null;
  if (!a) return b;
  if (!b) return a;
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: ((a.z || 0) + (b.z || 0)) / 2,
  };
}

function pointAverage(points) {
  const valid = points.filter(Boolean);
  if (!valid.length) return null;
  return {
    x: valid.reduce((sum, point) => sum + point.x, 0) / valid.length,
    y: valid.reduce((sum, point) => sum + point.y, 0) / valid.length,
  };
}

function setStatus(text, tone = "loading") {
  els.modelStatus.classList.toggle("ready", tone === "ready");
  els.modelStatus.classList.toggle("error", tone === "error");
  els.modelStatus.lastChild.textContent = ` ${text}`;
}

function refreshModelStatusText() {
  const copy = appCopy();
  if (state.active) setStatus(copy.statusMeasuring, "ready");
  else if (!state.models) setStatus(copy.statusLoading, "loading");
  else setStatus(state.handOptional ? copy.statusPartial : copy.statusReady, "ready");
}

function formatClock(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function formatWallTime(timestamp) {
  if (!timestamp) return "--";
  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
}

function scoreTone(score) {
  if (score >= 78) return { label: "โฟกัสดี", hint: "สัญญาณโดยรวมค่อนข้างนิ่ง", tone: "good" };
  if (score >= 55) return { label: "โฟกัสแกว่ง", hint: "มีบางสัญญาณที่เริ่มหลุด", tone: "warn" };
  if (score > 0) return { label: "โฟกัสต่ำ", hint: "สายตา ท่าทาง หรือแอ็กชันกำลังรบกวนคะแนน", tone: "bad" };
  return { label: "ยังไม่เริ่มวัด", hint: "เปิดกล้องเพื่อเริ่มประเมินสายตา ท่าทาง และแอ็กชัน", tone: "idle" };
}

async function createVisionTask(TaskClass, vision, options, required = true) {
  try {
    return await TaskClass.createFromOptions(vision, {
      ...options,
      baseOptions: { ...options.baseOptions, delegate: "GPU" },
    });
  } catch (gpuError) {
    try {
      return await TaskClass.createFromOptions(vision, {
        ...options,
        baseOptions: { ...options.baseOptions, delegate: "CPU" },
      });
    } catch (cpuError) {
      if (required) throw cpuError;
      console.warn("Optional vision task unavailable", gpuError, cpuError);
      return null;
    }
  }
}

async function loadModels() {
  setStatus("กำลังโหลดโมเดล", "loading");
  try {
    const tasks = await import(TASKS_BUNDLE);
    const vision = await tasks.FilesetResolver.forVisionTasks(WASM_ROOT);

    const faceLandmarker = await createVisionTask(tasks.FaceLandmarker, vision, {
      baseOptions: { modelAssetPath: MODEL_URLS.face },
      minFaceDetectionConfidence: 0.55,
      minFacePresenceConfidence: 0.55,
      minTrackingConfidence: 0.55,
      numFaces: 1,
      outputFaceBlendshapes: true,
      runningMode: "VIDEO",
    });

    const poseLandmarker = await createVisionTask(tasks.PoseLandmarker, vision, {
      baseOptions: { modelAssetPath: MODEL_URLS.pose },
      minPoseDetectionConfidence: 0.55,
      minPosePresenceConfidence: 0.55,
      minTrackingConfidence: 0.55,
      numPoses: 1,
      runningMode: "VIDEO",
    });

    const handLandmarker = await createVisionTask(
      tasks.HandLandmarker,
      vision,
      {
        baseOptions: { modelAssetPath: MODEL_URLS.hand },
        minHandDetectionConfidence: 0.55,
        minHandPresenceConfidence: 0.55,
        minTrackingConfidence: 0.55,
        numHands: 2,
        runningMode: "VIDEO",
      },
      false,
    );

    state.models = { faceLandmarker, handLandmarker, poseLandmarker };
    state.handOptional = !handLandmarker;
    setStatus(handLandmarker ? "พร้อมใช้งาน" : "พร้อมใช้งานบางส่วน", "ready");
    els.startBtn.disabled = false;
  } catch (error) {
    console.error(error);
    setStatus("โหลดโมเดลไม่สำเร็จ", "error");
    els.focusLabel.textContent = "โมเดลยังไม่พร้อม";
    els.focusHint.textContent = "ตรวจการเชื่อมต่ออินเทอร์เน็ตแล้วรีเฟรชหน้า";
  }
}

async function startCamera() {
  if (!state.models || state.active) return;

  try {
    state.stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: "user",
        height: { ideal: 720 },
        width: { ideal: 1280 },
      },
    });
    els.video.srcObject = state.stream;
    await els.video.play();

    state.active = true;
    state.sessionStart = state.sessionStart || performance.now();
    state.lastInferenceAt = 0;
    els.startBtn.disabled = true;
    els.stopBtn.disabled = false;
    els.calibrateBtn.disabled = false;
    els.cameraPanel.classList.add("camera-on");
    setStatus("กำลังวัด", "ready");
    requestAnimationFrame(trackFrame);
  } catch (error) {
    console.error(error);
    setStatus("เปิดกล้องไม่ได้", "error");
    els.focusLabel.textContent = "เปิดกล้องไม่ได้";
    els.focusHint.textContent = "เบราว์เซอร์ต้องได้รับสิทธิ์ใช้กล้องบน localhost";
  }
}

function stopCamera() {
  state.active = false;
  if (state.stream) {
    state.stream.getTracks().forEach((track) => track.stop());
  }
  state.stream = null;
  els.video.srcObject = null;
  els.startBtn.disabled = !state.models;
  els.stopBtn.disabled = true;
  els.calibrateBtn.disabled = true;
  els.cameraPanel.classList.remove("camera-on");
  clearOverlay();
  setStatus(state.models ? "พร้อมใช้งาน" : "กำลังโหลดโมเดล", state.models ? "ready" : "loading");
}

function resetSession() {
  state.baseline.calibrated = false;
  state.behavior = freshBehaviorState();
  state.events = [];
  state.focus = 0;
  state.history = [];
  state.lastEventAt = new Map();
  state.previousIssues = new Set();
  state.sessionStart = state.active ? performance.now() : 0;
  state.stats = freshStats();
  els.calibrationState.textContent = "ยังไม่ได้คาลิเบรต";
  renderEvents();
  updateUI({
    action: { label: "รอข้อมูล", score: 0, severity: "good" },
    eye: { label: "รอข้อมูล", score: 0, severity: "good" },
    focus: 0,
    posture: { label: "รอข้อมูล", score: 0, severity: "good" },
    presence: { score: 0 },
  });
  drawTrend();
  if (els.chatInput) els.chatInput.value = "";
  renderChatThread();
  updateBehaviorUI();
}

function exportSession() {
  const payload = {
    average: {
      actions: average("actionSum"),
      eyeTracking: average("eyeSum"),
      focus: average("focusSum"),
      posture: average("postureSum"),
      presence: average("presenceSum"),
    },
    behavior: {
      checkIns: state.behavior.history,
      language: state.behaviorLanguage,
      summary: summarizeBehaviorHistory(state.behavior.history),
    },
    events: state.events,
    generatedAt: new Date().toISOString(),
    samples: state.stats.samples,
    thresholds: state.thresholds,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `focus-session-${new Date().toISOString().slice(0, 19).replaceAll(":", "-")}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function average(key) {
  if (!state.stats.samples) return 0;
  return Math.round(state.stats[key] / state.stats.samples);
}

function calibrate() {
  if (!state.lastMetrics?.raw) return;
  const raw = state.lastMetrics.raw;
  state.baseline = {
    calibrated: true,
    gazeX: raw.gazeX ?? state.baseline.gazeX,
    headDrop: raw.headDrop ?? state.baseline.headDrop,
    headPitch: raw.headPitch ?? state.baseline.headPitch,
    headYaw: raw.headYaw ?? state.baseline.headYaw,
    lean: raw.lean ?? state.baseline.lean,
    shoulderSlope: raw.shoulderSlope ?? state.baseline.shoulderSlope,
  };
  els.calibrationState.textContent = "คาลิเบรตแล้ว";
  addEvent({
    id: "calibrated",
    severity: "good",
    title: "ตั้งค่ากึ่งกลางใหม่",
  });
}

function trackFrame(now) {
  if (!state.active) return;

  const videoReady = els.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
  if (videoReady && now - state.lastInferenceAt > 78) {
    state.lastInferenceAt = now;
    processFrame(now);
  }

  requestAnimationFrame(trackFrame);
}

function processFrame(now) {
  ensureCanvasSize();

  const timestamp = Math.round(now);
  const faceResult = state.models.faceLandmarker.detectForVideo(els.video, timestamp);
  const poseResult = state.models.poseLandmarker.detectForVideo(els.video, timestamp);
  const handResult = state.models.handLandmarker
    ? state.models.handLandmarker.detectForVideo(els.video, timestamp)
    : { landmarks: [] };

  state.lastFaceLandmarks = faceResult.faceLandmarks?.[0] || null;
  const face = analyzeFace(faceResult, now);
  const posture = analyzePosture(poseResult, face, now);
  const action = analyzeActions(handResult, face, now);

  const presenceScore = face.present ? 100 : 0;
  const rawFocus =
    face.score * 0.42 + posture.score * 0.3 + action.score * 0.18 + presenceScore * 0.1;
  const focus = state.stats.samples ? lerp(state.focus, rawFocus, 0.28) : rawFocus;
  state.focus = clamp(focus);

  const issues = [...face.issues, ...posture.issues, ...action.issues];
  if (state.focus < 45 && face.present) {
    issues.push({ id: "low-focus", severity: "bad", title: "คะแนนโฟกัสต่ำ" });
  }

  state.stats.samples += 1;
  state.stats.actionSum += action.score;
  state.stats.eyeSum += face.score;
  state.stats.focusSum += state.focus;
  state.stats.postureSum += posture.score;
  state.stats.presenceSum += presenceScore;
  state.history.push(Math.round(state.focus));
  if (state.history.length > 240) state.history.shift();

  state.lastMetrics = {
    action,
    eye: face,
    focus: state.focus,
    posture,
    presence: { score: presenceScore },
    raw: {
      gazeX: face.raw.gazeX,
      headDrop: posture.raw.headDrop,
      headPitch: face.raw.headPitch,
      headYaw: face.raw.headYaw,
      lean: posture.raw.lean,
      shoulderSlope: posture.raw.shoulderSlope,
    },
  };

  reconcileEvents(issues, now);
  drawOverlay(faceResult, poseResult, handResult, state.focus);
  drawTrend();
  updateUI(state.lastMetrics);
}

function analyzeFace(result, now) {
  const landmarks = result.faceLandmarks?.[0];
  if (!landmarks) {
    const staleMs = state.lastFaceSeen ? now - state.lastFaceSeen : 9999;
    return {
      issues: staleMs > 900 ? [{ id: "no-face", severity: "bad", title: "ไม่พบใบหน้า" }] : [],
      label: "ไม่พบใบหน้า",
      present: false,
      raw: {},
      score: 0,
      severity: "bad",
    };
  }

  state.lastFaceSeen = now;

  const leftIris = landmarks[473] || pointAverage([landmarks[474], landmarks[475], landmarks[476], landmarks[477]]);
  const rightIris = landmarks[468] || pointAverage([landmarks[469], landmarks[470], landmarks[471], landmarks[472]]);
  const leftInner = landmarks[362];
  const leftOuter = landmarks[263];
  const rightOuter = landmarks[33];
  const rightInner = landmarks[133];
  const leftEyeCenter = midpoint(leftInner, leftOuter);
  const rightEyeCenter = midpoint(rightInner, rightOuter);
  const eyeCenter = midpoint(leftEyeCenter, rightEyeCenter);
  const nose = landmarks[1];
  const mouth = midpoint(landmarks[61], landmarks[291]);

  const gazeX = pointAverage([
    irisRatio(leftIris, leftInner, leftOuter),
    irisRatio(rightIris, rightOuter, rightInner),
  ]);
  const gazeScalar = gazeX?.x ?? 0.5;
  const headYaw = nose && eyeCenter ? nose.x - eyeCenter.x : 0;
  const headPitch = nose && eyeCenter && mouth ? (nose.y - eyeCenter.y) / Math.max(distance(eyeCenter, mouth), 0.001) : 0;
  const gazeDeviation = Math.max(
    Math.abs(gazeScalar - state.baseline.gazeX),
    Math.abs(headYaw - state.baseline.headYaw) * 2.1,
    Math.abs(headPitch - state.baseline.headPitch) * 0.18,
  );

  const leftOpen = distance(landmarks[386], landmarks[374]) / Math.max(distance(leftInner, leftOuter), 0.001);
  const rightOpen = distance(landmarks[159], landmarks[145]) / Math.max(distance(rightOuter, rightInner), 0.001);
  const eyeOpen = (leftOpen + rightOpen) / 2;
  const eyesClosed = eyeOpen < 0.16;
  const closedPenalty = eyesClosed ? 24 : 0;
  const lookingAway = gazeDeviation > state.thresholds.gaze;
  const score = clamp(100 - (gazeDeviation / Math.max(state.thresholds.gaze, 0.001)) * 62 - closedPenalty);

  const issues = [];
  if (lookingAway) issues.push({ id: "look-away", severity: "warn", title: "สายตาออกนอกจอ" });
  if (eyesClosed) issues.push({ id: "eyes-closed", severity: "warn", title: "หลับตานานผิดปกติ" });

  return {
    issues,
    label: eyesClosed ? "หลับตา" : lookingAway ? "มองออกนอกจอ" : "มองจออยู่",
    present: true,
    raw: { eyeOpen, gazeX: gazeScalar, headPitch, headYaw },
    score,
    severity: lookingAway || eyesClosed ? "warn" : "good",
  };
}

function irisRatio(iris, cornerA, cornerB) {
  if (!iris || !cornerA || !cornerB) return null;
  const minX = Math.min(cornerA.x, cornerB.x);
  const maxX = Math.max(cornerA.x, cornerB.x);
  return { x: clamp((iris.x - minX) / Math.max(maxX - minX, 0.001), 0, 1), y: 0 };
}

function analyzePosture(result, face) {
  const pose = result.landmarks?.[0];
  if (!pose) {
    return {
      issues: face.present ? [{ id: "pose-partial", severity: "warn", title: "เห็นลำตัวไม่ชัด" }] : [],
      label: face.present ? "เห็นลำตัวไม่ชัด" : "รอข้อมูล",
      raw: {},
      score: face.present ? 58 : 0,
      severity: face.present ? "warn" : "bad",
    };
  }

  const leftShoulder = pose[11];
  const rightShoulder = pose[12];
  const leftHip = pose[23];
  const rightHip = pose[24];
  const nose = pose[0];
  const shoulderCenter = midpoint(leftShoulder, rightShoulder);
  const hipCenter = midpoint(leftHip, rightHip);
  const shoulderSlope = Math.abs((leftShoulder?.y || 0) - (rightShoulder?.y || 0));
  const lean = shoulderCenter && hipCenter ? shoulderCenter.x - hipCenter.x : 0;
  const headOffset = nose && shoulderCenter ? nose.x - shoulderCenter.x : 0;
  const headDrop = nose && shoulderCenter ? nose.y - shoulderCenter.y : state.baseline.headDrop;

  const leanDelta = Math.abs(lean - state.baseline.lean);
  const headDelta = Math.abs(headOffset);
  const dropDelta = Math.max(0, headDrop - state.baseline.headDrop);
  const slopeDelta = Math.max(0, shoulderSlope - state.baseline.shoulderSlope);
  const postureLoad = Math.max(leanDelta * 1.1, headDelta * 0.9, dropDelta * 0.78, slopeDelta * 1.35);
  const badPosture = postureLoad > state.thresholds.posture;
  const score = clamp(100 - (postureLoad / Math.max(state.thresholds.posture, 0.001)) * 70);

  return {
    issues: badPosture ? [{ id: "posture", severity: "warn", title: "ท่าทางเริ่มเสีย" }] : [],
    label: badPosture ? "เอน/ก้มมากไป" : "ท่าทางนิ่ง",
    raw: { headDrop, lean, shoulderSlope },
    score,
    severity: badPosture ? "warn" : "good",
  };
}

function analyzeActions(result, face) {
  const hands = result.landmarks || [];
  const centers = hands.map((hand) => pointAverage(hand)).filter(Boolean);

  const nearFace = Boolean(
    face.present &&
      hands.some((hand) => {
        const facePoint = getLastFacePoint();
        return facePoint && hand.some((point) => distance(point, facePoint) < state.thresholds.action);
      }),
  );

  let handMotion = 0;
  if (centers.length && state.lastHandCenters.length) {
    const total = centers.reduce((sum, center) => {
      const nearest = state.lastHandCenters.reduce(
        (best, previous) => Math.min(best, distance(center, previous)),
        Number.POSITIVE_INFINITY,
      );
      return Number.isFinite(nearest) ? sum + nearest : sum;
    }, 0);
    handMotion = total / centers.length;
  }
  state.lastHandCenters = centers;

  const motionLimit = state.thresholds.action / 5;
  const fidget = handMotion > motionLimit && hands.length > 0;
  const optionalPenalty = state.handOptional ? 8 : 0;
  const score = clamp(100 - (nearFace ? 38 : 0) - (fidget ? 22 : 0) - optionalPenalty);
  const issues = [];
  if (nearFace) issues.push({ id: "hand-face", severity: "warn", title: "มือใกล้ใบหน้า" });
  if (fidget) issues.push({ id: "fidget", severity: "warn", title: "มือเคลื่อนไหวบ่อย" });

  return {
    issues,
    label: nearFace ? "มือใกล้ใบหน้า" : fidget ? "เคลื่อนไหวบ่อย" : state.handOptional ? "วัดมือบางส่วน" : "นิ่ง",
    raw: { handMotion },
    score,
    severity: nearFace || fidget ? "warn" : "good",
  };
}

function getLastFacePoint() {
  const faceLandmarks = state.lastFaceLandmarks;
  if (!faceLandmarks) return null;
  return pointAverage([faceLandmarks[1], faceLandmarks[10], faceLandmarks[152]]);
}

function reconcileEvents(issues, now) {
  const next = new Set(issues.map((issue) => issue.id));
  for (const issue of issues) {
    const lastAt = state.lastEventAt.get(issue.id) || 0;
    if (!state.previousIssues.has(issue.id) && now - lastAt > 1600) {
      addEvent(issue);
      state.lastEventAt.set(issue.id, now);
    }
  }

  if (state.previousIssues.size > 0 && next.size === 0) {
    addEvent({ id: "recovered", severity: "good", title: "กลับมาโฟกัส" });
  }
  state.previousIssues = next;
}

function addEvent(event) {
  const timestamp = performance.now();
  const elapsed = state.sessionStart ? timestamp - state.sessionStart : 0;
  state.events.unshift({
    elapsed: formatClock(elapsed),
    id: event.id,
    severity: event.severity,
    title: localizedEventTitle(event),
  });
  state.events = state.events.slice(0, 32);
  renderEvents();
}

function localizedEventTitle(event) {
  const copy = signalCopy();
  const titles = {
    calibrated: copy.calibratedEvent,
    "eyes-closed": copy.eyesClosedEvent,
    fidget: copy.fidget,
    "hand-face": copy.handFace,
    "look-away": copy.lookAwayEvent,
    "low-focus": copy.lowFocusEvent,
    "no-face": copy.noFace,
    "pose-partial": copy.posturePartial,
    posture: copy.postureEvent,
    recovered: copy.recovered,
  };
  return titles[event.id] || event.title;
}

function renderEvents() {
  els.eventCount.textContent = String(state.events.length);
  if (!state.events.length) {
    els.eventList.innerHTML = `<li class="event-empty">ยังไม่มีเหตุการณ์</li>`;
    return;
  }

  els.eventList.innerHTML = state.events
    .map(
      (event) => `
        <li class="${event.severity}">
          <div class="event-time">${event.elapsed}</div>
          <div class="event-title">${localizedEventTitle(event)}</div>
        </li>
      `,
    )
    .join("");
}

function updateUI(metrics) {
  const focus = Math.round(metrics.focus || 0);
  const tone = scoreTone(focus);
  els.focusScore.textContent = String(focus);
  els.focusLabel.textContent = tone.label;
  els.focusHint.textContent = tone.hint;
  els.scoreRing.style.setProperty("--score", String(focus));
  updateMetric("eye", metrics.eye.score);
  updateMetric("posture", metrics.posture.score);
  updateMetric("action", metrics.action.score);
  updateMetric("presence", metrics.presence.score);
  updateBadge(els.gazeBadge, `สายตา: ${metrics.eye.label}`, metrics.eye.severity);
  updateBadge(els.postureBadge, `ท่าทาง: ${metrics.posture.label}`, metrics.posture.severity);
  updateBadge(els.actionBadge, `แอ็กชัน: ${metrics.action.label}`, metrics.action.severity);
  els.sampleCount.textContent = `${state.stats.samples} samples`;
}

function updateMetric(name, score) {
  const value = `${Math.round(score || 0)}%`;
  els[`${name}Score`].textContent = value;
  els[`${name}Meter`].style.width = value;
}

function updateBadge(element, text, severity) {
  element.classList.toggle("warn", severity === "warn");
  element.classList.toggle("bad", severity === "bad");
  element.querySelector("span").textContent = text;
}

function ensureCanvasSize() {
  const width = els.video.videoWidth || 1280;
  const height = els.video.videoHeight || 720;
  if (els.overlay.width !== width || els.overlay.height !== height) {
    els.overlay.width = width;
    els.overlay.height = height;
  }
}

function clearOverlay() {
  const ctx = els.overlay.getContext("2d");
  ctx.clearRect(0, 0, els.overlay.width, els.overlay.height);
}

function drawOverlay(faceResult, poseResult, handResult, focus) {
  const ctx = els.overlay.getContext("2d");
  const { width, height } = els.overlay;
  ctx.clearRect(0, 0, width, height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const faceLandmarks = faceResult.faceLandmarks?.[0];
  state.lastFaceLandmarks = faceLandmarks || null;
  if (faceLandmarks) {
    drawPoints(ctx, faceLandmarks, FACE_POINTS, width, height, "#f8d66d", 4);
    drawLine(ctx, faceLandmarks, [33, 133], width, height, "#f8d66d", 3);
    drawLine(ctx, faceLandmarks, [362, 263], width, height, "#f8d66d", 3);
    drawLine(ctx, faceLandmarks, [10, 152], width, height, "rgba(248, 214, 109, 0.55)", 2);
  }

  const pose = poseResult.landmarks?.[0];
  if (pose) {
    drawConnections(ctx, pose, POSE_CONNECTIONS, width, height, "rgba(45, 108, 223, 0.82)", 5);
    drawPoints(ctx, pose, [0, 11, 12, 13, 14, 15, 16, 23, 24], width, height, "#ffffff", 4);
  }

  const hands = handResult.landmarks || [];
  for (const hand of hands) {
    drawConnections(ctx, hand, HAND_CONNECTIONS, width, height, "rgba(38, 162, 105, 0.9)", 3);
    drawPoints(ctx, hand, hand.map((_, index) => index), width, height, "#baf3d4", 3);
  }

  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = focus >= 55 ? "rgba(38, 162, 105, 0.7)" : "rgba(217, 95, 89, 0.75)";
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, width - 10, height - 10);
  ctx.restore();
}

function drawLine(ctx, landmarks, indexes, width, height, color, lineWidth) {
  const [from, to] = indexes.map((index) => landmarks[index]).filter(Boolean);
  if (!from || !to) return;
  ctx.beginPath();
  ctx.moveTo(from.x * width, from.y * height);
  ctx.lineTo(to.x * width, to.y * height);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

function drawConnections(ctx, landmarks, connections, width, height, color, lineWidth) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  for (const [fromIndex, toIndex] of connections) {
    const from = landmarks[fromIndex];
    const to = landmarks[toIndex];
    if (!from || !to) continue;
    ctx.beginPath();
    ctx.moveTo(from.x * width, from.y * height);
    ctx.lineTo(to.x * width, to.y * height);
    ctx.stroke();
  }
}

function drawPoints(ctx, landmarks, indexes, width, height, color, radius) {
  ctx.fillStyle = color;
  for (const index of indexes) {
    const point = landmarks[index];
    if (!point) continue;
    ctx.beginPath();
    ctx.arc(point.x * width, point.y * height, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTrend() {
  const canvas = els.trendCanvas;
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#fbfcfa";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#dfe4dc";
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i += 1) {
    const y = (height / 4) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  if (state.history.length < 2) return;

  const xStep = width / Math.max(state.history.length - 1, 1);
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, "#0f8b8d");
  gradient.addColorStop(0.6, "#2d6cdf");
  gradient.addColorStop(1, "#26a269");
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 4;
  ctx.beginPath();
  state.history.forEach((score, index) => {
    const x = index * xStep;
    const y = height - (score / 100) * (height - 18) - 9;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function summarizeBehaviorHistory(history) {
  if (!history.length) {
    return {
      averageChars: 0,
      averageCpm: 0,
      averageEditRatio: 0,
      signal: "Low",
    };
  }

  return {
    averageChars: Math.round(mean(history.map((item) => item.metrics.charCount))),
    averageCpm: Math.round(mean(history.map((item) => item.metrics.charactersPerMinute))),
    averageEditRatio: Math.round(mean(history.map((item) => item.metrics.editRatio * 100))),
    averageRecordingMs: Math.round(mean(history.map((item) => item.recording?.durationMs || item.metrics.actualDurationMs || 0))),
    signal: history[history.length - 1].assessment.signal,
  };
}

function mean(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function handleTypingKeydown(event) {
  const live = state.behavior.live;
  const now = performance.now();
  if (!live.inputStartedAt) {
    live.inputStartedAt = now;
    live.inputStartedWallAt = Date.now();
  }
  if (live.lastInputAt) {
    const interval = now - live.lastInputAt;
    live.intervals.push(interval);
    if (interval < 220) live.burstCount += 1;
    if (interval > 1800) live.pauseCount += 1;
  }
  live.lastInputAt = now;
  live.lastInputWallAt = Date.now();
  live.totalKeydowns += 1;
  if (event.key === "Backspace" || event.key === "Delete") {
    live.backspaces += 1;
  }
  setBehaviorStatus("typing");
  updateBehaviorUI();
}

function handleTypingInput() {
  const now = performance.now();
  const live = state.behavior.live;
  if (!els.chatInput.value.trim()) {
    resetTypingLiveState();
    setBehaviorStatus("idle");
    updateBehaviorUI();
    return;
  }
  if (!live.inputStartedAt) {
    live.inputStartedAt = now;
    live.inputStartedWallAt = Date.now();
  }
  live.lastInputAt = now;
  live.lastInputWallAt = Date.now();
  setBehaviorStatus(els.chatInput.value.trim() ? "reviewing" : "idle");
  updateBehaviorUI();
}

function buildTypingMetrics(text, measuredAt = performance.now(), measuredWallAt = Date.now()) {
  const live = state.behavior.live;
  const cleanText = text.trim();
  const charCount = cleanText.length;
  const words = cleanText.toLowerCase().match(/[a-z0-9']+/g) || [];
  const wordCount = words.length;
  const uniqueWords = new Set(words).size;
  const startedAt = live.inputStartedAt || measuredAt;
  const actualDurationMs = Math.max(0, measuredAt - startedAt);
  const floorFromChars = charCount * 90;
  const floorFromWords = wordCount * 320;
  const durationMs = Math.max(1000, actualDurationMs, floorFromChars, floorFromWords);
  const charactersPerMinute = (charCount / durationMs) * 60000;
  const editRatio = live.totalKeydowns ? live.backspaces / live.totalKeydowns : 0;
  const averageInterval = live.intervals.length ? mean(live.intervals) : durationMs;
  const fillerMatches =
    cleanText.match(/\b(um+|uh+|like|actually|literally|sort of|kind of|basically|maybe)\b/gi) || [];
  const punctuationBursts = (cleanText.match(/[!?]{2,}|\.{3,}|,{3,}/g) || []).length;
  const repeatedWords = repeatedWordRatio(words);
  const history = state.behavior.history;
  const previous = history[history.length - 1];
  const lengthDrift = previous ? Math.abs(charCount - previous.metrics.charCount) : 0;
  const speedDrift = previous ? Math.abs(charactersPerMinute - previous.metrics.charactersPerMinute) : 0;

  return {
    averageInterval,
    actualDurationMs,
    analyzedWallAt: measuredWallAt,
    burstCount: live.burstCount,
    charCount,
    charactersPerMinute,
    durationMs,
    editRatio,
    fillerRate: wordCount ? fillerMatches.length / wordCount : 0,
    lengthDrift,
    pauseCount: live.pauseCount,
    punctuationBursts,
    repeatedWordRatio: repeatedWords,
    speedDrift,
    startedWallAt: live.inputStartedWallAt || 0,
    uniqueWordRatio: wordCount ? uniqueWords / wordCount : 0,
    wordCount,
  };
}

function repeatedWordRatio(words) {
  if (!words.length) return 0;
  const counts = new Map();
  for (const word of words) {
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  const repeated = [...counts.values()].filter((count) => count > 1).reduce((sum, count) => sum + count - 1, 0);
  return repeated / words.length;
}

function assessBehavior(text, metrics) {
  const signalScore =
    (metrics.charactersPerMinute > 850 ? 1 : 0) +
    (metrics.editRatio > 0.12 ? 1 : 0) +
    (metrics.pauseCount >= 2 ? 1 : 0) +
    (metrics.repeatedWordRatio > 0.18 ? 1 : 0) +
    (metrics.lengthDrift > 120 ? 1 : 0) +
    (metrics.speedDrift > 220 ? 1 : 0) +
    (metrics.punctuationBursts > 1 ? 1 : 0);

  const signal =
    signalScore >= 5 ? "High" : signalScore >= 3 ? "Elevated" : signalScore >= 2 ? "Moderate" : "Low";

  const flags = [];
  if (metrics.charactersPerMinute > 850) flags.push("fast bursts");
  if (metrics.editRatio > 0.12) flags.push("heavy revision");
  if (metrics.pauseCount >= 2) flags.push("stop-start pacing");
  if (metrics.repeatedWordRatio > 0.18) flags.push("repetition");
  if (metrics.lengthDrift > 120) flags.push("large length swing");
  if (metrics.speedDrift > 220) flags.push("speed volatility");
  if (metrics.punctuationBursts > 1) flags.push("punctuation bursts");

  const assistantText = buildAssistantResponse(text, metrics, signal, flags);
  return { assistantText, flags, signal, signalScore };
}

function buildAssistantResponse(text, metrics, signal, flags) {
  const copy = behaviorCopy();
  const thai = state.behaviorLanguage === "th";
  const focusScore = Math.round(state.focus || 0);
  const history = state.behavior.history;
  const previousAverageSpeed = history.length ? Math.round(mean(history.map((item) => item.metrics.charactersPerMinute))) : 0;
  const translatedFlags = flags.map((flag) => translateFlag(flag));
  const timingLine = metrics.startedWallAt
    ? thai
      ? `ช่วงที่บันทึก: ${formatWallTime(metrics.startedWallAt)} ถึง ${formatWallTime(metrics.analyzedWallAt)} รวม ${formatClock(metrics.actualDurationMs)}`
      : `Recorded window: ${formatWallTime(metrics.startedWallAt)} to ${formatWallTime(metrics.analyzedWallAt)}, lasting ${formatClock(metrics.actualDurationMs)}.`
    : thai
      ? `ช่วงที่บันทึก: ${formatClock(metrics.actualDurationMs)}`
      : `Recorded window: ${formatClock(metrics.actualDurationMs)}.`;
  const speedLine = previousAverageSpeed
    ? thai
      ? `ความเร็วพิมพ์คือ ${Math.round(metrics.charactersPerMinute)} CPM เทียบกับค่าเฉลี่ยล่าสุด ${previousAverageSpeed} CPM`
      : `Typing speed is ${Math.round(metrics.charactersPerMinute)} CPM, compared with your recent average of ${previousAverageSpeed} CPM.`
    : thai
      ? `ความเร็วพิมพ์รอบนี้คือ ${Math.round(metrics.charactersPerMinute)} CPM`
      : `Typing speed is ${Math.round(metrics.charactersPerMinute)} CPM in this check-in.`;
  const revisionLine = metrics.editRatio > 0.12
    ? thai
      ? "มีการลบหรือแก้ข้อความค่อนข้างมาก ซึ่งอาจเกิดตอนความคิดวิ่งเร็วกว่าการเรียบเรียงประโยค"
      : "Revision activity is fairly high, which can happen when thoughts are moving faster than the final wording."
    : thai
      ? "การแก้ข้อความค่อนข้างนิ่ง ทำให้ข้อความดูควบคุมจังหวะได้ดี"
      : "Revision activity is fairly steady, so the draft looks relatively controlled.";
  const pacingLine = metrics.pauseCount >= 2
    ? thai
      ? "จังหวะการพิมพ์มีการหยุดแล้วกลับมาพิมพ์หลายครั้ง ซึ่งอาจสะท้อนการเสียสมาธิหรือการสลับบริบท"
      : "The message shows stop-start pacing with multiple pauses, which can reflect distraction or context switching."
    : thai
      ? "จังหวะการพิมพ์ค่อนข้างต่อเนื่อง ยังไม่เห็นการหยุดยาวหลายช่วง"
      : "The pacing looks fairly continuous without many long pauses.";
  const wordLine = metrics.repeatedWordRatio > 0.18 || metrics.fillerRate > 0.08
    ? thai
      ? "พบการใช้คำซ้ำหรือคำเติมมากขึ้นเล็กน้อย อาจเป็นสัญญาณของความคิดที่วนหรือกำลังจัดระเบียบอยู่"
      : "Word reuse or filler language is a bit elevated, suggesting some cognitive churn."
    : thai
      ? "รูปแบบคำยังค่อนข้างหลากหลายสำหรับข้อความสั้น ๆ"
      : "Word choice looks reasonably varied for a short check-in.";
  const focusLine = state.stats.samples > 0
    ? thai
      ? `คะแนนโฟกัสจากกล้องตอนนี้คือ ${focusScore}/100 จึงอ่านสัญญาณข้อความร่วมกับท่าทางและสายตา`
      : `Camera-based focus is currently ${focusScore}/100, so this text signal is being read alongside posture and gaze.`
    : thai
      ? "ตอนนี้ยังไม่ได้เปิดการวัดจากกล้อง สรุปนี้จึงอิงจากพฤติกรรมการพิมพ์เป็นหลัก"
      : "Camera-based focus is not active yet, so this summary is based mostly on text behavior.";
  const cautionLine = signal === "High" || signal === "Elevated"
    ? thai
      ? "รูปแบบนี้อาจสอดคล้องกับการทำงานที่สมาธิแตกเป็นช่วง ๆ แต่ไม่จำเพาะกับ ADHD และไม่ควรใช้แทนการวินิจฉัย"
      : "These patterns can align with attention-fragmented work, but they are not specific to ADHD and should not be treated as a diagnosis."
    : thai
      ? "ข้อความรอบนี้ยังไม่เห็นสัญญาณสมาธิแตกที่แรงมาก แต่ข้อความเดียวไม่พอสำหรับสรุปภาพรวม"
      : "The current text does not show strong attention-fragmented signals, though one message alone is never conclusive.";
  const suggestionLine = signal === "High"
    ? thai
      ? "ลองรีเซ็ตสั้น ๆ 2 นาที: เปิดแท็บเดียว เลือกงานถัดไปหนึ่งข้อ แล้วเขียนเป้าหมายหนึ่งประโยค"
      : "Try a 2-minute reset: single-tab work, one concrete next action, and one short sentence goal."
    : signal === "Elevated"
      ? thai
        ? "ขั้นต่อไปที่ช่วยได้คือชะลอวงจรลง: เขียนหัวข้องานหนึ่งข้อ แล้วสรุปสั้น ๆ หนึ่งย่อหน้า"
        : "A useful next step is to slow the loop down: outline one task, then write one compact update."
      : thai
        ? "ถ้าต้องการรักษา baseline ให้ลองเช็กอินสั้น ๆ พร้อมชื่องานเดียวทุกไม่กี่นาที"
        : "A good way to keep the baseline is to continue with one task label and short check-ins every few minutes.";

  const flagLine = flags.length
    ? thai
      ? `สัญญาณที่พบ: ${translatedFlags.join(", ")}`
      : `Observed markers: ${flags.join(", ")}.`
    : thai
      ? "สัญญาณที่พบ: ความแกว่งต่ำ"
      : "Observed markers: low volatility.";
  return [timingLine, speedLine, revisionLine, pacingLine, wordLine, focusLine, flagLine, cautionLine, suggestionLine].join(" ");
}

function translateFlag(flag) {
  if (state.behaviorLanguage !== "th") return flag;
  const labels = {
    "fast bursts": "พิมพ์เร็วเป็นช่วง",
    "heavy revision": "แก้ข้อความมาก",
    "large length swing": "ความยาวข้อความแกว่ง",
    "punctuation bursts": "ใช้เครื่องหมายติดกัน",
    repetition: "ใช้คำซ้ำ",
    "speed volatility": "ความเร็วแกว่ง",
    "stop-start pacing": "พิมพ์แบบหยุดเป็นช่วง",
  };
  return labels[flag] || flag;
}

function normalizeLlmSignal(signal, fallback = "Low") {
  return ["Low", "Moderate", "Elevated", "High"].includes(signal) ? signal : fallback;
}

function buildLlmAssistantText(analysis, fallbackText) {
  if (!analysis?.summary) return fallbackText;
  const confidence = Number.isFinite(Number(analysis.confidence))
    ? ` Confidence: ${Math.round(Number(analysis.confidence) * 100)}%.`
    : "";
  const recommendation = analysis.recommendation ? ` ${analysis.recommendation}` : "";
  return `${analysis.summary}${confidence}${recommendation}`;
}

async function requestLlmBehaviorAssessment(text, metrics, heuristicAssessment) {
  const payload = {
    camera: {
      focus: Math.round(state.focus || 0),
      latest: state.lastMetrics
        ? {
            action: Math.round(state.lastMetrics.action.score || 0),
            eye: Math.round(state.lastMetrics.eye.score || 0),
            posture: Math.round(state.lastMetrics.posture.score || 0),
            presence: Math.round(state.lastMetrics.presence.score || 0),
          }
        : null,
      samples: state.stats.samples,
    },
    heuristic: {
      flags: heuristicAssessment.flags,
      signal: heuristicAssessment.signal,
      signalScore: heuristicAssessment.signalScore,
    },
    language: state.behaviorLanguage,
    metrics,
    text,
  };

  const response = await fetch("/api/behavior-analysis", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "LLM analysis failed");
  }
  return result.analysis;
}

async function submitBehaviorCheckin() {
  const text = els.chatInput.value.trim();
  if (!text) return;

  const analyzedAt = performance.now();
  const analyzedWallAt = Date.now();
  const metrics = buildTypingMetrics(text, analyzedAt, analyzedWallAt);
  const heuristicAssessment = assessBehavior(text, metrics);
  let assessment = heuristicAssessment;
  els.sendChatBtn.disabled = true;
  setBehaviorStatus("reviewing");
  try {
    const llmAnalysis = await requestLlmBehaviorAssessment(text, metrics, heuristicAssessment);
    const llmSignal = normalizeLlmSignal(llmAnalysis.signal, heuristicAssessment.signal);
    assessment = {
      ...heuristicAssessment,
      assistantText: buildLlmAssistantText(llmAnalysis, heuristicAssessment.assistantText),
      flags: Array.isArray(llmAnalysis.flags) && llmAnalysis.flags.length ? llmAnalysis.flags : heuristicAssessment.flags,
      llm: {
        confidence: Number(llmAnalysis.confidence || 0),
        recommendation: llmAnalysis.recommendation || "",
        summary: llmAnalysis.summary || "",
      },
      signal: llmSignal,
      signalScore: { Low: 1, Moderate: 2, Elevated: 3, High: 5 }[llmSignal] || heuristicAssessment.signalScore,
    };
  } catch (error) {
    console.warn("Falling back to local behavior analysis", error);
  } finally {
    els.sendChatBtn.disabled = false;
  }
  const recording = {
    analyzedAt: new Date(analyzedWallAt).toISOString(),
    durationMs: metrics.actualDurationMs,
    durationText: formatClock(metrics.actualDurationMs),
    startedAt: metrics.startedWallAt ? new Date(metrics.startedWallAt).toISOString() : null,
  };
  state.behavior.live.sendCount += 1;
  state.behavior.history.push({
    assessment,
    createdAt: new Date().toISOString(),
    metrics,
    recording,
    text,
  });
  state.behavior.history = state.behavior.history.slice(-24);
  state.behavior.thread.push({ role: "user", text });
  state.behavior.thread.push({ role: "assistant", text: assessment.assistantText });
  state.behavior.thread = state.behavior.thread.slice(-14);
  resetTypingLiveState();
  els.chatInput.value = "";
  setBehaviorStatus("idle");
  renderChatThread();
  updateBehaviorUI();
}

function resetTypingLiveState() {
  state.behavior.live = {
    backspaces: 0,
    burstCount: 0,
    inputStartedAt: 0,
    inputStartedWallAt: 0,
    intervals: [],
    lastInputAt: 0,
    lastInputWallAt: 0,
    pauseCount: 0,
    sendCount: state.behavior.live.sendCount,
    totalKeydowns: 0,
  };
}

function clearBehaviorThread() {
  state.behavior = freshBehaviorState();
  if (els.chatInput) els.chatInput.value = "";
  setBehaviorStatus("idle");
  renderChatThread();
  updateBehaviorUI();
}

function renderChatThread() {
  if (!els.chatThread) return;
  const copy = behaviorCopy();
  els.chatThread.innerHTML = state.behavior.thread
    .map(
      (item) => `
        <article class="chat-bubble ${item.role}">
          <strong>${item.role === "assistant" ? copy.assistantName : copy.userName}</strong>
          <p>${escapeHtml(item.key ? copy[item.key] : item.text)}</p>
        </article>
      `,
    )
    .join("");
  els.chatThread.scrollTop = els.chatThread.scrollHeight;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function updateBehaviorUI() {
  if (!els.typingSpeedValue) return;
  const copy = behaviorCopy();
  const draft = els.chatInput?.value || "";
  const hasDraft = Boolean(draft.trim() || state.behavior.live.totalKeydowns);
  const history = state.behavior.history;
  const latest = history[history.length - 1];
  const metrics = hasDraft
    ? buildTypingMetrics(draft)
    : latest?.metrics || {
        actualDurationMs: 0,
        charCount: 0,
        charactersPerMinute: 0,
        editRatio: 0,
        startedWallAt: 0,
  };
  const liveAssessment = hasDraft ? assessBehavior(draft, metrics) : null;
  els.typingSpeedValue.textContent = `${Math.round(metrics.charactersPerMinute || 0)} CPM`;
  els.messageLengthValue.textContent = `${metrics.charCount || 0} ${copy.chars}`;
  els.recordingWindowValue.textContent = formatClock(metrics.actualDurationMs || latest?.recording?.durationMs || 0);
  els.editRatioValue.textContent = `${Math.round((metrics.editRatio || 0) * 100)}%`;
  els.typingStartedValue.textContent = formatWallTime(metrics.startedWallAt || latest?.metrics?.startedWallAt);
  const signal = liveAssessment?.signal || latest?.assessment.signal || "Low";
  els.behaviorSignalValue.textContent = copy.signalLabels[signal] || signal;
}

function setBehaviorStatus(status) {
  const copy = behaviorCopy();
  const labels = {
    idle: copy.idle,
    reviewing: copy.reviewing,
    typing: copy.typing,
  };
  els.typingStatus.textContent = labels[status] || status;
}

function scoreTone(score) {
  const copy = appCopy();
  if (score >= 78) return { label: copy.scoreGood, hint: copy.scoreGoodHint, tone: "good" };
  if (score >= 55) return { label: copy.scoreWarn, hint: copy.scoreWarnHint, tone: "warn" };
  if (score > 0) return { label: copy.scoreLow, hint: copy.scoreLowHint, tone: "bad" };
  return { label: copy.focusLabelIdle, hint: copy.focusHintIdle, tone: "idle" };
}

function analyzeFace(result, now) {
  const copy = signalCopy();
  const landmarks = result.faceLandmarks?.[0];
  if (!landmarks) {
    const staleMs = state.lastFaceSeen ? now - state.lastFaceSeen : 9999;
    return {
      issues: staleMs > 900 ? [{ id: "no-face", severity: "bad", title: copy.noFace }] : [],
      label: copy.noFace,
      present: false,
      raw: {},
      score: 0,
      severity: "bad",
    };
  }

  state.lastFaceSeen = now;
  const leftIris = landmarks[473] || pointAverage([landmarks[474], landmarks[475], landmarks[476], landmarks[477]]);
  const rightIris = landmarks[468] || pointAverage([landmarks[469], landmarks[470], landmarks[471], landmarks[472]]);
  const leftInner = landmarks[362];
  const leftOuter = landmarks[263];
  const rightOuter = landmarks[33];
  const rightInner = landmarks[133];
  const leftEyeCenter = midpoint(leftInner, leftOuter);
  const rightEyeCenter = midpoint(rightInner, rightOuter);
  const eyeCenter = midpoint(leftEyeCenter, rightEyeCenter);
  const nose = landmarks[1];
  const mouth = midpoint(landmarks[61], landmarks[291]);
  const gazeX = pointAverage([
    irisRatio(leftIris, leftInner, leftOuter),
    irisRatio(rightIris, rightOuter, rightInner),
  ]);
  const gazeScalar = gazeX?.x ?? 0.5;
  const headYaw = nose && eyeCenter ? nose.x - eyeCenter.x : 0;
  const headPitch = nose && eyeCenter && mouth ? (nose.y - eyeCenter.y) / Math.max(distance(eyeCenter, mouth), 0.001) : 0;
  const gazeDeviation = Math.max(
    Math.abs(gazeScalar - state.baseline.gazeX),
    Math.abs(headYaw - state.baseline.headYaw) * 2.1,
    Math.abs(headPitch - state.baseline.headPitch) * 0.18,
  );
  const leftOpen = distance(landmarks[386], landmarks[374]) / Math.max(distance(leftInner, leftOuter), 0.001);
  const rightOpen = distance(landmarks[159], landmarks[145]) / Math.max(distance(rightOuter, rightInner), 0.001);
  const eyeOpen = (leftOpen + rightOpen) / 2;
  const eyesClosed = eyeOpen < 0.16;
  const lookingAway = gazeDeviation > state.thresholds.gaze;
  const closedPenalty = eyesClosed ? 24 : 0;
  const score = clamp(100 - (gazeDeviation / Math.max(state.thresholds.gaze, 0.001)) * 62 - closedPenalty);
  const issues = [];
  if (lookingAway) issues.push({ id: "look-away", severity: "warn", title: copy.lookAwayEvent });
  if (eyesClosed) issues.push({ id: "eyes-closed", severity: "warn", title: copy.eyesClosedEvent });
  return {
    issues,
    label: eyesClosed ? copy.eyesClosed : lookingAway ? copy.lookingAway : copy.lookingAtScreen,
    present: true,
    raw: { eyeOpen, gazeX: gazeScalar, headPitch, headYaw },
    score,
    severity: lookingAway || eyesClosed ? "warn" : "good",
  };
}

function analyzePosture(result, face) {
  const copy = signalCopy();
  const pose = result.landmarks?.[0];
  if (!pose) {
    return {
      issues: face.present ? [{ id: "pose-partial", severity: "warn", title: copy.posturePartial }] : [],
      label: face.present ? copy.posturePartial : copy.waiting,
      raw: {},
      score: face.present ? 58 : 0,
      severity: face.present ? "warn" : "bad",
    };
  }
  const leftShoulder = pose[11];
  const rightShoulder = pose[12];
  const leftHip = pose[23];
  const rightHip = pose[24];
  const nose = pose[0];
  const shoulderCenter = midpoint(leftShoulder, rightShoulder);
  const hipCenter = midpoint(leftHip, rightHip);
  const shoulderSlope = Math.abs((leftShoulder?.y || 0) - (rightShoulder?.y || 0));
  const lean = shoulderCenter && hipCenter ? shoulderCenter.x - hipCenter.x : 0;
  const headOffset = nose && shoulderCenter ? nose.x - shoulderCenter.x : 0;
  const headDrop = nose && shoulderCenter ? nose.y - shoulderCenter.y : state.baseline.headDrop;
  const leanDelta = Math.abs(lean - state.baseline.lean);
  const headDelta = Math.abs(headOffset);
  const dropDelta = Math.max(0, headDrop - state.baseline.headDrop);
  const slopeDelta = Math.max(0, shoulderSlope - state.baseline.shoulderSlope);
  const postureLoad = Math.max(leanDelta * 1.1, headDelta * 0.9, dropDelta * 0.78, slopeDelta * 1.35);
  const badPosture = postureLoad > state.thresholds.posture;
  return {
    issues: badPosture ? [{ id: "posture", severity: "warn", title: copy.postureEvent }] : [],
    label: badPosture ? copy.postureBad : copy.postureGood,
    raw: { headDrop, lean, shoulderSlope },
    score: clamp(100 - (postureLoad / Math.max(state.thresholds.posture, 0.001)) * 70),
    severity: badPosture ? "warn" : "good",
  };
}

function analyzeActions(result, face) {
  const copy = signalCopy();
  const hands = result.landmarks || [];
  const centers = hands.map((hand) => pointAverage(hand)).filter(Boolean);
  const nearFace = Boolean(
    face.present &&
      hands.some((hand) => {
        const facePoint = getLastFacePoint();
        return facePoint && hand.some((point) => distance(point, facePoint) < state.thresholds.action);
      }),
  );
  let handMotion = 0;
  if (centers.length && state.lastHandCenters.length) {
    const total = centers.reduce((sum, center) => {
      const nearest = state.lastHandCenters.reduce(
        (best, previous) => Math.min(best, distance(center, previous)),
        Number.POSITIVE_INFINITY,
      );
      return Number.isFinite(nearest) ? sum + nearest : sum;
    }, 0);
    handMotion = total / centers.length;
  }
  state.lastHandCenters = centers;
  const fidget = handMotion > state.thresholds.action / 5 && hands.length > 0;
  const optionalPenalty = state.handOptional ? 8 : 0;
  const issues = [];
  if (nearFace) issues.push({ id: "hand-face", severity: "warn", title: copy.handFace });
  if (fidget) issues.push({ id: "fidget", severity: "warn", title: copy.fidget });
  return {
    issues,
    label: nearFace ? copy.handFace : fidget ? copy.fidgetLabel : state.handOptional ? copy.handOptional : copy.still,
    raw: { handMotion },
    score: clamp(100 - (nearFace ? 38 : 0) - (fidget ? 22 : 0) - optionalPenalty),
    severity: nearFace || fidget ? "warn" : "good",
  };
}

function updateUI(metrics) {
  const focus = Math.round(metrics.focus || 0);
  const tone = scoreTone(focus);
  const copy = appCopy();
  els.focusScore.textContent = String(focus);
  els.focusLabel.textContent = tone.label;
  els.focusHint.textContent = tone.hint;
  els.scoreRing.style.setProperty("--score", String(focus));
  updateMetric("eye", metrics.eye.score);
  updateMetric("posture", metrics.posture.score);
  updateMetric("action", metrics.action.score);
  updateMetric("presence", metrics.presence.score);
  updateBadge(els.gazeBadge, `${copy.eye}: ${metrics.eye.label}`, metrics.eye.severity);
  updateBadge(els.postureBadge, `${copy.posture}: ${metrics.posture.label}`, metrics.posture.severity);
  updateBadge(els.actionBadge, `${copy.action}: ${metrics.action.label}`, metrics.action.severity);
  els.sampleCount.textContent = `${state.stats.samples} samples`;
}

async function startCamera() {
  if (!state.models || state.active) return;
  try {
    state.stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: "user", height: { ideal: 720 }, width: { ideal: 1280 } },
    });
    els.video.srcObject = state.stream;
    await els.video.play();
    state.active = true;
    state.sessionStart = state.sessionStart || performance.now();
    state.lastInferenceAt = 0;
    els.startBtn.disabled = true;
    els.stopBtn.disabled = false;
    els.calibrateBtn.disabled = false;
    els.cameraPanel.classList.add("camera-on");
    refreshModelStatusText();
    requestAnimationFrame(trackFrame);
  } catch (error) {
    console.error(error);
    setStatus(appCopy().cameraBlocked, "error");
    els.focusLabel.textContent = appCopy().cameraBlocked;
    els.focusHint.textContent = appCopy().cameraPermissionHint;
  }
}

function stopCamera() {
  state.active = false;
  if (state.stream) {
    state.stream.getTracks().forEach((track) => track.stop());
  }
  state.stream = null;
  els.video.srcObject = null;
  els.startBtn.disabled = !state.models;
  els.stopBtn.disabled = true;
  els.calibrateBtn.disabled = true;
  els.cameraPanel.classList.remove("camera-on");
  clearOverlay();
  refreshModelStatusText();
}

function resetSession() {
  state.baseline.calibrated = false;
  state.behavior = freshBehaviorState();
  state.events = [];
  state.focus = 0;
  state.history = [];
  state.lastEventAt = new Map();
  state.previousIssues = new Set();
  state.sessionStart = state.active ? performance.now() : 0;
  state.stats = freshStats();
  els.calibrationState.textContent = appCopy().calibrationNotReady;
  renderEvents();
  updateUI({
    action: { label: signalCopy().waiting, score: 0, severity: "good" },
    eye: { label: signalCopy().waiting, score: 0, severity: "good" },
    focus: 0,
    posture: { label: signalCopy().waiting, score: 0, severity: "good" },
    presence: { score: 0 },
  });
  drawTrend();
  if (els.chatInput) els.chatInput.value = "";
  renderChatThread();
  updateBehaviorUI();
  applyStaticLanguage();
}

function calibrate() {
  if (!state.lastMetrics?.raw) return;
  const raw = state.lastMetrics.raw;
  state.baseline = {
    calibrated: true,
    gazeX: raw.gazeX ?? state.baseline.gazeX,
    headDrop: raw.headDrop ?? state.baseline.headDrop,
    headPitch: raw.headPitch ?? state.baseline.headPitch,
    headYaw: raw.headYaw ?? state.baseline.headYaw,
    lean: raw.lean ?? state.baseline.lean,
    shoulderSlope: raw.shoulderSlope ?? state.baseline.shoulderSlope,
  };
  els.calibrationState.textContent = appCopy().calibrated;
  addEvent({ id: "calibrated", severity: "good", title: signalCopy().calibratedEvent });
}

async function loadModels() {
  setStatus(appCopy().statusLoading, "loading");
  try {
    const tasks = await import(TASKS_BUNDLE);
    const vision = await tasks.FilesetResolver.forVisionTasks(WASM_ROOT);
    const faceLandmarker = await createVisionTask(tasks.FaceLandmarker, vision, {
      baseOptions: { modelAssetPath: MODEL_URLS.face },
      minFaceDetectionConfidence: 0.55,
      minFacePresenceConfidence: 0.55,
      minTrackingConfidence: 0.55,
      numFaces: 1,
      outputFaceBlendshapes: true,
      runningMode: "VIDEO",
    });
    const poseLandmarker = await createVisionTask(tasks.PoseLandmarker, vision, {
      baseOptions: { modelAssetPath: MODEL_URLS.pose },
      minPoseDetectionConfidence: 0.55,
      minPosePresenceConfidence: 0.55,
      minTrackingConfidence: 0.55,
      numPoses: 1,
      runningMode: "VIDEO",
    });
    const handLandmarker = await createVisionTask(
      tasks.HandLandmarker,
      vision,
      {
        baseOptions: { modelAssetPath: MODEL_URLS.hand },
        minHandDetectionConfidence: 0.55,
        minHandPresenceConfidence: 0.55,
        minTrackingConfidence: 0.55,
        numHands: 2,
        runningMode: "VIDEO",
      },
      false,
    );
    state.models = { faceLandmarker, handLandmarker, poseLandmarker };
    state.handOptional = !handLandmarker;
    refreshModelStatusText();
    els.startBtn.disabled = false;
  } catch (error) {
    console.error(error);
    setStatus(appCopy().modelError, "error");
    els.focusLabel.textContent = appCopy().modelNotReady;
    els.focusHint.textContent = appCopy().modelNetworkHint;
  }
}

function applyStaticLanguage() {
  const copy = appCopy();
  setNodeText("#startBtn span", copy.start);
  setNodeText("#stopBtn span", copy.stop);
  setNodeText("#calibrateBtn span", copy.calibrate);
  setNodeText("#resetBtn span", copy.reset);
  setNodeText("#exportBtn span", copy.export);
  setNodeText(".camera-panel .panel-heading h2", copy.liveSignals);
  setNodeText(".camera-empty strong", copy.cameraEmptyTitle);
  setNodeText(".camera-empty span", copy.cameraEmptyHint);
  setNodeText(".calibration-strip strong", state.baseline.calibrated ? els.calibrationState.textContent : copy.calibrationNotReady);
  setNodeText(".calibration-strip span", copy.calibrationHint);
  setNodeText(".trend-panel .mini-heading span", copy.trend);
  setNodeText(".score-ring small", copy.focus);
  setNodeText(".score-copy .eyebrow", copy.currentScore);
  setNodeText(".metric-card:nth-child(1) .metric-head span", copy.eye);
  setNodeText(".metric-card:nth-child(2) .metric-head span", copy.posture);
  setNodeText(".metric-card:nth-child(3) .metric-head span", copy.action);
  setNodeText(".metric-card:nth-child(4) .metric-head span", copy.presence);
  setNodeText(".controls-panel .mini-heading span", copy.mode);
  setNodeText(".range-row:nth-of-type(1) span", copy.eyeTolerance);
  setNodeText(".range-row:nth-of-type(2) span", copy.postureTolerance);
  setNodeText(".range-row:nth-of-type(3) span", copy.actionTolerance);
  setNodeText(".events-panel .mini-heading span", copy.events);

  if (!state.stats.samples) {
    els.focusLabel.textContent = copy.focusLabelIdle;
    els.focusHint.textContent = copy.focusHintIdle;
    updateBadge(els.gazeBadge, copy.eyeWaiting, "good");
    updateBadge(els.postureBadge, copy.postureWaiting, "good");
    updateBadge(els.actionBadge, copy.actionWaiting, "good");
  } else if (state.lastMetrics) {
    updateUI(state.lastMetrics);
  }
  renderEvents();
  if (!state.events.length) setNodeText(".event-empty", copy.noEvents);
  refreshModelStatusText();
}

function applyBehaviorLanguage() {
  const copy = behaviorCopy();
  document.documentElement.lang = state.behaviorLanguage;
  els.languageButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === state.behaviorLanguage);
  });
  els.behaviorTitle.textContent = copy.title;
  els.chatDisclaimer.textContent = copy.disclaimer;
  els.typingSpeedLabel.textContent = copy.typingSpeed;
  els.messageLengthLabel.textContent = copy.messageLength;
  els.recordingWindowLabel.textContent = copy.recordingWindow;
  els.editRatioLabel.textContent = copy.editRatio;
  els.typingStartedLabel.textContent = copy.startedAt;
  els.behaviorSignalLabel.textContent = copy.behaviorSignal;
  els.chatInputLabel.textContent = copy.chatLabel;
  els.chatInput.placeholder = copy.placeholder;
  els.clearChatLabel.textContent = copy.clear;
  els.sendChatLabel.textContent = copy.analyze;
  setBehaviorStatus(state.behavior.live.inputStartedAt ? "reviewing" : "idle");
  renderChatThread();
  updateBehaviorUI();
  applyStaticLanguage();
}

function setBehaviorLanguage(language) {
  if (!BEHAVIOR_COPY[language] || state.behaviorLanguage === language) return;
  state.behaviorLanguage = language;
  applyBehaviorLanguage();
}

function applyPreset(name) {
  const preset = PRESETS[name];
  if (!preset) return;
  els.modeLabel.textContent = preset.label;
  els.gazeTolerance.value = preset.gaze;
  els.postureTolerance.value = preset.posture;
  els.actionTolerance.value = preset.action;
  document.querySelectorAll(".segment").forEach((button) => {
    button.classList.toggle("active", button.dataset.preset === name);
  });
  syncThresholds();
}

function syncThresholds() {
  state.thresholds.gaze = Number(els.gazeTolerance.value) / 100;
  state.thresholds.posture = Number(els.postureTolerance.value) / 100;
  state.thresholds.action = Number(els.actionTolerance.value) / 100;
  els.gazeToleranceValue.textContent = els.gazeTolerance.value;
  els.postureToleranceValue.textContent = els.postureTolerance.value;
  els.actionToleranceValue.textContent = els.actionTolerance.value;
}

function bindEvents() {
  els.startBtn.addEventListener("click", startCamera);
  els.stopBtn.addEventListener("click", stopCamera);
  els.resetBtn.addEventListener("click", resetSession);
  els.exportBtn.addEventListener("click", exportSession);
  els.sendChatBtn.addEventListener("click", submitBehaviorCheckin);
  els.clearChatBtn.addEventListener("click", clearBehaviorThread);
  els.calibrateBtn.addEventListener("click", calibrate);
  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => applyPreset(button.dataset.preset));
  });
  [els.gazeTolerance, els.postureTolerance, els.actionTolerance].forEach((range) => {
    range.addEventListener("input", syncThresholds);
  });
  els.languageButtons.forEach((button) => {
    button.addEventListener("click", () => setBehaviorLanguage(button.dataset.lang));
  });
  els.chatInput.addEventListener("keydown", (event) => {
    handleTypingKeydown(event);
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      submitBehaviorCheckin();
    }
  });
  els.chatInput.addEventListener("input", handleTypingInput);

  window.addEventListener("beforeunload", stopCamera);
  setInterval(() => {
    els.sessionClock.textContent = state.sessionStart ? formatClock(performance.now() - state.sessionStart) : "00:00";
    if (state.behavior.live.inputStartedAt) {
      updateBehaviorUI();
    }
  }, 500);
}

function init() {
  window.lucide?.createIcons();
  bindEvents();
  applyBehaviorLanguage();
  syncThresholds();
  drawTrend();
  loadModels();
}

init();
