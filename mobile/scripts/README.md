# Image Fetching Scripts

This directory contains scripts for fetching and optimizing driver images from Wikimedia.

## Available Scripts

### fetch-driver-images.js

Downloads driver portrait images from Wikimedia and optimizes them for mobile devices.

**Usage:**
```bash
npm run fetch-images
```

**What it does:**
1. Reads driver data from `src/assets/drivers.json`
2. Downloads images from Wikimedia URLs at multiple resolutions
3. Saves optimized images to `src/assets/images/drivers/`
4. Updates `drivers.json` with local image paths

**Configuration:**

Edit the script to customize:
- Image sizes (1x, 2x, 3x resolutions)
- Output directory
- Download retry logic
- Request headers

## Image Resolution Strategy

The script creates three versions of each image:

| Resolution | Width | Target Devices |
|------------|-------|----------------|
| 1x (mdpi)  | 200px | Standard phones |
| 2x (xhdpi) | 400px | High-res phones (most common) |
| 3x (xxhdpi)| 600px | Very high-res phones & tablets |

React Native automatically selects the appropriate resolution based on device pixel density.

## Troubleshooting

### 404 Errors

Some Wikimedia images may not exist at all requested sizes. The script:
1. Attempts the optimized size first
2. Falls back to the original URL
3. Keeps the remote URL if all downloads fail

### Network Issues

If downloads fail due to network issues:
1. Check your internet connection
2. Verify Wikimedia is accessible
3. Try running the script again (it will skip already downloaded images)

### Image Quality

The script downloads images at the sizes specified in `IMAGE_SIZES`. To change quality:
1. Edit the `IMAGE_SIZES` object in the script
2. Adjust width values (larger = higher quality, larger file size)
3. Re-run the script

## Current Implementation

The app currently uses **remote Wikimedia URLs with automatic caching** via `react-native-fast-image`. This approach:

✅ Keeps app bundle size small  
✅ Provides automatic caching  
✅ Works well for this educational project  
✅ Easy to update driver data  

For production apps, consider:
- Hosting images on your own CDN
- Converting to WebP format
- Implementing progressive loading
- Adding image preloading

## Related Documentation

See `docs/IMAGE_FETCHING_GUIDE.md` for comprehensive documentation on:
- Image optimization best practices
- Production deployment strategies
- Cache management
- Performance considerations
- Licensing information

## Future Enhancements

Potential improvements:
- [ ] WebP conversion for better compression
- [ ] Blurhash generation for placeholders
- [ ] Parallel downloads for faster processing
- [ ] Image validation and quality checks
- [ ] Automatic retry on failure
- [ ] Progress bar for downloads
