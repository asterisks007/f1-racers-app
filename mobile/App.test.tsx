import React from 'react';
import { render } from '@testing-library/react-native';
import App from './App';

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureHandlerRootView: View,
  };
});

describe('App', () => {
  it('renders correctly', () => {
    const { UNSAFE_root } = render(<App />);
    expect(UNSAFE_root).toBeTruthy();
  });
});
