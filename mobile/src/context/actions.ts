/**
 * Action creators for app state management
 * Provides type-safe action creators for dispatching state updates
 */

import { AppAction, Driver } from '../models';

/**
 * Action creator for starting driver data loading
 * @returns Action to set loading state to true
 */
export function loadDriversStart(): AppAction {
  return {
    type: 'LOAD_DRIVERS_START',
  };
}

/**
 * Action creator for successful driver data loading
 * @param drivers - Array of loaded drivers
 * @returns Action to set drivers and clear loading/error states
 */
export function loadDriversSuccess(drivers: Driver[]): AppAction {
  return {
    type: 'LOAD_DRIVERS_SUCCESS',
    payload: drivers,
  };
}

/**
 * Action creator for driver data loading error
 * @param error - Error that occurred during loading
 * @returns Action to set error state and clear loading
 */
export function loadDriversError(error: Error): AppAction {
  return {
    type: 'LOAD_DRIVERS_ERROR',
    payload: error,
  };
}

/**
 * Action creator for updating search query
 * @param query - New search query string
 * @returns Action to update search query in state
 */
export function setSearchQuery(query: string): AppAction {
  return {
    type: 'SET_SEARCH_QUERY',
    payload: query,
  };
}

/**
 * Action creator for updating cache size
 * @param size - New cache size in bytes
 * @returns Action to update cache size in state
 */
export function updateCacheSize(size: number): AppAction {
  return {
    type: 'UPDATE_CACHE_SIZE',
    payload: size,
  };
}

/**
 * Action creator for updating network state
 * @param isConnected - Whether device is connected to network
 * @param isInternetReachable - Whether internet is reachable
 * @returns Action to update network state
 */
export function setNetworkState(
  isConnected: boolean,
  isInternetReachable: boolean | null
): AppAction {
  return {
    type: 'SET_NETWORK_STATE',
    payload: { isConnected, isInternetReachable },
  };
}
