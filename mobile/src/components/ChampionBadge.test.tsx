/**
 * Property-based tests for ChampionBadge component
 * Feature: f1-racers-mobile-app
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import * as fc from 'fast-check';
import { ChampionBadge } from './ChampionBadge';

describe('ChampionBadge Property Tests', () => {
  /**
   * Feature: f1-racers-mobile-app, Property 3: Champion badge visibility
   * Validates: Requirements 2.1, 2.4
   * 
   * For any driver, a champion badge should be displayed if and only if
   * the driver is a world champion (isWorldChampion is true).
   */
  describe('Property 3: Champion badge visibility', () => {
    it('should render badge content when isWorldChampion is true', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 1950, max: 2024 }), { minLength: 1, maxLength: 10 }),
          (championshipYears) => {
            // Render with isWorldChampion = true
            const { queryByText, UNSAFE_root } = render(
              <ChampionBadge
                isWorldChampion={true}
                championshipYears={championshipYears}
              />
            );

            // Property: Badge should be visible (not null)
            expect(UNSAFE_root).toBeTruthy();
            
            // Property: Trophy icon should be present
            const trophyElement = queryByText('🏆');
            expect(trophyElement).toBeTruthy();
            
            // Property: Championship years should be displayed
            const sortedYears = [...championshipYears].sort((a, b) => a - b);
            const yearsText = sortedYears.join(', ');
            const yearsElement = queryByText(yearsText);
            expect(yearsElement).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not render any content when isWorldChampion is false', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 1950, max: 2024 }), { minLength: 0, maxLength: 10 }),
          (championshipYears) => {
            // Render with isWorldChampion = false
            const { queryByText } = render(
              <ChampionBadge
                isWorldChampion={false}
                championshipYears={championshipYears}
              />
            );
            
            // Property: Trophy icon should not be present
            const trophyElement = queryByText('🏆');
            expect(trophyElement).toBeNull();
            
            // Property: No years text should be displayed
            if (championshipYears.length > 0) {
              const sortedYears = [...championshipYears].sort((a, b) => a - b);
              const yearsText = sortedYears.join(', ');
              const yearsElement = queryByText(yearsText);
              expect(yearsElement).toBeNull();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should satisfy if-and-only-if condition: visible iff isWorldChampion is true', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.array(fc.integer({ min: 1950, max: 2024 }), { minLength: 0, maxLength: 10 }),
          (isWorldChampion, championshipYears) => {
            const { queryByText } = render(
              <ChampionBadge
                isWorldChampion={isWorldChampion}
                championshipYears={championshipYears}
              />
            );

            const trophyElement = queryByText('🏆');
            const isVisible = trophyElement !== null;

            // Property: Badge is visible if and only if isWorldChampion is true
            // The trophy icon should be present iff isWorldChampion is true
            expect(isVisible).toBe(isWorldChampion);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Edge case tests for champion badge visibility
   */
  describe('Edge Cases', () => {
    it('should not render when isWorldChampion is false with empty championship years', () => {
      const { queryByText } = render(
        <ChampionBadge isWorldChampion={false} championshipYears={[]} />
      );

      expect(queryByText('🏆')).toBeNull();
    });

    it('should not render when isWorldChampion is false even with championship years', () => {
      // This tests the case where data might be inconsistent
      const { queryByText } = render(
        <ChampionBadge
          isWorldChampion={false}
          championshipYears={[2020, 2021, 2022]}
        />
      );

      expect(queryByText('🏆')).toBeNull();
      expect(queryByText('2020, 2021, 2022')).toBeNull();
    });

    it('should render when isWorldChampion is true with single championship year', () => {
      const { queryByText } = render(
        <ChampionBadge isWorldChampion={true} championshipYears={[2023]} />
      );

      expect(queryByText('🏆')).toBeTruthy();
      expect(queryByText('2023')).toBeTruthy();
    });

    it('should render when isWorldChampion is true with multiple championship years', () => {
      const { queryByText } = render(
        <ChampionBadge
          isWorldChampion={true}
          championshipYears={[2008, 2014, 2015, 2017, 2018, 2019, 2020]}
        />
      );

      expect(queryByText('🏆')).toBeTruthy();
      expect(queryByText('2008, 2014, 2015, 2017, 2018, 2019, 2020')).toBeTruthy();
    });

    it('should render when isWorldChampion is true even with empty championship years array', () => {
      // This tests edge case where isWorldChampion is true but years array is empty
      const { queryByText, root } = render(
        <ChampionBadge isWorldChampion={true} championshipYears={[]} />
      );

      // Badge should still render because isWorldChampion is true
      expect(root).not.toBeNull();
      expect(queryByText('🏆')).toBeTruthy();
      // Years text will be empty string
      expect(queryByText('')).toBeTruthy();
    });
  });
});
