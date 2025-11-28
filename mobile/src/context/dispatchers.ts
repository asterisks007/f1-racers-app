/**
 * Dispatcher helper functions
 * Provides convenient functions for common state update patterns
 */

import { Dispatch } from 'react';
import { AppAction } from '../models';
import {
  loadDriversStart,
  loadDriversSuccess,
  loadDriversError,
  setSearchQuery,
  updateCacheSize,
} from './actions';
import { driverService } from '../services/DriverService';

/**
 * Load drivers from storage or bundled data
 * Handles the complete loading flow: start, success, or error
 * @param dispatch - Dispatch function from useAppDispatch
 */
export async function loadDrivers(
  dispatch: Dispatch<AppAction>
): Promise<void> {
  try {
    dispatch(loadDriversStart());
    const drivers = await driverService.loadDrivers();
    dispatch(loadDriversSuccess(drivers));
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Unknown error loading drivers');
    dispatch(loadDriversError(errorObj));
  }
}

/**
 * Update search query in state
 * @param dispatch - Dispatch function from useAppDispatch
 * @param query - New search query string
 */
export function updateSearchQuery(
  dispatch: Dispatch<AppAction>,
  query: string
): void {
  dispatch(setSearchQuery(query));
}

/**
 * Update cache size in state
 * @param dispatch - Dispatch function from useAppDispatch
 * @param size - New cache size in bytes
 */
export function updateCacheSizeInState(
  dispatch: Dispatch<AppAction>,
  size: number
): void {
  dispatch(updateCacheSize(size));
}

/**
 * Retry loading drivers after an error
 * @param dispatch - Dispatch function from useAppDispatch
 */
export async function retryLoadDrivers(
  dispatch: Dispatch<AppAction>
): Promise<void> {
  await loadDrivers(dispatch);
}

/**
 * Clear search query (reset to empty string)
 * @param dispatch - Dispatch function from useAppDispatch
 */
export function clearSearchQuery(dispatch: Dispatch<AppAction>): void {
  dispatch(setSearchQuery(''));
}
