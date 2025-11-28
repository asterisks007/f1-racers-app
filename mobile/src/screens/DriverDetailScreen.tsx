import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {Driver} from '../models';
import {driverService} from '../services/DriverService';
import {ChampionBadge} from '../components/ChampionBadge';
import {StandingIndicator} from '../components/StandingIndicator';
import {DriverDetailSkeleton} from '../components/DriverDetailSkeleton';
import ImageCacheService from '../services/ImageCacheService';
import {useTypedRoute} from '../navigation/hooks';
import {getScrollConfig} from '../utils/platformBehaviors';
import {useScaledFontSizes} from '../utils/accessibility';
import {DRIVER_PLACEHOLDER} from '../assets';

/**
 * DriverDetailScreen Component
 * Displays comprehensive driver information including:
 * - Large driver portrait
 * - Name, nationality, team
 * - Current standing
 * - Career statistics (points, wins)
 * - Championship years (if applicable)
 */
export const DriverDetailScreen: React.FC = () => {
  const route = useTypedRoute<'DriverDetail'>();
  const {driverId} = route.params;

  const [driver, setDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [cachedImageUrl, setCachedImageUrl] = useState<string>('');
  const scrollConfig = getScrollConfig();

  // Use scaled font sizes for accessibility
  const scaledFonts = useScaledFontSizes({
    loading: 16,
    errorTitle: 24,
    errorMessage: 16,
    placeholder: 72,
    name: 28,
    sectionTitle: 18,
    info: 16,
    championshipYears: 16,
  });

  useEffect(() => {
    loadDriver();
  }, [driverId]);

  useEffect(() => {
    if (driver?.imageUrl) {
      // Get cached image URL
      ImageCacheService.getCachedImage(driver.imageUrl)
        .then(url => setCachedImageUrl(url))
        .catch(() => setCachedImageUrl(driver.imageUrl));
    }
  }, [driver?.imageUrl]);

  /**
   * Load driver data by ID
   */
  const loadDriver = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const driverData = await driverService.getDriverById(driverId);
      
      if (!driverData) {
        throw new Error('Driver not found');
      }

      setDriver(driverData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load driver'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  /**
   * Render loading state with skeleton screen
   */
  if (isLoading) {
    return <DriverDetailSkeleton />;
  }

  /**
   * Render error state
   */
  if (error || !driver) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorTitle, {fontSize: scaledFonts.errorTitle}]}>Oops!</Text>
          <Text style={[styles.errorMessage, {fontSize: scaledFonts.errorMessage}]}>
            {error?.message || 'Driver not found'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const imageAccessibilityLabel = `${driver.name} portrait`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        accessibilityLabel="Driver details"
        {...scrollConfig}>
        {/* Large Driver Image */}
        <View style={styles.imageContainer}>
          {imageError ? (
            <Image
              style={styles.image}
              source={DRIVER_PLACEHOLDER}
              resizeMode="cover"
              accessibilityLabel={imageAccessibilityLabel}
            />
          ) : (
            <>
              <FastImage
                style={styles.image}
                source={{
                  uri: cachedImageUrl,
                  priority: FastImage.priority.high,
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
          )}
        </View>

        {/* Driver Details */}
        <View style={styles.detailsContainer}>
          {/* Name and Standing */}
          <View style={styles.headerRow}>
            <Text
              style={[styles.nameText, {fontSize: scaledFonts.name}]}
              accessibilityLabel={`Driver name: ${driver.name}`}
              accessibilityRole="header">
              {driver.name}
            </Text>
            <StandingIndicator position={driver.currentStanding} />
          </View>

          {/* Champion Badge */}
          {driver.isWorldChampion && (
            <View style={styles.championBadgeContainer}>
              <ChampionBadge
                isWorldChampion={driver.isWorldChampion}
                championshipYears={driver.championshipYears}
              />
            </View>
          )}

          {/* Basic Info Section */}
          <View style={styles.section}>
            <InfoRow
              label="Nationality"
              value={driver.nationality}
              accessibilityLabel={`Nationality: ${driver.nationality}`}
              fontSize={scaledFonts.info}
            />
            <InfoRow
              label="Team"
              value={driver.team}
              accessibilityLabel={`Team: ${driver.team}`}
              fontSize={scaledFonts.info}
            />
          </View>

          {/* Career Statistics Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {fontSize: scaledFonts.sectionTitle}]} accessibilityRole="header">
              Career Statistics
            </Text>
            <InfoRow
              label="Career Points"
              value={driver.careerPoints.toString()}
              accessibilityLabel={`Career points: ${driver.careerPoints}`}
              fontSize={scaledFonts.info}
            />
            <InfoRow
              label="Race Wins"
              value={driver.raceWins.toString()}
              accessibilityLabel={`Race wins: ${driver.raceWins}`}
              fontSize={scaledFonts.info}
            />
          </View>

          {/* Championship Years Section */}
          {driver.isWorldChampion && driver.championshipYears.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, {fontSize: scaledFonts.sectionTitle}]} accessibilityRole="header">
                Championship Years
              </Text>
              <Text
                style={[styles.championshipYearsText, {fontSize: scaledFonts.championshipYears}]}
                accessibilityLabel={`Championship years: ${driver.championshipYears.join(', ')}`}>
                {driver.championshipYears.join(', ')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * InfoRow Component
 * Displays a label-value pair in the detail screen
 */
interface InfoRowProps {
  label: string;
  value: string;
  accessibilityLabel: string;
  fontSize: number;
}

const InfoRow: React.FC<InfoRowProps> = ({label, value, accessibilityLabel, fontSize}) => (
  <View style={styles.infoRow}>
    <Text style={[styles.infoLabel, {fontSize}]}>{label}</Text>
    <Text style={[styles.infoValue, {fontSize}]} accessibilityLabel={accessibilityLabel}>
      {value}
    </Text>
  </View>
);

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
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: '100%',
    height: 400,
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
    fontSize: 72,
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
  detailsContainer: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  nameText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  championBadgeContainer: {
    marginBottom: 20,
    alignSelf: 'flex-start',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  championshipYearsText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});
