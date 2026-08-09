# Crypto Price Tracker

React Native (CLI) app that shows live crypto market data from a local mock WebSocket server: searchable product list, product detail (ticker / orderbook / recent trades), persisted favorites, and reconnect-aware connection status.

## Prerequisites

- Node.js `>= 22.11.0`
- Xcode (iOS) and/or Android Studio (Android) set up for React Native
- [Bun](https://bun.sh) for the mock market server
- Mock server available as a sibling checkout named `socket-custom-load` (same protocol as [server/README.md](server/README.md))

## Setup

```bash
# Terminal 1 — mock market data (WebSocket :8080, HTTP :3000)
cd ../socket-custom-load
bun install
bun start

# Terminal 2 — Metro bundler
cd ../crptoPriceTracker
npm install
npm start
```

In a third terminal, run the app:

```bash
# iOS (first time: cd ios && pod install)
npm run ios

# or Android
npm run android
```

Equivalent one-liner for the app after the mock server is already running:

```bash
npm install && npm start
```

**Hosts:** iOS Simulator uses `localhost`. Android emulator uses `10.0.2.2`. For a physical device, set your machine’s LAN IP in `src/api/marketConfig.ts`.

No external APIs are required — all market data comes from the local mock server.

## Approach

- **UI / logic split:** Screens and components never open a WebSocket. They call `marketRepository` through subscription hooks (`useTickerSubscriptions`, `useProductDetailSubscriptions`) and read Zustand via dedicated selectors.

- **Transport:** A single shared WebSocket with ref-counted subscribe/unsubscribe, a short grace window for React Strict Mode remounts, and exponential reconnect via reusable `exponentialBackoffMs`. Tap-to-retry / AppState resume use `reconnectNow` with a socket **generation** so a late async `onclose` cannot schedule a ghost reconnect. `__DEV__` `[WS subscriptions]` logs show live channel/symbol ref-counts for demos.

- **Errors:** Two failure domains — transport (badge retry / backoff / AppState) vs React render crashes (`AppErrorBoundary` with Try again).

- **Performance:** Channel-aware buffering — tickers use throttle (WHEN, ~300ms) + `requestAnimationFrame` (HOW, paint-aligned); orderbook/trades stay rAF-only so detail stays snappy. Order books are trimmed to the top 10 levels on ingest; trades are capped at 30; per-symbol selectors keep list row updates independent.

- **Favorites:** Persisted with Zustand + AsyncStorage so they survive app restarts.

- **UI:** Dark trading palette (shared tokens in `constants/colors.ts`). Only the newest trade flashes a buy/sell background (~720ms) via Reanimated; the first paint of the tape is seeded silently so opening detail doesn’t splash the whole list.

## What I’d improve with more time

- Stress-test UI (Normal / Fast / Extreme) wired to the server’s HTTP intervals API
- Unit tests for transport ref-counting and buffer flush behavior
- Mini candlestick chart from the `candlestick_*` channels
- Physical-device host config via env / in-app settings instead of editing `marketConfig.ts`

## Project layout

```
src/
  commonUtils/   # Shared market primitives: SYMBOLS, channels, backoff helper, message types, orderbook shapes
  api/           # Market data layer (see below)
  stores/        # Zustand state: live market data + favorites
  selectors/     # Narrow store selectors so UI only re-renders what it needs
  hooks/         # Subscribe/unsubscribe lifecycle for ticker, orderbook, and trades
  constants/     # Shared colors
  utils/         # Formatting helpers (price, volume, search normalize)
  i18.ts         # User-facing copy strings
  screens/       # Route-level screens (Markets, Product Detail, Favorites, Splash)
  components/    # Reusable UI (product row, orderbook, trades, connection status)
  navigation/    # React Navigation stack, screen names, types
```

### `src/api/` (market data layer)

| File | Role |
| --- | --- |
| `marketConfig.ts` | WebSocket / HTTP host URLs (`localhost` on iOS, `10.0.2.2` on Android emulator) |
| `websocketClient.ts` | WebSocket transport: connect, ref-counted subscribe/unsubscribe, Strict Mode grace unsubscribe, `reconnectNow`, backoff via `exponentialBackoffMs` |
| `marketBuffer.ts` | Channel-aware ingest buffer (see below) — coalesces fast WS updates before store writes |
| `marketRepository.ts` | App-facing API (`watchTicker`, `watchOrderbook`, `watchTrades`). Screens never open a socket directly |

### Subscriptions (screen → channels)

Subscribe only for data the **current screen** needs; unsubscribe on leave.

| Screen | Channels |
| --- | --- |
| Markets / Favorites list | `v2/ticker` only |
| Product detail | `v2/ticker` + `l2_orderbook` + `all_trades` |

No trade-tape or orderbook prefetch on the markets list.

**Wire vs server log:** Transport is ref-counted and sends **deltas only**. Opening product detail for `ETHUSD` does **not** resubscribe all market tickers — Markets is usually still mounted, so those tickers stay live and only `l2_orderbook` / `all_trades` (and a ticker ref-count bump) are new. If the mock server prints `Client subscriptions: [...]`, that is the **full aggregate** set for the client after the update, not a replay of every prior `subscribe` payload.

### Buffering strategy (`marketBuffer.ts`)

Mock tickers arrive every **10–50ms**. Painting every message makes the list jittery, so ingest is channel-aware:

| Channel | When | How | Why |
| --- | --- | --- | --- |
| `v2/ticker` | Throttle (`TICKER_UI_THROTTLE_MS`, default **300ms**). Latest value in the window wins. | Flush on `requestAnimationFrame` | Calm markets list; paint-aligned store writes |
| `l2_orderbook` / `all_trades` | Every pending update | `requestAnimationFrame` only | Detail stays snappy |

`TICKER_UI_THROTTLE_MS = 0` → ticker path becomes rAF-only (legacy cadence). Store also skips ticker writes when UI-visible fields are unchanged.
