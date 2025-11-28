import { PixelRatio, Platform } from 'react-native';
import { useWindowDimensions } from 'react-native';

/**
 * Accessibility utilities for dynamic text scaling and high contrast support
 */

/**
 * Get the current font scale from the system
 * This respects the user's text size settings
 */
export const getFontScale = (): number => {
  return PixelRatio.getFontScale();
};

/**
 * Scale a font size based on the system font scale setting
 * @param size - Base font size
 * @param maxScale - Maximum scale factor (default: 2.0)
 * @returns Scaled font size
 */
export const scaleFontSize = (size: number, maxScale: number = 2.0): number => {
  const scale = getFontScale();
  // Limit the scale to prevent extremely large text
  const limitedScale = Math.min(scale, maxScale);
  return size * limitedScale;
};

/**
 * Hook to get scaled font sizes that respond to system text size settings
 * @param baseSizes - Object with base font sizes
 * @returns Object with scaled font sizes
 */
export const useScaledFontSizes = <T extends Record<string, number>>(
  baseSizes: T
): T => {
  const scale = getFontScale();
  const maxScale = 2.0;
  const limitedScale = Math.min(scale, maxScale);

  const scaledSizes = {} as T;
  for (const key in baseSizes) {
    scaledSizes[key] = (baseSizes[key] * limitedScale) as T[Extract<keyof T, string>];
  }

  return scaledSizes;
};

/**
 * Check if the user has enabled large text settings
 * @returns true if font scale is greater than 1.3
 */
export const isLargeTextEnabled = (): boolean => {
  return getFontScale() > 1.3;
};

/**
 * Get accessible minimum touch target size
 * iOS: 44x44 points, Android: 48x48 dp
 */
export const getMinimumTouchTargetSize = (): number => {
  return Platform.OS === 'ios' ? 44 : 48;
};

/**
 * Ensure a dimension meets minimum touch target size
 * @param size - Current size
 * @returns Size adjusted to meet minimum requirements
 */
export const ensureMinimumTouchTarget = (size: number): number => {
  const minSize = getMinimumTouchTargetSize();
  return Math.max(size, minSize);
};

/**
 * High Contrast Mode Support
 */

/**
 * Check if high contrast mode is enabled
 * Note: React Native doesn't have direct API for this on all platforms
 * This is a placeholder that can be enhanced with native modules
 * @returns true if high contrast mode is detected
 */
export const isHighContrastEnabled = (): boolean => {
  // On iOS, we can check via AccessibilityInfo
  // On Android, this would require a native module
  // For now, return false as a safe default
  // This can be enhanced with react-native-accessibility-info or custom native modules
  return false;
};

/**
 * Get high contrast color adjustments
 * Returns colors with increased contrast ratios for better visibility
 */
export interface HighContrastColors {
  text: string;
  background: string;
  primary: string;
  secondary: string;
  border: string;
  error: string;
  success: string;
}

/**
 * Get high contrast colors for light mode
 */
export const getHighContrastLightColors = (): HighContrastColors => ({
  text: '#000000', // Pure black for maximum contrast
  background: '#FFFFFF', // Pure white
  primary: '#0000CC', // Darker blue for better contrast
  secondary: '#4B0082', // Darker purple
  border: '#000000', // Black borders
  error: '#CC0000', // Darker red
  success: '#006600', // Darker green
});

/**
 * Get high contrast colors for dark mode
 */
export const getHighContrastDarkColors = (): HighContrastColors => ({
  text: '#FFFFFF', // Pure white for maximum contrast
  background: '#000000', // Pure black
  primary: '#66B3FF', // Brighter blue for better contrast
  secondary: '#B399FF', // Brighter purple
  border: '#FFFFFF', // White borders
  error: '#FF6666', // Brighter red
  success: '#66FF66', // Brighter green
});

/**
 * Calculate contrast ratio between two colors
 * @param color1 - First color in hex format
 * @param color2 - Second color in hex format
 * @returns Contrast ratio (1-21)
 */
export const calculateContrastRatio = (color1: string, color2: string): number => {
  // Simplified contrast calculation
  // For production, use a proper color contrast library
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = ((rgb >> 16) & 0xff) / 255;
    const g = ((rgb >> 8) & 0xff) / 255;
    const b = (rgb & 0xff) / 255;
    
    const [rs, gs, bs] = [r, g, b].map(c => 
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if a color combination meets WCAG AA standards (4.5:1 for normal text)
 * @param foreground - Foreground color in hex
 * @param background - Background color in hex
 * @returns true if contrast ratio meets WCAG AA standards
 */
export const meetsWCAGAA = (foreground: string, background: string): boolean => {
  return calculateContrastRatio(foreground, background) >= 4.5;
};

/**
 * Check if a color combination meets WCAG AAA standards (7:1 for normal text)
 * @param foreground - Foreground color in hex
 * @param background - Background color in hex
 * @returns true if contrast ratio meets WCAG AAA standards
 */
export const meetsWCAGAAA = (foreground: string, background: string): boolean => {
  return calculateContrastRatio(foreground, background) >= 7.0;
};

/**
 * Hook to get high contrast colors based on current color scheme
 * @param isDark - Whether dark mode is enabled
 * @returns High contrast colors for the current mode
 */
export const useHighContrastColors = (isDark: boolean): HighContrastColors => {
  const isHighContrast = isHighContrastEnabled();
  
  if (!isHighContrast) {
    // Return normal colors if high contrast is not enabled
    return isDark ? {
      text: '#E5E5EA',
      background: '#1C1C1E',
      primary: '#0A84FF',
      secondary: '#5E5CE6',
      border: '#636366',
      error: '#FF453A',
      success: '#32D74B',
    } : {
      text: '#1C1C1E',
      background: '#FFFFFF',
      primary: '#007AFF',
      secondary: '#5856D6',
      border: '#C6C6C8',
      error: '#FF3B30',
      success: '#34C759',
    };
  }
  
  return isDark ? getHighContrastDarkColors() : getHighContrastLightColors();
};
