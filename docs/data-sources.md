# Data sources

## 1. Check-in API (makers)

[`src/utils/api/fetchData.js`](../src/utils/api/fetchData.js)

- **URL:** `${REACT_APP_API_BASE_URL}/checkin/active` and, when `REACT_APP_SPACE_ID` is
  set, `?space_id=${REACT_APP_SPACE_ID}` is appended.
  Production: `https://app-api.tinkerhub.org/checkin/active?space_id=2`.
- **Method:** `GET`, `Content-Type: application/json`, `credentials: 'same-origin'`.
  No auth header is sent (there's a comment placeholder for one).
- **Polled:** every 20s from `App.js`.
- **Failure behaviour:** logs and returns `[]`. Specific guards:
  - missing `REACT_APP_API_BASE_URL` -> throws internally, caught -> `[]`
  - non-2xx -> `[]`
  - response `Content-Type` not JSON -> `[]` (guards against an HTML error page)

### Maker object shape (as consumed)

The app reads these fields; unknown fields are ignored.

| Field | Used by | Notes |
|---|---|---|
| `membershipId` | `removeDuplicates`, React `key` | Dedupe key. Mock server also provides it. |
| `name` | `UserInfo`, `UserCard` (badge lookup), `key` fallback | |
| `avatar` | `UserImage` `src` | Empty / missing / load error -> first-letter placeholder |
| `purpose` | `UserCard` -> `UserImage` pill + colour | See purpose colours below |
| `workingOn` | `UserInfo` subtitle | First choice for the subtitle line |
| `projectName` | `UserInfo` subtitle | Fallback when `workingOn` is absent |

`UserInfo` subtitle = `card.workingOn || card.projectName || ' '` (non-breaking
space keeps the row height stable).

### Purpose -> pill colour ([`UserCard.jsx`](../src/components/cards/UserCard.jsx))

| Purpose | Colour |
|---|---|
| `Attending an event` | soft red `#FFD1D1` |
| `On duty` | soft orange `#FFE5B4` |
| `Visiting` | soft green `#D1FFD1` |
| `Working on a project` | soft blue `#D1E8FF` |
| `Self Learning` | soft purple `#E8D1FF` |
| anything else / missing | soft yellow `#FFF3B0` |

If a maker's `name` carries the `guard` badge (see below), the displayed purpose is
forced to `On duty` regardless of the API value.

### De-duplication ([`removeDuplicates.js`](../src/utils/helpers/removeDuplicates.js))

`reduce` that keeps the first occurrence of each `membershipId`. Handles `null`/`undefined`
input by treating it as `[]`. Runs on every fetch before `setData`.

### Badges ([`badgeConfig.js`](../src/utils/constants/badgeConfig.js))

Badges are **hard-coded by maker name**, not returned by the API.

- `USER_BADGES`: `name -> [badgeType]`. Types: `Team-Member-Bronze`, `Project-contributor`,
  `guard`. Image files live at `public/images/<badgeType>.png`.
- `BADGE_METADATA`: `alt` text + `priority` (used to sort when a name has multiple badges).
- To add a badge for a real maker, add their exact display name to `USER_BADGES`.

## 2. Weather API

[`src/utils/api/weatherService.js`](../src/utils/api/weatherService.js)

- **Provider:** open-meteo forecast API. **No API key.**
- **URL:** `https://api.open-meteo.com/v1/forecast?latitude=10.0469797&longitude=76.3351998&current=temperature_2m,precipitation,weather_code&timezone=auto`
  (coordinates hard-coded to TinkerSpace Calicut).
- **Polled:** every 5min, independently, from both `Header.jsx` and `TinkerHubMascot.jsx`.
- **Returns:** `{ isRaining, description, temperature (rounded °C), precipitation }`, or
  `null` on error.
- `isRaining` is true for WMO codes 51/53/55, 61/63/65, 80/81/82, 95/96/99.
- `description` is a coarse bucket: Thunderstorm / Rain Showers / Raining / Drizzle /
  Foggy / Partly Cloudy / clear sky.
- There is a large commented-out mock `response` block in the file for testing the rain
  animation locally — leave it commented in commits.

### How weather drives the UI

- **Header:** shows `${temperature}°C` next to a thermometer icon (only when weather is
  non-null). `description` is passed to `getWeatherIcon` but that currently always
  renders the same thermometer glyph.
- **Mascot:** `getWeatherPose(weather)` in [`policy.js`](../src/components/mascot/policy.js):
  - `isRaining` -> `rain` (takes precedence)
  - `temperature >= 32` -> `hot`
  - `temperature <= 24` -> `winter`
  - otherwise -> no reaction
  A change in the resulting pose queues one deduplicated `weather` event, subject to a
  15-minute cooldown in the policy.

## 3. Local mock server

[`mock-server/server.js`](../mock-server/server.js) + [`mock-server/data.js`](../mock-server/data.js)

- Plain Node `http` server, no dependencies. Port from `MOCK_SERVER_PORT` (default `4010`).
- Permissive CORS (`Access-Control-Allow-Origin: *`), `Cache-Control: no-store`.
- Routes:
  - `GET /health` -> `{ ok: true, service, port }`
  - `GET /checkin/active` -> the static `MOCK_MAKERS` array (6 Harry Potter characters)
  - anything else -> 404 JSON
- `MOCK_MAKERS` intentionally exercises edge cases: empty `avatar` (placeholder path),
  one entry using `projectName` instead of `workingOn`, names that match `badgeConfig`
  (`Harry Potter` = team member, `Rubeus Hagrid` = guard).
- Weather is **not** mocked — `dev:mock` still hits the real open-meteo API.

See [development.md](./development.md) for how the mock server is wired into `pnpm dev:mock`.
