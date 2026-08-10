import { memo } from 'react';

import { ProductRow } from '@/components/productRow';
import type { Symbol } from '@/commonUtils';
import { selectIsFavorite } from '@/selectors/favoritesSelectors';
import { selectTicker } from '@/selectors/marketSelectors';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useMarketStore } from '@/stores/marketStore';

/** Per-symbol selectors so one ticker update does not re-render the whole list. */
function SubscribedProductRowComponent({
  symbol,
  onPress,
  onToggleFavorite,
  forceFavorite,
}: {
  symbol: Symbol;
  onPress: (symbol: Symbol) => void;
  onToggleFavorite: (symbol: Symbol) => void;
  /** Favorites screen always shows starred rows. */
  forceFavorite?: boolean;
}) {
  const ticker = useMarketStore(selectTicker(symbol));
  const isFavorite = useFavoritesStore(selectIsFavorite(symbol));

  return (
    <ProductRow
      isFavorite={forceFavorite === true ? true : isFavorite}
      onPress={onPress}
      onToggleFavorite={onToggleFavorite}
      symbol={symbol}
      ticker={ticker}
    />
  );
}

export const SubscribedProductRow = memo(SubscribedProductRowComponent);
