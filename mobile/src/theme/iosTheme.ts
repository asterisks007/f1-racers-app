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
 * iOS Light Theme Configuration
 * Follows iOS Human Interface Guidelines
 * Uses SF Pro font family and iOS system colors
 */
export const iosLightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // iOS system colors
    primary: '#007AFF', // iOS blue
    onPrimary: '#FFFFFF',
    primaryContainer: '#E5F1FF',
    onPrimaryContainer: '#001D35',
    
    secondary: '#5856D6', // iOS purple
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E5E5EA',
    onSecondaryContainer: '#1C1C1E',
    
    tertiary: '#FF9500', // iOS orange
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FFE5CC',
    onTertiaryContainer: '#2D1600',
    
    error: '#FF3B30', // iOS red
    onError: '#FFFFFF',
    errorContainer: '#FFE5E5',
    onErrorContainer: '#410002',
    
    background: '#F2F2F7', // iOS light gray background
    onBackground: '#1C1C1E',
    
    surface: '#FFFFFF',
    onSurface: '#1C1C1E',
    surfaceVariant: '#F2F2F7',
    onSurfaceVariant: '#48484A',
    
    outline: '#C6C6C8',
    outlineVariant: '#E5E5EA',
    
    shadow: '#000000',
    scrim: '#000000',
    
    inverseSurface: '#1C1C1E',
    inverseOnSurface: '#F2F2F7',
    inversePrimary: '#64B5F6',
    
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#F9F9F9',
      level3: '#F2F2F7',
      level4: '#ECECEC',
      level5: '#E5E5EA',
    },
    
    surfaceDisabled: 'rgba(28, 28, 30, 0.12)',
    onSurfaceDisabled: 'rgba(28, 28, 30, 0.38)',
    backdrop: 'rgba(0, 0, 0, 0.4)',
  },
  fonts: {
    ...MD3LightTheme.fonts,
    // iOS uses SF Pro font family
    displayLarge: {
      fontFamily: 'System',
      fontSize: 57,
      fontWeight: '400',
      letterSpacing: 0,
      lineHeight: 64,
    },
    displayMedium: {
      fontFamily: 'System',
      fontSize: 45,
      fontWeight: '400',
      letterSpacing: 0,
      lineHeight: 52,
    },
    displaySmall: {
      fontFamily: 'System',
      fontSize: 36,
      fontWeight: '400',
      letterSpacing: 0,
      lineHeight: 44,
    },
    headlineLarge: {
      fontFamily: 'System',
      fontSize: 32,
      fontWeight: '600',
      letterSpacing: 0,
      lineHeight: 40,
    },
    headlineMedium: {
      fontFamily: 'System',
      fontSize: 28,
      fontWeight: '600',
      letterSpacing: 0,
      lineHeight: 36,
    },
    headlineSmall: {
      fontFamily: 'System',
      fontSize: 24,
      fontWeight: '600',
      letterSpacing: 0,
      lineHeight: 32,
    },
    titleLarge: {
      fontFamily: 'System',
      fontSize: 22,
      fontWeight: '600',
      letterSpacing: 0,
      lineHeight: 28,
    },
    titleMedium: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.15,
      lineHeight: 24,
    },
    titleSmall: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: 0.1,
      lineHeight: 20,
    },
    bodyLarge: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '400',
      letterSpacing: 0.5,
      lineHeight: 24,
    },
    bodyMedium: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '400',
      letterSpacing: 0.25,
      lineHeight: 20,
    },
    bodySmall: {
      fontFamily: 'System',
      fontSize: 12,
      fontWeight: '400',
      letterSpacing: 0.4,
      lineHeight: 16,
    },
    labelLarge: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: 0.1,
      lineHeight: 20,
    },
    labelMedium: {
      fontFamily: 'System',
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.5,
      lineHeight: 16,
    },
    labelSmall: {
      fontFamily: 'System',
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.5,
      lineHeight: 16,
    },
  },
  roundness: 10, // iOS uses more rounded corners
};

/**
 * iOS Dark Theme Configuration
 * Follows iOS Dark Mode guidelines
 */
export const iosDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // iOS dark mode colors
    primary: '#0A84FF', // iOS blue (dark mode)
    onPrimary: '#FFFFFF',
    primaryContainer: '#004A77',
    onPrimaryContainer: '#C2E7FF',
    
    secondary: '#5E5CE6', // iOS purple (dark mode)
    onSecondary: '#FFFFFF',
    secondaryContainer: '#3C3C43',
    onSecondaryContainer: '#E5E5EA',
    
    tertiary: '#FF9F0A', // iOS orange (dark mode)
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#4D2800',
    onTertiaryContainer: '#FFDDB3',
    
    error: '#FF453A', // iOS red (dark mode)
    onError: '#FFFFFF',
    errorContainer: '#93000A',
    onErrorContainer: '#FFDAD6',
    
    background: '#000000', // iOS dark background
    onBackground: '#E5E5EA',
    
    surface: '#1C1C1E', // iOS dark surface
    onSurface: '#E5E5EA',
    surfaceVariant: '#2C2C2E',
    onSurfaceVariant: '#AEAEB2',
    
    outline: '#636366',
    outlineVariant: '#3A3A3C',
    
    shadow: '#000000',
    scrim: '#000000',
    
    inverseSurface: '#E5E5EA',
    inverseOnSurface: '#1C1C1E',
    inversePrimary: '#006493',
    
    elevation: {
      level0: 'transparent',
      level1: '#1C1C1E',
      level2: '#2C2C2E',
      level3: '#3A3A3C',
      level4: '#48484A',
      level5: '#636366',
    },
    
    surfaceDisabled: 'rgba(229, 229, 234, 0.12)',
    onSurfaceDisabled: 'rgba(229, 229, 234, 0.38)',
    backdrop: 'rgba(0, 0, 0, 0.6)',
  },
  fonts: iosLightTheme.fonts, // Use same fonts as light theme
  roundness: 10,
};

/**
 * iOS-specific spacing values
 * Based on iOS Human Interface Guidelines
 */
export const iosSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * iOS-specific shadow styles
 */
export const iosShadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5.46,
  },
};

/**
 * iOS High Contrast Light Theme
 * Enhanced contrast ratios for better visibility
 */
export const iosHighContrastLightTheme: MD3Theme = {
  ...iosLightTheme,
  colors: {
    ...iosLightTheme.colors,
    // High contrast colors with increased contrast ratios
    primary: '#0000CC', // Darker blue for better contrast (WCAG AAA)
    onPrimary: '#FFFFFF',
    primaryContainer: '#CCDDFF',
    onPrimaryContainer: '#000033',
    
    secondary: '#4B0082', // Darker purple
    onSecondary: '#FFFFFF',
    secondaryContainer: '#D4D4E0',
    onSecondaryContainer: '#0A0A0F',
    
    tertiary: '#CC6600', // Darker orange
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FFD9B3',
    onTertiaryContainer: '#1A0900',
    
    error: '#CC0000', // Darker red
    onError: '#FFFFFF',
    errorContainer: '#FFD9D9',
    onErrorContainer: '#330000',
    
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
    inversePrimary: '#3366FF',
  },
};

/**
 * iOS High Contrast Dark Theme
 * Enhanced contrast ratios for better visibility in dark mode
 */
export const iosHighContrastDarkTheme: MD3Theme = {
  ...iosDarkTheme,
  colors: {
    ...iosDarkTheme.colors,
    // High contrast colors for dark mode
    primary: '#66B3FF', // Brighter blue for better contrast
    onPrimary: '#000000',
    primaryContainer: '#003366',
    onPrimaryContainer: '#E6F2FF',
    
    secondary: '#B399FF', // Brighter purple
    onSecondary: '#000000',
    secondaryContainer: '#2A2A33',
    onSecondaryContainer: '#F0F0F5',
    
    tertiary: '#FFB366', // Brighter orange
    onTertiary: '#000000',
    tertiaryContainer: '#331A00',
    onTertiaryContainer: '#FFE6CC',
    
    error: '#FF6666', // Brighter red
    onError: '#000000',
    errorContainer: '#660000',
    onErrorContainer: '#FFE6E6',
    
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
    inversePrimary: '#0044AA',
  },
};
