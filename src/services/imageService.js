/**
 * Service for optimizing and caching driver images
 */

import { fetchDriverImageWithRetry } from './wikimediaService.js';

const CACHE_NAME = 'f1-driver-images-v1';
const TARGET_WIDTH = 440;

/**
 * Optimizes an image by resizing it to target width while maintaining aspect ratio
 * @param {string} imageUrl - URL of the image to optimize
 * @param {number} targetWidth - Target width in pixels (default: 440)
 * @returns {Promise<Blob>} Promise that resolves to optimized image blob
 */
export const optimizeImage = async (imageUrl, targetWidth = TARGET_WIDTH) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Calculate new dimensions maintaining aspect ratio
        const aspectRatio = img.height / img.width;
        const newWidth = targetWidth;
        const newHeight = Math.round(newWidth * aspectRatio);
        
        // Create canvas with new dimensions
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw image on canvas at new size
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob from canvas'));
            }
          },
          'image/jpeg',
          0.85 // Quality setting
        );
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image from ${imageUrl}`));
    };
    
    img.src = imageUrl;
  });
};

/**
 * Stores an optimized image in the browser cache
 * @param {string} driverId - Unique driver identifier
 * @param {Blob} imageBlob - Optimized image blob
 * @returns {Promise<void>}
 */
export const cacheImage = async (driverId, imageBlob) => {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cacheKey = `driver-image-${driverId}`;
    
    // Create a response from the blob
    const response = new Response(imageBlob, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'max-age=31536000' // Cache for 1 year
      }
    });
    
    // Store in cache
    await cache.put(cacheKey, response);
  } catch (error) {
    console.error(`Error caching image for driver ${driverId}:`, error);
    throw error;
  }
};

/**
 * Retrieves a cached image for a driver
 * @param {string} driverId - Unique driver identifier
 * @returns {Promise<string|null>} Promise that resolves to data URL or null if not cached
 */
export const getCachedImage = async (driverId) => {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cacheKey = `driver-image-${driverId}`;
    
    const response = await cache.match(cacheKey);
    
    if (!response) {
      return null;
    }
    
    // Convert response to blob
    const blob = await response.blob();
    
    // Convert blob to data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Error retrieving cached image for driver ${driverId}:`, error);
    return null;
  }
};

/**
 * Main orchestration function to get driver image
 * Checks cache first, then fetches from Wikimedia, optimizes, caches, and returns
 * @param {string} driverId - Unique driver identifier
 * @param {string} driverName - Full name of the driver
 * @returns {Promise<string|null>} Promise that resolves to image data URL or null
 */
export const getDriverImage = async (driverId, driverName) => {
  try {
    // Step 1: Check cache first
    const cachedImage = await getCachedImage(driverId);
    if (cachedImage) {
      return cachedImage;
    }
    
    // Step 2: Fetch from Wikimedia
    const imageUrl = await fetchDriverImageWithRetry(driverName);
    if (!imageUrl) {
      return null;
    }
    
    // Step 3: Optimize the image
    const optimizedBlob = await optimizeImage(imageUrl);
    
    // Step 4: Cache the optimized image
    await cacheImage(driverId, optimizedBlob);
    
    // Step 5: Convert to data URL and return
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(optimizedBlob);
    });
  } catch (error) {
    console.error(`Error getting image for driver ${driverName}:`, error);
    return null;
  }
};

/**
 * Stores an optimized team car image in the browser cache
 * @param {string} teamId - Unique team identifier
 * @param {number} year - Year of the car
 * @param {Blob} imageBlob - Optimized image blob
 * @returns {Promise<void>}
 */
export const cacheTeamCarImage = async (teamId, year, imageBlob) => {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cacheKey = `car-image-${teamId}-${year}`;
    
    // Create a response from the blob
    const response = new Response(imageBlob, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'max-age=31536000' // Cache for 1 year
      }
    });
    
    // Store in cache
    await cache.put(cacheKey, response);
  } catch (error) {
    console.error(`Error caching team car image for ${teamId} ${year}:`, error);
    throw error;
  }
};

/**
 * Retrieves a cached team car image
 * @param {string} teamId - Unique team identifier
 * @param {number} year - Year of the car
 * @returns {Promise<string|null>} Promise that resolves to data URL or null if not cached
 */
export const getCachedTeamCarImage = async (teamId, year) => {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cacheKey = `car-image-${teamId}-${year}`;
    
    const response = await cache.match(cacheKey);
    
    if (!response) {
      return null;
    }
    
    // Convert response to blob
    const blob = await response.blob();
    
    // Convert blob to data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Error retrieving cached team car image for ${teamId} ${year}:`, error);
    return null;
  }
};

/**
 * Main orchestration function to get team car image
 * Checks cache first, then fetches from Wikimedia, optimizes, caches, and returns
 * @param {string} teamId - Unique team identifier
 * @param {string} teamName - Full name of the team
 * @param {number} year - Year of the car
 * @returns {Promise<string|null>} Promise that resolves to image data URL or null
 */
export const getTeamCarImage = async (teamId, teamName, year) => {
  try {
    // Step 1: Check cache first
    const cachedImage = await getCachedTeamCarImage(teamId, year);
    if (cachedImage) {
      return cachedImage;
    }
    
    // Step 2: Fetch from Wikimedia
    const { fetchTeamCarImageWithRetry } = await import('./wikimediaService.js');
    const imageUrl = await fetchTeamCarImageWithRetry(teamName, year);
    
    if (!imageUrl) {
      // No image found - return null for graceful degradation
      return null;
    }
    
    // Step 3: Optimize the image
    const optimizedBlob = await optimizeImage(imageUrl);
    
    // Step 4: Cache the optimized image
    await cacheTeamCarImage(teamId, year, optimizedBlob);
    
    // Step 5: Convert to data URL and return
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(optimizedBlob);
    });
  } catch (error) {
    console.error(`Error getting team car image for ${teamName} ${year}:`, error);
    return null;
  }
};
