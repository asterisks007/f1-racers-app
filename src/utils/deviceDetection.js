/**
 * Detect if the device is low-end based on hardware concurrency and memory
 * @returns {boolean} True if device is considered low-end
 */
export const isLowEndDevice = () => {
  // Check hardware concurrency (number of CPU cores)
  const cores = navigator.hardwareConcurrency || 4;
  
  // Check device memory (in GB) if available
  const memory = navigator.deviceMemory || 4;
  
  // Check if user prefers reduced motion (with fallback for test environments)
  let prefersReducedMotion = false;
  if (typeof window !== 'undefined' && window.matchMedia) {
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  
  // Consider device low-end if:
  // - Less than 4 CPU cores
  // - Less than 4GB RAM
  // - User prefers reduced motion
  return cores < 4 || memory < 4 || prefersReducedMotion;
};

/**
 * Get appropriate animation duration based on device capability
 * @returns {string} CSS duration value
 */
export const getAnimationDuration = () => {
  return isLowEndDevice() ? '0.2s' : '0.5s';
};

/**
 * Check if animations should be disabled
 * @returns {boolean} True if animations should be disabled
 */
export const shouldDisableAnimations = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
};
