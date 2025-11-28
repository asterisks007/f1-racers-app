import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useScaledFontSizes} from '../utils/accessibility';

interface StandingIndicatorProps {
  /** Current standing position (0 if not ranked) */
  position: number;
}

/**
 * StandingIndicator Component
 * Displays the driver's current championship standing position
 * Handles zero standing display (shows "-" for unranked drivers)
 * Memoized for performance
 */
const StandingIndicatorComponent: React.FC<StandingIndicatorProps> = ({
  position,
}) => {
  // Use scaled font sizes for accessibility
  const scaledFonts = useScaledFontSizes({
    position: 16,
  });

  const displayText = position === 0 ? '-' : `${position}`;
  const accessibilityLabel =
    position === 0
      ? 'Not currently ranked'
      : `Current standing: position ${position}`;

  return (
    <View style={styles.container} accessibilityLabel={accessibilityLabel}>
      <Text style={[styles.positionText, {fontSize: scaledFonts.position}]}>{displayText}</Text>
    </View>
  );
};

// Memoize component to prevent unnecessary re-renders
export const StandingIndicator = React.memo(StandingIndicatorComponent, (prevProps, nextProps) => {
  return prevProps.position === nextProps.position;
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
