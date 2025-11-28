import React from 'react';
import {View, StyleSheet, ScrollView, SafeAreaView, Platform} from 'react-native';
import {SkeletonLoader} from './SkeletonLoader';

/**
 * DriverDetailSkeleton Component
 * Skeleton loader for driver detail screen during initial load
 * Matches the layout of the actual DriverDetailScreen component
 */
export const DriverDetailSkeleton: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Large image skeleton */}
        <SkeletonLoader width="100%" height={400} borderRadius={0} />

        {/* Details container */}
        <View style={styles.detailsContainer}>
          {/* Name and standing row */}
          <View style={styles.headerRow}>
            <SkeletonLoader width="60%" height={28} borderRadius={4} />
            <SkeletonLoader width={50} height={50} borderRadius={25} />
          </View>

          {/* Champion badge */}
          <SkeletonLoader
            width="40%"
            height={32}
            borderRadius={16}
            style={styles.championBadge}
          />

          {/* Basic info section */}
          <View style={styles.section}>
            <View style={styles.infoRow}>
              <SkeletonLoader width="30%" height={16} borderRadius={4} />
              <SkeletonLoader width="40%" height={16} borderRadius={4} />
            </View>
            <View style={styles.infoRow}>
              <SkeletonLoader width="25%" height={16} borderRadius={4} />
              <SkeletonLoader width="50%" height={16} borderRadius={4} />
            </View>
          </View>

          {/* Career statistics section */}
          <View style={styles.section}>
            <SkeletonLoader
              width="50%"
              height={18}
              borderRadius={4}
              style={styles.sectionTitle}
            />
            <View style={styles.infoRow}>
              <SkeletonLoader width="35%" height={16} borderRadius={4} />
              <SkeletonLoader width="25%" height={16} borderRadius={4} />
            </View>
            <View style={styles.infoRow}>
              <SkeletonLoader width="30%" height={16} borderRadius={4} />
              <SkeletonLoader width="20%" height={16} borderRadius={4} />
            </View>
          </View>

          {/* Championship years section */}
          <View style={styles.section}>
            <SkeletonLoader
              width="55%"
              height={18}
              borderRadius={4}
              style={styles.sectionTitle}
            />
            <SkeletonLoader width="70%" height={16} borderRadius={4} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  detailsContainer: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  championBadge: {
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
});
