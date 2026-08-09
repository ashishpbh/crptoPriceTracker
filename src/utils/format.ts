export function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 }).format(value);
}

export function formatPercent(change: number) {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatTradeTime(timestamp: number) {
  return new Date(timestamp / 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/** Server sends ltp_change_24h as a ratio (e.g. 1.02 → +2%). */
export function changeFromTickerRatio(ltpChange24h: string) {
  return (Number(ltpChange24h) - 1) * 100;
}

export function normalizeSearchQuery(query: string) {
  return query.trim().toUpperCase();
}
