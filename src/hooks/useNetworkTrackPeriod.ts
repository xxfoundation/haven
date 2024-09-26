import useLocalStorage from './useLocalStorage'
import { useCallback } from 'react';
import { FAST_MODE_TRACKING_PERIOD_MS, SLOW_MODE_TRACKING_PERIOD_MS } from 'src/constants';

const useTrackNetworkPeriod = () => {
  const [trackingMode, setMode] = useLocalStorage<'slow' | 'fast'>('TRACK_NETWORK_PERIOD', 'fast');

  const toggle = useCallback(() => {
    setMode(trackingMode === 'fast' ? 'slow' : 'fast');
  }, [trackingMode, setMode]);

  return {
    trackingMode,
    trackingMs: trackingMode === 'slow'
      ? SLOW_MODE_TRACKING_PERIOD_MS
      : FAST_MODE_TRACKING_PERIOD_MS,
    toggle,
  }
};

export default useTrackNetworkPeriod;
