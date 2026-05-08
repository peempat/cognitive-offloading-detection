# Cognitive Debt Tracker

A web app + Chrome extension demo for the hackathon theme **Wellness in Post-AGI Era**.

The Vercel-ready web app is the main demo. The Chrome extension remains as a proof-of-deployment layer for ChatGPT and Claude.

## Web Demo

Open `index.html` directly, serve this folder locally, or deploy the repository to Vercel.

The app scores each prompt locally, then shows:

- Cognitive Debt Score
- Bloom level estimate
- Thinking impact summary
- Prompt rewrite suggestion
- Provocation questions
- Session trend and Bloom breakdown
- Simulated focus layer for eye-tracking, blink, and gaze V2

## Chrome Extension Demo

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this project folder
5. Open ChatGPT or Claude and send a prompt

If auto-capture misses the site, paste the prompt into **Manual analyze** in the floating panel.

## Demo Prompts

High debt:

```text
Give me startup ideas.
```

Lower debt:

```text
I think remote workers need a wellness product for loneliness because they lack social feedback. Challenge this assumption, ask 2 clarifying questions, and give 3 counterarguments.
```

Pitch line:

```text
Use AI without losing your mind.
```

## Scoring

```text
turn_debt =
  (100 - prompt_effort) * 0.40
+ bloom_debt * 0.35
+ (100 - engagement) * 0.25
```

High score means AI is replacing more cognition. Low score means AI is amplifying the user's own thinking.
