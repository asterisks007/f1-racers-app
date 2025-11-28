/**
 * OfflineIndicator - Displays a banner when device is offline
 * Shows at the top of the screen to inform users of connectivity issues
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useNetworkState } from '../services/NetworkService';

/**
 * OfflineIndicator component
 * Displays a banner when the device is offline
 */
export function OfflineIndicator(): JSX.Element | null {
  const { isConnected, isInternetReachable } = useNetworkState();

  // Don't show if connected and internet is reachable
  if (isConnected && isInternetReachable) {
    return null;
  }

  // Don't show if we haven't determined internet reachability yet
  if (isInternetReachable === null) {
    return null;
  }

  return (
    <View style={styles.container} accessibilityLabel="Offline indicator">
      <Text style={styles.text} accessibilityRole="text">
        {!isConnected
          ? 'No internet connection'
          : 'Limited connectivity'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#d32f2f',
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
