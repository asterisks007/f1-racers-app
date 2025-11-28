import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated, Platform} from 'react-native';
import {useReducedMotion} from '../utils/reducedMotion';

interface SkeletonLoaderProps {
  /** Width of the skeleton element */
  width?: number | string;
  /** Height of the skeleton element */
  height?: number | string;
  /** Border radius of the skeleton element */
  borderRadius?: number;
  /** Style overrides */
  style?: any;
}

/**
 * SkeletonLoader Component
 * Displays an animated placeholder during content loading
 * Provides a shimmer effect to indicate loading state
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const isReducedMotion = useReducedMotion();

  useEffect(() => {
    // Skip animation if reduced motion is enabled
    if (isReducedMotion) {
      animatedValue.setValue(0.5);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue, isReducedMotion]);

  const opacity = isReducedMotion
    ? 0.5
    : animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
      });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e0e0e0',
  },
});
