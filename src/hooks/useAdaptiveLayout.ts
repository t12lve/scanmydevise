import { useWindowDimensions } from 'react-native';

export function useAdaptiveLayout() {
  const { width, height } = useWindowDimensions();

  // A common breakpoint for foldable devices (e.g., Galaxy Z Fold) is 600dp.
  const isFoldable = width >= 600;

  return {
    isFoldable,
    width,
    height,
  };
}
