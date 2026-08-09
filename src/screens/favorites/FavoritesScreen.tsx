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

export function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const symbols = useFavoritesStore(selectFavoriteSymbols);
  const toggle = useFavoritesStore(selectToggleFavorite);
  useTickerSubscriptions(symbols);

  const renderItem = useCallback(
    ({ item }: { item: Symbol }) => (
      <SubscribedProductRow
        forceFavorite
        onPress={() => navigateToProductDetail(navigation, item)}
        onToggleFavorite={() => toggle(item)}
        symbol={item}
      />
    ),
    [navigation, toggle],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{i18.favoritesTitle}</Text>
      </View>
      {symbols.length ? (
        <FlashList data={symbols} keyExtractor={item => item} renderItem={renderItem} />
      ) : (
        <FavoritesEmpty />
      )}
      <Pressable onPress={() => navigateBack(navigation)} style={styles.back}>
        <Text style={styles.backText}>{i18.browseMarkets}</Text>
      </Pressable>
    </SafeAreaView>
  );
}
