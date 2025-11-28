import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { PixelRatio } from 'react-native';

/**
 * Get font scale for dynamic text sizing
 */
const getFontScale = () => PixelRatio.getFontScale();

/**
 * Scale font size with maximum limit
 */
const scaleFont = (size: number, maxScale: number = 2.0): number => {
  const scale = Math.min(getFontScale(), maxScale);
  return size * scale;
};

/**
 * Android Light Theme Configuration
 * Follows Material Design 3 guidelines
 * Uses Roboto font family and Material Design color system
 */
export const androidLightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Material Design 3 colors
    primary: '#1976D2', // Material blue
    onPrimary: '#FFFFFF',
    primaryContainer: '#BBDEFB',
    onPrimaryContainer: '#0D47A1',
    
    secondary: '#03A9F4', // Material light blue
    onSecondary: '#FFFFFF',
    secondaryContainer: '#B3E5FC',
    onSecondaryContainer: '#01579B',
    
    tertiary: '#FF6F00', // Material orange
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FFE0B2',
    onTertiaryContainer: '#E65100',
    
    error: '#D32F2F', // Material red
    onError: '#FFFFFF',
    errorContainer: '#FFCDD2',
    onErrorContainer: '#B71C1C',
    
    background: '#FAFAFA', // Material light background
    onBackground: '#212121',
    
    surface: '#FFFFFF',
    onSurface: '#212121',
    surfaceVariant: '#F5F5F5',
    onSurfaceVariant: '#616161',
    
    outline: '#BDBDBD',
    outlineVariant: '#E0E0E0',
    
    shadow: '#000000',
    scrim: '#000000',
    
    inverseSurface: '#212121',
    inverseOnSurface: '#FAFAFA',
    inversePrimary: '#64B5F6',
    
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#F5F5F5',
      level3: '#EEEEEE',
      level4: '#E0E0E0',
      level5: '#BDBDBD',
    },
    
    surfaceDisabled: 'rgba(33, 33, 33, 0.12)',
    onSurfaceDisabled: 'rgba(33, 33, 33, 0.38)',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  fonts: {
    ...MD3LightTheme.fonts,
    // Material Design uses Roboto font family
    displayLarge: {
      fontFamily: 'Roboto',
      fontSize: 57,
      fontWeight: '400',
      letterSpacing: -0.25,
      lineHeight: 64,
    },
    displayMedium: {
      fontFamily: 'Roboto',
      fontSize: 45,
      fontWeight: '400',
      letterSpacing: 0,
      lineHeight: 52,
    },
    displaySmall: {
      fontFamily: 'Roboto',
      fontSize: 36,
      fontWeight: '400',
      letterSpacing: 0,
      lineHeight: 44,
    },
    headlineLarge: {
      fontFamily: 'Roboto',
      fontSize: 32,
      fontWeight: '400',
      letterSpacing: 0,
      lineHeight: 40,
    },
    headlineMedium: {
      fontFamily: 'Roboto',
      fontSize: 28,
      fontWeight: '400',
      letterSpacing: 0,
      lineHeight: 36,
    },
    headlineSmall: {
      fontFamily: 'Roboto',
      fontSize: 24,
      fontWeight: '400',
      letterSpacing: 0,
      lineHeight: 32,
    },
    titleLarge: {
      fontFamily: 'Roboto',
      fontSize: 22,
      fontWeight: '500',
      letterSpacing: 0,
      lineHeight: 28,
    },
    titleMedium: {
      fontFamily: 'Roboto',
      fontSize: 16,
      fontWeight: '500',
      letterSpacing: 0.15,
      lineHeight: 24,
    },
    titleSmall: {
      fontFamily: 'Roboto',
      fontSize: 14,
      fontWeight: '500',
      letterSpacing: 0.1,
      lineHeight: 20,
    },
    bodyLarge: {
      fontFamily: 'Roboto',
      fontSize: 16,
      fontWeight: '400',
      letterSpacing: 0.5,
      lineHeight: 24,
    },
    bodyMedium: {
      fontFamily: 'Roboto',
      fontSize: 14,
      fontWeight: '400',
      letterSpacing: 0.25,
      lineHeight: 20,
    },
    bodySmall: {
      fontFamily: 'Roboto',
      fontSize: 12,
      fontWeight: '400',
      letterSpacing: 0.4,
      lineHeight: 16,
    },
    labelLarge: {
      fontFamily: 'Roboto',
      fontSize: 14,
      fontWeight: '500',
      letterSpacing: 0.1,
      lineHeight: 20,
    },
    labelMedium: {
      fontFamily: 'Roboto',
      fontSize: 12,
      fontWeight: '500',
      letterSpacing: 0.5,
      lineHeight: 16,
    },
    labelSmall: {
      fontFamily: 'Roboto',
      fontSize: 11,
      fontWeight: '500',
      letterSpacing: 0.5,
      lineHeight: 16,
    },
  },
  roundness: 4, // Material Design uses less rounded corners
};

/**
 * Android Dark Theme Configuration
 * Follows Material Design 3 dark theme guidelines
 */
export const androidDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Material Design 3 dark colors
    primary: '#90CAF9', // Material blue (dark)
    onPrimary: '#0D47A1',
    primaryContainer: '#1565C0',
    onPrimaryContainer: '#E3F2FD',
    
    secondary: '#81D4FA', // Material light blue (dark)
    onSecondary: '#01579B',
    secondaryContainer: '#0277BD',
    onSecondaryContainer: '#E1F5FE',
    
    tertiary: '#FFB74D', // Material orange (dark)
    onTertiary: '#E65100',
    tertiaryContainer: '#F57C00',
    onTertiaryContainer: '#FFF3E0',
    
    error: '#EF5350', // Material red (dark)
    onError: '#B71C1C',
    errorContainer: '#C62828',
    onErrorContainer: '#FFEBEE',
    
    background: '#121212', // Material dark background
    onBackground: '#E0E0E0',
    
    surface: '#1E1E1E', // Material dark surface
    onSurface: '#E0E0E0',
    surfaceVariant: '#2C2C2C',
    onSurfaceVariant: '#BDBDBD',
    
    outline: '#757575',
    outlineVariant: '#424242',
    
    shadow: '#000000',
    scrim: '#000000',
    
    inverseSurface: '#E0E0E0',
    inverseOnSurface: '#121212',
    inversePrimary: '#1976D2',
    
    elevation: {
      level0: 'transparent',
      level1: '#1E1E1E',
      level2: '#232323',
      level3: '#282828',
      level4: '#2C2C2C',
      level5: '#303030',
    },
    
    surfaceDisabled: 'rgba(224, 224, 224, 0.12)',
    onSurfaceDisabled: 'rgba(224, 224, 224, 0.38)',
    backdrop: 'rgba(0, 0, 0, 0.6)',
  },
  fonts: androidLightTheme.fonts, // Use same fonts as light theme
  roundness: 4,
};

/**
 * Material Design spacing values
 * Based on 8dp grid system
 */
export const androidSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Material Design elevation levels
 * Elevation is used instead of shadows on Android
 */
export const androidElevation = {
  level0: 0,
  level1: 1,
  level2: 2,
  level3: 3,
  level4: 4,
  level5: 6,
  level6: 8,
  level7: 12,
  level8: 16,
  level9: 24,
};

/**
 * Android High Contrast Light Theme
 * Enhanced contrast ratios for better visibility
 */
export const androidHighContrastLightTheme: MD3Theme = {
  ...androidLightTheme,
  colors: {
    ...androidLightTheme.colors,
    // High contrast colors with increased contrast ratios
    primary: '#0D47A1', // Darker blue for better contrast (WCAG AAA)
    onPrimary: '#FFFFFF',
    primaryContainer: '#BBDEFB',
    onPrimaryContainer: '#001A33',
    
    secondary: '#01579B', // Darker light blue
    onSecondary: '#FFFFFF',
    secondaryContainer: '#B3E5FC',
    onSecondaryContainer: '#001A26',
    
    tertiary: '#E65100', // Darker orange
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FFE0B2',
    onTertiaryContainer: '#1A0900',
    
    error: '#B71C1C', // Darker red
    onError: '#FFFFFF',
    errorContainer: '#FFCDD2',
    onErrorContainer: '#2D0000',
    
    background: '#FFFFFF', // Pure white
    onBackground: '#000000', // Pure black
    
    surface: '#FFFFFF',
    onSurface: '#000000',
    surfaceVariant: '#F0F0F0',
    onSurfaceVariant: '#1A1A1A',
    
    outline: '#000000', // Black borders for maximum contrast
    outlineVariant: '#666666',
    
    shadow: '#000000',
    scrim: '#000000',
    
    inverseSurface: '#000000',
    inverseOnSurface: '#FFFFFF',
    inversePrimary: '#2196F3',
  },
};

/**
 * Android High Contrast Dark Theme
 * Enhanced contrast ratios for better visibility in dark mode
 */
export const androidHighContrastDarkTheme: MD3Theme = {
  ...androidDarkTheme,
  colors: {
    ...androidDarkTheme.colors,
    // High contrast colors for dark mode
    primary: '#64B5F6', // Brighter blue for better contrast
    onPrimary: '#000000',
    primaryContainer: '#0D47A1',
    onPrimaryContainer: '#E3F2FD',
    
    secondary: '#4FC3F7', // Brighter light blue
    onSecondary: '#000000',
    secondaryContainer: '#01579B',
    onSecondaryContainer: '#E1F5FE',
    
    tertiary: '#FFB74D', // Brighter orange
    onTertiary: '#000000',
    tertiaryContainer: '#E65100',
    onTertiaryContainer: '#FFF3E0',
    
    error: '#EF5350', // Brighter red
    onError: '#000000',
    errorContainer: '#B71C1C',
    onErrorContainer: '#FFEBEE',
    
    background: '#000000', // Pure black
    onBackground: '#FFFFFF', // Pure white
    
    surface: '#0A0A0A',
    onSurface: '#FFFFFF',
    surfaceVariant: '#1A1A1A',
    onSurfaceVariant: '#E6E6E6',
    
    outline: '#FFFFFF', // White borders for maximum contrast
    outlineVariant: '#999999',
    
    shadow: '#000000',
    scrim: '#000000',
    
    inverseSurface: '#FFFFFF',
    inverseOnSurface: '#000000',
    inversePrimary: '#1976D2',
  },
};
