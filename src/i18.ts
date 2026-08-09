/**
 * User-facing copy. Plain English map — no i18n library.
 * Swap or wrap later if locales are needed.
 */
export const i18 = {
  splashBrand: 'Crypto tracker',
  splashTagline: 'Live markets',
  splashLoading: 'Loading…',

  marketsEyebrow: 'MARKETS',
  marketsTitle: 'Crypto tracker',
  searchPlaceholder: 'Search BTC, ETH, SOL...',
  productColumn: 'PRODUCT',
  priceColumn: 'LAST PRICE / 24H',
  favoritesButton: '★  Favorites',
  tabAll: 'All',
  tabFavorites: 'Favorites',
  waitingForPrice: 'Waiting for price',
  quotePerpetual: 'USD Perpetual',

  favoritesTitle: 'Favorites',
  favoritesEmptyTitle: 'No favorites yet',
  favoritesEmptyCopy: 'Star a market from the products list to keep it here.',
  browseMarkets: 'Browse markets',

  back: 'Back',
  orderbookTitle: 'Orderbook',
  recentTradesTitle: 'Recent Trades',
  waitingForOrderbook: 'Waiting for order book…',
  waitingForTrades: 'Waiting for trades…',
  spreadLabel: 'Spread',

  columnPrice: 'PRICE',
  columnSize: 'SIZE',
  columnTotal: 'TOTAL',
  columnSide: 'SIDE',
  columnTime: 'TIME',

  metricMark: 'Mark Price',
  metricHigh: '24H High',
  metricLow: '24H Low',
  metricVolume: '24H Volume',
  metricFunding: 'Funding Rate',

  buy: 'BUY',
  sell: 'SELL',

  statusLive: 'Live',
  statusConnecting: 'Connecting',
  statusReconnecting: 'Reconnecting',
  statusOffline: 'Offline',
  footerConnected: 'WebSocket connected · Live updates active',
  footerConnecting: 'WebSocket connecting…',
  footerReconnecting: 'WebSocket reconnecting…',
  footerDisconnected: 'WebSocket disconnected',

  productNames: {
    BTCUSD: 'Bitcoin Perpetual',
    ETHUSD: 'Ethereum Perpetual',
    XRPUSD: 'XRP Perpetual',
    SOLUSD: 'Solana Perpetual',
    PAXGUSD: 'PAXG Perpetual',
    DOGEUSD: 'Dogecoin Perpetual',
  } as const,
} as const;
