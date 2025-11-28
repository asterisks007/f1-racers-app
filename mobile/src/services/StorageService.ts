/**
 * StorageService - Handles persistent storage operations using AsyncStorage
 * Provides methods for saving, loading, and clearing driver data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Driver, parseDriversJSON, driverToJSON } from '../models';

const STORAGE_KEY = '@f1_racers:drivers';

/**
 * Error types for storage operations
 */
export class StorageQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageQuotaError';
  }
}

export class StoragePermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StoragePermissionError';
  }
}

/**
 * Service for managing driver data in AsyncStorage
 */
export class StorageService {
  /**
   * Save drivers array to AsyncStorage
   * @param drivers - Array of drivers to save
   * @throws StorageQuotaError if storage quota is exceeded
   * @throws StoragePermissionError if storage permissions are denied
   * @throws Error for other storage failures
   */
  async saveDrivers(drivers: Driver[]): Promise<void> {
    try {
      const jsonData = drivers.map(driverToJSON);
      const jsonString = JSON.stringify(jsonData);
      await AsyncStorage.setItem(STORAGE_KEY, jsonString);
    } catch (error) {
      // Handle specific error types
      if (error instanceof Error) {
        // Check for quota exceeded errors
        if (
          error.message.includes('quota') ||
          error.message.includes('QuotaExceededError') ||
          error.message.includes('storage full')
        ) {
          throw new StorageQuotaError(
            'Storage quota exceeded. Please clear app data or free up space.'
          );
        }
        
        // Check for permission errors
        if (
          error.message.includes('permission') ||
          error.message.includes('denied') ||
          error.message.includes('unauthorized')
        ) {
          throw new StoragePermissionError(
            'Storage permission denied. Please check app permissions.'
          );
        }
      }
      
      // Re-throw other errors
      throw new Error(`Failed to save drivers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load drivers array from AsyncStorage
   * @returns Array of drivers, or null if no data exists
   * @throws Error if data exists but is invalid or corrupted
   */
  async loadDrivers(): Promise<Driver[] | null> {
    try {
      const jsonString = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (jsonString === null) {
        return null;
      }

      const jsonData = JSON.parse(jsonString);
      const drivers = parseDriversJSON(jsonData);
      
      return drivers;
    } catch (error) {
      if (error instanceof Error) {
        // Check for permission errors
        if (
          error.message.includes('permission') ||
          error.message.includes('denied') ||
          error.message.includes('unauthorized')
        ) {
          throw new StoragePermissionError(
            'Storage permission denied. Please check app permissions.'
          );
        }
        
        // If it's a parse error, provide more context
        if (error.message.includes('Invalid driver data format') || error instanceof SyntaxError) {
          throw new Error('Stored driver data is corrupted or invalid');
        }
      }
      
      throw new Error(`Failed to load drivers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear all stored driver data from AsyncStorage
   * @throws StoragePermissionError if storage permissions are denied
   * @throws Error for other storage failures
   */
  async clearStorage(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      if (error instanceof Error) {
        // Check for permission errors
        if (
          error.message.includes('permission') ||
          error.message.includes('denied') ||
          error.message.includes('unauthorized')
        ) {
          throw new StoragePermissionError(
            'Storage permission denied. Please check app permissions.'
          );
        }
      }
      
      throw new Error(`Failed to clear storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
