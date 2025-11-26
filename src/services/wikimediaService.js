/**
 * Service for fetching driver images from Wikimedia Commons
 */

const WIKIMEDIA_API_BASE = 'https://en.wikipedia.org/w/api.php';
const COMMONS_API_BASE = 'https://commons.wikimedia.org/w/api.php';

/**
 * Fetches driver image from Wikimedia Commons
 * @param {string} driverName - Full name of the driver
 * @returns {Promise<string|null>} Promise that resolves to image URL or null if not found
 */
export const fetchDriverImage = async (driverName) => {
  try {
    // First, try to get the Wikipedia page for the driver
    const searchParams = new URLSearchParams({
      action: 'query',
      format: 'json',
      titles: driverName,
      prop: 'pageimages',
      pithumbsize: 500,
      origin: '*'
    });

    const response = await fetch(`${WIKIMEDIA_API_BASE}?${searchParams}`);
    
    if (!response.ok) {
      console.warn(`Wikimedia API request failed for ${driverName}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Extract the page data
    const pages = data.query?.pages;
    if (!pages) {
      return null;
    }

    // Get the first (and should be only) page
    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];

    // Check if we have a thumbnail
    if (page.thumbnail?.source) {
      return page.thumbnail.source;
    }

    // If no thumbnail, try to get the original image
    if (page.original?.source) {
      return page.original.source;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching image for ${driverName}:`, error);
    return null;
  }
};

/**
 * Constructs a direct URL to a Wikimedia Commons image
 * @param {string} filename - Wikimedia Commons filename (e.g., "File:Example.jpg")
 * @returns {string} Direct URL to the image
 */
export const getImageUrl = (filename) => {
  if (!filename) {
    return '';
  }

  // Remove "File:" prefix if present
  const cleanFilename = filename.replace(/^File:/, '');
  
  // Encode the filename for URL
  const encodedFilename = encodeURIComponent(cleanFilename);
  
  // Construct the direct URL
  // Using Special:FilePath which redirects to the actual file
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodedFilename}`;
};

/**
 * Fetches driver image with retry logic and rate limiting handling
 * @param {string} driverName - Full name of the driver
 * @param {number} retries - Number of retry attempts (default: 2)
 * @returns {Promise<string|null>} Promise that resolves to image URL or null
 */
export const fetchDriverImageWithRetry = async (driverName, retries = 2) => {
  let lastError = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Add delay between retries to handle rate limiting
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
      
      // Make the fetch call directly to allow proper error handling
      const searchParams = new URLSearchParams({
        action: 'query',
        format: 'json',
        titles: driverName,
        prop: 'pageimages',
        pithumbsize: 500,
        origin: '*'
      });

      const response = await fetch(`${WIKIMEDIA_API_BASE}?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Extract the page data
      const pages = data.query?.pages;
      if (!pages) {
        // No pages found - this is not an error, just no result
        return null;
      }

      // Get the first (and should be only) page
      const pageId = Object.keys(pages)[0];
      const page = pages[pageId];

      // Check if we have a thumbnail
      if (page.thumbnail?.source) {
        return page.thumbnail.source;
      }

      // If no thumbnail, try to get the original image
      if (page.original?.source) {
        return page.original.source;
      }

      // No image found - this is not an error, just no result
      return null;
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt + 1} failed for ${driverName}:`, error);
      
      // If this was the last attempt, return null
      if (attempt === retries) {
        console.error(`All retry attempts failed for ${driverName}:`, lastError);
        return null;
      }
      // Otherwise, continue to next retry
    }
  }
  
  return null;
};
