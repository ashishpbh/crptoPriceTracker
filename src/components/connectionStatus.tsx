import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CONNECTION_STATUS, type ConnectionStatus } from '@/commonUtils';
import { colors } from '@/constants/colors';
import { i18 } from '@/i18';

function badgeLabel(status: ConnectionStatus, attempt: number) {
  if (status === CONNECTION_STATUS.CONNECTED) return i18.statusLive;
  if (status === CONNECTION_STATUS.CONNECTING) return i18.statusConnecting;
  if (status === CONNECTION_STATUS.RECONNECTING) {
    return attempt > 0 ? `${i18.statusReconnecting} · ${attempt}` : i18.statusReconnecting;
  }
  return i18.statusOffline;
}

function footerLabel(status: ConnectionStatus, attempt: number) {
  if (status === CONNECTION_STATUS.CONNECTED) return i18.footerConnected;
  if (status === CONNECTION_STATUS.CONNECTING) return i18.footerConnecting;
  if (status === CONNECTION_STATUS.RECONNECTING) {
    const base =
      attempt > 0 ? `${i18.footerReconnecting} · try ${attempt}` : i18.footerReconnecting;
    return `${base}${i18.footerTapRetry}`;
  }
  return `${i18.footerDisconnected}${i18.footerTapRetry}`;
}

export function ConnectionStatusBadge({
  status,
  attempt = 0,
  onRetry,
  variant = 'badge',
}: {
  status: ConnectionStatus;
  attempt?: number;
  onRetry?: () => void;
  variant?: 'badge' | 'footer';
}) {
  const isLive = status === CONNECTION_STATUS.CONNECTED;
  const isWarn =
    status === CONNECTION_STATUS.CONNECTING ||
    status === CONNECTION_STATUS.RECONNECTING;
  const canRetry = !isLive && onRetry != null;

  if (variant === 'footer') {
    const body = (
      <>
        <View
          style={[
            styles.footerDot,
            isLive ? styles.dotLive : isWarn ? styles.dotWarn : styles.dotOffline,
          ]}
        />
        <Text style={[styles.footerText, !isLive && styles.footerTextOffline]}>
          {footerLabel(status, attempt)}
        </Text>
      </>
    );

    if (canRetry) {
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={i18.statusTapRetry}
          onPress={onRetry}
          style={styles.footer}>
          {body}
        </Pressable>
      );
    }

    return <View style={styles.footer}>{body}</View>;
  }

  const badge = (
    <View
      style={[
        styles.container,
        isLive ? styles.live : isWarn ? styles.warn : styles.offline,
      ]}>
      <View
        style={[
          styles.dot,
          isLive ? styles.dotLive : isWarn ? styles.dotWarn : styles.dotOffline,
        ]}
      />
      <Text style={styles.text}>{badgeLabel(status, attempt)}</Text>
    </View>
  );

  if (canRetry) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={i18.statusTapRetry}
        hitSlop={8}
        onPress={onRetry}>
        {badge}
      </Pressable>
    );
  }

  return badge;
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
  warn: { backgroundColor: colors.badgeWarnBg },
  offline: { backgroundColor: colors.badgeOfflineBg },
  dot: { borderRadius: 4, height: 7, width: 7 },
  dotLive: { backgroundColor: colors.liveDot },
  dotWarn: { backgroundColor: colors.warnDot },
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
  footerText: { color: colors.detailSpreadText, flex: 1, fontSize: 12, fontWeight: '500' },
  footerTextOffline: { color: colors.detailMuted },
});
