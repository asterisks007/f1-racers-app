import React from 'react';
import { render } from '@testing-library/react-native';
import App from './App';

describe('App', () => {
  it('renders correctly', () => {
    const { UNSAFE_root } = render(<App />);
    expect(UNSAFE_root).toBeTruthy();
  });
});
