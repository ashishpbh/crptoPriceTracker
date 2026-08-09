import { FlashList } from '@shopify/flash-list';
import { memo, useCallback } from 'react';

import type { Symbol } from '@/commonUtils';
import { SubscribedProductRow } from '@/components/SubscribedProductRow';

/** Symbol strings are unique and stable — ideal FlashList keys. */
function keyExtractor(item: Symbol) {
  return item;
}

function MarketsProductListComponent({
  products,
  onPressProduct,
  onToggleFavorite,
  forceFavorite = false,
}: {
  products: readonly Symbol[];
  onPressProduct: (symbol: Symbol) => void;
  onToggleFavorite: (symbol: Symbol) => void;
  forceFavorite?: boolean;
}) {
  const renderItem = useCallback(
    ({ item }: { item: Symbol }) => (
      <SubscribedProductRow
        forceFavorite={forceFavorite}
        onPress={() => onPressProduct(item)}
        onToggleFavorite={() => onToggleFavorite(item)}
        symbol={item}
      />
    ),
    [forceFavorite, onPressProduct, onToggleFavorite],
  );

  return (
    <FlashList
      data={products}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
    />
  );
}

export const MarketsProductList = memo(MarketsProductListComponent);
