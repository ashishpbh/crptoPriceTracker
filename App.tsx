import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import { RootNavigator } from '@/navigation/RootNavigator';
import { SplashOverlay, useSplashVisible } from '@/screens/splash';

function App() {
  const showSplash = useSplashVisible();

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0B0E11" />
        <AppErrorBoundary>
          <RootNavigator />
        </AppErrorBoundary>
        {showSplash ? <SplashOverlay /> : null}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default App;
