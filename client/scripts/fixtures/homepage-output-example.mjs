// Disposable synthetic screenshot data. Not research, generated output or a real user record.
const text = `# A tool library for the neighborhood

> **Nearby tool borrowers — working hypothesis**
> _Find a tool for an occasional job without buying it._

> **Elevator Pitch:** A small neighborhood tool library where people list, request and return tools.

### Blue team: What could work
- Local availability: Find a drill or ladder within walking distance instead of buying one for a single job.
- A small first group: Start with people who know each other and learn which tools actually get used.

### Red team: What needs checking
- Trust and damage: Agree on responsibility before a valuable tool changes hands.
- Reliable returns: Test pickup, return dates and owner confirmation with a small group first.

### Sources and limits
Illustrative fixture only. No market research, interviews or measured demand. Every number below is an example to show the interface.`;
const report = {
  marketPosition: "Illustrative tool-library example",
  scorecard: {
    opportunityScore: 6,
    opportunityLabel: "Example only",
    problemSeverity: 7,
    problemLabel: "Example only",
    feasibility: 8,
    feasibilityLabel: "Example only",
    whyNow: 6,
    whyNowLabel: "Example only",
    executionDifficulty: "3/10 — example only",
    gtmScore: "8/10 — example only",
  },
  communitySignals: { subreddits: [], youtubeThemes: [], organicWedges: [] },
  builderKit: {
    landingPageCopy: {
      headline: "Borrow a tool from a neighbor.",
      subheadline: "See what’s available and ask to borrow it.",
      ctaText: "Browse tools",
      valueProps: [
        "Find nearby tools",
        "Agree on a return date",
        "Keep track of requests",
      ],
    },
    adHooks: [],
    v1Spec: {
      targetApp: "Neighborhood tool library — illustrative example",
      recommendedStack: "Vite + React + TypeScript",
      buildHorizon: "Example first version",
      interactiveFeatures: [
        "Browse available tools",
        "Request to borrow",
        "Confirm the return date",
      ],
    },
    cursorScaffoldPrompt:
      "Synthetic fixture placeholder. No live installation or generation. This text is excluded from public screenshots.",
    coreEnginePrompt:
      "Synthetic fixture placeholder, excluded from public screenshots.",
  },
};
const prd = `# Neighborhood tool library

> **Illustrative product spec**
> Synthetic example. Start with a small group and a simple borrowing flow.

## First version

| Step | What the user does | What needs to happen |
| --- | --- | --- |
| Find | Browse nearby tools | Show the owner and availability |
| Request | Ask to borrow a tool | Include the dates and intended use |
| Confirm | Owner accepts the request | Agree on pickup and return |
| Return | Mark the tool as returned | Make the tool available again |

## Scope

- [x] A tool list with availability
- [x] Requests and owner confirmation
- [x] An agreed return date
- [ ] Payments and deposits
- [ ] Delivery

## Check the first version

A neighbor can find an available drill, request it, see confirmation and record the return.`;
export const fixtureIdea = {
  id: "idea_homepage-visual-example",
  userId: "mock-staging-user",
  title: "A tool library for the neighborhood",
  author: "Synthetic example",
  summary: "Illustrative product example, not validated market research.",
  transcript:
    "I only use my drill a few times a year. Could neighbors share tools instead of buying them?",
  businessIdeaMarkdown: JSON.stringify({ text, report }),
  prdContent: prd,
  createdAt: "2026-10-20T12:00:00.000Z",
  tags: ["synthetic-example"],
};
export const fixtureStore = { voice_notes: [], ideas: [fixtureIdea] };
