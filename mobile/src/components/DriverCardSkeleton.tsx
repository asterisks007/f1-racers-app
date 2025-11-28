import React from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {SkeletonLoader} from './SkeletonLoader';

/**
 * DriverCardSkeleton Component
 * Skeleton loader for driver cards during initial load
 * Matches the layout of the actual DriverCard component
 */
export const DriverCardSkeleton: React.FC = () => {
  return (
    <View style={[styles.container, Platform.OS === 'ios' && styles.iosContainer]}>
      {/* Image skeleton */}
      <SkeletonLoader width="100%" height={200} borderRadius={8} />

      {/* Content skeleton */}
      <View style={styles.contentContainer}>
        {/* Name and standing row */}
        <View style={styles.headerRow}>
          <SkeletonLoader width="60%" height={20} borderRadius={4} />
          <SkeletonLoader width={40} height={40} borderRadius={20} />
        </View>

        {/* Nationality */}
        <SkeletonLoader
          width="40%"
          height={16}
          borderRadius={4}
          style={styles.detailSkeleton}
        />

        {/* Team */}
        <SkeletonLoader
          width="50%"
          height={16}
          borderRadius={4}
          style={styles.detailSkeleton}
        />

        {/* Champion badge placeholder */}
        <SkeletonLoader
          width="30%"
          height={24}
          borderRadius={12}
          style={styles.badgeSkeleton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  iosContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  contentContainer: {
    marginTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailSkeleton: {
    marginBottom: 4,
  },
  badgeSkeleton: {
    marginTop: 8,
  },
});
