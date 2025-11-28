import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {Driver} from '../models';
import {ChampionBadge} from './ChampionBadge';
import {StandingIndicator} from './StandingIndicator';
import ImageCacheService from '../services/ImageCacheService';
import {getPlatformPressHandler, getRippleConfig, getPlatformPressConfig} from '../utils/platformBehaviors';
import {useScaledFontSizes} from '../utils/accessibility';
import {DRIVER_PLACEHOLDER} from '../assets';

interface DriverCardProps {
  /** Driver data to display */
  driver: Driver;
  /** Callback when card is pressed */
  onPress: () => void;
  /** Whether the card is visible on screen (for lazy loading) */
  isVisible?: boolean;
}

/**
 * DriverCard Component
 * Displays driver information in a card format with image, details, and badges
 * Handles image loading errors with placeholder fallback
 * Implements platform-specific styling
 * Supports lazy loading for performance optimization
 * Memoized for performance
 */
const DriverCardComponent: React.FC<DriverCardProps> = ({driver, onPress, isVisible = true}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [cachedImageUrl, setCachedImageUrl] = useState(driver.imageUrl);
  const [shouldLoadImage, setShouldLoadImage] = useState(isVisible);

  // Use scaled font sizes for accessibility
  const scaledFonts = useScaledFontSizes({
    name: 18,
    detail: 14,
    placeholder: 48,
  });

  // Lazy load images only when visible
  useEffect(() => {
    if (isVisible && !shouldLoadImage) {
      setShouldLoadImage(true);
    }
  }, [isVisible, shouldLoadImage]);

  useEffect(() => {
    // Only load image if it should be loaded (lazy loading)
    if (shouldLoadImage) {
      ImageCacheService.getCachedImage(driver.imageUrl)
        .then(url => setCachedImageUrl(url))
        .catch(() => setCachedImageUrl(driver.imageUrl));
    }
  }, [driver.imageUrl, shouldLoadImage]);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const imageAccessibilityLabel = `${driver.name} portrait`;
  const pressConfig = getPlatformPressConfig();
  const handlePress = getPlatformPressHandler(onPress, 'impactLight');

  return (
    <Pressable
      style={[styles.container, Platform.OS === 'ios' && styles.iosContainer]}
      onPress={handlePress}
      accessibilityLabel={`Driver card for ${driver.name}`}
      accessibilityRole="button"
      {...pressConfig}
      {...(Platform.OS === 'android' && getRippleConfig())}>
      <View style={styles.imageContainer}>
        {imageError ? (
          <Image
            style={styles.image}
            source={DRIVER_PLACEHOLDER}
            resizeMode="cover"
            accessibilityLabel={imageAccessibilityLabel}
          />
        ) : shouldLoadImage ? (
          <>
            <FastImage
              style={styles.image}
              source={{
                uri: cachedImageUrl,
                priority: FastImage.priority.normal,
              }}
              resizeMode={FastImage.resizeMode.cover}
              onError={handleImageError}
              onLoad={handleImageLoad}
              accessibilityLabel={imageAccessibilityLabel}
            />
            {imageLoading && (
              <View style={styles.imageLoadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
            )}
          </>
        ) : (
          <View style={styles.placeholderContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text
            style={[styles.nameText, {fontSize: scaledFonts.name}]}
            numberOfLines={1}
            accessibilityLabel={`Driver name: ${driver.name}`}>
            {driver.name}
          </Text>
          <StandingIndicator position={driver.currentStanding} />
        </View>

        <Text
          style={[styles.detailText, {fontSize: scaledFonts.detail}]}
          accessibilityLabel={`Nationality: ${driver.nationality}`}>
          {driver.nationality}
        </Text>
        <Text
          style={[styles.detailText, {fontSize: scaledFonts.detail}]}
          accessibilityLabel={`Team: ${driver.team}`}>
          {driver.team}
        </Text>

        {driver.isWorldChampion && (
          <View style={styles.badgeContainer}>
            <ChampionBadge
              isWorldChampion={driver.isWorldChampion}
              championshipYears={driver.championshipYears}
            />
          </View>
        )}
      </View>
    </Pressable>
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
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: '600',
    color: '#999',
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 245, 245, 0.8)',
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
  nameText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  badgeContainer: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
});

// Memoize component to prevent unnecessary re-renders
export const DriverCard = React.memo(DriverCardComponent, (prevProps, nextProps) => {
  // Only re-render if driver data, visibility, or onPress changes
  return (
    prevProps.driver.id === nextProps.driver.id &&
    prevProps.driver.imageUrl === nextProps.driver.imageUrl &&
    prevProps.driver.name === nextProps.driver.name &&
    prevProps.driver.currentStanding === nextProps.driver.currentStanding &&
    prevProps.driver.isWorldChampion === nextProps.driver.isWorldChampion &&
    prevProps.isVisible === nextProps.isVisible
  );
});
