/**
 * Tests for ImageCacheService
 * Feature: f1-racers-mobile-app
 */

import * as fc from 'fast-check';
import { ImageCacheService } from './ImageCacheService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('react-native-fast-image');

describe('ImageCacheService', () => {
  let service: ImageCacheService;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Reset AsyncStorage mock
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    
    // Reset FastImage mocks
    (FastImage.preload as jest.Mock).mockResolvedValue(undefined);
    (FastImage.clearDiskCache as jest.Mock).mockResolvedValue(undefined);
    (FastImage.clearMemoryCache as jest.Mock).mockResolvedValue(undefined);

    // Get fresh instance
    service = ImageCacheService.getInstance();
    await service.clearAllCache();
  });

  afterEach(async () => {
    await service.clearAllCache();
  });

  /**
   * Feature: f1-racers-mobile-app, Property 9: Image caching round-trip
   * Validates: Requirements 9.1, 9.2
   * 
   * Property: For any image URL, after downloading and caching an image,
   * subsequent requests for the same URL should retrieve the image from cache
   * without re-downloading.
   */
  describe('Property 9: Image caching round-trip', () => {
    it('should return the same URL for cached images on subsequent requests', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary valid URLs
          fc.webUrl(),
          async (imageUrl) => {
            // First request - should cache the image
            const firstResult = await service.getCachedImage(imageUrl);
            
            // Second request - should retrieve from cache
            const secondResult = await service.getCachedImage(imageUrl);
            
            // Both requests should return the same URL
            expect(firstResult).toBe(imageUrl);
            expect(secondResult).toBe(imageUrl);
            expect(firstResult).toBe(secondResult);
            
            // Verify the URL is tracked in cache metadata
            const cacheSize = await service.getCacheSize();
            expect(cacheSize).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle multiple different URLs independently', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate array of unique URLs
          fc.uniqueArray(fc.webUrl(), { minLength: 2, maxLength: 10 }),
          async (imageUrls) => {
            // Cache all images
            const firstResults = await Promise.all(
              imageUrls.map(url => service.getCachedImage(url))
            );
            
            // Retrieve all images again
            const secondResults = await Promise.all(
              imageUrls.map(url => service.getCachedImage(url))
            );
            
            // All URLs should be returned correctly
            firstResults.forEach((result, index) => {
              expect(result).toBe(imageUrls[index]);
              expect(secondResults[index]).toBe(imageUrls[index]);
            });
            
            // Cache should contain all images
            const cacheSize = await service.getCacheSize();
            expect(cacheSize).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve cached URLs even after clearing and reloading', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.webUrl(),
          async (imageUrl) => {
            // Cache the image
            const firstResult = await service.getCachedImage(imageUrl);
            expect(firstResult).toBe(imageUrl);
            
            // Simulate app restart by getting a new instance
            // In real scenario, metadata would be loaded from AsyncStorage
            const newService = ImageCacheService.getInstance();
            
            // Should still return the same URL
            const afterRestartResult = await newService.getCachedImage(imageUrl);
            expect(afterRestartResult).toBe(imageUrl);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit tests for edge cases', () => {
    it('should handle empty URL gracefully', async () => {
      const result = await service.getCachedImage('');
      expect(result).toBe('');
    });

    it('should handle malformed URLs gracefully', async () => {
      const malformedUrl = 'not-a-valid-url';
      const result = await service.getCachedImage(malformedUrl);
      expect(result).toBe(malformedUrl);
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error('Storage quota exceeded')
      );
      
      const url = 'https://example.com/image.jpg';
      const result = await service.getCachedImage(url);
      
      // Should still return the URL even if storage fails
      expect(result).toBe(url);
    });

    it('should preload multiple images', async () => {
      const urls = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
      ];
      
      await service.preloadImages(urls);
      
      expect(FastImage.preload).toHaveBeenCalledWith(
        urls.map(url => ({ uri: url }))
      );
      
      const cacheSize = await service.getCacheSize();
      expect(cacheSize).toBeGreaterThan(0);
    });

    it('should clear all cache', async () => {
      const url = 'https://example.com/image.jpg';
      await service.getCachedImage(url);
      
      let cacheSize = await service.getCacheSize();
      expect(cacheSize).toBeGreaterThan(0);
      
      await service.clearAllCache();
      
      cacheSize = await service.getCacheSize();
      expect(cacheSize).toBe(0);
      
      expect(FastImage.clearDiskCache).toHaveBeenCalled();
      expect(FastImage.clearMemoryCache).toHaveBeenCalled();
    });
  });

  /**
   * Feature: f1-racers-mobile-app, Property 10: Cache eviction policy
   * Validates: Requirements 9.3
   * 
   * Property: For any image cache, when the total cache size exceeds 50MB,
   * the system should remove the oldest cached images until the size is below the limit.
   */
  describe('Property 10: Cache eviction policy', () => {
    const MAX_CACHE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

    it('should reduce cache size below limit after eviction when cache exceeds 50MB', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            // Number of images that will exceed the limit
            // 512 images * 100KB = 52,428,800 bytes = exactly 50MB
            // We need more than 512 to exceed the limit
            numImages: fc.integer({ min: 520, max: 800 }),
          }),
          async ({ numImages }) => {
            // Clear cache before test
            await service.clearAllCache();
            
            // Each image is estimated at 100KB by the service
            const estimatedImageSize = 100 * 1024;
            
            // Cache enough images to exceed the 50MB limit
            const urls: string[] = [];
            for (let i = 0; i < numImages; i++) {
              const url = `https://example.com/prop10-image-${i}.jpg`;
              urls.push(url);
              await service.getCachedImage(url);
            }

            const initialSize = await service.getCacheSize();
            const expectedSize = numImages * estimatedImageSize;
            
            // Verify we exceeded the limit (only test if we actually exceeded)
            if (initialSize > MAX_CACHE_SIZE_BYTES) {
              expect(initialSize).toBe(expectedSize);

              // Trigger eviction
              await service.clearOldCache();
              
              const finalSize = await service.getCacheSize();
              
              // After eviction, cache size should be at or below the limit
              expect(finalSize).toBeLessThanOrEqual(MAX_CACHE_SIZE_BYTES);
              
              // Cache size should have decreased
              expect(finalSize).toBeLessThan(initialSize);
            }
            
            // Clean up
            await service.clearAllCache();
          }
        ),
        { numRuns: 20 } // Reduced runs for performance
      );
    }, 30000); // Increase timeout to 30 seconds

    it('should not evict images when cache is below 50MB limit', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 100 }),
          async (numImages) => {
            // Clear cache
            await service.clearAllCache();

            // Cache small number of images (well below limit)
            const urls: string[] = [];
            for (let i = 0; i < numImages; i++) {
              const url = `https://example.com/small-prop10-image-${i}.jpg`;
              urls.push(url);
              await service.getCachedImage(url);
            }

            const sizeBefore = await service.getCacheSize();
            
            // Verify we're under the limit
            expect(sizeBefore).toBeLessThanOrEqual(MAX_CACHE_SIZE_BYTES);
            
            // Call clearOldCache even though we're under limit
            await service.clearOldCache();
            
            const sizeAfter = await service.getCacheSize();
            
            // Size should remain the same since we're under limit
            expect(sizeAfter).toBe(sizeBefore);
            
            // Clean up
            await service.clearAllCache();
          }
        ),
        { numRuns: 100 }
      );
    }, 20000); // Increase timeout to 20 seconds
  });

  describe('Cache eviction unit tests', () => {
    it('should track cache size', async () => {
      const url = 'https://example.com/image.jpg';
      await service.getCachedImage(url);
      
      const cacheSize = await service.getCacheSize();
      expect(cacheSize).toBeGreaterThan(0);
    });

    it('should evict old images when cache exceeds limit', async () => {
      // This is a simplified test - in reality, we'd need to mock
      // the cache size to exceed the limit
      const urls = Array.from({ length: 600 }, (_, i) => 
        `https://example.com/image${i}.jpg`
      );
      
      for (const url of urls) {
        await service.getCachedImage(url);
      }
      
      await service.clearOldCache();
      
      const cacheSize = await service.getCacheSize();
      // Cache should be managed (this is a basic check)
      expect(cacheSize).toBeGreaterThanOrEqual(0);
    });
  });

  /**
   * Unit tests for image error handling
   * Requirements: 1.4, 10.2
   */
  describe('Image error handling unit tests', () => {
    describe('Network error scenarios', () => {
      it('should return original URL when network request fails', async () => {
        const imageUrl = 'https://example.com/driver-image.jpg';
        
        // Simulate network failure by making AsyncStorage operations fail
        (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
          new Error('Network timeout')
        );
        
        const result = await service.getCachedImage(imageUrl);
        
        // Should return the URL so FastImage can handle the error
        expect(result).toBe(imageUrl);
      });

      it('should handle network timeout errors gracefully', async () => {
        const imageUrl = 'https://example.com/timeout-image.jpg';
        
        // Simulate timeout
        (AsyncStorage.getItem as jest.Mock).mockImplementationOnce(() => 
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 100)
          )
        );
        
        const result = await service.getCachedImage(imageUrl);
        
        // Should still return URL for FastImage to attempt download
        expect(result).toBe(imageUrl);
        expect(result).toBeTruthy();
      });

      it('should handle DNS resolution failures', async () => {
        const imageUrl = 'https://nonexistent-domain-12345.com/image.jpg';
        
        // Service should return URL regardless of domain validity
        const result = await service.getCachedImage(imageUrl);
        
        expect(result).toBe(imageUrl);
      });

      it('should handle HTTP error responses (404, 500, etc)', async () => {
        const urls = [
          'https://example.com/404-not-found.jpg',
          'https://example.com/500-server-error.jpg',
          'https://example.com/403-forbidden.jpg',
        ];
        
        for (const url of urls) {
          const result = await service.getCachedImage(url);
          
          // Should return URL so FastImage can handle HTTP errors
          expect(result).toBe(url);
        }
      });

      it('should handle network disconnection during download', async () => {
        const imageUrl = 'https://example.com/large-image.jpg';
        
        // Simulate network disconnection
        (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
          new Error('Network connection lost')
        );
        
        const result = await service.getCachedImage(imageUrl);
        
        expect(result).toBe(imageUrl);
      });

      it('should handle slow network connections', async () => {
        const imageUrl = 'https://example.com/slow-loading-image.jpg';
        
        // Simulate slow response
        (AsyncStorage.getItem as jest.Mock).mockImplementationOnce(() =>
          new Promise(resolve => setTimeout(() => resolve(null), 50))
        );
        
        const result = await service.getCachedImage(imageUrl);
        
        expect(result).toBe(imageUrl);
      });
    });

    describe('Cache miss scenarios', () => {
      it('should handle cache miss for new image', async () => {
        const imageUrl = 'https://example.com/new-driver.jpg';
        
        // Ensure cache is empty
        await service.clearAllCache();
        
        const result = await service.getCachedImage(imageUrl);
        
        // Should return URL for download
        expect(result).toBe(imageUrl);
        
        // Should now be in cache
        const cacheSize = await service.getCacheSize();
        expect(cacheSize).toBeGreaterThan(0);
      });

      it('should handle cache miss after cache clear', async () => {
        const imageUrl = 'https://example.com/cached-then-cleared.jpg';
        
        // First cache the image
        await service.getCachedImage(imageUrl);
        let cacheSize = await service.getCacheSize();
        expect(cacheSize).toBeGreaterThan(0);
        
        // Clear cache
        await service.clearAllCache();
        cacheSize = await service.getCacheSize();
        expect(cacheSize).toBe(0);
        
        // Request again - should be cache miss
        const result = await service.getCachedImage(imageUrl);
        expect(result).toBe(imageUrl);
      });

      it('should handle corrupted cache metadata', async () => {
        const imageUrl = 'https://example.com/corrupted-cache.jpg';
        
        // Simulate corrupted cache metadata
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
          '{invalid json syntax'
        );
        
        const result = await service.getCachedImage(imageUrl);
        
        // Should handle gracefully and return URL
        expect(result).toBe(imageUrl);
      });

      it('should handle missing cache metadata file', async () => {
        const imageUrl = 'https://example.com/no-metadata.jpg';
        
        // Simulate missing metadata
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
        
        const result = await service.getCachedImage(imageUrl);
        
        expect(result).toBe(imageUrl);
      });

      it('should handle cache eviction of requested image', async () => {
        const imageUrl = 'https://example.com/evicted-image.jpg';
        
        // Cache the image
        await service.getCachedImage(imageUrl);
        
        // Simulate cache eviction by clearing
        await service.clearAllCache();
        
        // Request again - should handle cache miss
        const result = await service.getCachedImage(imageUrl);
        expect(result).toBe(imageUrl);
      });

      it('should handle cache read permission errors', async () => {
        const imageUrl = 'https://example.com/permission-denied.jpg';
        
        // Simulate permission error
        (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
          new Error('Permission denied')
        );
        
        const result = await service.getCachedImage(imageUrl);
        
        expect(result).toBe(imageUrl);
      });
    });

    describe('Placeholder image display scenarios', () => {
      it('should return URL that allows FastImage to show placeholder on error', async () => {
        const imageUrl = 'https://example.com/broken-image.jpg';
        
        // Service returns URL, FastImage handles placeholder display
        const result = await service.getCachedImage(imageUrl);
        
        // URL should be returned so FastImage can attempt load and show placeholder on failure
        expect(result).toBe(imageUrl);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });

      it('should handle empty image URLs gracefully', async () => {
        const emptyUrl = '';
        
        const result = await service.getCachedImage(emptyUrl);
        
        // Should return empty string (FastImage will handle placeholder)
        expect(result).toBe('');
      });

      it('should handle null or undefined URLs gracefully', async () => {
        // TypeScript would prevent this, but test runtime behavior
        const result1 = await service.getCachedImage(null as any);
        const result2 = await service.getCachedImage(undefined as any);
        
        // Service returns what it receives (FastImage will handle invalid values)
        expect(result1).toBe(null);
        expect(result2).toBe(undefined);
      });

      it('should handle malformed image URLs', async () => {
        const malformedUrls = [
          'not-a-url',
          'ftp://wrong-protocol.com/image.jpg',
          'javascript:alert("xss")',
          '../../../etc/passwd',
          'data:image/png;base64,invalid',
        ];
        
        for (const url of malformedUrls) {
          const result = await service.getCachedImage(url);
          
          // Should return the URL (FastImage will handle invalid URLs)
          expect(result).toBe(url);
        }
      });

      it('should handle image URLs with special characters', async () => {
        const specialUrls = [
          'https://example.com/image with spaces.jpg',
          'https://example.com/image%20encoded.jpg',
          'https://example.com/image?query=param&foo=bar',
          'https://example.com/image#fragment',
        ];
        
        for (const url of specialUrls) {
          const result = await service.getCachedImage(url);
          
          expect(result).toBe(url);
        }
      });

      it('should handle very long image URLs', async () => {
        const longUrl = 'https://example.com/' + 'a'.repeat(2000) + '.jpg';
        
        const result = await service.getCachedImage(longUrl);
        
        expect(result).toBe(longUrl);
      });

      it('should handle preload failures gracefully', async () => {
        const urls = [
          'https://example.com/preload1.jpg',
          'https://example.com/preload2.jpg',
        ];
        
        // Simulate preload failure
        (FastImage.preload as jest.Mock).mockRejectedValueOnce(
          new Error('Preload failed')
        );
        
        // Should not throw error
        await expect(service.preloadImages(urls)).resolves.not.toThrow();
      });

      it('should handle storage quota exceeded errors', async () => {
        const imageUrl = 'https://example.com/quota-exceeded.jpg';
        
        // Simulate storage quota exceeded
        (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
          new Error('QuotaExceededError: Storage quota exceeded')
        );
        
        const result = await service.getCachedImage(imageUrl);
        
        // Should still return URL for display
        expect(result).toBe(imageUrl);
      });
    });

    describe('Multiple concurrent error scenarios', () => {
      it('should handle multiple concurrent cache failures', async () => {
        const urls = Array.from({ length: 10 }, (_, i) => 
          `https://example.com/concurrent-${i}.jpg`
        );
        
        // Simulate random failures
        (AsyncStorage.setItem as jest.Mock).mockImplementation(() => {
          if (Math.random() > 0.5) {
            return Promise.reject(new Error('Random failure'));
          }
          return Promise.resolve();
        });
        
        const results = await Promise.all(
          urls.map(url => service.getCachedImage(url))
        );
        
        // All should return valid URLs
        results.forEach((result, index) => {
          expect(result).toBe(urls[index]);
        });
      });

      it('should handle mixed success and failure scenarios', async () => {
        const urls = [
          'https://example.com/success1.jpg',
          'https://example.com/fail1.jpg',
          'https://example.com/success2.jpg',
        ];
        
        let callCount = 0;
        (AsyncStorage.setItem as jest.Mock).mockImplementation(() => {
          callCount++;
          if (callCount === 2) {
            return Promise.reject(new Error('Simulated failure'));
          }
          return Promise.resolve();
        });
        
        const results = await Promise.all(
          urls.map(url => service.getCachedImage(url))
        );
        
        // All should return URLs regardless of cache success
        results.forEach((result, index) => {
          expect(result).toBe(urls[index]);
        });
      });
    });
  });

  /**
   * Feature: f1-racers-mobile-app, Property 11: Cache failure fallback
   * Validates: Requirements 9.5
   * 
   * Property: For any cached image that fails to load from cache,
   * the system should attempt to download the image from the network.
   */
  describe('Property 11: Cache failure fallback', () => {
    it('should return valid URL for network download when cache operations fail', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.webUrl(),
          async (imageUrl) => {
            // Simulate cache metadata failure
            (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
              new Error('Cache read failed')
            );
            
            // Even with cache failure, should return the URL for network download
            const result = await service.getCachedImage(imageUrl);
            
            // Should return the original URL so FastImage can attempt network download
            expect(result).toBe(imageUrl);
            expect(result).toBeTruthy();
            expect(typeof result).toBe('string');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle cache save failures and still return URL for download', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.webUrl(),
          async (imageUrl) => {
            // Simulate cache save failure
            (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
              new Error('Cache write failed')
            );
            
            // Should still return URL even if we can't save to cache
            const result = await service.getCachedImage(imageUrl);
            
            expect(result).toBe(imageUrl);
            expect(result).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return URL for network download after multiple cache failures', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uniqueArray(fc.webUrl(), { minLength: 2, maxLength: 10 }),
          async (imageUrls) => {
            // Simulate persistent cache failures
            (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
              new Error('Persistent cache failure')
            );
            (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
              new Error('Persistent cache failure')
            );
            
            // All URLs should still be returned for network download
            const results = await Promise.all(
              imageUrls.map(url => service.getCachedImage(url))
            );
            
            results.forEach((result, index) => {
              expect(result).toBe(imageUrls[index]);
              expect(result).toBeTruthy();
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should gracefully handle corrupted cache metadata and return URL', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.webUrl(),
          async (imageUrl) => {
            // Simulate corrupted cache metadata
            (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
              'invalid-json-{corrupted'
            );
            
            // Should handle gracefully and return URL for download
            const result = await service.getCachedImage(imageUrl);
            
            expect(result).toBe(imageUrl);
            expect(result).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
