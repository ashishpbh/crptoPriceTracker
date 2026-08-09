import { useEffect } from 'react';

import { marketRepository } from '@/api/marketRepository';
import type { Symbol } from '@/commonUtils';

/** Subscribe to tickers for the lifetime of the screen. */
export function useTickerSubscriptions(symbols: readonly Symbol[]) {
  const symbolKey = symbols.join(',');

  useEffect(() => {
    const unsubscribers = symbols.map(symbol => marketRepository.watchTicker(symbol));
    return () => unsubscribers.forEach(unsubscribe => unsubscribe());
    // symbolKey avoids churn when callers pass a fresh array with the same symbols.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolKey]);
}

/** Detail view: ticker + orderbook + trades for one symbol. */
export function useProductDetailSubscriptions(symbol: Symbol) {
  useEffect(() => {
    const unsubscribers = [
      marketRepository.watchTicker(symbol),
      marketRepository.watchOrderbook(symbol),
      marketRepository.watchTrades(symbol),
    ];
    return () => unsubscribers.forEach(unsubscribe => unsubscribe());
  }, [symbol]);
}
