import { Pressable, Text, View } from 'react-native';

import { i18 } from '@/i18';
import { MARKETS_TAB, type MarketsTab } from '@/navigation/screenNames';

import { marketsStyles as styles } from './styles';

export type { MarketsTab };

export function MarketsTabBar({
  activeTab,
  favoritesCount,
  onChangeTab,
}: {
  activeTab: MarketsTab;
  favoritesCount: number;
  onChangeTab: (tab: MarketsTab) => void;
}) {
  return (
    <View style={styles.tabBar}>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === MARKETS_TAB.ALL }}
        onPress={() => onChangeTab(MARKETS_TAB.ALL)}
        style={[styles.tab, activeTab === MARKETS_TAB.ALL && styles.tabActive]}>
        <Text
          style={[styles.tabText, activeTab === MARKETS_TAB.ALL && styles.tabTextActive]}>
          {i18.tabAll}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === MARKETS_TAB.FAVORITES }}
        onPress={() => onChangeTab(MARKETS_TAB.FAVORITES)}
        style={[
          styles.tab,
          activeTab === MARKETS_TAB.FAVORITES && styles.tabActive,
        ]}>
        <Text
          style={[
            styles.tabText,
            activeTab === MARKETS_TAB.FAVORITES && styles.tabTextActive,
          ]}>
          {i18.tabFavorites}
          {favoritesCount ? ` (${favoritesCount})` : ''}
        </Text>
      </Pressable>
    </View>
  );
}
