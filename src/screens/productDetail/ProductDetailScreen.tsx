import { useCallback } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { marketRepository } from '@/api/marketRepository';
import { isSymbol, type Symbol } from '@/commonUtils';
import { ConnectionStatusBadge } from '@/components/connectionStatus';
import { MarketMetrics } from '@/components/marketMetrics';
import { Orderbook } from '@/components/orderBook';
import { useProductDetailSubscriptions } from '@/hooks/useProductSubscriptions';
import { navigateBack } from '@/navigation/navigationUtils';
import type { ProductDetailScreenProps } from '@/navigation/types';
import {
  selectIsFavorite,
  selectToggleFavorite,
} from '@/selectors/favoritesSelectors';
import {
  selectConnectionStatus,
  selectOrderbook,
  selectReconnectAttempt,
  selectTicker,
  selectTrades,
} from '@/selectors/marketSelectors';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useMarketStore } from '@/stores/marketStore';

import { ProductDetailHeader } from './ProductDetailHeader';
import { ProductPriceBlock } from './ProductPriceBlock';
import { RecentTradesPanel } from './RecentTradesPanel';
import { productDetailStyles as styles } from './styles';

export function ProductDetailScreen({ navigation, route }: ProductDetailScreenProps) {
  const rawSymbol = route.params.symbol;
  const symbol: Symbol = isSymbol(rawSymbol) ? rawSymbol : 'BTCUSD';

  useProductDetailSubscriptions(symbol, navigation);

  const ticker = useMarketStore(selectTicker(symbol));
  const orderbook = useMarketStore(selectOrderbook(symbol));
  const trades = useMarketStore(selectTrades(symbol));
  const status = useMarketStore(selectConnectionStatus);
  const attempt = useMarketStore(selectReconnectAttempt);
  const isFavorite = useFavoritesStore(selectIsFavorite(symbol));
  const toggleFavorite = useFavoritesStore(selectToggleFavorite);

  const onBack = useCallback(() => navigateBack(navigation), [navigation]);

  const onToggleFavorite = useCallback(
    () => toggleFavorite(symbol),
    [toggleFavorite, symbol],
  );
  
  const onRetry = useCallback(() => marketRepository.reconnect(), []);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <ProductDetailHeader
        isFavorite={isFavorite}
        onBack={onBack}
        onToggleFavorite={onToggleFavorite}
        symbol={symbol}
      />
      <ProductPriceBlock ticker={ticker} />
      <MarketMetrics ticker={ticker} />
      <View style={styles.panels}>
        <View style={styles.orderbookPane}>
          <Orderbook orderbook={orderbook} />
        </View>
        <RecentTradesPanel trades={trades} />
      </View>
      <ConnectionStatusBadge
        attempt={attempt}
        onRetry={onRetry}
        status={status}
        variant="footer"
      />
    </SafeAreaView>
  );
}
