# Display & layout

Everything here is about making one fixed, unattended screen look right across phones,
tablets, desktops, and Android TV panels — there is no scrolling and no user navigation.

## Responsive grid math

[`src/hooks/useGridLayout.js`](../src/hooks/useGridLayout.js) turns the viewport into a
concrete grid on mount and on every `resize`:

- The grid is chosen from compact layouts: 4x3, 5x3, 6x3, 6x4, 7x4, and 8x4. It selects
  the smallest layout that fits the current maker count, then paginates after 8x4.
- `cardWidth` prefers `clamp(190, vw * 0.095, 420)` px and is reduced only when required
  for the selected layout to fit; `cardHeight` = `cardWidth * 225/211` (original aspect ratio).
- `gap` = `clamp(24, vw * 0.012, 48)` px; `paddingX` = `clamp(48, vw * 0.04, 160)` px.
- `topInset` = `clamp(24, vh * 0.02, 56)` px. The bottom inset is measured from the rendered
  quote height, its responsive bottom offset, and a 24px buffer. Together these are excluded
  from the grid's usable height, so cards cannot overlap the quote.
- The selected layout is centred rather than stretched edge-to-edge, preserving deliberate
  breathing room on 4K TV panels. SSR / no-`window` fallback is a 4x3 grid.
- The quote uses `clamp(1.125rem, 1.35vw, 3.25rem)` and its spinach icon uses
  `clamp(1.5rem, 1.5vw, 3.75rem)`, so both scale smoothly from laptop previews to 4K TVs.

`headerHeight` comes from `App.js`, which measures the real rendered header with a
`ResizeObserver` (the header's height changes by breakpoint — the clock stacks under the
pill on smaller screens), so the grid always gets the true leftover space.

## Pagination

[`PaginatedCardGrid.jsx`](../src/components/layout/PaginatedCardGrid.jsx)

- `totalSlots` = `cols * rows`.
- `cardsPerPage` = `totalSlots - mascotReservedSlots`. The bottom-right rectangle is reserved
  for the mascot overlay. Its width and height are calculated from the mascot's responsive
  `clamp(8rem, 13vw, 12rem)` footprint versus the current card size, so it reserves one or
  more cells when required.
- `totalPages` = `ceil(data.length / cardsPerPage)` (min 1).
- A `PAGE_INTERVAL` (20s) timer advances `page = (page + 1) % totalPages`.
- `page` resets to 0 when `isActive`, `cols`, or `rows` change.
- **Boundary guard:** `page` can momentarily exceed the page count when `data.length`
  shrinks (makers checking out) without the grid dimensions changing. Render clamps with
  `safePage = page % totalPages` so the grid never slices into an empty range and flashes
  blank. (This was the fix in commit `6cb8ff9`.)
- Empty trailing slots render as transparent spacer divs so the grid keeps its shape.
- Page dots render only when `totalPages > 1`, bottom-left, aligned to `paddingX`.

The grid itself is a CSS `grid` with explicit `repeat(cols, cardWidth px)` /
`repeat(rows, cardHeight px)` and `justify-content: space-between`.

## Header

[`Header.jsx`](../src/components/layout/Header.jsx) — `React.memo`, props `totalMakers`,
`isDarkMode`, `setManualTheme`.

- A frosted "pill": live green dot, `TinkerSpace Calicut`, `N Makers`, `${temp}°C`
  (when weather present), and a theme-toggle button.
- Clock/date: **corner display** (large, top-right) only when
  `window.innerWidth >= 1200 && window.innerHeight >= 600` — both dimensions are
  checked because tablets/landscape phones report wide widths while being too short for
  the corner clock and centred pill to coexist. Otherwise the clock stacks under the pill.
- Owns its own 1s clock timer and 5min weather timer.

## Theming

- Tailwind `darkMode: 'class'` — dark mode = `dark` class on `<html>`.
- `App.js` `checkTimeTheme` (every 20s): if `manualTheme` is set it wins; otherwise dark
  when `hour < 6 || hour >= 18`.
- The theme toggle in the header calls `setManualTheme(isDarkMode ? 'light' : 'dark')`,
  which pins the theme until reload (no persistence).
- CSS variables `--bg-color` / `--grid-color` in [`index.css`](../src/styles/index.css)
  drive the dotted-grid background in `index.js`; they switch under `.dark`.
- Fonts (loaded in [`public/index.html`](../public/index.html) from Google Fonts +
  cdnfonts): `Geist` (`font-geist`), `Space Mono` (`font-mono`), `Instrument Serif`
  (`font-instrument`), `VT323` (`font-vt323`).

## Fullscreen + wake lock (kiosk behaviour)

All in one `useEffect` in [`App.js`](../src/App.js):

- **Fullscreen:** `document.documentElement.requestFullscreen()` on load. Most TV / kiosk
  browsers block that without a user gesture, so:
  - a 1.5s timer sets `needsFullscreenPrompt` -> shows a full-screen
    "Press any button to enter fullscreen" overlay;
  - the first `keydown` / `click` / `touchstart` (a TV remote's OK button fires
    `keydown`) retries fullscreen and clears the prompt, then aborts its own listeners
    via `AbortController`;
  - `fullscreenchange` clears the prompt if fullscreen succeeds by any means.
- **Wake lock:** `navigator.wakeLock.request('screen')`. The Wake Lock API auto-releases
  whenever the page is backgrounded, so a `visibilitychange` handler re-acquires it every
  time the page becomes visible again (commit `f0fa6d1`). Failures are logged, non-fatal.

## Loading / intro animation

- `App.js` runs a `requestAnimationFrame` loop that increments a percentage with random
  steps, **pauses exactly 1s at 63%**, then continues to 100%.
- At 100%: after 400ms `startAnimation` = true (loading overlay fades out over 1s; the
  `vector1.png` mark animates from centre to the top-left corner over 2s); after a
  further 500ms `isAppReady` = true (main content fades in over 1.5s, mascot becomes
  visible).
- The bottom-centre quote ("Community is my spinach" + `spinach.png`) and the
  bottom-right mascot slot live in this same always-mounted content layer.
