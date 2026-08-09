export const SCREEN = {
  MARKETS: 'Markets',
  FAVORITES: 'Favorites',
  PRODUCT_DETAIL: 'ProductDetail',
} as const;

export type ScreenName = (typeof SCREEN)[keyof typeof SCREEN];

export const MARKETS_TAB = {
  ALL: 'all',
  FAVORITES: 'favorites',
} as const;

export type MarketsTab = (typeof MARKETS_TAB)[keyof typeof MARKETS_TAB];
