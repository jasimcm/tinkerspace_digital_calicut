# Mascot system (implementation)

This is the *code* view. For the design rationale, timings philosophy, and evidence base,
read [tinkerspace-mascot-brief.md](./tinkerspace-mascot-brief.md) — this doc assumes it.

## Module map — `src/components/mascot/`

| File | Role | Pure? |
|---|---|---|
| `TinkerHubMascot.jsx` | React component. Owns runtime state, timers, effects, rendering, the watchdog, and the fail-safe. Translates live props (`makerCount`, `currentView`, weather) into normalized policy context. | no |
| `manifest.js` | Single registry of data: `POSES`, `STORIES`, `POLICY_SELECTORS`, `PLAYBACK_DURATIONS`, `POLICY_LIMITS`, `EVENT_DEFINITIONS`, `EVENT_POLICY`. No file paths in policy code — only manifest IDs. | data |
| `policy.js` | Pure decision functions. `decideNextPose(context, random)` runs 7 ordered branches and returns `{ pose, queue, reason, effects?, home? }`. Also `getWeatherPose`, story/exposure helpers, event sanitization. | yes |
| `playback.js` | Pure timing helpers: `getPlayback`, `isOneShotPose`, `getScheduledPoseDuration`, `enqueueEvent` (dedupe by key), `getQueueDelay` (wait for a safe frame boundary). | yes |
| `watchdog.js` | Pure: `getMascotAssetUrl` (cache-busted absolute URL) and `getMascotWatchdogFailure` (returns `'scheduler-timeout'` / `'animation-stalled'` / `null`). | yes |
| `*.test.js(x)` | Unit tests. Policy/playback/watchdog tests use a fixed `random` to replay deterministic decision traces. | — |

CSS: `.tinkerhub-mascot*` classes in [`src/styles/index.css`](../src/styles/index.css).

## Rendering pipeline

- Each sprite is a **4-frame 2×2 WebP grid**. CSS animation `mascot-sprite` steps
  `background-position` through the four quadrants over `--mascot-cycle` ms
  (`steps(1, end)`), `background-size: 200% 200%`.
- The component renders up to two stacked `__sprite` divs: the outgoing pose
  (`--leaving`, `mascot-fade-out`) and the active pose (`--active`, `mascot-fade-in`).
  Crossfade is **380ms** (`FADE_MS`).
- Per-pose CSS custom properties set by JS: `--mascot-sprite` (the `url()`),
  `--mascot-cycle`, `--mascot-sprite-iterations` (finite count or `infinite`).
- The active sprite has `role="img"` + `aria-label` from `POSES[pose].label`.
- `prefers-reduced-motion: reduce` -> all sprite animation disabled (first frame only),
  leaving sprite hidden, wordmark static — handled purely in CSS.
- The **"TinkerHub" wordmark** is a rotated CSS chip, shown after the first awakening /
  return beat completes (`wordmarkVisible`), parked bottom-right; it never animates.

## Asset URL resolution (subpath-safe)

`getMascotAssetUrl(base, path, version)` builds
`` `${document.baseURI without trailing slash}${assetPath}?v=${version}` ``.
This matters because the sprite URL becomes a CSS custom property consumed from the
bundled stylesheet under `/static/css/`; a plain relative `url()` would resolve against
*that* location and 404 under the GitHub Pages subpath. `version` =
`REACT_APP_MASCOT_ASSET_VERSION` env var or `'mascot-watchdog-v1'`, and doubles as a
cache-buster.

## Runtime state (refs in `TinkerHubMascot.jsx`)

`useState`: `weather`, `activePose` (starts `'awakening'`), `previousPose`,
`wordmarkVisible`, `failSafeReason`.

`useRef` (mutable, don't trigger renders): `activePoseRef`, `poseStartedAt`,
`poseEndsAt`, `lastAnimationHeartbeatAt`, `previousMakerCount`, `weatherPoseRef`,
`pendingPoses` (the event queue), `lastStickerReturnAt`, `lastCompletedWorkDomain`,
`completedWorkStories`, `nextSalientAt`, `lastWeatherReactionAt`, `recentPoses`,
`sessionHistory`, `homeTurns` / `homeTurnTarget`, `currentViewRef`, plus timer handles
(`schedulerTimer`, `fadeTimer`, `wordmarkTimer`, `awakeningTimer`, `watchdogTimer`),
`failSafeActiveRef`, `hasAwakenedRef`, `advanceRef`.

## Decision cycle

1. A pose is shown. `scheduleNext(delay)` arms `schedulerTimer` for that pose's
   `getScheduledPoseDuration(...)` and records `poseEndsAt`.
2. On fire, `advanceRef.current()` -> `transitionTo(selectNextPose())`.
3. `selectNextPose` builds the immutable context from refs and calls
   `decideNextPose(context)` in `policy.js`.
4. `transitionTo` applies the returned `effects` to refs (story completion, sticker
   return, weather timestamp), swaps the sprite (if the pose changed), updates
   `recentPoses` / `sessionHistory`, arms salient cooldown if applicable, and calls
   `scheduleNext` again.

### Policy branch order (`policy.js` `POLICY_BRANCHES`)

1. `continueActivePath` — finish a causal story step / standalone `next`
2. `playEligibleQueuedEvent` — highest-priority queued event past its cooldown
3. `returnToSticker` — after `reset`, ≥2 completed stories, past 60s cooldown
4. `enterHome` — after a `transition: 'home'` pose, start a home run of 2–3 turns
5. `waitForBlockedEvent` — a valid event is cooldown-blocked -> stay low-salience home
6. `continueHome` — keep going through the current home run
7. `startMakerStory` — pick a new story, avoiding the last completed domain

First non-null wins. Unknown `lastPose` -> `FALLBACK_POSE` (`'ambientPeek'`).

## Events

Queued via `queueEventAtLoopBoundary` -> `enqueueEvent` (replaces any existing entry
with the same `dedupeKey`).

| Trigger (in the component) | Event | Reaction pose | Cooldown | Expiry |
|---|---|---|---|---|
| `makerCount` rises vs `previousMakerCount` | `maker-join` | `dance` -> `reset` | `salient` (45–60s) | 120s |
| `getWeatherPose(weather)` changes | `weather` | `rain` / `hot` / `winter` | `weather` (15min) | 20min |
| `currentView` change | (bias only) | — story weight nudge | — | — |

Events don't interrupt the intro, the `returning` beat, or a one-shot's recovery hold.
`getQueueDelay` defers the next decision to a safe frame boundary. Priority ages upward
by 1 every 60s, capped at +2 (`EVENT_POLICY`), so an old valid event isn't starved.

## Watchdog & fail-safe

- `watchdogTimer` runs every 5s (`WATCHDOG_INTERVAL_MS`). While `document.hidden` it just
  bumps the heartbeat and returns (no false positives when the kiosk tab is backgrounded).
- `getMascotWatchdogFailure` trips when:
  - `now - poseEndsAt > 12s` (`WATCHDOG_SCHEDULER_GRACE_MS`) -> `'scheduler-timeout'`
  - after awakening, a looping pose's animation heartbeat
    (`onAnimationStart` / `onAnimationIteration` for `mascot-sprite`) is older than
    `max(15s, cycle·2 + 15s)` -> `'animation-stalled'`
- Also: the active pose's image is preloaded with `new Image()`; `onerror` ->
  `activateFailSafe('asset-error')`.
- `activateFailSafe(reason)` clears every timer, drops `previousPose`/wordmark, and sets
  `failSafeReason`. The component then renders only the static
  `/images/dont-look.png` sticker with `data-failsafe-reason`. It does not recover on its
  own (reload required). The rest of the display is unaffected.

## Adding a pose (checklist from the brief)

1. Add the optimized 2×2 WebP to `public/images/mascot/dont-look/sprites/`.
2. Add one `POSES` entry (image, `cycle`, `label`, `playback`, and `story`/`kind`/
   `category`/`weight`/`transition` as needed).
3. Wire it into a `STORIES` path, the `homeBeat`/`flourish` selector, or
   `EVENT_DEFINITIONS` + the weather map — via IDs only.
4. Add tests with a fixed `random` proving it can't bypass cooldown / story / expiry /
   interruption rules.
5. Do **not** add timing logic, page checks, or global priority conditions to the pose
   definition.
