import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useScaledFontSizes} from '../utils/accessibility';

interface ChampionBadgeProps {
  /** Whether the driver is a world champion */
  isWorldChampion: boolean;
  /** Array of championship years (should be in chronological order) */
  championshipYears: number[];
}

/**
 * ChampionBadge Component
 * Displays a trophy icon and championship years for world champions
 * Only renders if the driver is a world champion
 * Memoized for performance
 */
const ChampionBadgeComponent: React.FC<ChampionBadgeProps> = ({
  isWorldChampion,
  championshipYears,
}) => {
  // Use scaled font sizes for accessibility
  const scaledFonts = useScaledFontSizes({
    trophy: 14,
    years: 12,
  });

  // Don't render anything if not a world champion
  if (!isWorldChampion) {
    return null;
  }

  // Sort years in chronological order (ascending) - memoized
  const sortedYears = React.useMemo(
    () => [...championshipYears].sort((a, b) => a - b),
    [championshipYears]
  );
  const yearsText = sortedYears.join(', ');
  const accessibilityLabel = `World Champion: ${yearsText}`;

  return (
    <View style={styles.container} accessibilityLabel={accessibilityLabel}>
      <Text style={[styles.trophy, {fontSize: scaledFonts.trophy}]}>🏆</Text>
      <Text style={[styles.yearsText, {fontSize: scaledFonts.years}]}>{yearsText}</Text>
    </View>
  );
};

// Memoize component to prevent unnecessary re-renders
export const ChampionBadge = React.memo(ChampionBadgeComponent, (prevProps, nextProps) => {
  return (
    prevProps.isWorldChampion === nextProps.isWorldChampion &&
    JSON.stringify(prevProps.championshipYears) === JSON.stringify(nextProps.championshipYears)
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  trophy: {
    fontSize: 14,
  },
  yearsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});
