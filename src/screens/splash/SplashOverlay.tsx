import { Text } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { i18 } from '@/i18';
import { splashStyles as styles } from './styles';

export function SplashOverlay() {
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(320)}
      style={styles.root}>
      <Animated.View entering={ZoomIn.duration(420).springify().damping(14)} style={styles.mark}>
        <Text style={styles.markText}>C</Text>
      </Animated.View>
      <Text style={styles.brand}>{i18.splashBrand}</Text>
      <Text style={styles.tagline}>{i18.splashTagline}</Text>
      <Text style={styles.loading}>{i18.splashLoading}</Text>
    </Animated.View>
  );
}
