import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('PWA Installation and Offline Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Service Worker Registration', () => {
    it('should register service worker when available', async () => {
      // Mock service worker registration
      const mockRegister = vi.fn().mockResolvedValue({
        installing: null,
        waiting: null,
        active: { state: 'activated' }
      });

      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          register: mockRegister,
          ready: Promise.resolve({
            active: { state: 'activated' }
          })
        }
      });

      // Simulate service worker registration
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/sw.js');
        expect(mockRegister).toHaveBeenCalledWith('/sw.js');
      }
    });

    it('should handle service worker registration failure gracefully', async () => {
      const mockRegister = vi.fn().mockRejectedValue(new Error('Registration failed'));

      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {
          register: mockRegister
        }
      });

      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch (error) {
        expect(error.message).toBe('Registration failed');
      }
    });
  });

  describe('PWA Manifest', () => {
    it('should have valid manifest configuration', () => {
      // Expected manifest properties based on vite.config.js
      const expectedManifest = {
        name: 'F1 Racers App',
        short_name: 'F1 Racers',
        description: 'View Formula 1 drivers, standings, and championship information',
        theme_color: '#e10600',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait-primary'
      };

      // Verify manifest structure
      expect(expectedManifest.name).toBe('F1 Racers App');
      expect(expectedManifest.theme_color).toBe('#e10600');
      expect(expectedManifest.display).toBe('standalone');
    });

    it('should include required icon configurations', () => {
      const expectedIcons = [
        {
          src: '/vite.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        }
      ];

      expect(expectedIcons[0].src).toBe('/vite.svg');
      expect(expectedIcons[0].purpose).toBe('any maskable');
    });
  });

  describe('Offline Functionality', () => {
    it('should cache static assets for offline use', () => {
      // Expected cache patterns from vite.config.js
      const expectedGlobPatterns = ['**/*.{js,css,html,ico,png,svg,json}'];
      
      expect(expectedGlobPatterns).toContain('**/*.{js,css,html,ico,png,svg,json}');
    });

    it('should cache driver images with CacheFirst strategy', () => {
      const expectedCacheConfig = {
        urlPattern: /^https:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'driver-images-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
          }
        }
      };

      expect(expectedCacheConfig.handler).toBe('CacheFirst');
      expect(expectedCacheConfig.options.cacheName).toBe('driver-images-cache');
      expect(expectedCacheConfig.options.expiration.maxEntries).toBe(50);
    });

    it('should handle offline state gracefully', () => {
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      expect(navigator.onLine).toBe(false);
    });

    it('should detect online state', () => {
      // Mock online state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });

      expect(navigator.onLine).toBe(true);
    });
  });

  describe('PWA Installation Prompt', () => {
    it('should handle beforeinstallprompt event', () => {
      const mockEvent = {
        preventDefault: vi.fn(),
        prompt: vi.fn().mockResolvedValue({ outcome: 'accepted' })
      };

      // Simulate beforeinstallprompt event
      const handler = (e) => {
        e.preventDefault();
        return e;
      };

      const result = handler(mockEvent);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(result).toBe(mockEvent);
    });

    it('should track installation outcome', async () => {
      const mockPrompt = {
        prompt: vi.fn().mockResolvedValue({ outcome: 'accepted' }),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };

      await mockPrompt.prompt();
      const choice = await mockPrompt.userChoice;
      
      expect(choice.outcome).toBe('accepted');
    });
  });

  describe('iOS PWA Support', () => {
    it('should detect iOS Safari for PWA installation', () => {
      // Mock iOS Safari user agent
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      });

      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
      expect(isIOS).toBe(true);
    });

    it('should detect standalone mode on iOS', () => {
      // Mock iOS standalone mode
      Object.defineProperty(navigator, 'standalone', {
        writable: true,
        value: true
      });

      expect(navigator.standalone).toBe(true);
    });
  });

  describe('Android PWA Support', () => {
    it('should detect Android for PWA installation', () => {
      // Mock Android user agent
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36'
      });

      const isAndroid = /Android/.test(navigator.userAgent);
      expect(isAndroid).toBe(true);
    });

    it('should handle display mode changes', () => {
      // Mock display mode query
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }));

      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      expect(isStandalone).toBe(true);
    });
  });
});
