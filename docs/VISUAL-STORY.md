# Capture-to-build homepage overview — AIW-555

The accepted responsive hero/navigation and GoodIdea typography remain separately checkpointed at `80b1d62`. AIW-555 changes the authorized payoff headline to “Turn your idea into a plan to build.” and adds one connected overview near the opening.

The same illustrative neighborhood tool-library idea moves through Capture, Refine and Use in your tools. Icons come from the existing `@heroicons/react/24/outline` family. The first stage is a synthetic rough spoken-note example with an idle, decorative waveform; it is not an audio recorder. The next stages reuse the actual product-spec and copyable page-brief image assets. Both images retain their full natural aspect ratio, so no heading or sentence is permanently cut by an overview box. Captions and the final note explain the manual copy step into the user's coding tool.

The original sharp voice-first dashboard image and full report/spec/build gallery remain in the page. Overview anchors lead to the existing capture and full artifact sections; no tabs hide those outputs. The accepted818px header and stacked hero remain; the story uses three columns above650px and a vertical sequence at650px and below.

Beta settings, signup substitutions, signin, collector publication dependency and deferred invitations are unchanged. The overview makes no automatic-sync or generated-live-app claim. No new dependencies, external icon services, audio/AI operation, backend change or production action is introduced.

From `client`, with the existing5193 mock preview running:

```sh
npm run check:visual-story
npm run check:homepage-composition
```

`check:visual-story` checks9 widths including818/390/320, full image aspect ratio and container bounds, rough-note fit, sequential stages, original full gallery visibility, local anchors and the unchanged beta CTA. The composition check retains15-width coverage of the accepted header/hero. Network and microphone guards prevent live operations.

For reliable opening and story-focused viewport screenshots:

```sh
BETA_EVIDENCE_DIR=<output-folder> node scripts/capture-visual-story.mjs
```

The capture script creates a new context at each final viewport, DPR1, then uses an explicit CDP surface viewport clip. It checks PNG dimensions. These are direct viewport captures, not resized or stitched full-page images; inspect actual pixels before accepting them. No app or original screenshot asset is altered to accommodate capture tooling.
