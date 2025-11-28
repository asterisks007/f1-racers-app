import React from 'react';
import { NavigationContainer as RNNavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { Platform, useColorScheme } from 'react-native';
import { RootStackParamList } from '../models';
import { DriverListScreen, DriverDetailScreen } from '../screens';
import { useReducedMotion } from '../utils/reducedMotion';

const Stack = createStackNavigator<RootStackParamList>();

/**
 * iOS-specific navigation theme
 */
const iOSTheme = {
  dark: false,
  colors: {
    primary: '#007AFF',
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#000000',
    border: '#C6C6C8',
    notification: '#FF3B30',
  },
};

/**
 * iOS dark mode navigation theme
 */
const iOSDarkTheme = {
  dark: true,
  colors: {
    primary: '#0A84FF',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    border: '#38383A',
    notification: '#FF453A',
  },
};

/**
 * Android Material Design navigation theme
 */
const androidTheme = {
  dark: false,
  colors: {
    primary: '#6200EE',
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#000000',
    border: '#E0E0E0',
    notification: '#B00020',
  },
};

/**
 * Android Material Design dark theme
 */
const androidDarkTheme = {
  dark: true,
  colors: {
    primary: '#BB86FC',
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    border: '#2C2C2C',
    notification: '#CF6679',
  },
};

/**
 * Get the appropriate theme based on platform and color scheme
 */
function getNavigationTheme(isDarkMode: boolean) {
  if (Platform.OS === 'ios') {
    return isDarkMode ? iOSDarkTheme : iOSTheme;
  }
  return isDarkMode ? androidDarkTheme : androidTheme;
}

/**
 * Main navigation container component
 * Configures React Navigation with platform-specific themes and transitions
 */
export function NavigationContainer() {
  const isDarkMode = useColorScheme() === 'dark';
  const theme = getNavigationTheme(isDarkMode);
  const isReducedMotion = useReducedMotion();

  // Get screen options based on reduced motion setting
  const getScreenOptions = () => {
    const baseOptions = {
      // Platform-specific header styles
      headerStyle: {
        backgroundColor: theme.colors.card,
        ...Platform.select({
          ios: {
            shadowColor: 'transparent',
          },
          android: {
            elevation: 4,
          },
        }),
      },
      headerTintColor: theme.colors.primary,
      headerTitleStyle: {
        ...Platform.select({
          ios: {
            fontFamily: 'System',
            fontSize: 17,
            fontWeight: '600',
          },
          android: {
            fontFamily: 'Roboto',
            fontSize: 20,
            fontWeight: '500',
          },
        }),
      },
    };

    // If reduced motion is enabled, use instant transitions
    if (isReducedMotion) {
      return {
        ...baseOptions,
        animationEnabled: false,
        gestureEnabled: true,
      };
    }

    // Otherwise use platform-specific transitions
    return {
      ...baseOptions,
      ...Platform.select({
        ios: {
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        },
        android: {
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          cardStyleInterpolator: ({ current }) => {
            return {
              cardStyle: {
                opacity: current.progress,
              },
            };
          },
        },
      }),
    };
  };

  return (
    <RNNavigationContainer theme={theme}>
      <Stack.Navigator
        initialRouteName="DriverList"
        screenOptions={getScreenOptions()}
      >
        <Stack.Screen
          name="DriverList"
          component={DriverListScreen}
          options={{
            title: 'F1 Drivers',
          }}
        />
        <Stack.Screen
          name="DriverDetail"
          component={DriverDetailScreen}
          options={{
            title: 'Driver Details',
            headerBackTitle: Platform.OS === 'ios' ? 'Back' : undefined,
          }}
        />
      </Stack.Navigator>
    </RNNavigationContainer>
  );
}
