import { Platform, BackHandler } from 'react-native';
import { useEffect } from 'react';

/**
 * Trigger haptic feedback on iOS
 * On Android, this is a no-op as ripple effects provide visual feedback
 * @param type - Type of haptic feedback
 */
export const triggerHapticFeedback = (
  type: 'selection' | 'impactLight' | 'impactMedium' | 'impactHeavy' | 'notificationSuccess' | 'notificationWarning' | 'notificationError'
) => {
  if (Platform.OS === 'ios') {
    // iOS haptic feedback
    // Note: In a real implementation, you would use react-native-haptic-feedback
    // For now, we'll use a placeholder that can be replaced with the actual library
    try {
      // Placeholder for haptic feedback
      // In production, use: ReactNativeHapticFeedback.trigger(type);
      console.log(`Haptic feedback triggered: ${type}`);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }
  // Android uses ripple effects instead of haptic feedback
};

/**
 * Get ripple configuration for Android
 * Returns undefined for iOS (uses opacity instead)
 * @param color - Ripple color (optional)
 * @returns Ripple configuration object or undefined
 */
export const getRippleConfig = (color?: string) => {
  if (Platform.OS === 'android') {
    return {
      android_ripple: {
        color: color || 'rgba(0, 0, 0, 0.12)',
        borderless: false,
      },
    };
  }
  return undefined;
};

/**
 * Get platform-specific press behavior
 * iOS: Opacity change
 * Android: Ripple effect
 */
export const getPlatformPressConfig = () => {
  if (Platform.OS === 'ios') {
    return {
      activeOpacity: 0.7,
    };
  }
  return {
    activeOpacity: 1, // No opacity change on Android (ripple handles it)
  };
};

/**
 * Hook to handle Android back button
 * @param handler - Function to call when back button is pressed
 * @returns boolean - true if back press was handled, false otherwise
 */
export const useAndroidBackHandler = (handler: () => boolean): void => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handler
      );

      return () => backHandler.remove();
    }
    return undefined;
  }, [handler]);
};

/**
 * Get platform-specific scroll behavior configuration
 * iOS: Bounce effect enabled
 * Android: Standard scroll behavior
 */
export const getScrollConfig = () => {
  return {
    bounces: Platform.OS === 'ios', // iOS bounce scrolling
    overScrollMode: Platform.OS === 'android' ? ('always' as const) : undefined,
  };
};

/**
 * Get platform-specific button press handler
 * Combines haptic feedback (iOS) with the actual press handler
 * @param onPress - The actual press handler
 * @param hapticType - Type of haptic feedback (iOS only)
 * @returns Combined press handler
 */
export const getPlatformPressHandler = (
  onPress: () => void,
  hapticType: 'selection' | 'impactLight' | 'impactMedium' = 'selection'
) => {
  return () => {
    if (Platform.OS === 'ios') {
      triggerHapticFeedback(hapticType);
    }
    onPress();
  };
};

/**
 * Platform-specific animation configurations
 */
export const platformAnimations = {
  // iOS uses spring animations
  ios: {
    type: 'spring',
    damping: 20,
    stiffness: 90,
  },
  // Android uses timing animations
  android: {
    type: 'timing',
    duration: 250,
  },
};

/**
 * Get platform-specific animation config
 */
export const getAnimationConfig = () => {
  return Platform.OS === 'ios' ? platformAnimations.ios : platformAnimations.android;
};
