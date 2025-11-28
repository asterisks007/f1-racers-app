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

/**
 * Fetches racing team car image from Wikimedia Commons
 * @param {string} teamName - Name of the F1 team
 * @param {number} year - Year of the car
 * @returns {Promise<string|null>} Promise that resolves to image URL or null if not found
 */
export const fetchTeamCarImage = async (teamName, year) => {
  try {
    // Construct search query for team car
    const searchQuery = `${teamName} ${year} Formula One car`;
    
    // Search for images on Wikimedia Commons
    const searchParams = new URLSearchParams({
      action: 'query',
      format: 'json',
      list: 'search',
      srsearch: searchQuery,
      srnamespace: '6', // File namespace
      srlimit: '5',
      origin: '*'
    });

    const response = await fetch(`${COMMONS_API_BASE}?${searchParams}`);
    
    if (!response.ok) {
      console.warn(`Wikimedia Commons search failed for ${teamName} ${year}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Check if we have search results
    if (!data.query?.search || data.query.search.length === 0) {
      return null;
    }

    // Get the first result
    const firstResult = data.query.search[0];
    const filename = firstResult.title;

    // Get the image info to retrieve the actual image URL
    const imageParams = new URLSearchParams({
      action: 'query',
      format: 'json',
      titles: filename,
      prop: 'imageinfo',
      iiprop: 'url',
      iiurlwidth: 500,
      origin: '*'
    });

    const imageResponse = await fetch(`${COMMONS_API_BASE}?${imageParams}`);
    
    if (!imageResponse.ok) {
      console.warn(`Failed to get image info for ${filename}: ${imageResponse.status}`);
      return null;
    }

    const imageData = await imageResponse.json();
    const pages = imageData.query?.pages;
    
    if (!pages) {
      return null;
    }

    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];

    // Return the thumbnail URL if available
    if (page.imageinfo?.[0]?.thumburl) {
      return page.imageinfo[0].thumburl;
    }

    // Otherwise return the full URL
    if (page.imageinfo?.[0]?.url) {
      return page.imageinfo[0].url;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching team car image for ${teamName} ${year}:`, error);
    return null;
  }
};

/**
 * Fetches team car image with retry logic and rate limiting handling
 * @param {string} teamName - Name of the F1 team
 * @param {number} year - Year of the car
 * @param {number} retries - Number of retry attempts (default: 2)
 * @returns {Promise<string|null>} Promise that resolves to image URL or null
 */
export const fetchTeamCarImageWithRetry = async (teamName, year, retries = 2) => {
  let lastError = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Add exponential backoff delay between retries
      if (attempt > 0) {
        const delay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s...
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const imageUrl = await fetchTeamCarImage(teamName, year);
      
      // If we got a result (even if null), return it
      return imageUrl;
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt + 1} failed for ${teamName} ${year} car:`, error);
      
      // If this was the last attempt, return null
      if (attempt === retries) {
        console.error(`All retry attempts failed for ${teamName} ${year} car:`, lastError);
        return null;
      }
      // Otherwise, continue to next retry
    }
  }
  
  return null;
};
