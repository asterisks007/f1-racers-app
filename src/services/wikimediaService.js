/**
 * WikimediaService - Fetches images from Wikimedia Commons
 */

const WIKIMEDIA_API_BASE = 'https://commons.wikimedia.org/w/api.php';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Delay helper for exponential backoff
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch with retry logic and exponential backoff
 */
async function fetchWithRetry(url, retries = MAX_RETRIES, retryDelay = INITIAL_RETRY_DELAY) {
  try {
    const response = await fetch(url);
    
    // Handle rate limiting (429) or server errors (5xx)
    if (response.status === 429 || response.status >= 500) {
      if (retries > 0) {
        console.warn(`Request failed with status ${response.status}, retrying in ${retryDelay}ms...`);
        await delay(retryDelay);
        return fetchWithRetry(url, retries - 1, retryDelay * 2); // Exponential backoff
      }
      throw new Error(`Failed after ${MAX_RETRIES} retries: ${response.status}`);
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    if (retries > 0 && (error.name === 'TypeError' || error.message.includes('network'))) {
      console.warn(`Network error, retrying in ${retryDelay}ms...`);
      await delay(retryDelay);
      return fetchWithRetry(url, retries - 1, retryDelay * 2);
    }
    throw error;
  }
}

/**
 * Fetch driver image from Wikimedia Commons
 * @param {string} driverName - Name of the driver
 * @returns {Promise<string>} - URL to the driver image
 */
export async function fetchDriverImage(driverName) {
  try {
    // Search for images related to the driver
    const searchUrl = `${WIKIMEDIA_API_BASE}?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(driverName + ' Formula 1')}&srnamespace=6&srlimit=5`;
    
    const response = await fetchWithRetry(searchUrl);
    const data = await response.json();
    
    if (!data.query || !data.query.search || data.query.search.length === 0) {
      return null;
    }
    
    // Get the first result's title
    const imageTitle = data.query.search[0].title;
    
    // Get the actual image URL
    const imageUrl = await getImageUrl(imageTitle);
    return imageUrl;
  } catch (error) {
    console.error('Error fetching driver image from Wikimedia:', error);
    return null;
  }
}

/**
 * Fetch racing team car image from Wikimedia Commons
 * @param {string} teamName - Name of the racing team
 * @param {number} year - Year of the car
 * @returns {Promise<string|null>} - URL to the team car image or null if not found
 */
export async function fetchTeamCarImage(teamName, year) {
  try {
    // Search for images related to the team car
    const searchTerms = [
      `${teamName} ${year} Formula 1 car`,
      `${teamName} F1 ${year}`,
      `${teamName} Formula One ${year}`
    ];
    
    // Try each search term
    for (const searchTerm of searchTerms) {
      const searchUrl = `${WIKIMEDIA_API_BASE}?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(searchTerm)}&srnamespace=6&srlimit=5`;
      
      const response = await fetchWithRetry(searchUrl);
      const data = await response.json();
      
      if (data.query && data.query.search && data.query.search.length > 0) {
        // Get the first result's title
        const imageTitle = data.query.search[0].title;
        
        // Get the actual image URL
        const imageUrl = await getImageUrl(imageTitle);
        if (imageUrl) {
          return imageUrl;
        }
      }
    }
    
    // No suitable image found
    return null;
  } catch (error) {
    console.error('Error fetching team car image from Wikimedia:', error);
    return null;
  }
}

/**
 * Get direct image URL from Wikimedia Commons
 * @param {string} imageTitle - Title of the image file
 * @returns {Promise<string|null>} - Direct URL to the image
 */
export async function getImageUrl(imageTitle) {
  try {
    const infoUrl = `${WIKIMEDIA_API_BASE}?action=query&format=json&origin=*&titles=${encodeURIComponent(imageTitle)}&prop=imageinfo&iiprop=url`;
    
    const response = await fetchWithRetry(infoUrl);
    const data = await response.json();
    
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    
    if (pageId === '-1' || !pages[pageId].imageinfo) {
      return null;
    }
    
    return pages[pageId].imageinfo[0].url;
  } catch (error) {
    console.error('Error getting image URL from Wikimedia:', error);
    return null;
  }
}
