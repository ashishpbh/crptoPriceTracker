## The Brief

Build a **Crypto Price Tracker** that displays live market data using the provided mock WebSocket server.

### Requirements

1. **Product List View** — Display the predefined list of symbols available from the server. For each symbol, subscribe to the ticker channel and show live data: symbol, last price, and 24h change. Include a way to search or filter products by name/symbol.
2. **Product Detail View** — When a user selects a product, show a detailed view with:
    - **Ticker data** — Mark price, last traded price, 24h volume, 24h high/low, funding rate (from the ticker channel)
    - **Orderbook** — Subscribe to the orderbook channel and render a live orderbook visualization. Show at least the top 10 bid/ask levels with price, quantity, and a visual depth bar (showing cumulative size). The orderbook should update in real time without layout jank or flicker.
    - **Recent Trades** — Subscribe to the trades channel and display the last 20–30 trades in a scrolling list with price, size, side (buy/sell), and timestamp. New trades should appear at the top with a brief highlight/animation.
3. **Favorites** — Allow users to mark products as favorites and view them in a separate list. Favorites should persist across page refreshes (localStorage is fine).
4. **WebSocket Lifecycle** — The detail view will have multiple concurrent subscriptions (ticker, orderbook, trades). Manage all of them cleanly: subscribe on mount, unsubscribe on unmount, handle reconnection gracefully. No memory leaks on navigation between products.
5. **Error Handling** — Gracefully handle WebSocket disconnections, reconnection logic, and display connection status to the user.

---

## What We're Evaluating

| Dimension | What We Look For |
| --- | --- |
| **Working software** | Does it run? Can we follow the README and get it working in under 5 minutes? |
| **Clean code** | Readable, well-organized components. Sensible naming. No massive God components. |
| **Code architecture** | Clear separation of concerns: API layer, hooks, components. Custom hooks for WebSocket channels. Reusable patterns. |
| **WebSocket lifecycle** | Manages multiple concurrent subscriptions cleanly. Proper subscribe/unsubscribe. No memory leaks on navigation. |
| **Orderbook & trades UI** | Smooth, real-time updates. Visual depth bars. Trade highlights. No jank under normal update frequency. |
| **Performance** | Keep the Memory Usage, DOM Nodes, CPU Usage in check |
| **Error handling** | Reconnection logic, connection status indicators, graceful degradation. |
| **TypeScript** | Proper typing of WebSocket messages, component props, and state. |

---

## Submission Requirements

1. Public GitHub repo (or zip file)
2. **README** with:
    - Setup instructions (should work with `npm install && npm start` or equivalent)
    - Brief description of your approach
    - What you'd improve if you had more time
3. No external APIs required — the mock server runs locally
4. **Don't over-engineer** — we'd rather see clean, working code for the core requirements than a half-finished attempt at everything

---

## Bonus: Stress Test Mode (Optional — Not Required)

The mock server supports configurable update frequency via a POST API (see `server/README.md`). As a bonus challenge:

- Add a UI control that lets the user increase the update frequency (e.g. a slider or preset buttons: Normal / Fast / Extreme)
- At higher frequencies, your app should remain usable — no freezing, no dropped frames, no runaway memory usage
- Document what optimizations you applied to handle high-frequency updates (throttling, batching, requestAnimationFrame, memoization, etc.)

This is entirely optional, but it's a great way to demonstrate performance awareness. We will also test your submission at higher frequencies during evaluation, so building with performance in mind — even without the UI control — is a plus.

---

## Other Bonus Ideas (Optional)

- Mini price chart using historical/candlestick data if available from the server
- Responsive design / mobile-friendly layout
- Unit tests for a key component or hook
- Dark mode toggle

---

## A Note on AI Tools

Use AI tools freely — Copilot, ChatGPT, Claude, whatever you prefer. Everyone does. What matters is whether you can build a working, well-structured application and explain your decisions in a follow-up conversation.

---

## Wireframe Reference

See the attached wireframe for a visual guide. Your UI can look different — it's a reference, not a design spec.

!Screenshot 2026-03-03 at 8.42.41 AM.png

!Screenshot 2026-03-03 at 8.42.55 AM.png