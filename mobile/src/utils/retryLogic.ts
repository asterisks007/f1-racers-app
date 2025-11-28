/**
 * Retry logic utilities
 * Provides functions for retrying failed operations with exponential backoff
 */

/**
 * Options for retry logic
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  
  /** Initial delay in milliseconds (default: 1000) */
  initialDelay?: number;
  
  /** Maximum delay in milliseconds (default: 10000) */
  maxDelay?: number;
  
  /** Backoff multiplier (default: 2) */
  backoffMultiplier?: number;
  
  /** Function to determine if error is retryable (default: all errors are retryable) */
  isRetryable?: (error: Error) => boolean;
  
  /** Callback called before each retry attempt */
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Default retry options
 */
const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  isRetryable: () => true,
  onRetry: () => {},
};

/**
 * Calculate delay for exponential backoff
 * @param attempt - Current attempt number (0-indexed)
 * @param options - Retry options
 * @returns Delay in milliseconds
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const delay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt);
  return Math.min(delay, options.maxDelay);
}

/**
 * Sleep for specified milliseconds
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an async operation with exponential backoff
 * @param operation - Async function to retry
 * @param options - Retry options
 * @returns Promise that resolves with operation result or rejects with final error
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts: Required<RetryOptions> = { ...DEFAULT_OPTIONS, ...options };
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      // Try the operation
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if we should retry
      if (attempt >= opts.maxRetries) {
        // No more retries left
        break;
      }
      
      // Check if error is retryable
      if (!opts.isRetryable(lastError)) {
        throw lastError;
      }
      
      // Call retry callback
      opts.onRetry(attempt + 1, lastError);
      
      // Calculate delay and wait
      const delay = calculateDelay(attempt, opts);
      await sleep(delay);
    }
  }
  
  // All retries exhausted, throw last error
  throw lastError || new Error('Operation failed after retries');
}

/**
 * Check if an error is a network error
 * @param error - Error to check
 * @returns True if error is network-related
 */
export function isNetworkError(error: Error): boolean {
  const networkErrorMessages = [
    'network request failed',
    'network error',
    'timeout',
    'connection refused',
    'econnrefused',
    'enotfound',
    'etimedout',
  ];
  
  const errorMessage = error.message.toLowerCase();
  return networkErrorMessages.some(msg => errorMessage.includes(msg));
}

/**
 * Retry a network request with exponential backoff
 * Automatically retries on network errors
 * @param request - Network request function
 * @param options - Retry options
 * @returns Promise that resolves with request result
 */
export async function retryNetworkRequest<T>(
  request: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  return retryWithBackoff(request, {
    ...options,
    isRetryable: (error) => {
      // Only retry network errors
      if (!isNetworkError(error)) {
        return false;
      }
      
      // Call custom isRetryable if provided
      if (options.isRetryable) {
        return options.isRetryable(error);
      }
      
      return true;
    },
  });
}

/**
 * Create a retryable version of an async function
 * @param fn - Async function to make retryable
 * @param options - Retry options
 * @returns Retryable version of the function
 */
export function makeRetryable<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: RetryOptions = {}
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    return retryWithBackoff(() => fn(...args), options);
  };
}

/**
 * Retry queue for managing failed requests
 */
export class RetryQueue {
  private queue: Array<{
    id: string;
    operation: () => Promise<void>;
    retryCount: number;
    maxRetries: number;
  }> = [];
  
  private isProcessing = false;

  /**
   * Add an operation to the retry queue
   * @param id - Unique identifier for the operation
   * @param operation - Async operation to retry
   * @param maxRetries - Maximum number of retries (default: 3)
   */
  add(id: string, operation: () => Promise<void>, maxRetries = 3): void {
    this.queue.push({
      id,
      operation,
      retryCount: 0,
      maxRetries,
    });
  }

  /**
   * Process all queued operations
   * @returns Promise that resolves when all operations are processed
   */
  async processAll(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      
      if (!item) {
        continue;
      }

      try {
        await item.operation();
      } catch (error) {
        // If operation fails and hasn't exceeded max retries, re-queue it
        if (item.retryCount < item.maxRetries) {
          this.queue.push({
            ...item,
            retryCount: item.retryCount + 1,
          });
        } else {
          console.error(`Operation ${item.id} failed after ${item.maxRetries} retries`);
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Clear all queued operations
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Get number of queued operations
   * @returns Number of operations in queue
   */
  get length(): number {
    return this.queue.length;
  }
}
