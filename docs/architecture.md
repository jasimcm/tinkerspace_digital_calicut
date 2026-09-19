# Architecture

## What this app is

- **Type:** Create React App (`react-scripts@5`), React 18, single page, no router.
- **Styling:** Tailwind CSS (`darkMode: 'class'`) plus a small hand-written stylesheet
  ([`src/styles/index.css`](../src/styles/index.css)) for the mascot sprite animation,
  the dotted-grid background variables, and the card name-scroll keyframes.
- **Purpose:** an always-on kiosk / Android TV display. It is read-only; there is no
  user input beyond the first gesture used to enter fullscreen.
- **Backends consumed:** the TinkerHub check-in API (makers) and open-meteo (weather).
  The app ships no backend of its own; a small Node mock server exists for local dev.
- **Hosting:** static build published to the `gh-pages` branch. `homepage: "."` in
  `package.json` keeps asset URLs relative so it works under the Pages subpath.

## Module layout

```
src/
  index.js                     Root render; dotted-grid background; mounts <App/>
  App.js                       Orchestrator: data polling, theme, loading animation,
                               fullscreen + wake lock, layout measurement
  components/
    layout/Header.jsx          Status pill (space name, maker count, temp, theme toggle) + clock
    layout/PaginatedCardGrid.jsx  Grid of maker cards + auto page rotation + page dots
    cards/UserCard.jsx         One maker card (image + badges + name/project metadata)
    userdetails/               UserImage, UserBadges, UserInfo — card sub-parts
    mascot/                    Mascot system (see mascot.md)
    animations/, layout/*      Dormant visual effects (see components.md)
  hooks/useGridLayout.js       Viewport -> {cols, rows, cardWidth, ...} on resize
  utils/
    api/fetchData.js           GET /checkin/active
    api/weatherService.js      open-meteo current weather -> {isRaining, temperature, ...}
    helpers/removeDuplicates.js  Dedupe makers by membershipId
    layout/makerGrid.js        Grid progression and cards-per-page = slots minus mascot slot
    layout/cardMetrics.js      Proportional card-content sizing
    constants/badgeConfig.js   Name -> badge mapping (hard-coded)
mock-server/                   Node http server: GET /health, GET /checkin/active
scripts/                       Dev/build launchers that inject mock env vars
```

## Boot sequence

1. `index.js` renders the dotted-grid background and `<App/>`.
2. `App` starts four independent `useEffect` loops (see below) and a fake loading
   animation that counts a percentage to 100 (with a deliberate 1s pause at 63%).
3. When the counter hits 100: `startAnimation` flips (loading overlay fades, the
   `vector1.png` decoration slides to the top-left corner), then ~500ms later
   `isAppReady` flips and the main content fades in.
4. `isAppReady` is passed to the mascot as `isVisible` — the mascot only begins its
   awakening sequence after the display is ready, per the performance brief.

## Runtime loops (all in `App.js` unless noted)

| Loop | Interval | Effect |
|---|---|---|
| Maker fetch | 20s | `fetchData()` -> `removeDuplicates` -> `setData` |
| Theme check | 20s | Auto dark mode when hour < 6 or ≥ 18, unless `manualTheme` is set |
| Loading animation | rAF | Drives `loadingProgress`; one-shot, ends at 100% |
| Header clock | 1s | `setCurrentTime(new Date())` in `Header.jsx` |
| Header weather | 5min | `getCurrentWeather()` in `Header.jsx` |
| Mascot weather | 5min | `getCurrentWeather()` in `TinkerHubMascot.jsx` (separate call) |
| Grid page rotation | 20s | `PaginatedCardGrid` advances `page` mod `totalPages` |
| Grid layout | on `resize` | `useGridLayout` recomputes columns/rows |
| Header corner-clock breakpoint | on `resize` | Switch between corner clock and stacked clock |
| Mascot watchdog | 5s | Detects a stalled scheduler/animation and trips the fail-safe |

> Weather is fetched twice (Header and mascot) with independent 5-minute timers and no
> shared cache. Harmless given the cadence, but worth knowing if you touch it.

## State ownership

- **`App.js`** owns: `data` (makers), `loadingProgress`, `startAnimation`, `isAppReady`,
  `isDarkMode`, `manualTheme`, `needsFullscreenPrompt`, `headerHeight`.
- **`Header.jsx`** owns its own `currentTime`, `weather`, and corner-clock flag.
- **`PaginatedCardGrid`** owns `page`; derives everything else from `data` + layout.
- **`TinkerHubMascot`** owns a large set of `useRef` values (pose history, cooldowns,
  timers) plus a few `useState` values for what renders. See [mascot.md](./mascot.md).
- `CURRENT_VIEW` in `App.js` is a constant `'makers'`. The mascot policy supports a
  `'calendar'` view bias, but the Calicut instance never sets it (the calendar view was
  removed).

## Data flow

```
checkin/active ── fetchData ──> removeDuplicates ──> App.data ──┬─> Header (count)
                                                                ├─> PaginatedCardGrid ─> UserCard ─> UserImage/UserBadges/UserInfo
                                                                └─> TinkerHubMascot (makerCount; a rise queues a "maker-join" reaction)

open-meteo ── getCurrentWeather ──┬─> Header (temperature readout)
                                  └─> TinkerHubMascot (rain / hot / winter reaction poses)
```

## Error handling posture

- `fetchData` never throws — on any failure it logs and returns `[]`, so the grid just
  empties rather than crashing.
- `getCurrentWeather` returns `null` on failure; callers treat that as "no weather".
- The mascot isolates its own failures: an asset load error or a stalled scheduler trips
  a fail-safe that renders the static `dont-look.png` sticker and stops all timers, while
  the rest of the display keeps working.
