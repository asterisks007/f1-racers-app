/**
 * DriverService - Business logic for driver data operations
 * Handles loading, searching, filtering, and sorting of driver data
 */

import { Driver, parseDriversJSON } from '../models';
import { storageService } from './StorageService';
import { retryWithBackoff } from '../utils/retryLogic';

// Import bundled driver data
const bundledDriverData = require('../assets/drivers.json');

/**
 * Service for managing driver data and business logic
 */
export class DriverService {
  /**
   * Load drivers from storage or fall back to bundled JSON
   * Implements retry logic for storage operations
   * @returns Array of drivers
   * @throws Error if both storage and bundled data fail
   */
  async loadDrivers(): Promise<Driver[]> {
    try {
      // Try to load from storage first with retry logic
      const storedDrivers = await retryWithBackoff(
        async () => await storageService.loadDrivers(),
        {
          maxRetries: 2,
          initialDelay: 500,
          onRetry: (attempt, error) => {
            console.log(`Retrying storage load (attempt ${attempt}):`, error.message);
          },
        }
      );
      
      if (storedDrivers !== null && storedDrivers.length > 0) {
        return storedDrivers;
      }
      
      // Fall back to bundled JSON data
      const drivers = parseDriversJSON(bundledDriverData);
      
      // Save to storage for future use with retry logic
      try {
        await retryWithBackoff(
          async () => await storageService.saveDrivers(drivers),
          {
            maxRetries: 2,
            initialDelay: 500,
          }
        );
      } catch (saveError) {
        // Log but don't fail if save fails
        console.warn('Failed to save drivers to storage after retries:', saveError);
      }
      
      return drivers;
    } catch (error) {
      // If storage fails, try bundled data as last resort
      try {
        const drivers = parseDriversJSON(bundledDriverData);
        return drivers;
      } catch (bundledError) {
        throw new Error(
          `Failed to load drivers from both storage and bundled data: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }
  }

  /**
   * Sort drivers by current standing position
   * Drivers with non-zero standings appear first in ascending order (1, 2, 3...)
   * Drivers with zero standing appear at the end
   * @param drivers - Array of drivers to sort
   * @returns Sorted array of drivers
   */
  sortByStanding(drivers: Driver[]): Driver[] {
    return [...drivers].sort((a, b) => {
      // Handle zero standings - they go to the end
      if (a.currentStanding === 0 && b.currentStanding === 0) {
        // Both have zero standing, maintain relative order by name
        return a.name.localeCompare(b.name);
      }
      if (a.currentStanding === 0) {
        return 1; // a goes after b
      }
      if (b.currentStanding === 0) {
        return -1; // a goes before b
      }
      
      // Both have non-zero standings, sort ascending
      return a.currentStanding - b.currentStanding;
    });
  }

  /**
   * Search drivers by name (case-insensitive)
   * @param drivers - Array of drivers to search
   * @param query - Search query string
   * @returns Filtered array of drivers whose names contain the query
   */
  searchDrivers(drivers: Driver[], query: string): Driver[] {
    // Empty query returns all drivers
    if (!query || query.trim() === '') {
      return drivers;
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    
    return drivers.filter((driver) =>
      driver.name.toLowerCase().includes(normalizedQuery)
    );
  }

  /**
   * Filter only world champion drivers
   * @param drivers - Array of drivers to filter
   * @returns Array containing only world champions
   */
  filterChampions(drivers: Driver[]): Driver[] {
    return drivers.filter((driver) => driver.isWorldChampion);
  }

  /**
   * Get a single driver by ID
   * @param id - Driver ID to search for
   * @returns Driver object if found, null otherwise
   */
  async getDriverById(id: string): Promise<Driver | null> {
    try {
      const drivers = await this.loadDrivers();
      const driver = drivers.find((d) => d.id === id);
      return driver || null;
    } catch (error) {
      throw new Error(
        `Failed to get driver by ID: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

// Export singleton instance
export const driverService = new DriverService();
