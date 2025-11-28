/**
 * AppContext - Global state management using React Context and useReducer
 * Provides centralized state for driver data, loading states, search, and cache
 */

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppAction } from '../models';

/**
 * Initial state for the application
 */
const initialState: AppState = {
  drivers: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  cacheSize: 0,
  isConnected: true,
  isInternetReachable: null,
};

/**
 * Reducer function to handle state updates
 * @param state - Current app state
 * @param action - Action to perform
 * @returns Updated app state
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_DRIVERS_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOAD_DRIVERS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        drivers: action.payload,
        error: null,
      };

    case 'LOAD_DRIVERS_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      };

    case 'UPDATE_CACHE_SIZE':
      return {
        ...state,
        cacheSize: action.payload,
      };

    case 'SET_NETWORK_STATE':
      return {
        ...state,
        isConnected: action.payload.isConnected,
        isInternetReachable: action.payload.isInternetReachable,
      };

    default:
      return state;
  }
}

/**
 * Context for app state
 */
const AppStateContext = createContext<AppState | undefined>(undefined);

/**
 * Context for dispatch function
 */
const AppDispatchContext = createContext<React.Dispatch<AppAction> | undefined>(
  undefined
);

/**
 * Props for AppProvider component
 */
interface AppProviderProps {
  children: ReactNode;
}

/**
 * AppProvider component that wraps the app with state management
 * @param props - Component props
 */
export function AppProvider({ children }: AppProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

/**
 * Custom hook to access app state
 * @returns Current app state
 * @throws Error if used outside AppProvider
 */
export function useAppState(): AppState {
  const context = useContext(AppStateContext);
  
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  
  return context;
}

/**
 * Custom hook to access dispatch function
 * @returns Dispatch function for app actions
 * @throws Error if used outside AppProvider
 */
export function useAppDispatch(): React.Dispatch<AppAction> {
  const context = useContext(AppDispatchContext);
  
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within an AppProvider');
  }
  
  return context;
}

/**
 * Custom hook to access both state and dispatch
 * @returns Tuple of [state, dispatch]
 */
export function useApp(): [AppState, React.Dispatch<AppAction>] {
  return [useAppState(), useAppDispatch()];
}
