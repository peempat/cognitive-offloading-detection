(function attachCognitiveDebtScoring(global) {
  const EFFORT_MARKERS = [
    "because",
    "given that",
    "my assumption",
    "i think",
    "hypothesis",
    "constraint",
    "tradeoff",
    "counterargument",
    "criteria",
    "evidence",
    "context",
    "audience",
    "goal",
    "risk",
    "why",
    "compare",
    "evaluate",
    "challenge",
    "critique"
  ];

  const LOW_COGNITION_PATTERNS = [
    /summari[sz]e/i,
    /explain/i,
    /define/i,
    /translate/i,
    /list/i,
    /write (me )?/i,
    /make (me )?/i,
    /generate/i,
    /create .*for me/i,
    /do .*for me/i,
    /ช่วย.*(ทำ|คิด|สรุป|เขียน)/i,
    /สรุป/i,
    /เขียน.*ให้/i,
    /ทำ.*ให้/i,
    /คิด.*ให้/i
  ];

  const BLOOM_RULES = [
    {
      level: 6,
      label: "Create",
      debt: 14,
      patterns: [/design/i, /invent/i, /synthesize/i, /prototype/i, /compose/i, /propose/i, /สร้าง/i, /ออกแบบ/i]
    },
    {
      level: 5,
      label: "Evaluate",
      debt: 24,
      patterns: [/evaluate/i, /judge/i, /rank/i, /assess/i, /tradeoff/i, /criteria/i, /challenge/i, /counterargument/i, /ตัดสิน/i, /ประเมิน/i]
    },
    {
      level: 4,
      label: "Analyze",
      debt: 34,
      patterns: [/analy[sz]e/i, /compare/i, /critique/i, /diagnose/i, /assumption/i, /root cause/i, /why/i, /แยกแยะ/i, /วิเคราะห์/i]
    },
    {
      level: 3,
      label: "Apply",
      debt: 58,
      patterns: [/apply/i, /calculate/i, /convert/i, /draft/i, /use .*to/i, /implement/i, /แก้/i, /คำนวณ/i]
    },
    {
      level: 2,
      label: "Understand",
      debt: 78,
      patterns: [/explain/i, /summari[sz]e/i, /describe/i, /paraphrase/i, /สรุป/i, /อธิบาย/i]
    },
    {
      level: 1,
      label: "Remember",
      debt: 90,
      patterns: [/define/i, /list/i, /what is/i, /who is/i, /when/i, /คืออะไร/i, /ลิสต์/i]
    }
  ];

  function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, Math.round(value)));
  }

  function words(text) {
    return (text.trim().match(/[\p{L}\p{N}_'-]+/gu) || []).filter(Boolean);
  }

  function countMatches(text, patterns) {
    return patterns.reduce((total, pattern) => total + (pattern.test(text) ? 1 : 0), 0);
  }

  function scorePromptEffort(prompt) {
    const clean = prompt.trim();
    const tokens = words(clean);
    const wordCount = tokens.length;
    const numbers = (clean.match(/\d+/g) || []).length;
    const punctuationConstraints = (clean.match(/[:;•\-]/g) || []).length;
    const quotedPhrases = (clean.match(/["'“”‘’]/g) || []).length / 2;
    const properish = (clean.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || []).length;
    const markerCount = EFFORT_MARKERS.filter((marker) => clean.toLowerCase().includes(marker)).length;
    const thaiReasoning = countMatches(clean, [/เพราะ/g, /สมมติฐาน/g, /บริบท/g, /ข้อจำกัด/g, /เปรียบเทียบ/g, /โต้แย้ง/g, /หลักฐาน/g]);
    const selfContext = countMatches(clean, [/\bi think\b/i, /\bi tried\b/i, /\bmy\b/i, /\bwe\b/i, /ผมคิด/i, /ฉันคิด/i, /ลอง/i]);
    const asksForChallenge = countMatches(clean, [/challenge/i, /critique/i, /ask me/i, /counterargument/i, /ท้าทาย/i, /ถามกลับ/i, /โต้แย้ง/i]);
    const passiveAsk = countMatches(clean, LOW_COGNITION_PATTERNS);

    let score = 10;
    score += Math.min(wordCount * 1.6, 34);
    score += Math.min(numbers * 5, 12);
    score += Math.min((properish + quotedPhrases) * 3, 12);
    score += Math.min(punctuationConstraints * 2, 8);
    score += Math.min((markerCount + thaiReasoning) * 7, 24);
    score += Math.min(selfContext * 7, 14);
    score += Math.min(asksForChallenge * 10, 16);
    score -= Math.min(passiveAsk * 9, 22);

    return clamp(score);
  }

  function classifyBloom(prompt) {
    const clean = prompt.trim();
    const matched = BLOOM_RULES.find((rule) => rule.patterns.some((pattern) => pattern.test(clean)));
    return matched || { level: 2, label: "Understand", debt: 78 };
  }

  function scoreEngagement(prompt, previousTurn) {
    if (!previousTurn) return 55;
    const secondsSinceLast = Math.max(0, (Date.now() - previousTurn.createdAt) / 1000);
    const verification = countMatches(prompt, [/is this right/i, /check/i, /verify/i, /critique/i, /challenge/i, /ถูกไหม/i, /ตรวจ/i]);
    const delegation = countMatches(prompt, [/continue/i, /do it/i, /make it/i, /เขียนต่อ/i, /ทำต่อ/i, /จัดการต่อ/i]);
    let score = 45;
    if (secondsSinceLast > 45) score += 18;
    if (secondsSinceLast > 120) score += 12;
    score += verification * 18;
    score -= delegation * 16;
    return clamp(score);
  }

  function summarizeImpact(prompt, effort, bloom) {
    const passiveAsk = countMatches(prompt, LOW_COGNITION_PATTERNS);
    const hasOwnThinking = countMatches(prompt, [/\bi think\b/i, /\bmy assumption\b/i, /ผมคิด/i, /ฉันคิด/i, /สมมติฐาน/i]);
    const wantsChallenge = countMatches(prompt, [/challenge/i, /critique/i, /counterargument/i, /ถามกลับ/i, /โต้แย้ง/i]);

    if (effort >= 72 && bloom.level >= 4) {
      return "You brought your own reasoning and asked AI to test it.";
    }
    if (wantsChallenge) {
      return "Good move: you asked AI to challenge your thinking instead of replacing it.";
    }
    if (hasOwnThinking) {
      return "You included some thinking, but the prompt could make AI test your assumptions harder.";
    }
    if (passiveAsk) {
      return "You may be outsourcing the hard part: framing, evaluation, or first-pass reasoning.";
    }
    return "This prompt gives AI the task, but not much of your own context or hypothesis.";
  }

  function rewritePrompt(prompt, bloom) {
    const trimmed = prompt.trim().replace(/\s+/g, " ");
    const base = trimmed.length > 140 ? trimmed.slice(0, 140) + "..." : trimmed;
    if (bloom.level <= 2) {
      return `My current understanding is: [write your hypothesis]. Given this task: "${base}", challenge my assumptions, ask 2 clarifying questions, then suggest a better approach with tradeoffs.`;
    }
    if (bloom.level === 3) {
      return `I want to apply this myself first. Here is my attempt: [your first pass]. Review it against clear criteria, point out weak reasoning, and give hints before giving the final answer.`;
    }
    return `Push this further: identify hidden assumptions, strongest counterargument, and one experiment I can run without AI before accepting the answer.`;
  }

  function provocations(prompt, bloom) {
    const pool = [
      "What would you argue if AI's answer were wrong?",
      "Which assumption did you just outsource?",
      "Can you solve the first step before reading the answer?",
      "What evidence would change your mind here?",
      "Ask AI for a critique, not a finished answer.",
      "Write your hypothesis in one sentence, then ask AI to attack it."
    ];
    if (bloom.level <= 2) {
      return [pool[1], pool[2], pool[5]];
    }
    if (/summari[sz]e|สรุป/i.test(prompt)) {
      return ["What is the author's strongest claim?", "What do you disagree with?", "What did the summary remove that matters?"];
    }
    return [pool[0], pool[3], pool[4]];
  }

  function scoreTurn(prompt, previousTurn) {
    const effort = scorePromptEffort(prompt);
    const bloom = classifyBloom(prompt);
    const engagement = scoreEngagement(prompt, previousTurn);
    const turnDebt = clamp((100 - effort) * 0.4 + bloom.debt * 0.35 + (100 - engagement) * 0.25);
    return {
      id: String(Date.now()),
      prompt,
      effort,
      bloom,
      engagement,
      turnDebt,
      createdAt: Date.now(),
      impact: summarizeImpact(prompt, effort, bloom),
      rewrite: rewritePrompt(prompt, bloom),
      provocations: provocations(prompt, bloom)
    };
  }

  function sessionDebt(turns) {
    const latest = turns.slice(-10);
    if (!latest.length) return 0;
    return clamp(latest.reduce((sum, turn) => sum + turn.turnDebt, 0) / latest.length);
  }

  function accumulatedDebt(turns) {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    return clamp(turns.reduce((sum, turn) => {
      const ageDays = Math.max(0, (now - turn.createdAt) / dayMs);
      const decay = Math.pow(0.5, ageDays);
      return sum + turn.turnDebt * decay;
    }, 0), 0, 9999);
  }

  global.CognitiveDebtScoring = {
    scoreTurn,
    sessionDebt,
    accumulatedDebt,
    classifyBloom,
    scorePromptEffort
  };
})(window);
