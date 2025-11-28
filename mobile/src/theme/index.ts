import { Platform, useColorScheme } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { iosLightTheme, iosDarkTheme, iosSpacing, iosShadows, iosHighContrastLightTheme, iosHighContrastDarkTheme } from './iosTheme';
import { androidLightTheme, androidDarkTheme, androidSpacing, androidElevation, androidHighContrastLightTheme, androidHighContrastDarkTheme } from './androidTheme';
import { isHighContrastEnabled } from '../utils/accessibility';

/**
 * Get the appropriate theme based on platform, color scheme, and high contrast mode
 * @param isDark - Whether dark mode is enabled
 * @param isHighContrast - Whether high contrast mode is enabled
 * @returns The appropriate theme for the current platform and settings
 */
export const getTheme = (isDark: boolean, isHighContrast: boolean = false): MD3Theme => {
  if (Platform.OS === 'ios') {
    if (isHighContrast) {
      return isDark ? iosHighContrastDarkTheme : iosHighContrastLightTheme;
    }
    return isDark ? iosDarkTheme : iosLightTheme;
  } else {
    if (isHighContrast) {
      return isDark ? androidHighContrastDarkTheme : androidHighContrastLightTheme;
    }
    return isDark ? androidDarkTheme : androidLightTheme;
  }
};

/**
 * Hook to get the current theme based on system appearance and accessibility settings
 * Automatically detects dark mode and high contrast mode
 * @returns The current theme based on platform, appearance, and accessibility settings
 */
export const useAppTheme = (): MD3Theme => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isHighContrast = isHighContrastEnabled();
  return getTheme(isDark, isHighContrast);
};

/**
 * Get platform-specific spacing values
 */
export const getSpacing = () => {
  return Platform.OS === 'ios' ? iosSpacing : androidSpacing;
};

/**
 * Get platform-specific shadow or elevation styles
 * iOS uses shadows, Android uses elevation
 */
export const getPlatformShadow = (level: 'small' | 'medium' | 'large') => {
  if (Platform.OS === 'ios') {
    return iosShadows[level];
  } else {
    // Map shadow levels to elevation
    const elevationMap = {
      small: androidElevation.level1,
      medium: androidElevation.level3,
      large: androidElevation.level6,
    };
    return { elevation: elevationMap[level] };
  }
};

// Export individual themes for testing and direct use
export { 
  iosLightTheme, 
  iosDarkTheme, 
  iosHighContrastLightTheme, 
  iosHighContrastDarkTheme, 
  iosSpacing, 
  iosShadows 
};
export { 
  androidLightTheme, 
  androidDarkTheme, 
  androidHighContrastLightTheme, 
  androidHighContrastDarkTheme, 
  androidSpacing, 
  androidElevation 
};
