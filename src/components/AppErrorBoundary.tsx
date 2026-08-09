import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { i18 } from '@/i18';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/** Catches React render/lifecycle crashes — not WebSocket drops (those use badge retry). */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) {
      console.warn('[AppErrorBoundary]', error, info.componentStack);
    }
  }

  private onRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.root}>
          <Text style={styles.title}>{i18.errorBoundaryTitle}</Text>
          <Text style={styles.copy}>{i18.errorBoundaryCopy}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={this.onRetry}
            style={styles.button}>
            <Text style={styles.buttonText}>{i18.errorBoundaryRetry}</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: colors.detailBg,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  title: {
    color: colors.detailText,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  copy: {
    color: colors.detailMuted,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.marketsAccent,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: { color: colors.detailText, fontSize: 15, fontWeight: '700' },
});
