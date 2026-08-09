import { StyleSheet } from 'react-native';

import { colors } from '@/constants/colors';

export const favoritesStyles = StyleSheet.create({
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
