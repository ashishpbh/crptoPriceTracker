import { useCallback, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SYMBOLS, type Symbol } from '@/commonUtils';
import { useTickerSubscriptions } from '@/hooks/useProductSubscriptions';
import { navigateToProductDetail } from '@/navigation/navigationUtils';
import { MARKETS_TAB, type MarketsTab } from '@/navigation/screenNames';
import type { MarketsScreenProps } from '@/navigation/types';
import {
  selectFavoriteSymbols,
  selectToggleFavorite,
} from '@/selectors/favoritesSelectors';
import { selectConnectionStatus } from '@/selectors/marketSelectors';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useMarketStore } from '@/stores/marketStore';
import { normalizeSearchQuery } from '@/utils/format';
import { MarketsListSection } from './MarketsListSection';
import { MarketsTabBar } from './MarketsTabBar';
import { MarketsTopBar } from './MarketsTopBar';
import { marketsStyles as styles } from './styles';

export function MarketsScreen({ navigation }: MarketsScreenProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<MarketsTab>(MARKETS_TAB.ALL);
  const status = useMarketStore(selectConnectionStatus);
  const favorites = useFavoritesStore(selectFavoriteSymbols);
  const toggleFavorite = useFavoritesStore(selectToggleFavorite);
  useTickerSubscriptions(SYMBOLS);

  const products = useMemo(() => {
    const source = activeTab === MARKETS_TAB.ALL ? SYMBOLS : favorites;
    const normalizedQuery = normalizeSearchQuery(query);
    return normalizedQuery
      ? source.filter(symbol => symbol.includes(normalizedQuery))
      : [...source];
  }, [activeTab, favorites, query]);

  const onPressProduct = useCallback(
    (symbol: Symbol) => navigateToProductDetail(navigation, symbol),
    [navigation],
  );

  const onToggleFavorite = useCallback(
    (symbol: Symbol) => toggleFavorite(symbol),
    [toggleFavorite],
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <MarketsTopBar query={query} onChangeQuery={setQuery} status={status} />
      <MarketsListSection
        activeTab={activeTab}
        onPressProduct={onPressProduct}
        onToggleFavorite={onToggleFavorite}
        products={products}
      />
      <MarketsTabBar
        activeTab={activeTab}
        favoritesCount={favorites.length}
        onChangeTab={setActiveTab}
      />
    </SafeAreaView>
  );
}
