/**
 * ImageService - Optimizes and caches images
 */

import { fetchDriverImage, fetchTeamCarImage } from './wikimediaService';

const CACHE_NAME = 'f1-racers-images-v1';
const TARGET_WIDTH = 440;

/**
 * Optimize image to target width while maintaining aspect ratio
 * @param {string} imageUrl - URL of the image to optimize
 * @param {number} targetWidth - Target width in pixels (default: 440)
 * @returns {Promise<Blob>} - Optimized image as Blob
 */
export async function optimizeImage(imageUrl, targetWidth = TARGET_WIDTH) {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Create an image element
    const img = new Image();
    const imageLoadPromise = new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
    });
    
    img.src = URL.createObjectURL(blob);
    await imageLoadPromise;
    
    // Calculate new dimensions maintaining aspect ratio
    const aspectRatio = img.height / img.width;
    const targetHeight = Math.round(targetWidth * aspectRatio);
    
    // Create canvas and draw resized image
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    
    // Convert canvas to Blob
    const optimizedBlob = await new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85);
    });
    
    // Clean up
    URL.revokeObjectURL(img.src);
    
    return optimizedBlob;
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw error;
  }
}

/**
 * Cache an image
 * @param {string} cacheKey - Unique key for the cached image
 * @param {Blob} imageBlob - Image blob to cache
 * @returns {Promise<void>}
 */
export async function cacheImage(cacheKey, imageBlob) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(imageBlob);
    await cache.put(cacheKey, response);
  } catch (error) {
    console.error('Error caching image:', error);
  }
}

/**
 * Get cached image
 * @param {string} cacheKey - Unique key for the cached image
 * @returns {Promise<string|null>} - Data URL of cached image or null
 */
export async function getCachedImage(cacheKey) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(cacheKey);
    
    if (!response) {
      return null;
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error getting cached image:', error);
    return null;
  }
}

/**
 * Get driver image (from cache or fetch and optimize)
 * @param {string} driverId - Unique driver ID
 * @param {string} driverName - Driver name for searching
 * @returns {Promise<string>} - Data URL of the image
 */
export async function getDriverImage(driverId, driverName) {
  const cacheKey = `driver-image-${driverId}`;
  
  // Check cache first
  const cachedImage = await getCachedImage(cacheKey);
  if (cachedImage) {
    return cachedImage;
  }
  
  // Fetch from Wikimedia
  const imageUrl = await fetchDriverImage(driverName);
  if (!imageUrl) {
    return null;
  }
  
  // Optimize the image
  const optimizedBlob = await optimizeImage(imageUrl);
  
  // Cache the optimized image
  await cacheImage(cacheKey, optimizedBlob);
  
  // Return data URL
  return URL.createObjectURL(optimizedBlob);
}

/**
 * Get team car image (from cache or fetch and optimize)
 * @param {string} teamId - Unique team ID
 * @param {string} teamName - Team name for searching
 * @param {number} year - Year of the car
 * @returns {Promise<string|null>} - Data URL of the image or null if unavailable
 */
export async function getTeamCarImage(teamId, teamName, year) {
  const cacheKey = `car-image-${teamId}-${year}`;
  
  // Check cache first
  const cachedImage = await getCachedImage(cacheKey);
  if (cachedImage) {
    return cachedImage;
  }
  
  // Fetch from Wikimedia
  const imageUrl = await fetchTeamCarImage(teamName, year);
  if (!imageUrl) {
    return null; // No car image available
  }
  
  try {
    // Optimize the image
    const optimizedBlob = await optimizeImage(imageUrl);
    
    // Cache the optimized image
    await cacheImage(cacheKey, optimizedBlob);
    
    // Return data URL
    return URL.createObjectURL(optimizedBlob);
  } catch (error) {
    console.error('Error processing team car image:', error);
    return null;
  }
}
