# TinkerSpace Calicut — Digital Display · Context Docs

Reference documentation for the kiosk display app. These files describe how the
codebase actually works today, as a companion to the top-level [`README.md`](../README.md)
(setup / scripts) and the [mascot brief](./tinkerspace-mascot-brief.md) (mascot design intent).

| Doc | Covers |
|---|---|
| [architecture.md](./architecture.md) | Big picture: what the app is, boot sequence, render tree, polling loops, state ownership |
| [data-sources.md](./data-sources.md) | Check-in API, weather API, the local mock server, data shapes, de-duplication |
| [display-and-layout.md](./display-and-layout.md) | Responsive grid math, page rotation, header, theming, fullscreen + wake lock, kiosk behaviour |
| [mascot.md](./mascot.md) | Implementation view of the mascot: module layout, runtime state, watchdog / fail-safe, asset versioning |
| [components.md](./components.md) | File-by-file component and utility map, including dormant/unused modules |
| [development.md](./development.md) | Prerequisites, package manager lock-in, scripts, env vars, tests, GitHub Pages deploy |
| [tinkerspace-mascot-brief.md](./tinkerspace-mascot-brief.md) | Original design brief for the mascot behaviour system (intent, not code) |

## One-paragraph summary

A Create React App (react-scripts 5) single-page app, built with Tailwind, that runs
full-screen on a kiosk / Android TV screen at TinkerSpace Calicut. It polls the shared
TinkerHub check-in API for makers currently checked in (`space_id=2`), shows them as a
paginated card grid that auto-rotates, and renders an ambient animated mascot in the
bottom-right corner. Weather (open-meteo, no key) drives a temperature readout and mascot
reactions. There is no router, no backend of its own, and no auth — just the display.

The maker grid uses a horizontal-first 5×2 through 8×4 progression, reserves exactly one
bottom-right cell for the mascot, and paginates above 31 makers. Card dimensions are bounded
by the usable viewport, while profile images, labels, badges, and text scale with the card.
Deployment is a static bundle published to GitHub Pages via `pnpm deploy`.
