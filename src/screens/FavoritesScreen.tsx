import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Symbol } from '@/commonUtils';
import { SubscribedProductRow } from '@/components/SubscribedProductRow';
import { colors } from '@/constants/colors';
import { useTickerSubscriptions } from '@/hooks/useProductSubscriptions';
import { i18 } from '@/i18';
import type { FavoritesScreenProps } from '@/navigation/types';
import {
  selectFavoriteSymbols,
  selectToggleFavorite,
} from '@/selectors/favoritesSelectors';
import { useFavoritesStore } from '@/stores/favoritesStore';

export function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const symbols = useFavoritesStore(selectFavoriteSymbols);
  const toggle = useFavoritesStore(selectToggleFavorite);
  useTickerSubscriptions(symbols);

  const renderItem = useCallback(
    ({ item }: { item: Symbol }) => (
      <SubscribedProductRow
        forceFavorite
        onPress={() => navigation.navigate('ProductDetail', { symbol: item })}
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
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{i18.favoritesEmptyTitle}</Text>
          <Text style={styles.emptyCopy}>{i18.favoritesEmptyCopy}</Text>
        </View>
      )}
      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>{i18.browseMarkets}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.marketsBg, flex: 1 },
  header: {
    borderBottomColor: colors.marketsBorder,
    borderBottomWidth: StyleSheet.hairlineWidth,
    padding: 20,
  },
  title: { color: colors.marketsText, fontSize: 28, fontWeight: '800' },
  empty: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: { color: colors.marketsText, fontSize: 18, fontWeight: '800' },
  emptyCopy: {
    color: colors.marketsMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    textAlign: 'center',
  },
  back: { alignSelf: 'center', marginBottom: 20, padding: 10 },
  backText: { color: colors.marketsAccent, fontSize: 14, fontWeight: '700' },
});
