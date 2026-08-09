import { StyleSheet, Text, View } from 'react-native';

import { CONNECTION_STATUS, type ConnectionStatus } from '@/commonUtils';
import { colors } from '@/constants/colors';
import { i18 } from '@/i18';

const BADGE_COPY: Record<ConnectionStatus, string> = {
  [CONNECTION_STATUS.CONNECTED]: i18.statusLive,
  [CONNECTION_STATUS.CONNECTING]: i18.statusConnecting,
  [CONNECTION_STATUS.RECONNECTING]: i18.statusReconnecting,
  [CONNECTION_STATUS.DISCONNECTED]: i18.statusOffline,
};

const FOOTER_COPY: Record<ConnectionStatus, string> = {
  [CONNECTION_STATUS.CONNECTED]: i18.footerConnected,
  [CONNECTION_STATUS.CONNECTING]: i18.footerConnecting,
  [CONNECTION_STATUS.RECONNECTING]: i18.footerReconnecting,
  [CONNECTION_STATUS.DISCONNECTED]: i18.footerDisconnected,
};

export function ConnectionStatusBadge({
  status,
  variant = 'badge',
}: {
  status: ConnectionStatus;
  variant?: 'badge' | 'footer';
}) {
  const isLive = status === CONNECTION_STATUS.CONNECTED;

  if (variant === 'footer') {
    return (
      <View style={styles.footer}>
        <View style={[styles.footerDot, isLive ? styles.dotLive : styles.dotOffline]} />
        <Text style={[styles.footerText, !isLive && styles.footerTextOffline]}>
          {FOOTER_COPY[status]}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isLive ? styles.live : styles.offline]}>
      <View style={[styles.dot, isLive ? styles.dotLive : styles.dotOffline]} />
      <Text style={styles.text}>{BADGE_COPY[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 99,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  live: { backgroundColor: colors.badgeLiveBg },
  offline: { backgroundColor: colors.badgeOfflineBg },
  dot: { borderRadius: 4, height: 7, width: 7 },
  dotLive: { backgroundColor: colors.liveDot },
  dotOffline: { backgroundColor: colors.offlineDot },
  text: { color: colors.badgeText, fontSize: 12, fontWeight: '700' },
  footer: {
    alignItems: 'center',
    borderTopColor: colors.detailBorder,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  footerDot: { borderRadius: 4, height: 8, width: 8 },
  footerText: { color: colors.detailSpreadText, fontSize: 12, fontWeight: '500' },
  footerTextOffline: { color: colors.detailMuted },
});
