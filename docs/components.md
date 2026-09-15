# Component & module map

Repo-relative paths. "Dormant" = present in the tree but not rendered anywhere in the
current app (kept for future use / previous display variants).

## Entry

| File | Notes |
|---|---|
| [`src/index.js`](../src/index.js) | Mounts `<App/>` inside a full-viewport wrapper with the dotted-grid background (CSS-variable driven). Contains a large commented-out New Year firecracker-video block — dead code, not wired. |
| [`src/App.js`](../src/App.js) | Orchestrator. See [architecture.md](./architecture.md). Also holds commented-out QR code + standalone theme toggle + bottom `LedMarquee`. |

## Active components

| File | Props | Notes |
|---|---|---|
| [`components/layout/Header.jsx`](../src/components/layout/Header.jsx) | `totalMakers`, `isDarkMode`, `setManualTheme` | `React.memo`. Own clock (1s) + weather (5min) timers. Corner-vs-stacked clock by `innerWidth>=1200 && innerHeight>=600`. |
| [`components/layout/PaginatedCardGrid.jsx`](../src/components/layout/PaginatedCardGrid.jsx) | `data`, `isActive`, `headerHeight` | Grid + 20s page rotation + page dots. `safePage` clamp guards the shrinking-data boundary. |
| [`components/cards/UserCard.jsx`](../src/components/cards/UserCard.jsx) | `card`, `CARD_HEIGHT` | `React.memo`. Resolves badges + purpose colour; measures name overflow to toggle the `nameScroll` marquee. |
| [`components/userdetails/UserImage.jsx`](../src/components/userdetails/UserImage.jsx) | `src`, `alt`, `purpose`, `purposeColor`, `cardHeight` | Avatar with first-letter fallback on missing/broken `src`. Purpose pill overlay. Reserves `INFO_HEIGHT = 47` for the text row. |
| [`components/userdetails/UserBadges.jsx`](../src/components/userdetails/UserBadges.jsx) | `name`, `cardHeight` | Looks up `USER_BADGES[name]`, sorts by `BADGE_METADATA.priority`, renders `public/images/<type>.png`. Positioned to straddle the image/info boundary — `INFO_HEIGHT` must match `UserImage`. |
| [`components/userdetails/UserInfo.jsx`](../src/components/userdetails/UserInfo.jsx) | `card`, `textRef`, `containerRef`, `isOverflowing` | Name (marquee when overflowing) + subtitle `workingOn || projectName || nbsp`. |
| [`components/mascot/TinkerHubMascot.jsx`](../src/components/mascot/TinkerHubMascot.jsx) | `makerCount`, `currentView`, `isVisible` | See [mascot.md](./mascot.md). |

## Mascot support modules

`components/mascot/manifest.js`, `policy.js`, `playback.js`, `watchdog.js` — see
[mascot.md](./mascot.md). All except `manifest.js` are pure and unit-tested.

## Hooks & utils

| File | Notes |
|---|---|
| [`hooks/useGridLayout.js`](../src/hooks/useGridLayout.js) | Viewport -> `{cols, rows, cardWidth, cardHeight, gap, paddingX}`, recomputed on `resize`. |
| [`utils/api/fetchData.js`](../src/utils/api/fetchData.js) | `GET /checkin/active`. Returns `[]` on any error. |
| [`utils/api/weatherService.js`](../src/utils/api/weatherService.js) | open-meteo current weather. Returns `null` on error. |
| [`utils/helpers/removeDuplicates.js`](../src/utils/helpers/removeDuplicates.js) | Dedupe by `membershipId`. |
| [`utils/layout/makerGrid.js`](../src/utils/layout/makerGrid.js) | `getMakerCardsPerPage` = slots − 1 (reserved mascot cell). |
| [`utils/constants/badgeConfig.js`](../src/utils/constants/badgeConfig.js) | Hard-coded name -> badge map + metadata. |

## Dormant / unused modules

Not imported by any rendered path (some referenced only in commented-out JSX). Safe to
delete if you're sure they won't be revived; documented here so their absence from the UI
isn't mistaken for a bug.

| File | What it is | Status |
|---|---|---|
| [`components/animations/RainAnimation.jsx`](../src/components/animations/RainAnimation.jsx) | 50-drop CSS rain + splash overlay, self-fetches weather | Not rendered. Rain is handled by the mascot `rain` pose instead. |
| [`components/layout/LedMarquee.jsx`](../src/components/layout/LedMarquee.jsx) | "WELCOME TO TINKERSPACE" LED-matrix scroller | Referenced only in commented-out JSX in `App.js`. |
| [`components/layout/MarqueeBanner.jsx`](../src/components/layout/MarqueeBanner.jsx) | Generic `content`-prop marquee | No importers. |
| [`components/layout/FloatingSquares.jsx`](../src/components/layout/FloatingSquares.jsx) | 7 floating magenta squares, `z-[-1]` | No importers. |
| [`components/layout/TinkerSparks.jsx`](../src/components/layout/TinkerSparks.jsx) | 30 rising particle sparks, light-mode only | No importers. |
| [`components/userdetails/UserBadge.jsx`](../src/components/userdetails/UserBadge.jsx) | Single-badge `<img>` | Superseded by the inline `AchievementBadge` inside `UserBadges.jsx`. |

## Tests

`react-scripts test` (Jest + Testing Library, `react-app/jest` ESLint preset). Existing
suites:

- `components/mascot/TinkerHubMascot.test.jsx`
- `components/mascot/policy.test.js`
- `components/mascot/playback.test.js`
- `components/mascot/watchdog.test.js`
- `utils/layout/makerGrid.test.js`

All current test coverage is on the mascot system and the grid slot math. `App`,
`Header`, `PaginatedCardGrid`, the card components, `fetchData`, and `weatherService`
have no tests.

## Static assets

- `public/images/` — logos, decorations (`vector1.png`, `spinach.png`,
  `tinkersapce-image.webp`), badge PNGs (`Team-Member-Bronze.png`,
  `Project-contributor.png`, `guard.png`), `dont-look.png` (mascot fail-safe sticker),
  `maker.svg`.
- `public/images/mascot/dont-look/sprites/*.webp` — the 2×2 sprite sheets referenced by
  `manifest.js` (`awakening`, `ambient-glance`, `ambient-peek`, `sun`, `rain`, `hot`,
  `winter`, `debug`, `breakthrough`, `solder`, `fix`, `show`, `dance`, `reset`). The
  sprite directory and the manifest are 1:1 today — 14 files, all referenced.
