import { useEffect } from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { marketRepository } from '@/api/marketRepository';
import type { Symbol } from '@/commonUtils';
import { SCREEN } from '@/navigation/screenNames';
import type { RootStackParamList } from '@/navigation/types';

type DetailNavigation = NativeStackNavigationProp<
  RootStackParamList,
  typeof SCREEN.PRODUCT_DETAIL
>;

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

/**
 * Detail view subscriptions.
 * Ticker starts immediately (usually already live from Markets).
 * Orderbook + trades wait for the native push to finish (`transitionEnd`)
 * so nav stays smooth. `InteractionManager` is deprecated on RN 0.82+.
 */
export function useProductDetailSubscriptions(
  symbol: Symbol,
  navigation: DetailNavigation,
) {
  useEffect(() => {
    const unsubTicker = marketRepository.watchTicker(symbol);
    let unsubBook: (() => void) | undefined;
    let unsubTrades: (() => void) | undefined;
    let heavyStarted = false;

    const startHeavy = () => {
      if (heavyStarted) return;
      heavyStarted = true;
      unsubBook = marketRepository.watchOrderbook(symbol);
      unsubTrades = marketRepository.watchTrades(symbol);
    };

    const unsubTransition = navigation.addListener('transitionEnd', event => {
      if (event.data.closing) return;
      startHeavy();
    });

    // Safety net if transitionEnd never fires (animation disabled / edge cases).
    const fallbackTimer = setTimeout(startHeavy, 400);

    return () => {
      unsubTransition();
      clearTimeout(fallbackTimer);
      unsubTicker();
      unsubBook?.();
      unsubTrades?.();
    };
  }, [symbol, navigation]);
}
