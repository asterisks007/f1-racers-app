import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { retryNetworkRequest } from '../utils/retryLogic';
import { networkService } from './NetworkService';

const CACHE_SIZE_KEY = '@image_cache_size';
const CACHE_METADATA_KEY = '@image_cache_metadata';
const MAX_CACHE_SIZE_MB = 50;
const MAX_CACHE_SIZE_BYTES = MAX_CACHE_SIZE_MB * 1024 * 1024;
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150?text=Driver';

interface CacheMetadata {
  [url: string]: {
    timestamp: number;
    size: number;
  };
}

export class ImageCacheService {
  private static instance: ImageCacheService;
  private cacheMetadata: CacheMetadata = {};

  private constructor() {
    this.loadCacheMetadata();
  }

  static getInstance(): ImageCacheService {
    if (!ImageCacheService.instance) {
      ImageCacheService.instance = new ImageCacheService();
    }
    return ImageCacheService.instance;
  }

  private async loadCacheMetadata(): Promise<void> {
    try {
      const metadata = await AsyncStorage.getItem(CACHE_METADATA_KEY);
      if (metadata) {
        this.cacheMetadata = JSON.parse(metadata);
      }
    } catch (error) {
      console.error('Failed to load cache metadata:', error);
      this.cacheMetadata = {};
    }
  }

  private async saveCacheMetadata(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        CACHE_METADATA_KEY,
        JSON.stringify(this.cacheMetadata)
      );
    } catch (error) {
      console.error('Failed to save cache metadata:', error);
    }
  }

  /**
   * Get cached image or download if not cached
   * Returns the URL that can be used with FastImage
   * Implements retry logic with exponential backoff
   */
  async getCachedImage(url: string): Promise<string> {
    try {
      // Check if we're online
      const networkState = networkService.getState();
      
      // If offline and image is cached, return cached URL
      if (!networkState.isConnected && this.cacheMetadata[url]) {
        return url;
      }
      
      // If offline and image is not cached, return placeholder
      if (!networkState.isConnected) {
        return PLACEHOLDER_IMAGE;
      }

      // Try to get image with retry logic
      return await retryNetworkRequest(
        async () => {
          // FastImage handles caching automatically
          // We just track metadata for cache management
          if (!this.cacheMetadata[url]) {
            // Estimate image size (actual size would require download)
            const estimatedSize = 100 * 1024; // 100KB estimate
            this.cacheMetadata[url] = {
              timestamp: Date.now(),
              size: estimatedSize,
            };
            await this.saveCacheMetadata();
            await this.checkAndEvictCache();
          } else {
            // Update timestamp for LRU
            this.cacheMetadata[url].timestamp = Date.now();
            await this.saveCacheMetadata();
          }

          return url;
        },
        {
          maxRetries: 3,
          initialDelay: 1000,
          onRetry: (attempt, error) => {
            console.log(`Retrying image download (attempt ${attempt}):`, error.message);
            
            // Queue for retry when network is restored
            networkService.queueRequest({
              id: `image-${url}`,
              execute: async () => {
                await this.getCachedImage(url);
              },
              retryCount: 0,
              maxRetries: 3,
            });
          },
        }
      );
    } catch (error) {
      console.error('Failed to get cached image after retries:', error);
      // Return placeholder as fallback
      return PLACEHOLDER_IMAGE;
    }
  }

  /**
   * Preload images for better UX
   * Implements retry logic for failed preloads
   */
  async preloadImages(urls: string[]): Promise<void> {
    try {
      // Check if we're online
      const networkState = networkService.getState();
      
      if (!networkState.isConnected) {
        console.log('Skipping image preload - device is offline');
        return;
      }

      await retryNetworkRequest(
        async () => {
          const sources = urls.map(url => ({ uri: url }));
          await FastImage.preload(sources);

          // Update metadata for all preloaded images
          const now = Date.now();
          urls.forEach(url => {
            if (!this.cacheMetadata[url]) {
              this.cacheMetadata[url] = {
                timestamp: now,
                size: 100 * 1024, // 100KB estimate
              };
            }
          });
          await this.saveCacheMetadata();
        },
        {
          maxRetries: 3,
          initialDelay: 1000,
          onRetry: (attempt, error) => {
            console.log(`Retrying image preload (attempt ${attempt}):`, error.message);
          },
        }
      );
    } catch (error) {
      console.error('Failed to preload images after retries:', error);
    }
  }

  /**
   * Clear old cache when size limit is exceeded
   */
  async clearOldCache(): Promise<void> {
    try {
      const currentSize = await this.getCacheSize();
      
      if (currentSize > MAX_CACHE_SIZE_BYTES) {
        // Sort by timestamp (oldest first)
        const entries = Object.entries(this.cacheMetadata).sort(
          ([, a], [, b]) => a.timestamp - b.timestamp
        );

        let sizeToFree = currentSize - MAX_CACHE_SIZE_BYTES;
        const urlsToRemove: string[] = [];

        for (const [url, metadata] of entries) {
          if (sizeToFree <= 0) break;
          urlsToRemove.push(url);
          sizeToFree -= metadata.size;
        }

        // Remove from metadata
        urlsToRemove.forEach(url => {
          delete this.cacheMetadata[url];
        });

        await this.saveCacheMetadata();
        
        // Clear FastImage cache
        await FastImage.clearDiskCache();
      }
    } catch (error) {
      console.error('Failed to clear old cache:', error);
    }
  }

  /**
   * Get current cache size in bytes
   */
  async getCacheSize(): Promise<number> {
    try {
      const totalSize = Object.values(this.cacheMetadata).reduce(
        (sum, metadata) => sum + metadata.size,
        0
      );
      return totalSize;
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  }

  /**
   * Check cache size and evict if necessary
   */
  private async checkAndEvictCache(): Promise<void> {
    const currentSize = await this.getCacheSize();
    if (currentSize > MAX_CACHE_SIZE_BYTES) {
      await this.clearOldCache();
    }
  }

  /**
   * Clear all cached images
   */
  async clearAllCache(): Promise<void> {
    try {
      this.cacheMetadata = {};
      await AsyncStorage.removeItem(CACHE_METADATA_KEY);
      await AsyncStorage.removeItem(CACHE_SIZE_KEY);
      await FastImage.clearDiskCache();
      await FastImage.clearMemoryCache();
    } catch (error) {
      console.error('Failed to clear all cache:', error);
    }
  }
}

export default ImageCacheService.getInstance();
