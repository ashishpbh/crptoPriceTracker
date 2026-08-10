import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Symbol } from '@/commonUtils';
import { SubscribedProductRow } from '@/components/SubscribedProductRow';
import { useTickerSubscriptions } from '@/hooks/useProductSubscriptions';
import { i18 } from '@/i18';
import {
  navigateBack,
  navigateToProductDetail,
} from '@/navigation/navigationUtils';
import type { FavoritesScreenProps } from '@/navigation/types';
import {
  selectFavoriteSymbols,
  selectToggleFavorite,
} from '@/selectors/favoritesSelectors';
import { useFavoritesStore } from '@/stores/favoritesStore';

import { FavoritesEmpty } from './FavoritesEmpty';
import { favoritesStyles as styles } from './styles';

function keyExtractor(item: Symbol) {
  return item;
}

export function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const symbols = useFavoritesStore(selectFavoriteSymbols);
  const toggle = useFavoritesStore(selectToggleFavorite);
  useTickerSubscriptions(symbols);

  const onPressProduct = useCallback(
    (symbol: Symbol) => navigateToProductDetail(navigation, symbol),
    [navigation],
  );

  const onToggleFavorite = useCallback(
    (symbol: Symbol) => toggle(symbol),
    [toggle],
  );

  const onBrowseMarkets = useCallback(() => navigateBack(navigation), [navigation]);

  const renderItem = useCallback(
    ({ item }: { item: Symbol }) => (
      <SubscribedProductRow
        forceFavorite
        onPress={onPressProduct}
        onToggleFavorite={onToggleFavorite}
        symbol={item}
      />
    ),
    [onPressProduct, onToggleFavorite],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{i18.favoritesTitle}</Text>
      </View>
      {symbols.length ? (
        <FlashList data={symbols} keyExtractor={keyExtractor} renderItem={renderItem} />
      ) : (
        <FavoritesEmpty />
      )}
      <Pressable onPress={onBrowseMarkets} style={styles.back}>
        <Text style={styles.backText}>{i18.browseMarkets}</Text>
      </Pressable>
    </SafeAreaView>
  );
}
