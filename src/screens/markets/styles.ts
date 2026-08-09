import { StyleSheet } from 'react-native';

import { colors } from '@/constants/colors';

export const marketsStyles = StyleSheet.create({
  screen: { backgroundColor: colors.marketsBg, flex: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  eyebrow: {
    color: colors.marketsMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  title: { color: colors.marketsText, fontSize: 27, fontWeight: '800', marginTop: 3 },
  searchWrap: { paddingHorizontal: 20, paddingVertical: 20 },
  search: {
    backgroundColor: colors.marketsSurface,
    borderColor: colors.marketsSurfaceBorder,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.marketsText,
    fontSize: 15,
    height: 48,
    paddingHorizontal: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 7,
    paddingHorizontal: 20,
  },
  sectionLabel: {
    color: colors.marketsMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  tabBar: {
    backgroundColor: colors.marketsFooterBg,
    borderTopColor: colors.marketsFooterBorder,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingBottom: 4,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    paddingVertical: 12,
  },
  tabActive: { backgroundColor: colors.marketsSurface },
  tabText: { color: colors.marketsMuted, fontSize: 14, fontWeight: '700' },
  tabTextActive: { color: colors.marketsText },
  emptyWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: { color: colors.marketsText, fontSize: 18, fontWeight: '800' },
  emptyCopy: {
    color: colors.marketsMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    textAlign: 'center',
  },
});
