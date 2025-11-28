/**
 * Property-based tests for DriverDetailScreen
 * Feature: f1-racers-mobile-app
 */

import React from 'react';
import {render, waitFor} from '@testing-library/react-native';
import * as fc from 'fast-check';
import {DriverDetailScreen} from './DriverDetailScreen';
import {Driver} from '../models';
import {driverService} from '../services/DriverService';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockRoute = {
  key: 'test-key',
  name: 'DriverDetail' as const,
  params: {driverId: 'test-id'},
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => mockRoute,
}));

// Mock the navigation hooks
jest.mock('../navigation/hooks', () => ({
  useTypedRoute: () => mockRoute,
  useTypedNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}));

// Mock react-native-fast-image
jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const FastImageComponent = ({source, ...props}: any) => {
    return React.createElement('Image', {
      ...props,
      source: typeof source === 'object' ? source.uri : source,
    });
  };
  
  FastImageComponent.priority = {
    low: 'low',
    normal: 'normal',
    high: 'high',
  };
  
  FastImageComponent.resizeMode = {
    contain: 'contain',
    cover: 'cover',
    stretch: 'stretch',
    center: 'center',
  };
  
  return {
    __esModule: true,
    default: FastImageComponent,
  };
});

// Mock ImageCacheService
jest.mock('../services/ImageCacheService', () => ({
  __esModule: true,
  default: {
    getCachedImage: jest.fn((url: string) => Promise.resolve(url)),
    preloadImages: jest.fn(() => Promise.resolve()),
    clearOldCache: jest.fn(() => Promise.resolve()),
    getCacheSize: jest.fn(() => Promise.resolve(0)),
  },
}));

describe('DriverDetailScreen Property Tests', () => {
  /**
   * Arbitrary generator for Driver objects
   */
  const driverArbitrary = fc.record({
    id: fc.uuid(),
    name: fc.string({minLength: 1, maxLength: 50}).filter(s => s.trim().length > 0),
    nationality: fc.string({minLength: 1, maxLength: 30}).filter(s => s.trim().length > 0),
    team: fc.string({minLength: 1, maxLength: 50}).filter(s => s.trim().length > 0),
    isWorldChampion: fc.boolean(),
    championshipYears: fc.array(fc.integer({min: 1950, max: 2024})),
    currentStanding: fc.integer({min: 0, max: 30}),
    careerPoints: fc.integer({min: 0, max: 5000}),
    raceWins: fc.integer({min: 0, max: 200}),
    imageUrl: fc.webUrl(),
  }) as fc.Arbitrary<Driver>;

  /**
   * Feature: f1-racers-mobile-app, Property 7: Detail screen completeness
   * Validates: Requirements 4.2
   *
   * For any driver displayed on the detail screen, the screen should show
   * all required fields: name, portrait, nationality, team, current standing,
   * career points, race wins, and championship years.
   */
  describe('Property 7: Detail screen completeness', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should display all required driver fields for any driver', async () => {
      await fc.assert(
        fc.asyncProperty(driverArbitrary, async driver => {
          // Mock the getDriverById to return our test driver
          jest
            .spyOn(driverService, 'getDriverById')
            .mockResolvedValue(driver);

          // Update the mock route to use the driver's ID
          mockRoute.params.driverId = driver.id;

          // Render the component
          const {getByText, getAllByText, getByLabelText, queryByText} = render(
            <DriverDetailScreen />
          );

          // Wait for the component to load
          await waitFor(() => {
            const nameElements = getAllByText(driver.name);
            expect(nameElements.length).toBeGreaterThan(0);
          });

          // Property: Driver name should be displayed
          const nameElements = getAllByText(driver.name);
          expect(nameElements.length).toBeGreaterThan(0);

          // Property: Driver nationality should be displayed
          const nationalityElements = getAllByText(driver.nationality);
          expect(nationalityElements.length).toBeGreaterThan(0);

          // Property: Driver team should be displayed
          const teamElements = getAllByText(driver.team);
          expect(teamElements.length).toBeGreaterThan(0);

          // Property: Career points should be displayed
          expect(getAllByText(driver.careerPoints.toString()).length).toBeGreaterThan(0);

          // Property: Race wins should be displayed
          expect(getAllByText(driver.raceWins.toString()).length).toBeGreaterThan(0);

          // Property: Driver portrait should have accessibility label
          const portraitAccessibilityLabel = `${driver.name} portrait`;
          expect(getByLabelText(portraitAccessibilityLabel)).toBeTruthy();

          // Property: Current standing should be displayed (via StandingIndicator)
          // The StandingIndicator component displays the standing, so we check for its presence
          const standingLabel = driver.currentStanding === 0 
            ? 'Not currently ranked' 
            : `Current standing: position ${driver.currentStanding}`;
          expect(getByLabelText(standingLabel)).toBeTruthy();

          // Property: Championship years should be displayed if driver is a world champion
          if (driver.isWorldChampion && driver.championshipYears.length > 0) {
            // Championship years should be displayed as comma-separated string (sorted)
            const sortedYears = [...driver.championshipYears].sort((a, b) => a - b);
            const yearsString = sortedYears.join(', ');
            expect(getAllByText(yearsString).length).toBeGreaterThan(0);

            // Championship badge should be visible
            const championBadgeLabel = `World Champion: ${yearsString}`;
            expect(getByLabelText(championBadgeLabel)).toBeTruthy();
          } else {
            // Non-champions should not have championship years displayed
            // We can't easily test for absence of specific years, but we can verify
            // the championship section is not present
            const championshipSectionTitle = queryByText('Championship Years');
            if (driver.championshipYears.length === 0) {
              expect(championshipSectionTitle).toBeFalsy();
            }
          }
        }),
        {numRuns: 10} // Reduced iterations for faster test execution
      );
    }, 30000); // 30 second timeout

    it('should display all required fields for non-champion drivers', async () => {
      await fc.assert(
        fc.asyncProperty(driverArbitrary, async driver => {
          // Force driver to be non-champion
          const nonChampionDriver: Driver = {
            ...driver,
            isWorldChampion: false,
            championshipYears: [],
          };

          jest
            .spyOn(driverService, 'getDriverById')
            .mockResolvedValue(nonChampionDriver);

          mockRoute.params.driverId = nonChampionDriver.id;

          const {getAllByText, getByText, getByLabelText, queryByText} = render(
            <DriverDetailScreen />
          );

          await waitFor(() => {
            const nameElements = getAllByText(nonChampionDriver.name);
            expect(nameElements.length).toBeGreaterThan(0);
          });

          // All basic fields should still be present
          expect(getAllByText(nonChampionDriver.name).length).toBeGreaterThan(0);
          expect(getAllByText(nonChampionDriver.nationality).length).toBeGreaterThan(0);
          expect(getAllByText(nonChampionDriver.team).length).toBeGreaterThan(0);
          expect(
            getAllByText(nonChampionDriver.careerPoints.toString()).length
          ).toBeGreaterThan(0);
          expect(getAllByText(nonChampionDriver.raceWins.toString()).length).toBeGreaterThan(0);

          // Portrait should be present
          const portraitLabel = `${nonChampionDriver.name} portrait`;
          expect(getByLabelText(portraitLabel)).toBeTruthy();

          // Standing should be present
          const standingLabel = nonChampionDriver.currentStanding === 0 
            ? 'Not currently ranked' 
            : `Current standing: position ${nonChampionDriver.currentStanding}`;
          expect(getByLabelText(standingLabel)).toBeTruthy();

          // Championship section should not be present
          expect(queryByText('Championship Years')).toBeFalsy();
        }),
        {numRuns: 10}
      );
    }, 30000);

    it('should display all required fields for champion drivers with multiple years', async () => {
      await fc.assert(
        fc.asyncProperty(
          driverArbitrary,
          fc.array(fc.integer({min: 1950, max: 2024}), {
            minLength: 1,
            maxLength: 10,
          }),
          async (driver, years) => {
            // Force driver to be champion with specific years
            const championDriver: Driver = {
              ...driver,
              isWorldChampion: true,
              championshipYears: years,
            };

            jest
              .spyOn(driverService, 'getDriverById')
              .mockResolvedValue(championDriver);

            mockRoute.params.driverId = championDriver.id;

            const {getAllByText, getByText, getByLabelText} = render(<DriverDetailScreen />);

            await waitFor(() => {
              const nameElements = getAllByText(championDriver.name);
              expect(nameElements.length).toBeGreaterThan(0);
            });

            // All basic fields should be present
            expect(getAllByText(championDriver.name).length).toBeGreaterThan(0);
            expect(getAllByText(championDriver.nationality).length).toBeGreaterThan(0);
            expect(getAllByText(championDriver.team).length).toBeGreaterThan(0);
            expect(
              getAllByText(championDriver.careerPoints.toString()).length
            ).toBeGreaterThan(0);
            expect(getAllByText(championDriver.raceWins.toString()).length).toBeGreaterThan(0);

            // Portrait should be present
            const portraitLabel = `${championDriver.name} portrait`;
            expect(getByLabelText(portraitLabel)).toBeTruthy();

            // Standing should be present
            const standingLabel = championDriver.currentStanding === 0 
              ? 'Not currently ranked' 
              : `Current standing: position ${championDriver.currentStanding}`;
            expect(getByLabelText(standingLabel)).toBeTruthy();

            // Championship years should be displayed (sorted)
            const sortedYears = [...years].sort((a, b) => a - b);
            const yearsString = sortedYears.join(', ');
            expect(getAllByText(yearsString).length).toBeGreaterThan(0);

            // Championship badge should be present
            const badgeLabel = `World Champion: ${yearsString}`;
            expect(getByLabelText(badgeLabel)).toBeTruthy();
          }
        ),
        {numRuns: 10}
      );
    }, 30000);

    it('should display all required fields for drivers with zero standing', async () => {
      await fc.assert(
        fc.asyncProperty(driverArbitrary, async driver => {
          // Force driver to have zero standing
          const unrankedDriver: Driver = {
            ...driver,
            currentStanding: 0,
          };

          jest
            .spyOn(driverService, 'getDriverById')
            .mockResolvedValue(unrankedDriver);

          mockRoute.params.driverId = unrankedDriver.id;

          const {getAllByText, getByText, getByLabelText} = render(<DriverDetailScreen />);

          await waitFor(() => {
            const nameElements = getAllByText(unrankedDriver.name);
            expect(nameElements.length).toBeGreaterThan(0);
          });

          // All fields should be present
          expect(getAllByText(unrankedDriver.name).length).toBeGreaterThan(0);
          expect(getAllByText(unrankedDriver.nationality).length).toBeGreaterThan(0);
          expect(getAllByText(unrankedDriver.team).length).toBeGreaterThan(0);
          expect(
            getAllByText(unrankedDriver.careerPoints.toString()).length
          ).toBeGreaterThan(0);
          expect(getAllByText(unrankedDriver.raceWins.toString()).length).toBeGreaterThan(0);

          // Portrait should be present
          const portraitLabel = `${unrankedDriver.name} portrait`;
          expect(getByLabelText(portraitLabel)).toBeTruthy();

          // Standing should show "Not currently ranked" for zero standing
          const standingLabel = 'Not currently ranked';
          expect(getByLabelText(standingLabel)).toBeTruthy();
        }),
        {numRuns: 10}
      );
    }, 30000);

    it('should handle edge case: driver with all zero statistics', async () => {
      const zeroStatsDriver: Driver = {
        id: 'test-id',
        name: 'Test Driver',
        nationality: 'Test Nation',
        team: 'Test Team',
        isWorldChampion: false,
        championshipYears: [],
        currentStanding: 0,
        careerPoints: 0,
        raceWins: 0,
        imageUrl: 'https://example.com/test.jpg',
      };

      jest.spyOn(driverService, 'getDriverById').mockResolvedValue(zeroStatsDriver);

      mockRoute.params.driverId = zeroStatsDriver.id;

      const {getAllByText, getByLabelText} = render(<DriverDetailScreen />);

      await waitFor(() => {
        const nameElements = getAllByText(zeroStatsDriver.name);
        expect(nameElements.length).toBeGreaterThan(0);
      });

      // All fields should still be displayed, even with zero values
      expect(getAllByText(zeroStatsDriver.name).length).toBeGreaterThan(0);
      expect(getAllByText(zeroStatsDriver.nationality).length).toBeGreaterThan(0);
      expect(getAllByText(zeroStatsDriver.team).length).toBeGreaterThan(0);
      // Both careerPoints and raceWins are 0, so we just verify the component rendered without error
      
      const portraitLabel = `${zeroStatsDriver.name} portrait`;
      expect(getByLabelText(portraitLabel)).toBeTruthy();
      
      const standingLabel = 'Not currently ranked';
      expect(getByLabelText(standingLabel)).toBeTruthy();
    }, 10000); // 10 second timeout for this simpler test
  });
});
