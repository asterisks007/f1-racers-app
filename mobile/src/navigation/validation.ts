import type { RootStackParamList } from '../models';

/**
 * Validates navigation parameters for type safety at runtime
 * Ensures that navigation parameters match the expected types
 * 
 * @param screenName - The name of the screen to navigate to
 * @param params - The parameters to validate
 * @returns true if parameters are valid
 * @throws Error if parameters are invalid
 */
export function validateNavigationParams<T extends keyof RootStackParamList>(
  screenName: T,
  params: RootStackParamList[T]
): boolean {
  switch (screenName) {
    case 'DriverList':
      // DriverList has no parameters (undefined)
      if (params !== undefined) {
        throw new Error(
          `Invalid parameters for DriverList screen. Expected undefined, got ${typeof params}`
        );
      }
      return true;

    case 'DriverDetail':
      // DriverDetail requires { driverId: string }
      if (typeof params !== 'object' || params === null) {
        throw new Error(
          `Invalid parameters for DriverDetail screen. Expected object with driverId, got ${typeof params}`
        );
      }

      const detailParams = params as { driverId?: unknown };
      
      if (typeof detailParams.driverId !== 'string') {
        throw new Error(
          `Invalid driverId parameter for DriverDetail screen. Expected string, got ${typeof detailParams.driverId}`
        );
      }

      if (detailParams.driverId.trim() === '') {
        throw new Error(
          'Invalid driverId parameter for DriverDetail screen. driverId cannot be empty'
        );
      }

      return true;

    default:
      // TypeScript should prevent this, but handle it at runtime
      throw new Error(`Unknown screen name: ${String(screenName)}`);
  }
}

/**
 * Type guard to check if navigation parameters are valid
 * Non-throwing version of validateNavigationParams
 * 
 * @param screenName - The name of the screen
 * @param params - The parameters to check
 * @returns true if parameters are valid, false otherwise
 */
export function isValidNavigationParams<T extends keyof RootStackParamList>(
  screenName: T,
  params: unknown
): params is RootStackParamList[T] {
  try {
    validateNavigationParams(screenName, params as RootStackParamList[T]);
    return true;
  } catch {
    return false;
  }
}
