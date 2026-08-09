# Crypto Price Tracker

React Native (CLI) app that shows live crypto market data from a local mock WebSocket server: searchable product list, product detail (ticker / orderbook / recent trades), persisted favorites, and reconnect-aware connection status.

**Data flow & layers:** see [ARCHITECTURE.md](./ARCHITECTURE.md).  
**Tough interview Q&A (tradeoffs / alternatives):** see [INTERVIEW_ARCHITECTURE_QA.md](./INTERVIEW_ARCHITECTURE_QA.md).

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
| `marketBuffer.ts` | Separates socket updates from state updates: WS messages land here first; store/`applyBatch` runs later (throttle + rAF), not on every tick (see below) |
| `marketRepository.ts` | App-facing API (`watchTicker`, `watchOrderbook`, `watchTrades`). Screens never open a socket directly |

### Subscriptions (screen → channels)

**Intentional split:** each screen subscribes only to channels it renders. Markets does **not** open orderbook/trades — that traffic is heavy and unused on the list, so we keep the list cheap on purpose.

| Screen | Channels | Why this set |
| --- | --- | --- |
| Markets / Favorites | `v2/ticker` only | List needs last price + 24h change — nothing else |
| Product detail | `v2/ticker` + `l2_orderbook` + `all_trades` | Detail is the only place book + tape are shown |

Unsubscribe on leave (ref-counted). Prefetching book/tape on Markets would burn bandwidth and CPU for UI the user never sees.

**Wire vs server log:** Transport sends **deltas only**. Opening detail for `ETHUSD` does not resubscribe every market ticker — Markets usually stays mounted, so those tickers remain; the wire adds `l2_orderbook` / `all_trades` (and bumps the ticker ref-count). If the mock server prints `Client subscriptions: [...]`, that is the **full aggregate** client state after the update, not a replay of every prior `subscribe` payload.

### Buffering strategy (`marketBuffer.ts`)

**Intentional tradeoff:** mock tickers arrive every **10–50ms**. Updating every list row that often feels noisy and wastes frames. Detail book/tape should feel live. So ingest is **channel-aware by design** — not a one-size flush for everything:

| Channel | When (rate) | How (paint) | Why (product choice) |
| --- | --- | --- | --- |
| `v2/ticker` | Throttle `TICKER_UI_THROTTLE_MS` (**300ms**); latest in the window wins | Flush on `requestAnimationFrame` | Calm, readable markets list; still paint-aligned |
| `l2_orderbook` / `all_trades` | Keep the latest update each frame (no 300ms wait) | Flush via `requestAnimationFrame` (once per screen frame) | Detail should feel live when prices move fast |

So: **list prefers calm; detail prefers immediacy.** Same pipeline, different policy per channel. `TICKER_UI_THROTTLE_MS = 0` falls back to rAF-only tickers. Store also skips ticker writes when UI-visible fields are unchanged.
