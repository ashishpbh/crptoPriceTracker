import { CHANNEL } from './channels';

export const MESSAGE_TYPE = {
  TICKER: CHANNEL.TICKER,
  ORDERBOOK: CHANNEL.ORDERBOOK,
  TRADES: CHANNEL.TRADES,
  SUBSCRIPTIONS: 'subscriptions',
} as const;

export const SUBSCRIPTION_ACTION = {
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
} as const;

export const TRADE_ROLE = {
  MAKER: 'maker',
  TAKER: 'taker',
} as const;

/** Top orderbook levels kept on ingest (server sends ~500). */
export const VISIBLE_DEPTH = 10;

/** Levels rendered in the orderbook UI. */
export const VISIBLE_ORDERBOOK_LEVELS = 8;

/** Newest trades retained per symbol. */
export const MAX_TRADES_PER_SYMBOL = 30;

/** WebSocket reconnect backoff cap. */
export const MAX_RETRY_DELAY_MS = 10_000;

/** Grace before wire-unsubscribe (Strict Mode remount). */
export const UNSUBSCRIBE_GRACE_MS = 100;
