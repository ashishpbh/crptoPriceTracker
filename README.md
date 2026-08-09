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

- **Transport:** A single shared WebSocket with ref-counted subscribe/unsubscribe, a short grace window for React Strict Mode remounts, and exponential reconnect backoff. Connection status is surfaced in the UI.

- **Performance:** Incoming messages are batched with `requestAnimationFrame` before store writes; order books are trimmed to the top 10 levels on ingest; trades are capped at 30; per-symbol selectors keep list row updates independent.

- **Favorites:** Persisted with Zustand + AsyncStorage so they survive app restarts.

- **Motion:** New trade rows highlight briefly via Reanimated.

## What I’d improve with more time

- Stress-test UI (Normal / Fast / Extreme) wired to the server’s HTTP intervals API
- Unit tests for transport ref-counting and buffer flush behavior
- Mini candlestick chart from the `candlestick_*` channels
- Physical-device host config via env / in-app settings instead of editing `marketConfig.ts`

## Project layout

```
src/
  commonUtils/   # Shared market primitives: SYMBOLS, channel names, WebSocket message types, orderbook shapes
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

| `websocketClient.ts` | WebSocket transport: connect, subscribe/unsubscribe, reconnect with backoff |

| `marketBuffer.ts` | **requestAnimationFrame (rAF) buffer** — holds fast WebSocket updates and flushes them to the store once per screen frame so the UI is not rewritten on every message |

| `marketRepository.ts` | App-facing API (`watchTicker`, `watchOrderbook`, `watchTrades`). Screens never open a socket directly |
