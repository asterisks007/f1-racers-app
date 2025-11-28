/**
 * Property-based tests for DriverListScreen component
 * Feature: f1-racers-mobile-app
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import * as fc from 'fast-check';
import { DriverListScreen } from './DriverListScreen';
import { Driver } from '../models';
import { driverService } from '../services/DriverService';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('../navigation/hooks', () => ({
  useTypedNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock AppContext
const mockDispatch = jest.fn();
const mockState = {
  drivers: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  cacheSize: 0,
};

jest.mock('../context/AppContext', () => ({
  useAppState: () => mockState,
  useAppDispatch: () => mockDispatch,
}));

// Mock DriverService
jest.mock('../services/DriverService', () => ({
  driverService: {
    loadDrivers: jest.fn(),
    sortByStanding: jest.fn((drivers) => drivers),
    searchDrivers: jest.fn((drivers) => drivers),
  },
}));

describe('DriverListScreen Property Tests', () => {
  /**
   * Arbitrary generator for Driver objects
   */
  const driverArbitrary = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
    nationality: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
    team: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
    isWorldChampion: fc.boolean(),
    championshipYears: fc.array(fc.integer({ min: 1950, max: 2024 })),
    currentStanding: fc.integer({ min: 0, max: 30 }),
    careerPoints: fc.integer({ min: 0, max: 5000 }),
    raceWins: fc.integer({ min: 0, max: 200 }),
    imageUrl: fc.webUrl(),
  }) as fc.Arbitrary<Driver>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockState.drivers = [];
    mockState.isLoading = false;
    mockState.error = null;
    mockState.searchQuery = '';
  });

  /**
   * Feature: f1-racers-mobile-app, Property 15: Accessibility labels completeness
   * Validates: Requirements 12.1
   * 
   * For any interactive element in the UI, the element should have a descriptive
   * accessibility label for screen readers.
   */
  describe('Property 15: Accessibility labels completeness', () => {
    it('should have accessibility labels for all interactive elements in loading state', () => {
      // Set loading state
      mockState.isLoading = true;

      const { getByLabelText } = render(<DriverListScreen />);

      // Property: Loading indicator should have accessibility label
      const loadingIndicator = getByLabelText('Loading drivers');
      expect(loadingIndicator).toBeTruthy();
      expect(loadingIndicator.props.accessibilityLabel).toBe('Loading drivers');
    });

    it('should have accessibility labels for all interactive elements in error state', () => {
      // Set error state
      mockState.isLoading = false;
      mockState.error = new Error('Failed to load drivers');

      const { getByLabelText } = render(<DriverListScreen />);

      // Property: Retry button should have accessibility label
      const retryButton = getByLabelText('Retry loading drivers');
      expect(retryButton).toBeTruthy();
      expect(retryButton.props.accessibilityLabel).toBe('Retry loading drivers');
      expect(retryButton.props.accessibilityRole).toBe('button');
    });

    it('should have accessibility labels for search bar and driver list', () => {
      // Set normal state with drivers
      mockState.isLoading = false;
      mockState.error = null;
      mockState.drivers = [
        {
          id: '1',
          name: 'Lewis Hamilton',
          nationality: 'British',
          team: 'Mercedes',
          isWorldChampion: true,
          championshipYears: [2008, 2014, 2015, 2017, 2018, 2019, 2020],
          currentStanding: 1,
          careerPoints: 4500,
          raceWins: 103,
          imageUrl: 'https://example.com/hamilton.jpg',
        },
      ];

      const { getByLabelText } = render(<DriverListScreen />);

      // Property: Search bar should have accessibility label
      const searchBar = getByLabelText('Search bar');
      expect(searchBar).toBeTruthy();
      expect(searchBar.props.accessibilityLabel).toBe('Search bar');

      // Property: Search input field should have accessibility label
      const searchInput = getByLabelText('Search input field');
      expect(searchInput).toBeTruthy();
      expect(searchInput.props.accessibilityLabel).toBe('Search input field');
      expect(searchInput.props.accessibilityHint).toBe('Type to search for drivers by name');

      // Property: Driver list should have accessibility label
      const driverList = getByLabelText('Driver list');
      expect(driverList).toBeTruthy();
      expect(driverList.props.accessibilityLabel).toBe('Driver list');
    });

    it('should have accessibility labels for all interactive elements across random driver data', () => {
      fc.assert(
        fc.property(
          fc.array(driverArbitrary, { minLength: 1, maxLength: 5 }), // Reduced to 5 for faster testing
          (driversRaw) => {
            // Ensure unique IDs and names to avoid duplicate accessibility labels
            const drivers = driversRaw.map((driver, index) => ({
              ...driver,
              id: `${driver.id}-${index}`, // Make IDs unique
              name: `${driver.name} ${index}`, // Make names unique for accessibility labels
            }));

            // Set state with random drivers
            mockState.isLoading = false;
            mockState.error = null;
            mockState.drivers = drivers;

            const { getByLabelText, getAllByRole } = render(<DriverListScreen />);

            // Property 1: Search bar should have accessibility label
            const searchBar = getByLabelText('Search bar');
            expect(searchBar).toBeTruthy();
            expect(searchBar.props.accessibilityLabel).toBe('Search bar');

            // Property 2: Search input should have accessibility label and hint
            const searchInput = getByLabelText('Search input field');
            expect(searchInput).toBeTruthy();
            expect(searchInput.props.accessibilityLabel).toBe('Search input field');
            expect(searchInput.props.accessibilityHint).toBe('Type to search for drivers by name');

            // Property 3: Driver list should have accessibility label
            const driverList = getByLabelText('Driver list');
            expect(driverList).toBeTruthy();
            expect(driverList.props.accessibilityLabel).toBe('Driver list');

            // Property 4: All driver cards should have accessibility role "button"
            // We verify that all rendered buttons have the correct role
            const allButtons = getAllByRole('button');
            expect(allButtons.length).toBeGreaterThanOrEqual(drivers.length);
            
            // Verify each button has an accessibility label
            allButtons.forEach(button => {
              expect(button.props.accessibilityLabel).toBeTruthy();
              expect(button.props.accessibilityLabel).toMatch(/Driver card for/);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have accessibility labels for all states (loading, error, success)', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant({ isLoading: true, error: null, drivers: [] }),
            fc.constant({ isLoading: false, error: new Error('Test error'), drivers: [] }),
            fc.record({
              isLoading: fc.constant(false),
              error: fc.constant(null),
              drivers: fc.array(driverArbitrary, { minLength: 1, maxLength: 10 }),
            })
          ),
          (state) => {
            // Set state
            mockState.isLoading = state.isLoading;
            mockState.error = state.error;
            mockState.drivers = state.drivers;

            const { getByLabelText, queryByLabelText } = render(<DriverListScreen />);

            if (state.isLoading) {
              // Property: Loading state should have accessibility label
              const loadingIndicator = getByLabelText('Loading drivers');
              expect(loadingIndicator).toBeTruthy();
              expect(loadingIndicator.props.accessibilityLabel).toBe('Loading drivers');
            } else if (state.error) {
              // Property: Error state should have accessibility label for retry button
              const retryButton = getByLabelText('Retry loading drivers');
              expect(retryButton).toBeTruthy();
              expect(retryButton.props.accessibilityLabel).toBe('Retry loading drivers');
              expect(retryButton.props.accessibilityRole).toBe('button');
            } else {
              // Property: Success state should have accessibility labels for search and list
              const searchBar = getByLabelText('Search bar');
              expect(searchBar).toBeTruthy();

              const searchInput = getByLabelText('Search input field');
              expect(searchInput).toBeTruthy();
              expect(searchInput.props.accessibilityHint).toBe('Type to search for drivers by name');

              const driverList = getByLabelText('Driver list');
              expect(driverList).toBeTruthy();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain accessibility labels when search query changes', () => {
      fc.assert(
        fc.property(
          fc.array(driverArbitrary, { minLength: 5, maxLength: 20 }),
          fc.string(),
          (drivers, searchQuery) => {
            // Set state with drivers
            mockState.isLoading = false;
            mockState.error = null;
            mockState.drivers = drivers;
            mockState.searchQuery = searchQuery;

            const { getByLabelText } = render(<DriverListScreen />);

            // Property: Accessibility labels should remain consistent regardless of search query
            const searchBar = getByLabelText('Search bar');
            expect(searchBar).toBeTruthy();
            expect(searchBar.props.accessibilityLabel).toBe('Search bar');

            const searchInput = getByLabelText('Search input field');
            expect(searchInput).toBeTruthy();
            expect(searchInput.props.accessibilityLabel).toBe('Search input field');
            expect(searchInput.props.accessibilityHint).toBe('Type to search for drivers by name');

            const driverList = getByLabelText('Driver list');
            expect(driverList).toBeTruthy();
            expect(driverList.props.accessibilityLabel).toBe('Driver list');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have accessibility role for all interactive elements', () => {
      fc.assert(
        fc.property(
          fc.array(driverArbitrary, { minLength: 1, maxLength: 5 }),
          (driversRaw) => {
            // Ensure unique IDs and names to avoid duplicate accessibility labels
            const drivers = driversRaw.map((driver, index) => ({
              ...driver,
              id: `${driver.id}-${index}`,
              name: `${driver.name} ${index}`,
            }));

            // Set state with drivers
            mockState.isLoading = false;
            mockState.error = null;
            mockState.drivers = drivers;

            const { getAllByRole } = render(<DriverListScreen />);

            // Property: All interactive elements should have appropriate accessibility roles
            const allButtons = getAllByRole('button');
            expect(allButtons.length).toBeGreaterThanOrEqual(drivers.length);
            
            // All buttons should have the "button" role
            allButtons.forEach(button => {
              expect(button.props.accessibilityRole).toBe('button');
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have accessibility labels for empty state', () => {
      // Set state with no drivers (empty search results)
      mockState.isLoading = false;
      mockState.error = null;
      mockState.drivers = [];

      const { getByLabelText } = render(<DriverListScreen />);

      // Property: Search bar should still have accessibility label in empty state
      const searchBar = getByLabelText('Search bar');
      expect(searchBar).toBeTruthy();

      const searchInput = getByLabelText('Search input field');
      expect(searchInput).toBeTruthy();

      const driverList = getByLabelText('Driver list');
      expect(driverList).toBeTruthy();
    });
  });

  /**
   * Additional tests for component-level accessibility
   */
  describe('Component Accessibility Labels', () => {
    it('should have descriptive accessibility labels for all UI components', () => {
      const testDrivers: Driver[] = [
        {
          id: '1',
          name: 'Max Verstappen',
          nationality: 'Dutch',
          team: 'Red Bull Racing',
          isWorldChampion: true,
          championshipYears: [2021, 2022, 2023],
          currentStanding: 1,
          careerPoints: 2500,
          raceWins: 50,
          imageUrl: 'https://example.com/verstappen.jpg',
        },
      ];

      mockState.isLoading = false;
      mockState.error = null;
      mockState.drivers = testDrivers;

      const { getByLabelText } = render(<DriverListScreen />);

      // Verify all accessibility labels are descriptive and meaningful
      const searchBar = getByLabelText('Search bar');
      expect(searchBar.props.accessibilityLabel).toMatch(/search/i);

      const searchInput = getByLabelText('Search input field');
      expect(searchInput.props.accessibilityLabel).toMatch(/search/i);
      expect(searchInput.props.accessibilityHint).toBeTruthy();
      expect(searchInput.props.accessibilityHint).toMatch(/search/i);

      const driverList = getByLabelText('Driver list');
      expect(driverList.props.accessibilityLabel).toMatch(/driver/i);

      const driverCard = getByLabelText('Driver card for Max Verstappen');
      expect(driverCard.props.accessibilityLabel).toContain('Max Verstappen');
      expect(driverCard.props.accessibilityRole).toBe('button');
    });

    it('should have accessibility labels that include relevant context', () => {
      const testDriver: Driver = {
        id: '2',
        name: 'Lewis Hamilton',
        nationality: 'British',
        team: 'Mercedes',
        isWorldChampion: true,
        championshipYears: [2008, 2014, 2015, 2017, 2018, 2019, 2020],
        currentStanding: 2,
        careerPoints: 4500,
        raceWins: 103,
        imageUrl: 'https://example.com/hamilton.jpg',
      };

      mockState.isLoading = false;
      mockState.error = null;
      mockState.drivers = [testDriver];

      const { getByLabelText } = render(<DriverListScreen />);

      // Property: Accessibility labels should provide context about what the element does
      const searchInput = getByLabelText('Search input field');
      expect(searchInput.props.accessibilityHint).toBe('Type to search for drivers by name');

      const driverCard = getByLabelText('Driver card for Lewis Hamilton');
      expect(driverCard.props.accessibilityLabel).toContain('Lewis Hamilton');
    });

    it('should have accessibility labels for error retry button', () => {
      mockState.isLoading = false;
      mockState.error = new Error('Network error');
      mockState.drivers = [];

      const { getByLabelText } = render(<DriverListScreen />);

      // Property: Retry button should have clear accessibility label
      const retryButton = getByLabelText('Retry loading drivers');
      expect(retryButton).toBeTruthy();
      expect(retryButton.props.accessibilityLabel).toBe('Retry loading drivers');
      expect(retryButton.props.accessibilityRole).toBe('button');
    });

    it('should have accessibility labels for loading indicator', () => {
      mockState.isLoading = true;
      mockState.error = null;
      mockState.drivers = [];

      const { getByLabelText } = render(<DriverListScreen />);

      // Property: Loading indicator should have clear accessibility label
      const loadingIndicator = getByLabelText('Loading drivers');
      expect(loadingIndicator).toBeTruthy();
      expect(loadingIndicator.props.accessibilityLabel).toBe('Loading drivers');
    });
  });
});

/**
 * Unit tests for DriverListScreen component
 * Testing specific examples, edge cases, and user interactions
 * Requirements: 3.3, 8.2, 8.3
 */
describe('DriverListScreen Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState.drivers = [];
    mockState.isLoading = false;
    mockState.error = null;
    mockState.searchQuery = '';
  });

  /**
   * Test loading state display
   * Requirement 8.2: WHEN driver data is loading THEN the system SHALL display a loading indicator
   */
  describe('Loading State', () => {
    it('should display loading indicator when isLoading is true', () => {
      mockState.isLoading = true;
      mockState.error = null;
      mockState.drivers = [];

      const { getByLabelText, getByText } = render(<DriverListScreen />);

      // Verify loading indicator is displayed
      const loadingIndicator = getByLabelText('Loading drivers');
      expect(loadingIndicator).toBeTruthy();

      // Verify loading text is displayed
      const loadingText = getByText('Loading drivers...');
      expect(loadingText).toBeTruthy();
    });

    it('should not display driver list when loading', () => {
      mockState.isLoading = true;
      mockState.error = null;
      mockState.drivers = [];

      const { queryByLabelText } = render(<DriverListScreen />);

      // Verify driver list is not displayed during loading
      const driverList = queryByLabelText('Driver list');
      expect(driverList).toBeNull();
    });

    it('should not display search bar when loading', () => {
      mockState.isLoading = true;
      mockState.error = null;
      mockState.drivers = [];

      const { queryByLabelText } = render(<DriverListScreen />);

      // Verify search bar is not displayed during loading
      const searchBar = queryByLabelText('Search bar');
      expect(searchBar).toBeNull();
    });
  });

  /**
   * Test error state with retry
   * Requirement 8.3: WHEN driver data fails to load THEN the system SHALL display an error message with a retry option
   */
  describe('Error State with Retry', () => {
    it('should display error message when error occurs', () => {
      mockState.isLoading = false;
      mockState.error = new Error('Failed to load drivers');
      mockState.drivers = [];

      const { getByText } = render(<DriverListScreen />);

      // Verify error title is displayed
      const errorTitle = getByText('Oops!');
      expect(errorTitle).toBeTruthy();

      // Verify error message is displayed
      const errorMessage = getByText('Failed to load drivers');
      expect(errorMessage).toBeTruthy();
    });

    it('should display retry button in error state', () => {
      mockState.isLoading = false;
      mockState.error = new Error('Network error');
      mockState.drivers = [];

      const { getByLabelText, getByText } = render(<DriverListScreen />);

      // Verify retry button is displayed
      const retryButton = getByLabelText('Retry loading drivers');
      expect(retryButton).toBeTruthy();

      // Verify retry button text
      const retryButtonText = getByText('Retry');
      expect(retryButtonText).toBeTruthy();
    });

    it('should call loadDrivers when retry button is pressed', async () => {
      mockState.isLoading = false;
      mockState.error = new Error('Network error');
      mockState.drivers = [];

      const mockLoadDrivers = jest.fn().mockResolvedValue([]);
      (driverService.loadDrivers as jest.Mock) = mockLoadDrivers;

      const { getByText } = render(<DriverListScreen />);

      // Find and press retry button by text
      const retryButton = getByText('Retry');
      
      // Simulate button press using fireEvent
      const { fireEvent } = require('@testing-library/react-native');
      fireEvent.press(retryButton);

      // Wait for async operations
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'LOAD_DRIVERS_START' });
      });
    });

    it('should not display driver list in error state', () => {
      mockState.isLoading = false;
      mockState.error = new Error('Failed to load drivers');
      mockState.drivers = [];

      const { queryByLabelText } = render(<DriverListScreen />);

      // Verify driver list is not displayed in error state
      const driverList = queryByLabelText('Driver list');
      expect(driverList).toBeNull();
    });

    it('should display custom error message from error object', () => {
      const customErrorMessage = 'Custom network error occurred';
      mockState.isLoading = false;
      mockState.error = new Error(customErrorMessage);
      mockState.drivers = [];

      const { getByText } = render(<DriverListScreen />);

      // Verify custom error message is displayed
      const errorMessage = getByText(customErrorMessage);
      expect(errorMessage).toBeTruthy();
    });
  });

  /**
   * Test empty search results
   * Requirement 3.3: WHEN the search query matches no drivers THEN the system SHALL display an empty state message
   */
  describe('Empty Search Results', () => {
    it('should display empty state when no drivers match search', () => {
      mockState.isLoading = false;
      mockState.error = null;
      mockState.drivers = [];

      const { getByText } = render(<DriverListScreen />);

      // Verify empty state title is displayed
      const emptyTitle = getByText('No drivers found');
      expect(emptyTitle).toBeTruthy();

      // Verify empty state message is displayed
      const emptyMessage = getByText("Try adjusting your search to find what you're looking for");
      expect(emptyMessage).toBeTruthy();
    });

    it('should display search bar even when no results', () => {
      mockState.isLoading = false;
      mockState.error = null;
      mockState.drivers = [];

      const { getByLabelText } = render(<DriverListScreen />);

      // Verify search bar is still displayed
      const searchBar = getByLabelText('Search bar');
      expect(searchBar).toBeTruthy();
    });

    it('should display driver list component even when empty', () => {
      mockState.isLoading = false;
      mockState.error = null;
      mockState.drivers = [];

      const { getByLabelText } = render(<DriverListScreen />);

      // Verify driver list is displayed (but empty)
      const driverList = getByLabelText('Driver list');
      expect(driverList).toBeTruthy();
    });

    it('should show empty state when search filters out all drivers', () => {
      // Mock searchDrivers to return empty array
      (driverService.searchDrivers as jest.Mock).mockReturnValue([]);

      mockState.isLoading = false;
      mockState.error = null;
      mockState.drivers = [
        {
          id: '1',
          name: 'Lewis Hamilton',
          nationality: 'British',
          team: 'Mercedes',
          isWorldChampion: true,
          championshipYears: [2008, 2014, 2015, 2017, 2018, 2019, 2020],
          currentStanding: 1,
          careerPoints: 4500,
          raceWins: 103,
          imageUrl: 'https://example.com/hamilton.jpg',
        },
      ];

      const { getByText } = render(<DriverListScreen />);

      // Verify empty state is displayed
      const emptyTitle = getByText('No drivers found');
      expect(emptyTitle).toBeTruthy();
    });
  });

  /**
   * Test navigation on card press
   * Requirement 4.1: WHEN the user taps on a driver card THEN the system SHALL navigate to a detail screen
   */
  describe('Navigation on Card Press', () => {
    it('should navigate to detail screen when driver card is pressed', () => {
      const { fireEvent } = require('@testing-library/react-native');
      
      const testDriver: Driver = {
        id: 'driver-123',
        name: 'Max Verstappen',
        nationality: 'Dutch',
        team: 'Red Bull Racing',
        isWorldChampion: true,
        championshipYears: [2021, 2022, 2023],
        currentStanding: 1,
        careerPoints: 2500,
        raceWins: 50,
        imageUrl: 'https://example.com/verstappen.jpg',
      };

      mockState.isLoading = false;
      mockState.error = null;
      mockState.drivers = [testDriver];
      
      // Mock searchDrivers to return the drivers
      (driverService.searchDrivers as jest.Mock).mockReturnValue([testDriver]);

      const { getByLabelText } = render(<DriverListScreen />);

      // Find driver card
      const driverCard = getByLabelText('Driver card for Max Verstappen');
      expect(driverCard).toBeTruthy();

      // Simulate card press
      fireEvent.press(driverCard);

      // Verify navigation was called with correct parameters
      expect(mockNavigate).toHaveBeenCalledWith('DriverDetail', {
        driverId: 'driver-123',
      });
    });

    it('should navigate with correct driver ID for multiple drivers', () => {
      const { fireEvent } = require('@testing-library/react-native');
      
      const testDrivers: Driver[] = [
        {
          id: 'driver-1',
          name: 'Lewis Hamilton',
          nationality: 'British',
          team: 'Mercedes',
          isWorldChampion: true,
          championshipYears: [2008, 2014, 2015, 2017, 2018, 2019, 2020],
          currentStanding: 1,
          careerPoints: 4500,
          raceWins: 103,
          imageUrl: 'https://example.com/hamilton.jpg',
        },
        {
          id: 'driver-2',
          name: 'Max Verstappen',
          nationality: 'Dutch',
          team: 'Red Bull Racing',
          isWorldChampion: true,
          championshipYears: [2021, 2022, 2023],
          currentStanding: 2,
          careerPoints: 2500,
          raceWins: 50,
          imageUrl: 'https://example.com/verstappen.jpg',
        },
      ];

      mockState.isLoading = false;
      mockState.error = null;
      mockState.drivers = testDrivers;
      
      // Mock searchDrivers to return the drivers
      (driverService.searchDrivers as jest.Mock).mockReturnValue(testDrivers);

      const { getByLabelText } = render(<DriverListScreen />);

      // Press first driver card
      const hamiltonCard = getByLabelText('Driver card for Lewis Hamilton');
      fireEvent.press(hamiltonCard);

      expect(mockNavigate).toHaveBeenCalledWith('DriverDetail', {
        driverId: 'driver-1',
      });

      // Clear mock
      mockNavigate.mockClear();

      // Press second driver card
      const verstappenCard = getByLabelText('Driver card for Max Verstappen');
      fireEvent.press(verstappenCard);

      expect(mockNavigate).toHaveBeenCalledWith('DriverDetail', {
        driverId: 'driver-2',
      });
    });

    it('should pass driver object to DriverCard component', () => {
      const testDriver: Driver = {
        id: 'driver-456',
        name: 'Charles Leclerc',
        nationality: 'Monégasque',
        team: 'Ferrari',
        isWorldChampion: false,
        championshipYears: [],
        currentStanding: 3,
        careerPoints: 1200,
        raceWins: 5,
        imageUrl: 'https://example.com/leclerc.jpg',
      };

      mockState.isLoading = false;
      mockState.error = null;
      mockState.drivers = [testDriver];
      
      // Mock searchDrivers to return the driver
      (driverService.searchDrivers as jest.Mock).mockReturnValue([testDriver]);

      const { getByLabelText } = render(<DriverListScreen />);

      // Verify driver card is rendered with correct driver
      const driverCard = getByLabelText('Driver card for Charles Leclerc');
      expect(driverCard).toBeTruthy();
    });

    it('should render all driver cards in the list', () => {
      const testDrivers: Driver[] = [
        {
          id: '1',
          name: 'Driver One',
          nationality: 'Country1',
          team: 'Team1',
          isWorldChampion: false,
          championshipYears: [],
          currentStanding: 1,
          careerPoints: 100,
          raceWins: 1,
          imageUrl: 'https://example.com/driver1.jpg',
        },
        {
          id: '2',
          name: 'Driver Two',
          nationality: 'Country2',
          team: 'Team2',
          isWorldChampion: false,
          championshipYears: [],
          currentStanding: 2,
          careerPoints: 90,
          raceWins: 0,
          imageUrl: 'https://example.com/driver2.jpg',
        },
        {
          id: '3',
          name: 'Driver Three',
          nationality: 'Country3',
          team: 'Team3',
          isWorldChampion: false,
          championshipYears: [],
          currentStanding: 3,
          careerPoints: 80,
          raceWins: 0,
          imageUrl: 'https://example.com/driver3.jpg',
        },
      ];

      mockState.isLoading = false;
      mockState.error = null;
      mockState.drivers = testDrivers;
      
      // Mock searchDrivers to return all drivers
      (driverService.searchDrivers as jest.Mock).mockReturnValue(testDrivers);

      const { getByLabelText } = render(<DriverListScreen />);

      // Verify all driver cards are rendered
      const card1 = getByLabelText('Driver card for Driver One');
      const card2 = getByLabelText('Driver card for Driver Two');
      const card3 = getByLabelText('Driver card for Driver Three');

      expect(card1).toBeTruthy();
      expect(card2).toBeTruthy();
      expect(card3).toBeTruthy();
    });
  });

  /**
   * Feature: f1-racers-mobile-app, Property 18: Responsive layout breakpoints
   * Validates: Requirements 13.4, 13.5
   * 
   * For any screen width, the driver card grid should display in single/two-column 
   * layout when width < 600dp, and multi-column layout when width >= 600dp.
   */
  describe('Property 18: Responsive layout breakpoints', () => {
    // Import the calculateColumns function
    const { calculateColumns } = require('./DriverListScreen');

    it('should use 1 column for screen width < 400dp', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 200, max: 399 }),
          (width) => {
            // Property: For width < 400, numColumns should be 1
            const numColumns = calculateColumns(width);
            expect(numColumns).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use 2 columns for screen width between 400-599dp', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 400, max: 599 }),
          (width) => {
            // Property: For width 400-599, numColumns should be 2
            const numColumns = calculateColumns(width);
            expect(numColumns).toBe(2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use 3+ columns for screen width >= 600dp', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 600, max: 2000 }),
          (width) => {
            // Property: For width >= 600, numColumns should be >= 3
            const numColumns = calculateColumns(width);
            const expectedColumns = Math.max(3, Math.floor(width / 300));
            expect(numColumns).toBe(expectedColumns);
            expect(numColumns).toBeGreaterThanOrEqual(3);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should calculate correct number of columns for all screen widths', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 200, max: 2000 }),
          (width) => {
            // Property: numColumns should follow the breakpoint rules
            const numColumns = calculateColumns(width);
            
            let expectedColumns: number;
            if (width < 400) {
              expectedColumns = 1;
            } else if (width < 600) {
              expectedColumns = 2;
            } else {
              expectedColumns = Math.max(3, Math.floor(width / 300));
            }

            expect(numColumns).toBe(expectedColumns);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use single or two-column layout for width < 600dp', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 200, max: 599 }),
          (width) => {
            // Property: For width < 600dp, numColumns should be 1 or 2
            const numColumns = calculateColumns(width);
            expect(numColumns).toBeGreaterThanOrEqual(1);
            expect(numColumns).toBeLessThanOrEqual(2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use multi-column layout for width >= 600dp', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 600, max: 2000 }),
          (width) => {
            // Property: For width >= 600dp, numColumns should be >= 3 (multi-column)
            const numColumns = calculateColumns(width);
            expect(numColumns).toBeGreaterThanOrEqual(3);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain consistent column calculation across calls', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 200, max: 2000 }),
          (width) => {
            // Property: Same width should always produce same number of columns
            const numColumns1 = calculateColumns(width);
            const numColumns2 = calculateColumns(width);
            expect(numColumns1).toBe(numColumns2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge cases at breakpoint boundaries', () => {
      const breakpointWidths = [399, 400, 599, 600, 900, 1200];
      
      breakpointWidths.forEach(width => {
        // Property: Breakpoint boundaries should be handled correctly
        const numColumns = calculateColumns(width);
        
        let expectedColumns: number;
        if (width < 400) {
          expectedColumns = 1;
        } else if (width < 600) {
          expectedColumns = 2;
        } else {
          expectedColumns = Math.max(3, Math.floor(width / 300));
        }

        expect(numColumns).toBe(expectedColumns);
      });
    });
  });

  /**
   * Additional integration tests for complete user flows
   */
  describe('Integration Tests', () => {
    it('should load drivers on component mount', async () => {
      const mockDrivers: Driver[] = [
        {
          id: '1',
          name: 'Test Driver',
          nationality: 'Test',
          team: 'Test Team',
          isWorldChampion: false,
          championshipYears: [],
          currentStanding: 1,
          careerPoints: 100,
          raceWins: 0,
          imageUrl: 'https://example.com/test.jpg',
        },
      ];

      (driverService.loadDrivers as jest.Mock).mockResolvedValue(mockDrivers);
      (driverService.sortByStanding as jest.Mock).mockReturnValue(mockDrivers);

      mockState.isLoading = false;
      mockState.error = null;
      mockState.drivers = [];

      render(<DriverListScreen />);

      // Verify loadDrivers was called on mount
      await waitFor(() => {
        expect(driverService.loadDrivers).toHaveBeenCalled();
      });

      // Verify dispatch was called with LOAD_DRIVERS_START
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'LOAD_DRIVERS_START' });
      });
    });

    it('should display drivers after successful load', async () => {
      const mockDrivers: Driver[] = [
        {
          id: '1',
          name: 'Loaded Driver',
          nationality: 'Test',
          team: 'Test Team',
          isWorldChampion: false,
          championshipYears: [],
          currentStanding: 1,
          careerPoints: 100,
          raceWins: 0,
          imageUrl: 'https://example.com/test.jpg',
        },
      ];

      (driverService.loadDrivers as jest.Mock).mockResolvedValue(mockDrivers);
      (driverService.sortByStanding as jest.Mock).mockReturnValue(mockDrivers);
      (driverService.searchDrivers as jest.Mock).mockReturnValue(mockDrivers);

      mockState.isLoading = false;
      mockState.error = null;
      mockState.drivers = mockDrivers;

      const { getByLabelText } = render(<DriverListScreen />);

      // Verify driver list is displayed
      const driverList = getByLabelText('Driver list');
      expect(driverList).toBeTruthy();

      // Verify driver card is displayed
      const driverCard = getByLabelText('Driver card for Loaded Driver');
      expect(driverCard).toBeTruthy();
    });
  });
});
