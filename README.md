# TinkerSpace Calicut — Digital Display

Digital display app for **TinkerSpace Calicut** — shows a live, auto-refreshing grid
of currently checked-in makers on a kiosk-style screen.

This is based on [tinkerhub/tinkerspace_digital](https://github.com/tinkerhub/tinkerspace_digital),
adapted for the Calicut space:

- Points at the shared TinkerHub check-in API with `space_id=2` (Calicut), via a new
  `REACT_APP_SPACE_ID` env var.
- The Calendar Dashboard view (which needs a separate SpaceCalendar API key) has been
  removed — this instance only shows the maker check-in grid.

**Live site:** https://jasimcm.github.io/tinkerspace_digital_calicut/ (GitHub Pages)

## Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) 11+ (`corepack enable` if needed)

This project uses pnpm only. `npm install` and `yarn` are blocked.

## Local setup

```bash
git clone https://github.com/jasimcm/tinkerspace_digital_calicut.git
cd tinkerspace_digital_calicut
pnpm install
pnpm dev:mock
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Local development without the real backend

```bash
pnpm dev:mock
```

This starts:

- the React dev server on `http://localhost:3000`
- a local mock API server on `http://localhost:4010` exposing `GET /checkin/active`

### Local setup with the real backend

```bash
cp .env.example .env
# fill in the values in .env
pnpm dev
```

### Environment variables

Copy `.env.example` to `.env` and set:

| Variable | Description |
|---|---|
| `REACT_APP_API_BASE_URL` | Base URL for the check-in API (`https://app-api.tinkerhub.org`) |
| `REACT_APP_SPACE_ID` | The TinkerHub space id to show makers for (`2` for Calicut) |

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm dev:mock` | Start the development server with the built-in mock backend |
| `pnpm mock:server` | Start only the local mock backend on port `4010` |
| `pnpm build` | Create a production build |
| `pnpm build:mock` | Create a production build configured against local mock API URLs |
| `pnpm test` | Run tests |
| `pnpm deploy` | Build and publish to GitHub Pages |

## Deployment (GitHub Pages)

```bash
pnpm deploy
```

This builds the app and publishes `build/` to the `gh-pages` branch via the `gh-pages`
package. Enable GitHub Pages in the repo's **Settings → Pages**, with source set to the
`gh-pages` branch, if it isn't already.

Set `REACT_APP_API_BASE_URL` and `REACT_APP_SPACE_ID` in `.env` (not committed) before
running `pnpm build` / `pnpm deploy` so the production bundle points at the real API.
