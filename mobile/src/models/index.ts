/**
 * Core data models for the F1 Racers Mobile App
 * These types define the structure of data used throughout the application
 */

/**
 * Represents an F1 driver with all relevant information
 */
export interface Driver {
  /** Unique identifier for the driver */
  id: string;
  
  /** Full name of the driver */
  name: string;
  
  /** Driver's nationality */
  nationality: string;
  
  /** Current team the driver races for */
  team: string;
  
  /** Whether the driver has won at least one World Championship */
  isWorldChampion: boolean;
  
  /** Array of years when the driver won the World Championship */
  championshipYears: number[];
  
  /** Current position in the championship standings (0 if not ranked) */
  currentStanding: number;
  
  /** Total career points accumulated */
  careerPoints: number;
  
  /** Total number of race wins */
  raceWins: number;
  
  /** URL to the driver's portrait image */
  imageUrl: string;
}

/**
 * Application state structure
 */
export interface AppState {
  /** List of all drivers */
  drivers: Driver[];
  
  /** Loading state indicator */
  isLoading: boolean;
  
  /** Error object if any operation fails */
  error: Error | null;
  
  /** Current search query string */
  searchQuery: string;
  
  /** Current size of image cache in bytes */
  cacheSize: number;
  
  /** Whether the device is connected to the internet */
  isConnected: boolean;
  
  /** Whether internet is reachable */
  isInternetReachable: boolean | null;
}

/**
 * Actions that can be dispatched to update app state
 */
export type AppAction =
  | { type: 'LOAD_DRIVERS_START' }
  | { type: 'LOAD_DRIVERS_SUCCESS'; payload: Driver[] }
  | { type: 'LOAD_DRIVERS_ERROR'; payload: Error }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'UPDATE_CACHE_SIZE'; payload: number }
  | { type: 'SET_NETWORK_STATE'; payload: { isConnected: boolean; isInternetReachable: boolean | null } };

/**
 * Navigation parameter list for type-safe navigation
 */
export type RootStackParamList = {
  DriverList: undefined;
  DriverDetail: { driverId: string };
};

/**
 * JSON Schema validation types
 */

/**
 * Type guard to check if an object is a valid Driver
 */
export function isDriver(obj: unknown): obj is Driver {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const driver = obj as Record<string, unknown>;

  return (
    typeof driver.id === 'string' &&
    typeof driver.name === 'string' &&
    typeof driver.nationality === 'string' &&
    typeof driver.team === 'string' &&
    typeof driver.isWorldChampion === 'boolean' &&
    Array.isArray(driver.championshipYears) &&
    driver.championshipYears.every((year) => typeof year === 'number') &&
    typeof driver.currentStanding === 'number' &&
    typeof driver.careerPoints === 'number' &&
    typeof driver.raceWins === 'number' &&
    typeof driver.imageUrl === 'string'
  );
}

/**
 * Type guard to check if an array contains valid Drivers
 */
export function isDriverArray(obj: unknown): obj is Driver[] {
  return Array.isArray(obj) && obj.every(isDriver);
}

/**
 * Validates and parses JSON data into Driver array
 * @throws Error if JSON data is invalid
 */
export function parseDriversJSON(json: unknown): Driver[] {
  if (!isDriverArray(json)) {
    throw new Error('Invalid driver data format');
  }
  return json;
}

/**
 * Type for JSON-serializable driver data
 */
export type DriverJSON = {
  id: string;
  name: string;
  nationality: string;
  team: string;
  isWorldChampion: boolean;
  championshipYears: number[];
  currentStanding: number;
  careerPoints: number;
  raceWins: number;
  imageUrl: string;
};

/**
 * Converts a Driver to JSON-serializable format
 */
export function driverToJSON(driver: Driver): DriverJSON {
  return {
    id: driver.id,
    name: driver.name,
    nationality: driver.nationality,
    team: driver.team,
    isWorldChampion: driver.isWorldChampion,
    championshipYears: [...driver.championshipYears],
    currentStanding: driver.currentStanding,
    careerPoints: driver.careerPoints,
    raceWins: driver.raceWins,
    imageUrl: driver.imageUrl,
  };
}

/**
 * Converts JSON data to Driver format
 */
export function jsonToDriver(json: DriverJSON): Driver {
  if (!isDriver(json)) {
    throw new Error('Invalid driver JSON format');
  }
  return json;
}
