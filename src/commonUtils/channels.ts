export const CHANNEL = {
  TICKER: 'v2/ticker',
  ORDERBOOK: 'l2_orderbook',
  TRADES: 'all_trades',
} as const;

export const MARKET_CHANNELS = [CHANNEL.TICKER, CHANNEL.ORDERBOOK, CHANNEL.TRADES] as const;

export type MarketChannel = (typeof MARKET_CHANNELS)[number];

export const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
} as const;

export type ConnectionStatus = (typeof CONNECTION_STATUS)[keyof typeof CONNECTION_STATUS];

/** Live connection snapshot for UI (attempt > 0 while reconnecting). */
export interface ConnectionInfo {
  status: ConnectionStatus;
  attempt: number;
}

/** Teardown fn returned by subscribe / listener registration. */
export type Cleanup = () => void;