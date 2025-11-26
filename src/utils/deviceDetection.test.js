import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isLowEndDevice, getAnimationDuration, shouldDisableAnimations } from './deviceDetection';

describe('Device Detection Utilities', () => {
  beforeEach(() => {
    // Reset navigator properties
    vi.clearAllMocks();
  });

  describe('isLowEndDevice', () => {
    it('should detect low-end device with less than 4 CPU cores', () => {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        writable: true,
        value: 2
      });
      Object.defineProperty(navigator, 'deviceMemory', {
        writable: true,
        value: 4
      });
      
      expect(isLowEndDevice()).toBe(true);
    });

    it('should detect low-end device with less than 4GB memory', () => {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        writable: true,
        value: 4
      });
      Object.defineProperty(navigator, 'deviceMemory', {
        writable: true,
        value: 2
      });
      
      expect(isLowEndDevice()).toBe(true);
    });

    it('should detect high-end device with sufficient resources', () => {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        writable: true,
        value: 8
      });
      Object.defineProperty(navigator, 'deviceMemory', {
        writable: true,
        value: 8
      });
      
      // Mock matchMedia to return false for reduced motion
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false
      }));
      
      expect(isLowEndDevice()).toBe(false);
    });

    it('should detect low-end device when user prefers reduced motion', () => {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        writable: true,
        value: 8
      });
      Object.defineProperty(navigator, 'deviceMemory', {
        writable: true,
        value: 8
      });
      
      // Mock matchMedia to return true for reduced motion
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: true
      }));
      
      expect(isLowEndDevice()).toBe(true);
    });

    it('should use default values when hardware info is unavailable', () => {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        writable: true,
        value: undefined
      });
      Object.defineProperty(navigator, 'deviceMemory', {
        writable: true,
        value: undefined
      });
      
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false
      }));
      
      // Should default to 4 cores and 4GB, which is not low-end
      expect(isLowEndDevice()).toBe(false);
    });
  });

  describe('getAnimationDuration', () => {
    it('should return shorter duration for low-end devices', () => {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        writable: true,
        value: 2
      });
      
      expect(getAnimationDuration()).toBe('0.2s');
    });

    it('should return normal duration for high-end devices', () => {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        writable: true,
        value: 8
      });
      Object.defineProperty(navigator, 'deviceMemory', {
        writable: true,
        value: 8
      });
      
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false
      }));
      
      expect(getAnimationDuration()).toBe('0.5s');
    });
  });

  describe('shouldDisableAnimations', () => {
    it('should return true when user prefers reduced motion', () => {
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: true
      }));
      
      expect(shouldDisableAnimations()).toBe(true);
    });

    it('should return false when user does not prefer reduced motion', () => {
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false
      }));
      
      expect(shouldDisableAnimations()).toBe(false);
    });

    it('should handle missing matchMedia gracefully', () => {
      const originalMatchMedia = window.matchMedia;
      delete window.matchMedia;
      
      expect(shouldDisableAnimations()).toBe(false);
      
      window.matchMedia = originalMatchMedia;
    });
  });
});
