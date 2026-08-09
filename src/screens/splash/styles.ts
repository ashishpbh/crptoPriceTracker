import { StyleSheet } from 'react-native';

import { colors } from '@/constants/colors';

export const splashStyles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    backgroundColor: colors.marketsBg,
    justifyContent: 'center',
    zIndex: 100,
  },
  mark: {
    alignItems: 'center',
    backgroundColor: colors.marketsCoinBg,
    borderRadius: 28,
    height: 72,
    justifyContent: 'center',
    marginBottom: 20,
    width: 72,
  },
  markText: {
    color: colors.marketsCoinText,
    fontSize: 28,
    fontWeight: '800',
  },
  brand: {
    color: colors.marketsText,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  tagline: {
    color: colors.marketsMuted,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  loading: {
    color: colors.marketsAccent,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 28,
  },
});
