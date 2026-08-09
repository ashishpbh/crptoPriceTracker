import { Text, View } from 'react-native';

import { i18 } from '@/i18';

import { favoritesStyles as styles } from './styles';

export function FavoritesEmpty() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{i18.favoritesEmptyTitle}</Text>
      <Text style={styles.emptyCopy}>{i18.favoritesEmptyCopy}</Text>
    </View>
  );
}
