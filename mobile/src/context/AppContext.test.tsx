/**
 * Tests for AppContext state management
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import {
  AppProvider,
  useAppState,
  useAppDispatch,
  useApp,
} from './AppContext';
import {
  loadDriversStart,
  loadDriversSuccess,
  loadDriversError,
  setSearchQuery,
  updateCacheSize,
} from './actions';
import { Driver } from '../models';

// Wrapper component for testing hooks
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

describe('AppContext', () => {
  describe('useAppState', () => {
    it('should throw error when used outside AppProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useAppState());
      }).toThrow('useAppState must be used within an AppProvider');

      console.error = originalError;
    });

    it('should return initial state', () => {
      const { result } = renderHook(() => useAppState(), { wrapper });

      expect(result.current).toEqual({
        drivers: [],
        isLoading: false,
        error: null,
        searchQuery: '',
        cacheSize: 0,
        isConnected: true,
        isInternetReachable: null,
      });
    });
  });

  describe('useAppDispatch', () => {
    it('should throw error when used outside AppProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useAppDispatch());
      }).toThrow('useAppDispatch must be used within an AppProvider');

      console.error = originalError;
    });

    it('should return dispatch function', () => {
      const { result } = renderHook(() => useAppDispatch(), { wrapper });

      expect(typeof result.current).toBe('function');
    });
  });

  describe('useApp', () => {
    it('should return both state and dispatch', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current).toHaveLength(2);
      expect(typeof result.current[0]).toBe('object');
      expect(typeof result.current[1]).toBe('function');
    });
  });

  describe('State updates', () => {
    it('should handle LOAD_DRIVERS_START action', () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      const [, dispatch] = result.current;

      act(() => {
        dispatch(loadDriversStart());
      });

      const [state] = result.current;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle LOAD_DRIVERS_SUCCESS action', () => {
      const mockDrivers: Driver[] = [
        {
          id: '1',
          name: 'Test Driver',
          nationality: 'Test',
          team: 'Test Team',
          isWorldChampion: false,
          championshipYears: [],
          currentStanding: 1,
          careerPoints: 100,
          raceWins: 5,
          imageUrl: 'https://example.com/image.jpg',
        },
      ];

      const { result } = renderHook(() => useApp(), { wrapper });
      const [, dispatch] = result.current;

      act(() => {
        dispatch(loadDriversSuccess(mockDrivers));
      });

      const [state] = result.current;
      expect(state.isLoading).toBe(false);
      expect(state.drivers).toEqual(mockDrivers);
      expect(state.error).toBe(null);
    });

    it('should handle LOAD_DRIVERS_ERROR action', () => {
      const mockError = new Error('Test error');

      const { result } = renderHook(() => useApp(), { wrapper });
      const [, dispatch] = result.current;

      act(() => {
        dispatch(loadDriversError(mockError));
      });

      const [state] = result.current;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(mockError);
    });

    it('should handle SET_SEARCH_QUERY action', () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      const [, dispatch] = result.current;

      act(() => {
        dispatch(setSearchQuery('Hamilton'));
      });

      const [state] = result.current;
      expect(state.searchQuery).toBe('Hamilton');
    });

    it('should handle UPDATE_CACHE_SIZE action', () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      const [, dispatch] = result.current;

      act(() => {
        dispatch(updateCacheSize(1024000));
      });

      const [state] = result.current;
      expect(state.cacheSize).toBe(1024000);
    });

    it('should handle multiple actions in sequence', () => {
      const mockDrivers: Driver[] = [
        {
          id: '1',
          name: 'Lewis Hamilton',
          nationality: 'British',
          team: 'Mercedes',
          isWorldChampion: true,
          championshipYears: [2008, 2014, 2015, 2017, 2018, 2019, 2020],
          currentStanding: 1,
          careerPoints: 4500,
          raceWins: 103,
          imageUrl: 'https://example.com/hamilton.jpg',
        },
      ];

      const { result } = renderHook(() => useApp(), { wrapper });
      const [, dispatch] = result.current;

      // Start loading
      act(() => {
        dispatch(loadDriversStart());
      });

      let [state] = result.current;
      expect(state.isLoading).toBe(true);

      // Load success
      act(() => {
        dispatch(loadDriversSuccess(mockDrivers));
      });

      [state] = result.current;
      expect(state.isLoading).toBe(false);
      expect(state.drivers).toEqual(mockDrivers);

      // Set search query
      act(() => {
        dispatch(setSearchQuery('Hamilton'));
      });

      [state] = result.current;
      expect(state.searchQuery).toBe('Hamilton');

      // Update cache size
      act(() => {
        dispatch(updateCacheSize(2048000));
      });

      [state] = result.current;
      expect(state.cacheSize).toBe(2048000);
    });
  });
});
