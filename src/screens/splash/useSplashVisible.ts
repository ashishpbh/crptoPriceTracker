import { useEffect, useState } from 'react';

import { SPLASH_DURATION_MS } from './splashConstants';

/** Shows splash on mount, then hides after the minimum duration. */
export function useSplashVisible(durationMs = SPLASH_DURATION_MS) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), durationMs);
    return () => clearTimeout(timer);
  }, [durationMs]);

  return visible;
}
