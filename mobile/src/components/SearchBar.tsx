import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Text,
} from 'react-native';

interface SearchBarProps {
  /** Current search query value */
  value: string;
  /** Callback when search text changes */
  onChangeText: (text: string) => void;
  /** Placeholder text for the search input */
  placeholder?: string;
}

/**
 * SearchBar Component
 * Platform-specific search bar implementation
 * iOS: UISearchBar-style with rounded corners and light background
 * Android: Material Design search bar with elevation
 * Memoized for performance
 */
const SearchBarComponent: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search drivers...',
}) => {
  const handleClear = React.useCallback(() => {
    onChangeText('');
  }, [onChangeText]);

  return (
    <View
      style={[
        styles.container,
        Platform.select({
          ios: styles.iosContainer,
          android: styles.androidContainer,
        }),
      ]}
      accessibilityLabel="Search bar">
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={[
          styles.input,
          Platform.select({
            ios: styles.iosInput,
            android: styles.androidInput,
          }),
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
        accessibilityLabel="Search input field"
        accessibilityHint="Type to search for drivers by name"
      />
      {Platform.OS === 'android' && value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          accessibilityLabel="Clear search"
          accessibilityRole="button">
          <Text style={styles.clearIcon}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  iosContainer: {
    backgroundColor: '#f0f0f0',
    height: 40,
  },
  androidContainer: {
    backgroundColor: '#fff',
    height: 48,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  iosInput: {
    fontFamily: Platform.select({
      ios: 'System',
      default: undefined,
    }),
  },
  androidInput: {
    fontFamily: 'Roboto',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearIcon: {
    fontSize: 18,
    color: '#666',
  },
});

// Memoize component to prevent unnecessary re-renders
export const SearchBar = React.memo(SearchBarComponent, (prevProps, nextProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.placeholder === nextProps.placeholder
  );
});
