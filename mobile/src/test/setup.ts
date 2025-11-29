import '@testing-library/react-native/extend-expect';

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  const mockComponent = (name: string) => {
    const Component = (props: any) => React.createElement(View, props, props.children);
    Component.displayName = name;
    return Component;
  };
  
  return {
    GestureHandlerRootView: mockComponent('GestureHandlerRootView'),
    Swipeable: mockComponent('Swipeable'),
    DrawerLayout: mockComponent('DrawerLayout'),
    State: {},
    ScrollView: mockComponent('ScrollView'),
    Slider: mockComponent('Slider'),
    Switch: mockComponent('Switch'),
    TextInput: mockComponent('TextInput'),
    ToolbarAndroid: mockComponent('ToolbarAndroid'),
    ViewPagerAndroid: mockComponent('ViewPagerAndroid'),
    DrawerLayoutAndroid: mockComponent('DrawerLayoutAndroid'),
    WebView: mockComponent('WebView'),
    NativeViewGestureHandler: mockComponent('NativeViewGestureHandler'),
    TapGestureHandler: mockComponent('TapGestureHandler'),
    FlingGestureHandler: mockComponent('FlingGestureHandler'),
    ForceTouchGestureHandler: mockComponent('ForceTouchGestureHandler'),
    LongPressGestureHandler: mockComponent('LongPressGestureHandler'),
    PanGestureHandler: mockComponent('PanGestureHandler'),
    PinchGestureHandler: mockComponent('PinchGestureHandler'),
    RotationGestureHandler: mockComponent('RotationGestureHandler'),
    RawButton: mockComponent('RawButton'),
    BaseButton: mockComponent('BaseButton'),
    RectButton: mockComponent('RectButton'),
    BorderlessButton: mockComponent('BorderlessButton'),
    FlatList: mockComponent('FlatList'),
    gestureHandlerRootHOC: jest.fn(component => component),
    Directions: {},
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaInsetsContext: React.createContext({ top: 0, right: 0, bottom: 0, left: 0 }),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-fast-image
jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const { Image } = require('react-native');
  
  const FastImage = (props: any) => React.createElement(Image, props);
  FastImage.preload = jest.fn();
  FastImage.clearMemoryCache = jest.fn();
  FastImage.clearDiskCache = jest.fn();
  FastImage.priority = {
    low: 'low',
    normal: 'normal',
    high: 'high',
  };
  FastImage.resizeMode = {
    contain: 'contain',
    cover: 'cover',
    stretch: 'stretch',
    center: 'center',
  };
  
  return FastImage;
});

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock AccessibilityInfo
jest.mock('react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo', () => ({
  isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
  addEventListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  removeEventListener: jest.fn(),
}));
