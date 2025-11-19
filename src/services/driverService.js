import driversData from '../data/drivers.json';

/**
 * Fetches driver data from the JSON file
 * @returns {Promise<Array>} Promise that resolves to an array of driver objects
 */
export const getDrivers = async () => {
  try {
    // Simulate async behavior to match real API calls
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(driversData);
      }, 100);
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    throw new Error('Failed to fetch driver data');
  }
};

/**
 * Sorts drivers by their current standing position
 * @param {Array} drivers - Array of driver objects
 * @returns {Array} Sorted array of drivers (lowest standing number first)
 */
export const sortDriversByStanding = (drivers) => {
  if (!Array.isArray(drivers)) {
    return [];
  }
  
  return [...drivers].sort((a, b) => {
    // Handle drivers with no standing (historical drivers with standing 0)
    // Place them at the end
    if (a.currentStanding === 0 && b.currentStanding === 0) {
      return 0;
    }
    if (a.currentStanding === 0) {
      return 1;
    }
    if (b.currentStanding === 0) {
      return -1;
    }
    
    return a.currentStanding - b.currentStanding;
  });
};

/**
 * Filters drivers to return only world champions
 * @param {Array} drivers - Array of driver objects
 * @returns {Array} Array containing only drivers who are world champions
 */
export const filterChampions = (drivers) => {
  if (!Array.isArray(drivers)) {
    return [];
  }
  
  return drivers.filter(driver => driver.isWorldChampion === true);
};
