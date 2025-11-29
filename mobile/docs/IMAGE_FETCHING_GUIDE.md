# Driver Image Fetching Guide

This guide explains how to fetch and optimize driver images from Wikimedia for the F1 Racers Mobile App.

## Overview

The app currently uses Wikimedia URLs directly in the `drivers.json` file. For production use, you may want to:
1. Download images locally for faster loading
2. Optimize images for mobile resolutions
3. Reduce dependency on external services

## Current Implementation

The app uses `react-native-fast-image` which provides automatic caching of remote images. This means:
- Images are downloaded once and cached locally
- No need to bundle images with the app
- Reduces app size significantly
- Images load quickly after first download

## Fetching Images Locally (Optional)

If you want to bundle optimized images with the app, use the provided script:

```bash
npm run fetch-images
```

### What the Script Does

1. Reads driver data from `src/assets/drivers.json`
2. Downloads images from Wikimedia URLs
3. Creates optimized versions at three resolutions:
   - **1x** (200px): For mdpi devices
   - **2x** (400px): For xhdpi devices  
   - **3x** (600px): For xxhdpi devices
4. Saves images to `src/assets/images/drivers/driver-{id}/`
5. Updates `drivers.json` with `localImagePath` field

### Image Resolution Strategy

The script attempts to download images at multiple resolutions to support different device pixel densities:

- **mdpi** (1x): Standard resolution phones
- **xhdpi** (2x): High resolution phones (most common)
- **xxhdpi** (3x): Very high resolution phones and tablets

React Native automatically selects the appropriate resolution based on the device's pixel density.

## Handling Missing Images

Some Wikimedia images may not be available at all requested sizes. The script handles this by:

1. Attempting to download the optimized size
2. Falling back to the original URL if the optimized size fails
3. Keeping the original Wikimedia URL if all downloads fail

## Image Optimization Best Practices

### For Production Apps

1. **Use a CDN**: Upload optimized images to a CDN for better performance
2. **WebP Format**: Consider converting to WebP for smaller file sizes
3. **Lazy Loading**: Images are already lazy-loaded by `react-native-fast-image`
4. **Cache Management**: The app automatically manages cache size (50MB limit)

### Manual Optimization

If you need to manually optimize images:

```bash
# Install sharp for image processing
npm install --save-dev sharp

# Create an optimization script
node scripts/optimize-images.js
```

## Updating Driver Images

To update images for specific drivers:

1. Update the `imageUrl` in `src/assets/drivers.json`
2. Run `npm run fetch-images` to download new images
3. Test on both iOS and Android devices

## Troubleshooting

### Images Not Downloading

**Problem**: Script returns 404 errors

**Solution**: 
- Verify the Wikimedia URL is correct
- Check if the image exists at the specified resolution
- Try using the original URL without size parameters

### Images Too Large

**Problem**: App bundle size is too large

**Solution**:
- Use remote URLs instead of bundled images
- Enable ProGuard/R8 for Android builds
- Use WebP format for smaller file sizes

### Cache Issues

**Problem**: Old images still showing

**Solution**:
```javascript
// Clear image cache in the app
import FastImage from 'react-native-fast-image';

FastImage.clearDiskCache();
FastImage.clearMemoryCache();
```

## Image Licensing

All images are from Wikimedia Commons and are licensed under Creative Commons or public domain licenses. Always verify licensing before using images in production.

## Performance Considerations

### Remote URLs (Current Approach)
- ✅ Smaller app bundle size
- ✅ Easy to update images
- ✅ Automatic caching
- ❌ Requires network on first load
- ❌ Depends on external service

### Bundled Images
- ✅ Works offline immediately
- ✅ No external dependencies
- ✅ Faster first load
- ❌ Larger app bundle
- ❌ Harder to update

## Recommended Approach

For this educational project, **using remote Wikimedia URLs with caching** (current implementation) is recommended because:

1. Keeps app size small
2. Images are high quality
3. Automatic caching provides good performance
4. Easy to update driver data
5. No licensing concerns

For a production app, consider:
1. Hosting images on your own CDN
2. Using WebP format
3. Implementing progressive image loading
4. Adding image preloading for better UX

## Script Configuration

You can customize the script by editing `scripts/fetch-driver-images.js`:

```javascript
// Change image sizes
const IMAGE_SIZES = {
  '1x': 200,  // Base resolution
  '2x': 400,  // 2x resolution
  '3x': 600   // 3x resolution
};

// Change output directory
const OUTPUT_DIR = path.join(__dirname, '../src/assets/images/drivers');
```

## Future Enhancements

Potential improvements to the image fetching system:

1. **Automatic WebP Conversion**: Convert images to WebP for better compression
2. **Blurhash Generation**: Generate blurhash placeholders for smooth loading
3. **Image Validation**: Verify image dimensions and quality
4. **Batch Processing**: Process multiple drivers in parallel
5. **Progress Tracking**: Show download progress in the script
6. **Error Recovery**: Retry failed downloads automatically

## Related Files

- `scripts/fetch-driver-images.js` - Image fetching script
- `src/assets/drivers.json` - Driver data with image URLs
- `src/services/ImageCacheService.ts` - Image caching logic
- `src/components/DriverCard.tsx` - Component that displays driver images

## Support

For issues with image fetching:
1. Check the script output for specific error messages
2. Verify network connectivity
3. Ensure Wikimedia URLs are accessible
4. Check available disk space for image storage
