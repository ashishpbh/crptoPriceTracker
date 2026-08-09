import { Platform } from 'react-native';

/** Android emulator reaches the host machine via 10.0.2.2; iOS Simulator uses localhost. */
const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const marketConfig = {
  wsUrl: `ws://${host}:8080`,
  httpUrl: `http://${host}:3000`,
};
