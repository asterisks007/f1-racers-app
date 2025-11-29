/**
 * Script to fetch driver images from Wikimedia and optimize them for mobile
 * 
 * This script:
 * 1. Reads driver data from drivers.json
 * 2. Downloads images from Wikimedia URLs
 * 3. Optimizes images for mobile resolutions (1x, 2x, 3x)
 * 4. Saves optimized images to src/assets/images/drivers/
 * 5. Updates drivers.json with local image paths
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const DRIVERS_JSON_PATH = path.join(__dirname, '../src/assets/drivers.json');
const OUTPUT_DIR = path.join(__dirname, '../src/assets/images/drivers');
const IMAGE_SIZES = {
  '1x': 200,  // Base resolution for mdpi
  '2x': 400,  // For xhdpi
  '3x': 600   // For xxhdpi
};

// Ensure output directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Download image from URL
function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    console.log(`Downloading: ${url}`);
    
    const options = {
      headers: {
        'User-Agent': 'F1RacersMobileApp/1.0 (Educational Project)',
        'Accept': 'image/*'
      }
    };
    
    protocol.get(url, options, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(outputPath);
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`Saved: ${outputPath}`);
          resolve(outputPath);
        });
        
        fileStream.on('error', (err) => {
          fs.unlink(outputPath, () => {});
          reject(err);
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        const redirectUrl = response.headers.location;
        console.log(`Redirecting to: ${redirectUrl}`);
        downloadImage(redirectUrl, outputPath).then(resolve).catch(reject);
      } else {
        reject(new Error(`Failed to download: ${response.statusCode} ${url}`));
      }
    }).on('error', reject);
  });
}

// Get optimized image URL from Wikimedia
function getOptimizedWikimediaUrl(originalUrl, width) {
  // Wikimedia URLs can be resized by changing the width parameter
  // Example: /440px-Name.jpg -> /200px-Name.jpg
  const match = originalUrl.match(/\/(\d+)px-/);
  if (match) {
    return originalUrl.replace(`/${match[1]}px-`, `/${width}px-`);
  }
  return originalUrl;
}

// Extract filename from URL
function getFilenameFromUrl(url) {
  const urlPath = new URL(url).pathname;
  const filename = path.basename(urlPath);
  // Remove size prefix (e.g., "440px-") and decode URL encoding
  return decodeURIComponent(filename.replace(/^\d+px-/, ''));
}

// Process a single driver's image
async function processDriverImage(driver, index) {
  try {
    console.log(`\n[${index + 1}] Processing: ${driver.name}`);
    
    const filename = getFilenameFromUrl(driver.imageUrl);
    const baseFilename = filename.replace(/\.[^.]+$/, ''); // Remove extension
    const ext = path.extname(filename);
    
    // Create driver-specific directory
    const driverDir = path.join(OUTPUT_DIR, `driver-${driver.id}`);
    ensureDirectoryExists(driverDir);
    
    // Download images at different resolutions
    const downloadedImages = {};
    let anySuccess = false;
    
    for (const [scale, width] of Object.entries(IMAGE_SIZES)) {
      const optimizedUrl = getOptimizedWikimediaUrl(driver.imageUrl, width);
      const outputFilename = `${baseFilename}@${scale}${ext}`;
      const outputPath = path.join(driverDir, outputFilename);
      
      try {
        await downloadImage(optimizedUrl, outputPath);
        downloadedImages[scale] = outputPath;
        anySuccess = true;
      } catch (error) {
        // If optimized size fails, try the original URL as fallback
        if (!anySuccess) {
          try {
            console.log(`Trying original URL for ${scale}...`);
            await downloadImage(driver.imageUrl, outputPath);
            downloadedImages[scale] = outputPath;
            anySuccess = true;
          } catch (fallbackError) {
            console.error(`Failed to download ${scale} for ${driver.name}`);
          }
        }
      }
    }
    
    // Update driver object with local image path (use 2x as default, or any available)
    const preferredScale = downloadedImages['2x'] || downloadedImages['1x'] || downloadedImages['3x'];
    if (preferredScale) {
      const relativePath = path.relative(
        path.join(__dirname, '../src/assets'),
        preferredScale
      ).replace(/\\/g, '/');
      driver.localImagePath = relativePath;
      console.log(`✓ Updated local path: ${relativePath}`);
    } else {
      // Keep the original Wikimedia URL if download failed
      console.log(`⚠ Keeping original URL for ${driver.name}`);
    }
    
    return driver;
  } catch (error) {
    console.error(`Error processing ${driver.name}:`, error.message);
    return driver;
  }
}

// Main function
async function main() {
  try {
    console.log('=== F1 Driver Image Fetcher ===\n');
    
    // Read drivers.json
    console.log(`Reading drivers data from: ${DRIVERS_JSON_PATH}`);
    const driversData = JSON.parse(fs.readFileSync(DRIVERS_JSON_PATH, 'utf8'));
    console.log(`Found ${driversData.length} drivers\n`);
    
    // Ensure output directory exists
    ensureDirectoryExists(OUTPUT_DIR);
    
    // Process each driver sequentially to avoid overwhelming the server
    const updatedDrivers = [];
    for (let i = 0; i < driversData.length; i++) {
      const updatedDriver = await processDriverImage(driversData[i], i);
      updatedDrivers.push(updatedDriver);
      
      // Add a small delay between requests to be respectful to Wikimedia servers
      if (i < driversData.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Update drivers.json with local image paths
    console.log('\n=== Updating drivers.json ===');
    const updatedJson = JSON.stringify(updatedDrivers, null, 2);
    fs.writeFileSync(DRIVERS_JSON_PATH, updatedJson, 'utf8');
    console.log(`✓ Updated: ${DRIVERS_JSON_PATH}`);
    
    // Generate summary
    const successCount = updatedDrivers.filter(d => d.localImagePath).length;
    console.log('\n=== Summary ===');
    console.log(`Total drivers: ${driversData.length}`);
    console.log(`Successfully processed: ${successCount}`);
    console.log(`Failed: ${driversData.length - successCount}`);
    
    if (successCount === driversData.length) {
      console.log('\n✓ All driver images fetched and optimized successfully!');
    } else {
      console.log('\n⚠ Some images failed to download. Check the logs above.');
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main };
