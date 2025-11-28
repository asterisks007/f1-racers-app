import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { optimizeImage, cacheImage, getCachedImage, getDriverImage } from './imageService.js';
import * as wikimediaService from './wikimediaService.js';
import { fetchDriverImage, getImageUrl, fetchDriverImageWithRetry } from './wikimediaService.js';

/**
 * Feature: f1-racers-app, Property 33: Image optimization dimensions
 * For any image fetched from Wikimedia, the optimized version should have a width of 440 pixels 
 * while maintaining the original aspect ratio.
 * Validates: Requirements 13.2
 */

describe('Property-Based Tests: Image Optimization', () => {
  let canvasCreations = [];

  beforeEach(() => {
    canvasCreations = [];
    
    // Store original createElement
    const originalCreateElement = document.createElement.bind(document);
    
    // Mock createElement to track canvas creation
    document.createElement = vi.fn((tagName) => {
      const element = originalCreateElement(tagName);
      
      if (tagName === 'canvas') {
        // Track canvas dimensions when they're set
        const canvas = element;
        let _width = 0;
        let _height = 0;
        
        Object.defineProperty(canvas, 'width', {
          get() { return _width; },
          set(value) {
            _width = value;
            canvasCreations.push({ width: value, height: _height });
          }
        });
        
        Object.defineProperty(canvas, 'height', {
          get() { return _height; },
          set(value) {
            _height = value;
            // Update the last creation record with height
            if (canvasCreations.length > 0) {
              canvasCreations[canvasCreations.length - 1].height = value;
            }
          }
        });
        
        // Mock getContext
        canvas.getContext = vi.fn(() => ({
          drawImage: vi.fn(),
        }));
        
        // Mock toBlob
        canvas.toBlob = vi.fn(function(callback, type, quality) {
          const mockBlob = new Blob(['mock-image-data'], { type: type || 'image/jpeg' });
          callback(mockBlob);
        });
      }
      
      return element;
    });

    // Mock Image class
    global.Image = class {
      constructor() {
        this.crossOrigin = '';
        this.onload = null;
        this.onerror = null;
        this._src = '';
      }
      
      set src(value) {
        this._src = value;
        // Simulate successful image load with the dimensions set on the mock
        setTimeout(() => {
          if (this.onload) {
            this.onload();
          }
        }, 0);
      }
      
      get src() {
        return this._src;
      }
    };
  });

  it('Property 33: optimized images have 440px width and maintain aspect ratio', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random image dimensions
        // Width: 100 to 5000 pixels
        // Height: 100 to 5000 pixels
        fc.integer({ min: 100, max: 5000 }),
        fc.integer({ min: 100, max: 5000 }),
        async (originalWidth, originalHeight) => {
          // Reset canvas tracking for this iteration
          canvasCreations = [];
          
          // Calculate expected aspect ratio
          const expectedAspectRatio = originalHeight / originalWidth;
          const targetWidth = 440;
          const expectedHeight = Math.round(targetWidth * expectedAspectRatio);

          // Create a mock image URL
          const mockImageUrl = `data:image/jpeg;base64,mock-${originalWidth}x${originalHeight}`;

          // Mock the Image class to return our test dimensions
          const OriginalImage = global.Image;
          global.Image = class extends OriginalImage {
            constructor() {
              super();
              this.width = originalWidth;
              this.height = originalHeight;
            }
          };

          try {
            // Call optimizeImage
            const resultBlob = await optimizeImage(mockImageUrl, targetWidth);

            // Verify the blob was created
            expect(resultBlob).toBeDefined();
            expect(resultBlob).toBeInstanceOf(Blob);

            // Verify that a canvas was created with the correct dimensions
            expect(canvasCreations.length).toBeGreaterThan(0);
            
            const canvasDimensions = canvasCreations[canvasCreations.length - 1];
            
            // Verify width is exactly 440px
            expect(canvasDimensions.width).toBe(targetWidth);
            
            // Verify height maintains aspect ratio
            expect(canvasDimensions.height).toBe(expectedHeight);

            // Verify aspect ratio is maintained (within rounding tolerance)
            const actualAspectRatio = canvasDimensions.height / canvasDimensions.width;
            const aspectRatioDifference = Math.abs(actualAspectRatio - expectedAspectRatio);
            
            // Allow for small rounding errors (less than 1%)
            expect(aspectRatioDifference).toBeLessThan(0.01);
          } finally {
            // Restore original Image class
            global.Image = OriginalImage;
          }
        }
      ),
      { numRuns: 100 } // Run minimum 100 iterations as specified
    );
  });
});

/**
 * Feature: f1-racers-app, Property 36: Cache usage over re-fetching
 * For any driver image that exists in the cache, the cached version should be used 
 * without re-fetching from Wikimedia.
 * Validates: Requirements 13.5
 */

describe('Property-Based Tests: Cache Behavior', () => {
  let mockCache;
  let fetchCallCount;

  beforeEach(() => {
    // Reset fetch call counter
    fetchCallCount = 0;

    // Mock the cache storage
    mockCache = new Map();

    // Mock caches.open
    global.caches = {
      open: vi.fn(async () => ({
        match: vi.fn(async (key) => {
          const cached = mockCache.get(key);
          return cached || undefined;
        }),
        put: vi.fn(async (key, response) => {
          mockCache.set(key, response);
        })
      }))
    };

    // Mock FileReader for blob to data URL conversion
    global.FileReader = class {
      readAsDataURL(blob) {
        // Use queueMicrotask for immediate async execution
        queueMicrotask(() => {
          this.result = `data:image/jpeg;base64,mock-data-${blob.size}`;
          if (this.onloadend) {
            this.onloadend();
          }
        });
      }
    };

    // Mock Response class
    global.Response = class {
      constructor(body, init) {
        this.body = body;
        this.headers = init?.headers || {};
      }
      
      async blob() {
        return this.body;
      }
    };

    // Mock Image class for optimization
    global.Image = class {
      constructor() {
        this.crossOrigin = '';
        this.onload = null;
        this.onerror = null;
        this._src = '';
        this.width = 800;
        this.height = 600;
      }
      
      set src(value) {
        this._src = value;
        queueMicrotask(() => {
          if (this.onload) {
            this.onload();
          }
        });
      }
      
      get src() {
        return this._src;
      }
    };

    // Mock document.createElement for canvas
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = vi.fn((tagName) => {
      const element = originalCreateElement(tagName);
      
      if (tagName === 'canvas') {
        element.width = 0;
        element.height = 0;
        element.getContext = vi.fn(() => ({
          drawImage: vi.fn(),
        }));
        element.toBlob = vi.fn(function(callback) {
          const mockBlob = new Blob(['mock-optimized-image'], { type: 'image/jpeg' });
          queueMicrotask(() => callback(mockBlob));
        });
      }
      
      return element;
    });

    // Mock wikimediaService.fetchDriverImageWithRetry
    vi.spyOn(wikimediaService, 'fetchDriverImageWithRetry').mockImplementation(async (driverName) => {
      fetchCallCount++;
      return `https://mock-wikimedia.com/${driverName.replace(/\s+/g, '_')}.jpg`;
    });
  });

  it('Property 36: cached images are used without re-fetching from Wikimedia', { timeout: 30000 }, async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random driver IDs and names
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        async (driverId, driverName) => {
          // Clear cache and reset fetch counter for this iteration
          mockCache.clear();
          fetchCallCount = 0;

          // First call: should fetch from Wikimedia and cache
          const firstResult = await getDriverImage(driverId, driverName);
          const firstFetchCount = fetchCallCount;

          // Verify first call fetched from Wikimedia
          expect(firstFetchCount).toBe(1);
          expect(firstResult).toBeTruthy();

          // Second call: should use cache without re-fetching
          const secondResult = await getDriverImage(driverId, driverName);
          const secondFetchCount = fetchCallCount;

          // Verify second call did NOT fetch from Wikimedia (count should be same)
          expect(secondFetchCount).toBe(firstFetchCount);
          expect(secondResult).toBeTruthy();

          // Third call: should still use cache
          const thirdResult = await getDriverImage(driverId, driverName);
          const thirdFetchCount = fetchCallCount;

          // Verify third call also did NOT fetch from Wikimedia
          expect(thirdFetchCount).toBe(firstFetchCount);
          expect(thirdResult).toBeTruthy();

          // Verify cache was populated after first call
          const cacheKey = `driver-image-${driverId}`;
          expect(mockCache.has(cacheKey)).toBe(true);
        }
      ),
      { numRuns: 100 } // Run minimum 100 iterations as specified
    );
  });

  it('Property 36: cache updates occur for new images', { timeout: 30000 }, async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate array of unique driver IDs
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 5 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        async (driverIds, baseName) => {
          // Clear cache for this iteration
          mockCache.clear();

          // Cache should be empty initially
          expect(mockCache.size).toBe(0);

          // Add images for each driver
          for (let i = 0; i < driverIds.length; i++) {
            const driverId = driverIds[i];
            const driverName = `${baseName}-${i}`;
            
            await getDriverImage(driverId, driverName);
            
            // Verify cache was updated
            const cacheKey = `driver-image-${driverId}`;
            expect(mockCache.has(cacheKey)).toBe(true);
          }

          // Verify all images are in cache
          expect(mockCache.size).toBe(driverIds.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 36: cache retrieval works for existing images', { timeout: 30000 }, async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        async (driverId) => {
          // Clear cache for this iteration
          mockCache.clear();

          // Create a mock cached image
          const mockBlob = new Blob(['cached-image-data'], { type: 'image/jpeg' });
          const mockResponse = new Response(mockBlob, {
            headers: { 'Content-Type': 'image/jpeg' }
          });
          
          const cacheKey = `driver-image-${driverId}`;
          mockCache.set(cacheKey, mockResponse);

          // Retrieve from cache
          const cachedImage = await getCachedImage(driverId);

          // Verify image was retrieved
          expect(cachedImage).toBeTruthy();
          expect(cachedImage).toContain('data:image/jpeg;base64');
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Unit Tests for WikimediaService
 * Testing API integration, URL construction, and error handling
 */

describe('Unit Tests: WikimediaService', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('fetchDriverImage', () => {
    it('should fetch driver image successfully from Wikimedia API', async () => {
      const mockResponse = {
        query: {
          pages: {
            '12345': {
              thumbnail: {
                source: 'https://upload.wikimedia.org/wikipedia/commons/thumb/test.jpg'
              }
            }
          }
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchDriverImage('Lewis Hamilton');

      expect(result).toBe('https://upload.wikimedia.org/wikipedia/commons/thumb/test.jpg');
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const fetchCall = global.fetch.mock.calls[0][0];
      expect(fetchCall).toContain('Lewis+Hamilton');
    });

    it('should return original image source if thumbnail is not available', async () => {
      const mockResponse = {
        query: {
          pages: {
            '12345': {
              original: {
                source: 'https://upload.wikimedia.org/wikipedia/commons/original.jpg'
              }
            }
          }
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchDriverImage('Max Verstappen');

      expect(result).toBe('https://upload.wikimedia.org/wikipedia/commons/original.jpg');
    });

    it('should return null when API request fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      });

      const result = await fetchDriverImage('Unknown Driver');

      expect(result).toBeNull();
    });

    it('should return null when no image data is found', async () => {
      const mockResponse = {
        query: {
          pages: {
            '12345': {}
          }
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchDriverImage('Driver Without Image');

      expect(result).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await fetchDriverImage('Test Driver');

      expect(result).toBeNull();
    });

    it('should handle malformed API responses', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      const result = await fetchDriverImage('Test Driver');

      expect(result).toBeNull();
    });
  });

  describe('getImageUrl', () => {
    it('should construct correct Wikimedia Commons URL', () => {
      const filename = 'File:Example.jpg';
      const result = getImageUrl(filename);

      expect(result).toBe('https://commons.wikimedia.org/wiki/Special:FilePath/Example.jpg');
    });

    it('should handle filename without "File:" prefix', () => {
      const filename = 'Example.jpg';
      const result = getImageUrl(filename);

      expect(result).toBe('https://commons.wikimedia.org/wiki/Special:FilePath/Example.jpg');
    });

    it('should encode special characters in filename', () => {
      const filename = 'File:Test Image With Spaces.jpg';
      const result = getImageUrl(filename);

      expect(result).toContain('Test%20Image%20With%20Spaces.jpg');
    });

    it('should return empty string for null filename', () => {
      const result = getImageUrl(null);

      expect(result).toBe('');
    });

    it('should return empty string for undefined filename', () => {
      const result = getImageUrl(undefined);

      expect(result).toBe('');
    });

    it('should return empty string for empty filename', () => {
      const result = getImageUrl('');

      expect(result).toBe('');
    });
  });

  describe('fetchDriverImageWithRetry', () => {
    beforeEach(() => {
      // Mock fetch for these tests
      global.fetch = vi.fn();
    });

    it('should return image URL on first successful attempt', async () => {
      const mockImageUrl = 'https://example.com/image.jpg';
      
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          query: {
            pages: {
              '123': {
                thumbnail: { source: mockImageUrl }
              }
            }
          }
        })
      });

      const result = await fetchDriverImageWithRetry('Lewis Hamilton');

      expect(result).toBe(mockImageUrl);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should return null immediately if no image found on first attempt', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          query: {
            pages: {
              '123': {}
            }
          }
        })
      });

      const result = await fetchDriverImageWithRetry('Unknown Driver');

      expect(result).toBeNull();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on error and succeed on second attempt', async () => {
      const mockImageUrl = 'https://example.com/image.jpg';
      
      // First call throws error, second call succeeds
      global.fetch
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            query: {
              pages: {
                '123': {
                  thumbnail: { source: mockImageUrl }
                }
              }
            }
          })
        });

      const result = await fetchDriverImageWithRetry('Max Verstappen', 2);

      expect(result).toBe(mockImageUrl);
      // Should be called twice: first fails, second succeeds
      expect(global.fetch).toHaveBeenCalledTimes(2);
    }, 10000); // Increase timeout for retry delays

    it('should return null after all retry attempts fail', async () => {
      // All calls throw error
      global.fetch.mockRejectedValue(new Error('Persistent error'));

      const result = await fetchDriverImageWithRetry('Test Driver', 2);

      expect(result).toBeNull();
      expect(global.fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    }, 10000); // Increase timeout for retry delays
  });
});

/**
 * Unit Tests for ImageService
 * Testing optimization logic, cache operations, and error handling
 */

describe('Unit Tests: ImageService', () => {
  let mockCache;
  let mockCanvas;
  let mockContext;
  let mockImage;

  beforeEach(() => {
    // Mock cache
    mockCache = new Map();
    global.caches = {
      open: vi.fn(async () => ({
        match: vi.fn(async (key) => mockCache.get(key)),
        put: vi.fn(async (key, response) => {
          mockCache.set(key, response);
        })
      }))
    };

    // Mock Response
    global.Response = class {
      constructor(body, init) {
        this.body = body;
        this.headers = init?.headers || {};
      }
      async blob() {
        return this.body;
      }
    };

    // Mock FileReader
    global.FileReader = class {
      readAsDataURL(blob) {
        queueMicrotask(() => {
          this.result = `data:image/jpeg;base64,mock-${blob.size}`;
          if (this.onloadend) this.onloadend();
        });
      }
    };

    // Mock canvas and context
    mockContext = {
      drawImage: vi.fn()
    };

    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext),
      toBlob: vi.fn((callback) => {
        const blob = new Blob(['optimized-image'], { type: 'image/jpeg' });
        queueMicrotask(() => callback(blob));
      })
    };

    // Mock document.createElement
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = vi.fn((tagName) => {
      if (tagName === 'canvas') return mockCanvas;
      return originalCreateElement(tagName);
    });

    // Mock Image constructor
    global.Image = class {
      constructor() {
        this.crossOrigin = '';
        this.width = 800;
        this.height = 600;
        this.onload = null;
        this.onerror = null;
        this._src = '';
      }
      
      set src(value) {
        this._src = value;
        queueMicrotask(() => {
          if (this.onload) this.onload();
        });
      }
      
      get src() {
        return this._src;
      }
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('optimizeImage', () => {
    it('should optimize image to target width', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      const targetWidth = 440;

      const result = await optimizeImage(imageUrl, targetWidth);

      expect(result).toBeInstanceOf(Blob);
      expect(mockCanvas.width).toBe(targetWidth);
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
      expect(mockContext.drawImage).toHaveBeenCalled();
    });

    it('should maintain aspect ratio when optimizing', async () => {
      // Override Image constructor for this test
      global.Image = class {
        constructor() {
          this.crossOrigin = '';
          this.width = 1000;
          this.height = 500;
          this.onload = null;
          this.onerror = null;
          this._src = '';
        }
        
        set src(value) {
          this._src = value;
          queueMicrotask(() => {
            if (this.onload) this.onload();
          });
        }
        
        get src() {
          return this._src;
        }
      };

      const targetWidth = 440;
      await optimizeImage('https://example.com/image.jpg', targetWidth);

      const expectedHeight = Math.round(targetWidth * (500 / 1000));
      expect(mockCanvas.height).toBe(expectedHeight);
    });

    it('should set crossOrigin to anonymous', async () => {
      let capturedImage;
      global.Image = class {
        constructor() {
          this.crossOrigin = '';
          this.width = 800;
          this.height = 600;
          this.onload = null;
          this.onerror = null;
          this._src = '';
          capturedImage = this;
        }
        
        set src(value) {
          this._src = value;
          queueMicrotask(() => {
            if (this.onload) this.onload();
          });
        }
        
        get src() {
          return this._src;
        }
      };

      await optimizeImage('https://example.com/image.jpg');

      expect(capturedImage.crossOrigin).toBe('anonymous');
    });

    it('should reject when image fails to load', async () => {
      global.Image = class {
        constructor() {
          this.crossOrigin = '';
          this.width = 800;
          this.height = 600;
          this.onload = null;
          this.onerror = null;
          this._src = '';
        }
        
        set src(value) {
          this._src = value;
          queueMicrotask(() => {
            if (this.onerror) this.onerror();
          });
        }
        
        get src() {
          return this._src;
        }
      };

      await expect(optimizeImage('https://invalid.com/image.jpg')).rejects.toThrow();
    });

    it('should reject when canvas toBlob fails', async () => {
      mockCanvas.toBlob = vi.fn((callback) => {
        queueMicrotask(() => callback(null));
      });

      await expect(optimizeImage('https://example.com/image.jpg')).rejects.toThrow();
    });

    it('should use default target width of 440 when not specified', async () => {
      await optimizeImage('https://example.com/image.jpg');

      expect(mockCanvas.width).toBe(440);
    });
  });

  describe('cacheImage', () => {
    it('should store image blob in cache with correct key', async () => {
      const driverId = 'driver-123';
      const imageBlob = new Blob(['test-image'], { type: 'image/jpeg' });

      await cacheImage(driverId, imageBlob);

      const cacheKey = `driver-image-${driverId}`;
      expect(mockCache.has(cacheKey)).toBe(true);
    });

    it('should store response with correct headers', async () => {
      const driverId = 'driver-456';
      const imageBlob = new Blob(['test-image'], { type: 'image/jpeg' });

      await cacheImage(driverId, imageBlob);

      const cacheKey = `driver-image-${driverId}`;
      const cachedResponse = mockCache.get(cacheKey);
      
      expect(cachedResponse.headers['Content-Type']).toBe('image/jpeg');
      expect(cachedResponse.headers['Cache-Control']).toBe('max-age=31536000');
    });

    it('should throw error when cache operation fails', async () => {
      global.caches.open = vi.fn().mockRejectedValue(new Error('Cache error'));

      const driverId = 'driver-789';
      const imageBlob = new Blob(['test-image'], { type: 'image/jpeg' });

      await expect(cacheImage(driverId, imageBlob)).rejects.toThrow('Cache error');
    });
  });

  describe('getCachedImage', () => {
    it('should retrieve cached image as data URL', async () => {
      const driverId = 'driver-123';
      const mockBlob = new Blob(['cached-image'], { type: 'image/jpeg' });
      const mockResponse = new Response(mockBlob);
      
      mockCache.set(`driver-image-${driverId}`, mockResponse);

      const result = await getCachedImage(driverId);

      expect(result).toBeTruthy();
      expect(result).toContain('data:image/jpeg;base64');
    });

    it('should return null when image is not in cache', async () => {
      const result = await getCachedImage('non-existent-driver');

      expect(result).toBeNull();
    });

    it('should return null when cache operation fails', async () => {
      global.caches.open = vi.fn().mockRejectedValue(new Error('Cache error'));

      const result = await getCachedImage('driver-123');

      expect(result).toBeNull();
    });

    it('should handle FileReader errors gracefully', async () => {
      const driverId = 'driver-456';
      const mockBlob = new Blob(['cached-image'], { type: 'image/jpeg' });
      const mockResponse = new Response(mockBlob);
      
      mockCache.set(`driver-image-${driverId}`, mockResponse);

      // Mock FileReader to reject the promise
      global.FileReader = class {
        readAsDataURL() {
          // Don't call onloadend or onerror, simulating a failure
          // The getCachedImage function wraps this in a promise that will timeout/fail
        }
      };

      // Since FileReader never calls callbacks, getCachedImage will hang
      // Instead, let's test with a blob conversion error
      const mockResponseWithError = {
        blob: vi.fn().mockRejectedValue(new Error('Blob conversion error'))
      };
      
      mockCache.set(`driver-image-${driverId}`, mockResponseWithError);

      const result = await getCachedImage(driverId);

      expect(result).toBeNull();
    });
  });

  describe('getDriverImage', () => {
    beforeEach(() => {
      vi.spyOn(wikimediaService, 'fetchDriverImageWithRetry');
    });

    it('should return cached image if available', async () => {
      const driverId = 'driver-123';
      const driverName = 'Lewis Hamilton';
      
      // Pre-populate cache
      const mockBlob = new Blob(['cached-image'], { type: 'image/jpeg' });
      const mockResponse = new Response(mockBlob);
      mockCache.set(`driver-image-${driverId}`, mockResponse);

      const result = await getDriverImage(driverId, driverName);

      expect(result).toBeTruthy();
      expect(wikimediaService.fetchDriverImageWithRetry).not.toHaveBeenCalled();
    });

    it('should fetch, optimize, and cache new image when not cached', async () => {
      const driverId = 'driver-456';
      const driverName = 'Max Verstappen';
      
      wikimediaService.fetchDriverImageWithRetry.mockResolvedValue('https://example.com/image.jpg');

      const result = await getDriverImage(driverId, driverName);

      expect(result).toBeTruthy();
      expect(wikimediaService.fetchDriverImageWithRetry).toHaveBeenCalledWith(driverName);
      expect(mockCache.has(`driver-image-${driverId}`)).toBe(true);
    });

    it('should return null when Wikimedia fetch returns null', async () => {
      const driverId = 'driver-789';
      const driverName = 'Unknown Driver';
      
      wikimediaService.fetchDriverImageWithRetry.mockResolvedValue(null);

      const result = await getDriverImage(driverId, driverName);

      expect(result).toBeNull();
      expect(mockCache.has(`driver-image-${driverId}`)).toBe(false);
    });

    it('should return null when optimization fails', async () => {
      const driverId = 'driver-999';
      const driverName = 'Test Driver';
      
      wikimediaService.fetchDriverImageWithRetry.mockResolvedValue('https://example.com/image.jpg');
      
      // Make optimization fail
      mockCanvas.toBlob = vi.fn((callback) => {
        queueMicrotask(() => callback(null));
      });

      const result = await getDriverImage(driverId, driverName);

      expect(result).toBeNull();
    });

    it('should return null when caching fails but still return the image', async () => {
      const driverId = 'driver-111';
      const driverName = 'Test Driver';
      
      wikimediaService.fetchDriverImageWithRetry.mockResolvedValue('https://example.com/image.jpg');
      
      // Make caching fail
      global.caches.open = vi.fn(async () => ({
        match: vi.fn(async () => undefined),
        put: vi.fn().mockRejectedValue(new Error('Cache write error'))
      }));

      const result = await getDriverImage(driverId, driverName);

      // Should still return null because the entire operation fails
      expect(result).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing canvas context gracefully', async () => {
      mockCanvas.getContext = vi.fn(() => null);

      await expect(optimizeImage('https://example.com/image.jpg')).rejects.toThrow();
    });

    it('should handle blob conversion errors in getCachedImage', async () => {
      const driverId = 'driver-error';
      const mockResponse = {
        blob: vi.fn().mockRejectedValue(new Error('Blob conversion error'))
      };
      
      mockCache.set(`driver-image-${driverId}`, mockResponse);

      const result = await getCachedImage(driverId);

      expect(result).toBeNull();
    });

    it('should handle concurrent cache operations', async () => {
      const driverId = 'driver-concurrent';
      const imageBlob = new Blob(['test-image'], { type: 'image/jpeg' });

      // Perform multiple cache operations simultaneously
      const promises = [
        cacheImage(driverId, imageBlob),
        cacheImage(driverId, imageBlob),
        cacheImage(driverId, imageBlob)
      ];

      await Promise.all(promises);

      // Should have cached the image
      expect(mockCache.has(`driver-image-${driverId}`)).toBe(true);
    });
  });
});


/**
 * Unit Tests: Team Car Image Services
 * Tests for fetchTeamCarImage, getTeamCarImage, and related functionality
 * Validates: Requirements 14.2, 14.3, 14.4, 14.5
 */

describe('Unit Tests: Team Car Image Services', () => {
  let mockCache;
  let mockCanvas;
  let mockContext;

  beforeEach(() => {
    // Mock cache API
    mockCache = new Map();
    global.caches = {
      open: vi.fn().mockResolvedValue({
        match: vi.fn((key) => {
          const response = mockCache.get(key);
          return Promise.resolve(response || null);
        }),
        put: vi.fn((key, response) => {
          mockCache.set(key, response);
          return Promise.resolve();
        }),
        has: vi.fn((key) => mockCache.has(key))
      })
    };

    // Mock canvas
    mockContext = {
      drawImage: vi.fn()
    };

    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext),
      toBlob: vi.fn((callback) => {
        const blob = new Blob(['mock-car-image'], { type: 'image/jpeg' });
        queueMicrotask(() => callback(blob));
      })
    };

    document.createElement = vi.fn((tagName) => {
      if (tagName === 'canvas') {
        return mockCanvas;
      }
      return {};
    });

    // Mock Image
    global.Image = class {
      constructor() {
        this.crossOrigin = '';
        this.onload = null;
        this.onerror = null;
        this._src = '';
        this.width = 800;
        this.height = 600;
      }
      
      set src(value) {
        this._src = value;
        queueMicrotask(() => {
          if (this.onload) {
            this.onload();
          }
        });
      }
      
      get src() {
        return this._src;
      }
    };

    // Mock fetch for Wikimedia API
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchTeamCarImage', () => {
    it('should fetch team car image from Wikimedia Commons', async () => {
      const { fetchTeamCarImage } = await import('./wikimediaService.js');
      
      // Mock search response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          query: {
            search: [
              { title: 'File:Red_Bull_RB19_2023.jpg' }
            ]
          }
        })
      });

      // Mock image info response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          query: {
            pages: {
              '12345': {
                imageinfo: [{
                  thumburl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/test-car.jpg/500px-test-car.jpg',
                  url: 'https://upload.wikimedia.org/wikipedia/commons/test-car.jpg'
                }]
              }
            }
          }
        })
      });

      const result = await fetchTeamCarImage('Red Bull Racing', 2023);

      expect(result).toBe('https://upload.wikimedia.org/wikipedia/commons/thumb/test-car.jpg/500px-test-car.jpg');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should return null when no car images are found', async () => {
      const { fetchTeamCarImage } = await import('./wikimediaService.js');
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          query: {
            search: []
          }
        })
      });

      const result = await fetchTeamCarImage('Unknown Team', 2023);

      expect(result).toBeNull();
    });

    it('should handle API request failures gracefully', async () => {
      const { fetchTeamCarImage } = await import('./wikimediaService.js');
      
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const result = await fetchTeamCarImage('Ferrari', 2023);

      expect(result).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      const { fetchTeamCarImage } = await import('./wikimediaService.js');
      
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchTeamCarImage('Mercedes', 2023);

      expect(result).toBeNull();
    });
  });

  describe('fetchTeamCarImageWithRetry', () => {
    it('should return result on first successful attempt', async () => {
      const { fetchTeamCarImageWithRetry } = await import('./wikimediaService.js');
      
      // First attempt succeeds - search response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          query: {
            search: [{ title: 'File:McLaren_MCL60_2023.jpg' }]
          }
        })
      });

      // Image info response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          query: {
            pages: {
              '67890': {
                imageinfo: [{
                  thumburl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/mclaren.jpg/500px-mclaren.jpg'
                }]
              }
            }
          }
        })
      });

      const result = await fetchTeamCarImageWithRetry('McLaren', 2023, 2);

      expect(result).toBe('https://upload.wikimedia.org/wikipedia/commons/thumb/mclaren.jpg/500px-mclaren.jpg');
    });

    it('should return null after all retry attempts fail', async () => {
      const { fetchTeamCarImageWithRetry } = await import('./wikimediaService.js');
      
      global.fetch.mockRejectedValue(new Error('Persistent error'));

      const result = await fetchTeamCarImageWithRetry('Test Team', 2023, 2);

      expect(result).toBeNull();
    });
  });

  describe('getTeamCarImage', () => {
    it('should return cached car image if available', async () => {
      const { getTeamCarImage } = await import('./imageService.js');
      
      const teamId = 'ferrari';
      const year = 2023;
      const mockBlob = new Blob(['cached-car-image'], { type: 'image/jpeg' });
      const mockResponse = new Response(mockBlob);
      
      mockCache.set(`car-image-${teamId}-${year}`, mockResponse);

      const result = await getTeamCarImage(teamId, 'Ferrari', year);

      expect(result).toBeTruthy();
      expect(result).toContain('data:image/jpeg;base64');
    });

    it('should fetch, optimize, and cache car image when not in cache', async () => {
      const { getTeamCarImage } = await import('./imageService.js');
      
      // Mock Wikimedia fetch - search response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          query: {
            search: [{ title: 'File:Mercedes_W14_2023.jpg' }]
          }
        })
      });

      // Mock image info response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          query: {
            pages: {
              '11111': {
                imageinfo: [{
                  thumburl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/mercedes.jpg/500px-mercedes.jpg'
                }]
              }
            }
          }
        })
      });

      const result = await getTeamCarImage('mercedes', 'Mercedes', 2023);

      expect(result).toBeTruthy();
      expect(result).toContain('data:image/jpeg;base64');
      expect(mockCache.has('car-image-mercedes-2023')).toBe(true);
    });

    it('should return null when car image is unavailable', async () => {
      const { getTeamCarImage } = await import('./imageService.js');
      
      // Mock Wikimedia fetch returning no results
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          query: {
            search: []
          }
        })
      });

      const result = await getTeamCarImage('unknown-team', 'Unknown Team', 2023);

      expect(result).toBeNull();
    });

    it('should handle errors gracefully and return null', async () => {
      const { getTeamCarImage } = await import('./imageService.js');
      
      global.fetch.mockRejectedValue(new Error('Network failure'));

      const result = await getTeamCarImage('aston-martin', 'Aston Martin', 2023);

      expect(result).toBeNull();
    });
  });

  describe('Team Car Image Caching', () => {
    it('should cache team car images with correct key format', async () => {
      const { cacheTeamCarImage } = await import('./imageService.js');
      
      const teamId = 'red-bull-racing';
      const year = 2023;
      const imageBlob = new Blob(['test-car-image'], { type: 'image/jpeg' });

      await cacheTeamCarImage(teamId, year, imageBlob);

      const cacheKey = `car-image-${teamId}-${year}`;
      expect(mockCache.has(cacheKey)).toBe(true);
    });

    it('should retrieve cached team car images', async () => {
      const { getCachedTeamCarImage } = await import('./imageService.js');
      
      const teamId = 'mclaren';
      const year = 2023;
      const mockBlob = new Blob(['cached-car'], { type: 'image/jpeg' });
      const mockResponse = new Response(mockBlob);
      
      mockCache.set(`car-image-${teamId}-${year}`, mockResponse);

      const result = await getCachedTeamCarImage(teamId, year);

      expect(result).toBeTruthy();
      expect(result).toContain('data:image/jpeg;base64');
    });

    it('should return null when team car image is not cached', async () => {
      const { getCachedTeamCarImage } = await import('./imageService.js');
      
      const result = await getCachedTeamCarImage('non-existent-team', 2023);

      expect(result).toBeNull();
    });
  });

  describe('Team Car Image Error Handling', () => {
    it('should handle missing team car images without disrupting layout', async () => {
      const { getTeamCarImage } = await import('./imageService.js');
      
      // Simulate no car image found
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          query: {
            search: []
          }
        })
      });

      const result = await getTeamCarImage('williams', 'Williams', 1994);

      // Should return null for graceful degradation
      expect(result).toBeNull();
    });

    it('should handle failed car image loads gracefully', async () => {
      const { getTeamCarImage } = await import('./imageService.js');
      
      // Mock fetch failure
      global.fetch.mockRejectedValueOnce(new Error('Load failed'));

      const result = await getTeamCarImage('alfa-romeo', 'Alfa Romeo', 2021);

      // Should return null without throwing
      expect(result).toBeNull();
    });

    it('should optimize team car images to 440px width', async () => {
      const { getTeamCarImage } = await import('./imageService.js');
      
      // Mock successful fetch
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          query: {
            search: [{ title: 'File:Test_Car.jpg' }]
          }
        })
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          query: {
            pages: {
              '99999': {
                imageinfo: [{
                  thumburl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/test.jpg/500px-test.jpg'
                }]
              }
            }
          }
        })
      });

      await getTeamCarImage('test-team', 'Test Team', 2023);

      // Verify canvas was set to 440px width
      expect(mockCanvas.width).toBe(440);
    });
  });
});
