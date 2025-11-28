import {AccessibilityInfo} from 'react-native';
import {useState, useEffect} from 'react';

/**
 * Hook to detect if reduced motion is enabled
 * Returns true if the user has enabled reduced motion in system settings
 */
export const useReducedMotion = (): boolean => {
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);

  useEffect(() => {
    // Check initial state
    const checkReducedMotion = async () => {
      try {
        if (AccessibilityInfo && AccessibilityInfo.isReduceMotionEnabled) {
          const enabled = await AccessibilityInfo.isReduceMotionEnabled();
          setIsReducedMotionEnabled(enabled);
        }
      } catch (error) {
        // Silently fail - reduced motion will be disabled
        setIsReducedMotionEnabled(false);
      }
    };

    checkReducedMotion();

    // Listen for changes
    let subscription: any;
    if (AccessibilityInfo && AccessibilityInfo.addEventListener) {
      subscription = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        enabled => {
          setIsReducedMotionEnabled(enabled);
        }
      );
    }

    return () => {
      if (subscription && subscription.remove) {
        subscription.remove();
      }
    };
  }, []);

  return isReducedMotionEnabled;
};

/**
 * Get animation duration based on reduced motion setting
 * Returns 0 if reduced motion is enabled, otherwise returns the provided duration
 */
export const getAnimationDuration = (
  duration: number,
  isReducedMotion: boolean
): number => {
  return isReducedMotion ? 0 : duration;
};
