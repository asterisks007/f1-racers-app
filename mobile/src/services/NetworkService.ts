/**
 * NetworkService - Handles network connectivity detection and monitoring
 * Provides methods to check online/offline status and listen for changes
 */

import { useEffect, useState } from 'react';

/**
 * Network state information
 */
export interface NetworkState {
  /** Whether the device is connected to the internet */
  isConnected: boolean;
  
  /** Whether the network state has been determined */
  isInternetReachable: boolean | null;
}

/**
 * Callback function for network state changes
 */
export type NetworkStateCallback = (state: NetworkState) => void;

/**
 * Queue item for failed requests
 */
export interface QueuedRequest {
  id: string;
  execute: () => Promise<void>;
  retryCount: number;
  maxRetries: number;
}

/**
 * NetworkService class for managing network connectivity
 */
class NetworkService {
  private listeners: Set<NetworkStateCallback> = new Set();
  private currentState: NetworkState = {
    isConnected: true,
    isInternetReachable: null,
  };
  private requestQueue: QueuedRequest[] = [];
  private isProcessingQueue = false;

  /**
   * Initialize the network service
   * In a real implementation, this would use @react-native-community/netinfo
   * For now, we'll simulate network detection
   */
  constructor() {
    // Simulate initial network check
    this.checkConnectivity();
  }

  /**
   * Check current network connectivity
   * @returns Current network state
   */
  async checkConnectivity(): Promise<NetworkState> {
    // In a real implementation, this would use NetInfo.fetch()
    // For now, we'll assume connected
    this.currentState = {
      isConnected: true,
      isInternetReachable: true,
    };
    
    return this.currentState;
  }

  /**
   * Get current network state
   * @returns Current network state
   */
  getState(): NetworkState {
    return { ...this.currentState };
  }

  /**
   * Subscribe to network state changes
   * @param callback - Function to call when network state changes
   * @returns Unsubscribe function
   */
  subscribe(callback: NetworkStateCallback): () => void {
    this.listeners.add(callback);
    
    // Immediately call with current state
    callback(this.currentState);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of network state change
   * @param state - New network state
   */
  private notifyListeners(state: NetworkState): void {
    this.currentState = state;
    this.listeners.forEach(listener => listener(state));
    
    // If network is restored, process queued requests
    if (state.isConnected && state.isInternetReachable) {
      this.processQueue();
    }
  }

  /**
   * Simulate network state change (for testing)
   * @param isConnected - Whether device is connected
   */
  setNetworkState(isConnected: boolean): void {
    this.notifyListeners({
      isConnected,
      isInternetReachable: isConnected,
    });
  }

  /**
   * Add a failed request to the retry queue
   * @param request - Request to queue for retry
   */
  queueRequest(request: QueuedRequest): void {
    this.requestQueue.push(request);
  }

  /**
   * Process queued requests when network is restored
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      
      if (!request) {
        continue;
      }

      try {
        await request.execute();
      } catch (error) {
        // If request fails and hasn't exceeded max retries, re-queue it
        if (request.retryCount < request.maxRetries) {
          this.requestQueue.push({
            ...request,
            retryCount: request.retryCount + 1,
          });
        }
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Clear all queued requests
   */
  clearQueue(): void {
    this.requestQueue = [];
  }

  /**
   * Get number of queued requests
   * @returns Number of requests in queue
   */
  getQueueLength(): number {
    return this.requestQueue.length;
  }
}

/**
 * Singleton instance of NetworkService
 */
export const networkService = new NetworkService();

/**
 * React hook to use network state in components
 * @returns Current network state
 */
export function useNetworkState(): NetworkState {
  const [networkState, setNetworkState] = useState<NetworkState>(
    networkService.getState()
  );

  useEffect(() => {
    const unsubscribe = networkService.subscribe(setNetworkState);
    return unsubscribe;
  }, []);

  return networkState;
}
