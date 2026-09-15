# Development & deployment

## Prerequisites

- Node.js **22+** (`.nvmrc` present; `engines.node: ">=22"`).
- **pnpm 11+** only. `package.json` has `"packageManager": "pnpm@11.5.0"` and a
  `preinstall` hook (`npx only-allow pnpm`) that **fails `npm install` / `yarn`**.
  Get pnpm via `corepack enable` (needs an elevated shell on Windows to write shims into
  `C:\Program Files\nodejs`) or `npm install -g pnpm`.

## Install & run

```bash
pnpm install
pnpm dev:mock     # app on :3000, mock API on :4010
```

| Command | What it does |
|---|---|
| `pnpm dev` | `react-scripts start` — uses your `.env` (needs the real API URL) |
| `pnpm dev:mock` | [`scripts/dev-with-mocks.js`](../scripts/dev-with-mocks.js): spawns the mock server **and** the frontend; either process exiting tears down both |
| `pnpm mock:server` | [`mock-server/server.js`](../mock-server/server.js) alone on `:4010` |
| `pnpm build` | `react-scripts build` -> `build/`, using `.env` |
| `pnpm build:mock` | [`scripts/react-scripts-with-mocks.js`](../scripts/react-scripts-with-mocks.js) `build` — forces mock API env vars |
| `pnpm test` | `react-scripts test` (Jest watch mode) |
| `pnpm deploy` | `pnpm run build` then `gh-pages -d build` |

### How the mock wiring works

`scripts/react-scripts-with-mocks.js` spawns `pnpm exec react-scripts <cmd>` with
`REACT_APP_API_BASE_URL=http://localhost:<MOCK_SERVER_PORT>` and `REACT_APP_SPACE_ID=2`
**injected over** any `.env` values, so the mock path is deterministic regardless of a
checked-out `.env`. `dev-with-mocks.js` additionally starts the mock server itself.
`MOCK_SERVER_PORT` (default `4010`) is the single knob.

Weather is never mocked — mock runs still call the live open-meteo API.

## Environment variables

Copy `.env.example` -> `.env` (git-ignored):

| Variable | Required | Value | Used by |
|---|---|---|---|
| `REACT_APP_API_BASE_URL` | yes (for `dev` / `build`) | `https://app-api.tinkerhub.org` | `fetchData.js` |
| `REACT_APP_SPACE_ID` | recommended | `2` (Calicut) | `fetchData.js` — appends `?space_id=` |
| `REACT_APP_MASCOT_ASSET_VERSION` | no | any string; default `mascot-watchdog-v1` | mascot sprite cache-bust / URL versioning |

CRA only exposes vars prefixed `REACT_APP_`. They are inlined at build time — a
production build is pinned to whatever `.env` held when `pnpm build` ran.

## Deployment (GitHub Pages)

- `pnpm deploy` builds and pushes `build/` to the `gh-pages` branch via the `gh-pages`
  package.
- `homepage: "."` in `package.json` -> relative asset paths, so it works under
  `https://<user>.github.io/<repo>/`.
- Set `REACT_APP_API_BASE_URL` + `REACT_APP_SPACE_ID` in `.env` **before** building so
  the bundle points at the real API.
- In the repo: Settings → Pages → source = `gh-pages` branch.
- Live: https://jasimcm.github.io/tinkerspace_digital_calicut/

## Kiosk / TV setup notes

- The app tries to go fullscreen on load; if the browser blocks it, a "Press any button"
  overlay appears and the first remote/keyboard/tap gesture retries. See
  [display-and-layout.md](./display-and-layout.md).
- It requests a screen wake lock and re-requests it on every `visibilitychange`, so the
  panel should not sleep while the tab is foregrounded.
- Layout is fully viewport-driven — no fixed target resolution. Tested intent covers
  phones through TV panels (commits `522257f`, `3f3b808`).

## Lint

ESLint config is CRA's `react-app` + `react-app/jest` (in `package.json`). No custom
rules, no standalone lint script — lint runs as part of `react-scripts` start/build.

## Relationship to upstream

Forked from [tinkerhub/tinkerspace_digital](https://github.com/tinkerhub/tinkerspace_digital).
Calicut-specific changes: `space_id=2` via `REACT_APP_SPACE_ID`, the SpaceCalendar
dashboard view removed (this instance is maker-grid only), and the animated mascot system.
