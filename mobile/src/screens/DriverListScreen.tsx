import React, {useEffect, useState, useMemo} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  SafeAreaView,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import {useAppState, useAppDispatch} from '../context/AppContext';
import {driverService} from '../services/DriverService';
import {SearchBar} from '../components/SearchBar';
import {DriverCard} from '../components/DriverCard';
import {DriverCardSkeleton} from '../components/DriverCardSkeleton';
import {useTypedNavigation} from '../navigation/hooks';
import {Driver} from '../models';
import {getScrollConfig, getPlatformPressHandler, getRippleConfig, useAndroidBackHandler} from '../utils/platformBehaviors';
import {useScaledFontSizes} from '../utils/accessibility';
import ImageCacheService from '../services/ImageCacheService';

/**
 * Calculate number of columns based on screen width
 * @param width - Screen width in dp
 * @returns Number of columns for grid layout
 */
export const calculateColumns = (width: number): number => {
  if (width < 600) {
    // Small screens (phones): 1-2 columns
    return width < 400 ? 1 : 2;
  } else {
    // Large screens (tablets): 3+ columns
    // Ensure minimum of 3 columns for tablets
    return Math.max(3, Math.floor(width / 300));
  }
};

/**
 * DriverListScreen Component
 * Main screen displaying searchable list of F1 drivers
 * Features:
 * - Searchable driver list
 * - Loading states
 * - Error handling with retry
 * - Empty state for no results
 * - Optimized FlatList rendering
 * - Responsive grid layout
 */
export const DriverListScreen: React.FC = () => {
  const navigation = useTypedNavigation();
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const {width} = useWindowDimensions();
  const flatListRef = React.useRef<FlatList>(null);
  const [scrollOffset, setScrollOffset] = React.useState(0);
  const previousNumColumns = React.useRef<number>(0);
  const scrollConfig = getScrollConfig();
  const [refreshing, setRefreshing] = React.useState(false);

  // Use scaled font sizes for accessibility
  const scaledFonts = useScaledFontSizes({
    loading: 16,
    errorTitle: 24,
    errorMessage: 16,
    retryButton: 16,
    emptyTitle: 20,
    emptyMessage: 16,
  });

  // Handle Android back button
  useAndroidBackHandler(() => {
    // Return false to allow default back behavior
    return false;
  });

  // Load drivers on mount
  useEffect(() => {
    loadDrivers();
  }, []);

  // Preload visible images when drivers are loaded
  useEffect(() => {
    if (state.drivers.length > 0) {
      // Preload first 10 driver images (visible on initial render)
      const visibleDrivers = state.drivers.slice(0, 10);
      const imageUrls = visibleDrivers.map(d => d.imageUrl);
      ImageCacheService.preloadImages(imageUrls);
    }
  }, [state.drivers]);

  /**
   * Load drivers from service
   */
  const loadDrivers = async () => {
    dispatch({type: 'LOAD_DRIVERS_START'});
    
    try {
      const drivers = await driverService.loadDrivers();
      const sortedDrivers = driverService.sortByStanding(drivers);
      dispatch({type: 'LOAD_DRIVERS_SUCCESS', payload: sortedDrivers});
    } catch (error) {
      dispatch({
        type: 'LOAD_DRIVERS_ERROR',
        payload: error instanceof Error ? error : new Error('Failed to load drivers'),
      });
    }
  };

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const drivers = await driverService.loadDrivers();
      const sortedDrivers = driverService.sortByStanding(drivers);
      dispatch({type: 'LOAD_DRIVERS_SUCCESS', payload: sortedDrivers});
    } catch (error) {
      // Silently fail on refresh - data is already loaded
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Handle retry button press - memoized
   */
  const handleRetry = React.useCallback(
    getPlatformPressHandler(() => {
      loadDrivers();
    }, 'impactMedium'),
    []
  );

  /**
   * Handle search query change - memoized
   */
  const handleSearchChange = React.useCallback((query: string) => {
    setLocalSearchQuery(query);
    dispatch({type: 'SET_SEARCH_QUERY', payload: query});
  }, [dispatch]);

  /**
   * Filter drivers based on search query
   */
  const filteredDrivers = useMemo(() => {
    return driverService.searchDrivers(state.drivers, localSearchQuery);
  }, [state.drivers, localSearchQuery]);

  /**
   * Calculate number of columns based on screen width
   */
  const numColumns = useMemo(() => {
    return calculateColumns(width);
  }, [width]);

  /**
   * Handle scroll position tracking - memoized
   */
  const handleScroll = React.useCallback((event: any) => {
    const offset = event.nativeEvent.contentOffset.y;
    setScrollOffset(offset);
  }, []);

  /**
   * Restore scroll position after orientation change
   */
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    
    // Check if numColumns changed (orientation change)
    if (previousNumColumns.current !== 0 && previousNumColumns.current !== numColumns) {
      // Restore scroll position after layout update
      timer = setTimeout(() => {
        if (flatListRef.current && scrollOffset > 0) {
          flatListRef.current.scrollToOffset({
            offset: scrollOffset,
            animated: false,
          });
        }
      }, 100);
    }
    
    previousNumColumns.current = numColumns;
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [numColumns, scrollOffset]);

  /**
   * Handle driver card press - navigate to detail screen - memoized
   */
  const handleDriverPress = React.useCallback((driver: Driver) => {
    navigation.navigate('DriverDetail', {driverId: driver.id});
  }, [navigation]);

  /**
   * Render individual driver card - memoized
   * Note: isVisible is always true as FlatList handles viewability internally
   * Images are loaded on-demand through react-native-fast-image
   */
  const renderDriverCard = React.useCallback(({item}: {item: Driver}) => (
    <View style={styles.cardContainer}>
      <DriverCard driver={item} onPress={() => handleDriverPress(item)} isVisible={true} />
    </View>
  ), [handleDriverPress]);

  /**
   * Key extractor for FlatList - memoized
   */
  const keyExtractor = React.useCallback((item: Driver) => item.id, []);

  /**
   * Get item layout for FlatList optimization
   * Enables FlatList to skip measurement of items for better performance
   * Assumes consistent item heights
   */
  const getItemLayout = React.useCallback(
    (_data: Driver[] | null | undefined, index: number) => {
      const ITEM_HEIGHT = 340; // Approximate height of DriverCard (200px image + 140px content)
      const ITEM_MARGIN = 16; // Total vertical margin (8px top + 8px bottom)
      const totalHeight = ITEM_HEIGHT + ITEM_MARGIN;
      
      return {
        length: totalHeight,
        offset: totalHeight * index,
        index,
      };
    },
    []
  );

  /**
   * Render skeleton item - memoized
   */
  const renderSkeletonItem = React.useCallback(() => (
    <View style={styles.cardContainer}>
      <DriverCardSkeleton />
    </View>
  ), []);

  /**
   * Render empty state for no search results - memoized
   */
  const renderEmptyState = React.useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, {fontSize: scaledFonts.emptyTitle}]}>No drivers found</Text>
      <Text style={[styles.emptyMessage, {fontSize: scaledFonts.emptyMessage}]}>
        Try adjusting your search to find what you're looking for
      </Text>
    </View>
  ), [scaledFonts.emptyTitle, scaledFonts.emptyMessage]);

  /**
   * Render loading state with skeleton screens
   */
  if (state.isLoading) {
    return (
      <SafeAreaView style={styles.container} accessibilityLabel="Loading drivers">
        <FlatList
          data={[1, 2, 3, 4]}
          renderItem={renderSkeletonItem}
          keyExtractor={(item) => `skeleton-${item}`}
          numColumns={numColumns}
          contentContainerStyle={styles.listContent}
          key={`skeleton-flatlist-${numColumns}`}
          windowSize={5}
          maxToRenderPerBatch={4}
          removeClippedSubviews={true}
        />
      </SafeAreaView>
    );
  }

  /**
   * Render error state
   */
  if (state.error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorTitle, {fontSize: scaledFonts.errorTitle}]}>Oops!</Text>
          <Text style={[styles.errorMessage, {fontSize: scaledFonts.errorMessage}]}>
            {state.error.message || 'Failed to load drivers'}
          </Text>
          <Pressable
            style={styles.retryButton}
            onPress={handleRetry}
            accessibilityLabel="Retry loading drivers"
            accessibilityRole="button"
            {...getRippleConfig('#FFFFFF')}>
            <Text style={[styles.retryButtonText, {fontSize: scaledFonts.retryButton}]}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar
        value={localSearchQuery}
        onChangeText={handleSearchChange}
        placeholder="Search drivers..."
      />
      <FlatList
        ref={flatListRef}
        key={`flatlist-${numColumns}`}
        data={filteredDrivers}
        renderItem={renderDriverCard}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        accessibilityLabel="Driver list"
        refreshing={refreshing}
        onRefresh={handleRefresh}
        // Performance optimizations
        getItemLayout={numColumns === 1 ? getItemLayout : undefined}
        windowSize={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        removeClippedSubviews={true}
        {...scrollConfig}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    padding: 8,
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
