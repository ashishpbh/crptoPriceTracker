import { memo } from 'react';
import { Text, View } from 'react-native';

import type { Symbol } from '@/commonUtils';
import { i18 } from '@/i18';
import { MARKETS_TAB, type MarketsTab } from '@/navigation/screenNames';

import { MarketsProductList } from './MarketsProductList';
import { marketsStyles as styles } from './styles';

function MarketsListSectionComponent({
  activeTab,
  products,
  onPressProduct,
  onToggleFavorite,
}: {
  activeTab: MarketsTab;
  products: readonly Symbol[];
  onPressProduct: (symbol: Symbol) => void;
  onToggleFavorite: (symbol: Symbol) => void;
}) {
  if (activeTab === MARKETS_TAB.FAVORITES && products.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>{i18.favoritesEmptyTitle}</Text>
        <Text style={styles.emptyCopy}>{i18.favoritesEmptyCopy}</Text>
      </View>
    );
  }

  return (
    <MarketsProductList
      forceFavorite={activeTab === MARKETS_TAB.FAVORITES || undefined}
      onPressProduct={onPressProduct}
      onToggleFavorite={onToggleFavorite}
      products={products}
    />
  );
}

export const MarketsListSection = memo(MarketsListSectionComponent);
