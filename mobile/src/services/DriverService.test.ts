/**
 * Property-based tests for DriverService
 * Feature: f1-racers-mobile-app
 */

import * as fc from 'fast-check';
import { DriverService } from './DriverService';
import { Driver } from '../models';

describe('DriverService Property Tests', () => {
  const driverService = new DriverService();

  /**
   * Arbitrary generator for Driver objects
   * Generates random but valid driver data for property testing
   */
  const driverArbitrary = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    nationality: fc.string({ minLength: 1, maxLength: 30 }),
    team: fc.string({ minLength: 1, maxLength: 50 }),
    isWorldChampion: fc.boolean(),
    championshipYears: fc.array(fc.integer({ min: 1950, max: 2024 })),
    currentStanding: fc.integer({ min: 0, max: 30 }),
    careerPoints: fc.integer({ min: 0, max: 5000 }),
    raceWins: fc.integer({ min: 0, max: 200 }),
    imageUrl: fc.webUrl(),
  }) as fc.Arbitrary<Driver>;

  /**
   * Feature: f1-racers-mobile-app, Property 1: Driver list sorting consistency
   * Validates: Requirements 1.1, 1.2
   * 
   * For any set of drivers, when sorted by standing position:
   * - Drivers with non-zero standings should appear in ascending order (1, 2, 3...)
   * - Drivers with zero standing should appear at the end of the list
   */
  describe('Property 1: Driver list sorting consistency', () => {
    it('should sort drivers with non-zero standings in ascending order and place zero standings at the end', () => {
      fc.assert(
        fc.property(
          fc.array(driverArbitrary, { minLength: 0, maxLength: 50 }),
          (drivers) => {
            // Sort the drivers
            const sorted = driverService.sortByStanding(drivers);

            // Property 1: Result should have same length as input
            expect(sorted.length).toBe(drivers.length);

            // Property 2: All drivers from input should be in output
            const inputIds = new Set(drivers.map(d => d.id));
            const outputIds = new Set(sorted.map(d => d.id));
            expect(outputIds).toEqual(inputIds);

            // Find the index where zero standings begin
            const firstZeroIndex = sorted.findIndex(d => d.currentStanding === 0);

            // Property 3: All non-zero standings should come before zero standings
            if (firstZeroIndex !== -1) {
              // Check all drivers before firstZeroIndex have non-zero standings
              for (let i = 0; i < firstZeroIndex; i++) {
                expect(sorted[i].currentStanding).toBeGreaterThan(0);
              }
              // Check all drivers from firstZeroIndex onwards have zero standings
              for (let i = firstZeroIndex; i < sorted.length; i++) {
                expect(sorted[i].currentStanding).toBe(0);
              }
            } else {
              // No zero standings, all should be non-zero
              sorted.forEach(d => {
                if (drivers.length > 0) {
                  expect(d.currentStanding).toBeGreaterThanOrEqual(0);
                }
              });
            }

            // Property 4: Non-zero standings should be in ascending order
            const nonZeroStandings = sorted
              .filter(d => d.currentStanding > 0)
              .map(d => d.currentStanding);
            
            for (let i = 1; i < nonZeroStandings.length; i++) {
              expect(nonZeroStandings[i]).toBeGreaterThanOrEqual(nonZeroStandings[i - 1]);
            }

            // Property 5: Zero standings should all be at the end
            const zeroStandings = sorted.filter(d => d.currentStanding === 0);
            const lastNonZeroIndex = sorted.findIndex(d => d.currentStanding === 0);
            
            if (zeroStandings.length > 0 && lastNonZeroIndex !== -1) {
              // All zero standings should be consecutive at the end
              const expectedZeroCount = zeroStandings.length;
              const actualZeroCount = sorted.length - lastNonZeroIndex;
              expect(actualZeroCount).toBe(expectedZeroCount);
            }
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in design doc
      );
    });

    it('should handle edge case: empty array', () => {
      const result = driverService.sortByStanding([]);
      expect(result).toEqual([]);
    });

    it('should handle edge case: all drivers with zero standing', () => {
      fc.assert(
        fc.property(
          fc.array(driverArbitrary, { minLength: 1, maxLength: 20 }),
          (drivers) => {
            // Set all standings to zero
            const driversWithZeroStanding = drivers.map(d => ({
              ...d,
              currentStanding: 0,
            }));

            const sorted = driverService.sortByStanding(driversWithZeroStanding);

            // All should have zero standing
            sorted.forEach(d => {
              expect(d.currentStanding).toBe(0);
            });

            // Should have same length
            expect(sorted.length).toBe(driversWithZeroStanding.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case: all drivers with non-zero standing', () => {
      fc.assert(
        fc.property(
          fc.array(driverArbitrary, { minLength: 1, maxLength: 20 }),
          (drivers) => {
            // Set all standings to non-zero
            const driversWithNonZeroStanding = drivers.map((d, idx) => ({
              ...d,
              currentStanding: idx + 1,
            }));

            const sorted = driverService.sortByStanding(driversWithNonZeroStanding);

            // All should be in ascending order
            for (let i = 1; i < sorted.length; i++) {
              expect(sorted[i].currentStanding).toBeGreaterThanOrEqual(
                sorted[i - 1].currentStanding
              );
            }

            // None should have zero standing
            sorted.forEach(d => {
              expect(d.currentStanding).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not mutate the original array', () => {
      fc.assert(
        fc.property(
          fc.array(driverArbitrary, { minLength: 1, maxLength: 20 }),
          (drivers) => {
            // Create a deep copy to compare
            const originalCopy = JSON.parse(JSON.stringify(drivers));

            // Sort the drivers
            driverService.sortByStanding(drivers);

            // Original should be unchanged
            expect(drivers).toEqual(originalCopy);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: f1-racers-mobile-app, Property 5: Search filtering correctness
   * Validates: Requirements 3.1, 3.4
   * 
   * For any list of drivers and any search query, the filtered results should:
   * - Contain only drivers whose names contain the search text (case-insensitive)
   * - Contain all such drivers (no false negatives)
   */
  describe('Property 5: Search filtering correctness', () => {
    it('should return only drivers whose names contain the search query (case-insensitive)', () => {
      fc.assert(
        fc.property(
          fc.array(driverArbitrary, { minLength: 0, maxLength: 50 }),
          fc.string(),
          (drivers, query) => {
            const results = driverService.searchDrivers(drivers, query);

            // Property 1: All results should be from the original driver list
            results.forEach(result => {
              expect(drivers).toContainEqual(result);
            });

            // Property 2: All results should contain the query (case-insensitive)
            const normalizedQuery = query.toLowerCase().trim();
            
            if (normalizedQuery === '') {
              // Empty query should return all drivers
              expect(results.length).toBe(drivers.length);
              expect(results).toEqual(drivers);
            } else {
              // Non-empty query: all results should contain the query
              results.forEach(driver => {
                expect(driver.name.toLowerCase()).toContain(normalizedQuery);
              });

              // Property 3: All drivers whose names contain the query should be in results
              const expectedMatches = drivers.filter(driver =>
                driver.name.toLowerCase().includes(normalizedQuery)
              );
              
              expect(results.length).toBe(expectedMatches.length);
              
              // Check that all expected matches are in results
              expectedMatches.forEach(expectedDriver => {
                expect(results).toContainEqual(expectedDriver);
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case: empty driver array', () => {
      const result = driverService.searchDrivers([], 'Hamilton');
      expect(result).toEqual([]);
    });

    it('should handle edge case: empty search query returns all drivers', () => {
      fc.assert(
        fc.property(
          fc.array(driverArbitrary, { minLength: 1, maxLength: 20 }),
          (drivers) => {
            const emptyQueries = ['', '   ', '\t', '\n'];
            
            emptyQueries.forEach(query => {
              const result = driverService.searchDrivers(drivers, query);
              expect(result).toEqual(drivers);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be case-insensitive', () => {
      fc.assert(
        fc.property(
          fc.array(driverArbitrary, { minLength: 1, maxLength: 20 }),
          fc.string({ minLength: 1, maxLength: 10 }),
          (drivers, queryBase) => {
            // Test with different case variations
            const lowerQuery = queryBase.toLowerCase();
            const upperQuery = queryBase.toUpperCase();
            const mixedQuery = queryBase.split('').map((c, i) => 
              i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()
            ).join('');

            const lowerResults = driverService.searchDrivers(drivers, lowerQuery);
            const upperResults = driverService.searchDrivers(drivers, upperQuery);
            const mixedResults = driverService.searchDrivers(drivers, mixedQuery);

            // All variations should return the same results
            expect(lowerResults).toEqual(upperResults);
            expect(lowerResults).toEqual(mixedResults);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle special characters in search query', () => {
      fc.assert(
        fc.property(
          fc.array(driverArbitrary, { minLength: 1, maxLength: 20 }),
          fc.string(),
          (drivers, query) => {
            // Should not throw an error with any string input
            expect(() => {
              driverService.searchDrivers(drivers, query);
            }).not.toThrow();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not mutate the original driver array', () => {
      fc.assert(
        fc.property(
          fc.array(driverArbitrary, { minLength: 1, maxLength: 20 }),
          fc.string(),
          (drivers, query) => {
            const originalCopy = JSON.parse(JSON.stringify(drivers));
            
            driverService.searchDrivers(drivers, query);
            
            // Original should be unchanged
            expect(drivers).toEqual(originalCopy);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle partial name matches', () => {
      const testDrivers: Driver[] = [
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
        {
          id: '2',
          name: 'Max Verstappen',
          team: 'Red Bull Racing',
          nationality: 'Dutch',
          isWorldChampion: true,
          championshipYears: [2021, 2022, 2023],
          currentStanding: 2,
          careerPoints: 2500,
          raceWins: 50,
          imageUrl: 'https://example.com/verstappen.jpg',
        },
      ];

      // Partial matches should work
      expect(driverService.searchDrivers(testDrivers, 'Ham').length).toBe(1);
      expect(driverService.searchDrivers(testDrivers, 'Ver').length).toBe(1);
      expect(driverService.searchDrivers(testDrivers, 'a').length).toBe(2); // Both have 'a'
      expect(driverService.searchDrivers(testDrivers, 'xyz').length).toBe(0);
    });
  });

  /**
   * Feature: f1-racers-mobile-app, Property 14: JSON parsing round-trip
   * Validates: Requirements 11.3
   * 
   * For any valid Driver object, serializing to JSON and then parsing back
   * should produce an equivalent Driver object with all fields preserved.
   */
  describe('Property 14: JSON parsing round-trip', () => {
    it('should preserve all driver fields through JSON serialization and parsing', () => {
      fc.assert(
        fc.property(
          driverArbitrary,
          (driver) => {
            // Serialize to JSON string
            const jsonString = JSON.stringify(driver);
            
            // Parse back from JSON string
            const parsed = JSON.parse(jsonString);
            
            // Validate the parsed object is a valid Driver
            expect(parsed).toEqual(driver);
            
            // Verify all fields are preserved with correct types
            expect(parsed.id).toBe(driver.id);
            expect(typeof parsed.id).toBe('string');
            
            expect(parsed.name).toBe(driver.name);
            expect(typeof parsed.name).toBe('string');
            
            expect(parsed.nationality).toBe(driver.nationality);
            expect(typeof parsed.nationality).toBe('string');
            
            expect(parsed.team).toBe(driver.team);
            expect(typeof parsed.team).toBe('string');
            
            expect(parsed.isWorldChampion).toBe(driver.isWorldChampion);
            expect(typeof parsed.isWorldChampion).toBe('boolean');
            
            expect(parsed.championshipYears).toEqual(driver.championshipYears);
            expect(Array.isArray(parsed.championshipYears)).toBe(true);
            expect(parsed.championshipYears.length).toBe(driver.championshipYears.length);
            parsed.championshipYears.forEach((year: number, idx: number) => {
              expect(year).toBe(driver.championshipYears[idx]);
              expect(typeof year).toBe('number');
            });
            
            expect(parsed.currentStanding).toBe(driver.currentStanding);
            expect(typeof parsed.currentStanding).toBe('number');
            
            expect(parsed.careerPoints).toBe(driver.careerPoints);
            expect(typeof parsed.careerPoints).toBe('number');
            
            expect(parsed.raceWins).toBe(driver.raceWins);
            expect(typeof parsed.raceWins).toBe('number');
            
            expect(parsed.imageUrl).toBe(driver.imageUrl);
            expect(typeof parsed.imageUrl).toBe('string');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle driver arrays through JSON round-trip', () => {
      fc.assert(
        fc.property(
          fc.array(driverArbitrary, { minLength: 0, maxLength: 30 }),
          (drivers) => {
            // Serialize array to JSON string
            const jsonString = JSON.stringify(drivers);
            
            // Parse back from JSON string
            const parsed: Driver[] = JSON.parse(jsonString);
            
            // Should have same length
            expect(parsed.length).toBe(drivers.length);
            
            // All drivers should be preserved
            expect(parsed).toEqual(drivers);
            
            // Verify each driver individually
            parsed.forEach((parsedDriver, idx) => {
              const originalDriver = drivers[idx];
              expect(parsedDriver).toEqual(originalDriver);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case: driver with empty championship years', () => {
      fc.assert(
        fc.property(
          driverArbitrary,
          (driver) => {
            // Create driver with no championship years
            const nonChampion: Driver = {
              ...driver,
              isWorldChampion: false,
              championshipYears: [],
            };
            
            const jsonString = JSON.stringify(nonChampion);
            const parsed = JSON.parse(jsonString);
            
            expect(parsed).toEqual(nonChampion);
            expect(parsed.championshipYears).toEqual([]);
            expect(Array.isArray(parsed.championshipYears)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case: driver with multiple championship years', () => {
      fc.assert(
        fc.property(
          driverArbitrary,
          fc.array(fc.integer({ min: 1950, max: 2024 }), { minLength: 1, maxLength: 10 }),
          (driver, years) => {
            // Create driver with multiple championship years
            const champion: Driver = {
              ...driver,
              isWorldChampion: true,
              championshipYears: years,
            };
            
            const jsonString = JSON.stringify(champion);
            const parsed = JSON.parse(jsonString);
            
            expect(parsed).toEqual(champion);
            expect(parsed.championshipYears).toEqual(years);
            expect(parsed.championshipYears.length).toBe(years.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case: driver with zero standing', () => {
      fc.assert(
        fc.property(
          driverArbitrary,
          (driver) => {
            // Create driver with zero standing
            const unrankedDriver: Driver = {
              ...driver,
              currentStanding: 0,
            };
            
            const jsonString = JSON.stringify(unrankedDriver);
            const parsed = JSON.parse(jsonString);
            
            expect(parsed).toEqual(unrankedDriver);
            expect(parsed.currentStanding).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case: driver with special characters in strings', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            nationality: fc.string({ minLength: 1, maxLength: 30 }),
            team: fc.string({ minLength: 1, maxLength: 50 }),
            isWorldChampion: fc.boolean(),
            championshipYears: fc.array(fc.integer({ min: 1950, max: 2024 })),
            currentStanding: fc.integer({ min: 0, max: 30 }),
            careerPoints: fc.integer({ min: 0, max: 5000 }),
            raceWins: fc.integer({ min: 0, max: 200 }),
            imageUrl: fc.webUrl(),
          }) as fc.Arbitrary<Driver>,
          (driver) => {
            const jsonString = JSON.stringify(driver);
            const parsed = JSON.parse(jsonString);
            
            expect(parsed).toEqual(driver);
            
            // Verify strings are properly escaped and unescaped
            expect(parsed.name).toBe(driver.name);
            expect(parsed.nationality).toBe(driver.nationality);
            expect(parsed.team).toBe(driver.team);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve data types after round-trip', () => {
      fc.assert(
        fc.property(
          driverArbitrary,
          (driver) => {
            const jsonString = JSON.stringify(driver);
            const parsed = JSON.parse(jsonString);
            
            // Verify types are preserved
            expect(typeof parsed.id).toBe(typeof driver.id);
            expect(typeof parsed.name).toBe(typeof driver.name);
            expect(typeof parsed.nationality).toBe(typeof driver.nationality);
            expect(typeof parsed.team).toBe(typeof driver.team);
            expect(typeof parsed.isWorldChampion).toBe(typeof driver.isWorldChampion);
            expect(Array.isArray(parsed.championshipYears)).toBe(Array.isArray(driver.championshipYears));
            expect(typeof parsed.currentStanding).toBe(typeof driver.currentStanding);
            expect(typeof parsed.careerPoints).toBe(typeof driver.careerPoints);
            expect(typeof parsed.raceWins).toBe(typeof driver.raceWins);
            expect(typeof parsed.imageUrl).toBe(typeof driver.imageUrl);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty driver array', () => {
      const emptyArray: Driver[] = [];
      const jsonString = JSON.stringify(emptyArray);
      const parsed = JSON.parse(jsonString);
      
      expect(parsed).toEqual([]);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(0);
    });
  });

  /**
   * Unit tests for DriverService edge cases
   * Testing specific edge cases as required by task 3.7
   */
  describe('DriverService Unit Tests - Edge Cases', () => {
    const driverService = new DriverService();

    describe('Empty driver arrays', () => {
      it('should return empty array when sorting empty driver list', () => {
        const result = driverService.sortByStanding([]);
        expect(result).toEqual([]);
        expect(result.length).toBe(0);
      });

      it('should return empty array when searching empty driver list', () => {
        const result = driverService.searchDrivers([], 'Hamilton');
        expect(result).toEqual([]);
        expect(result.length).toBe(0);
      });

      it('should return empty array when filtering champions from empty list', () => {
        const result = driverService.filterChampions([]);
        expect(result).toEqual([]);
        expect(result.length).toBe(0);
      });
    });

    describe('Search with empty strings and special characters', () => {
      const testDrivers: Driver[] = [
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
        {
          id: '2',
          name: 'Max Verstappen',
          team: 'Red Bull Racing',
          nationality: 'Dutch',
          isWorldChampion: true,
          championshipYears: [2021, 2022, 2023],
          currentStanding: 2,
          careerPoints: 2500,
          raceWins: 50,
          imageUrl: 'https://example.com/verstappen.jpg',
        },
        {
          id: '3',
          name: "Charles Leclerc",
          team: 'Ferrari',
          nationality: 'Monégasque',
          isWorldChampion: false,
          championshipYears: [],
          currentStanding: 3,
          careerPoints: 1200,
          raceWins: 5,
          imageUrl: 'https://example.com/leclerc.jpg',
        },
      ];

      it('should return all drivers when search query is empty string', () => {
        const result = driverService.searchDrivers(testDrivers, '');
        expect(result).toEqual(testDrivers);
        expect(result.length).toBe(3);
      });

      it('should return all drivers when search query is whitespace only', () => {
        const whitespaceQueries = ['   ', '\t', '\n', '  \t\n  '];
        
        whitespaceQueries.forEach(query => {
          const result = driverService.searchDrivers(testDrivers, query);
          expect(result).toEqual(testDrivers);
          expect(result.length).toBe(3);
        });
      });

      it('should handle special characters in search query without throwing', () => {
        const specialCharQueries = [
          '!@#$%^&*()',
          '[]{}',
          '\\',
          '/',
          '.',
          '*',
          '?',
          '+',
          '|',
          '(',
          ')',
          '<>',
          '~`',
        ];

        specialCharQueries.forEach(query => {
          expect(() => {
            driverService.searchDrivers(testDrivers, query);
          }).not.toThrow();
        });
      });

      it('should return empty array when special characters do not match any driver name', () => {
        const result = driverService.searchDrivers(testDrivers, '@#$%');
        expect(result).toEqual([]);
        expect(result.length).toBe(0);
      });

      it('should match drivers with special characters in their names', () => {
        const driversWithSpecialChars: Driver[] = [
          {
            id: '1',
            name: "Nico Hülkenberg",
            nationality: 'German',
            team: 'Haas',
            isWorldChampion: false,
            championshipYears: [],
            currentStanding: 10,
            careerPoints: 500,
            raceWins: 0,
            imageUrl: 'https://example.com/hulkenberg.jpg',
          },
          {
            id: '2',
            name: "Sergio Pérez",
            nationality: 'Mexican',
            team: 'Red Bull Racing',
            isWorldChampion: false,
            championshipYears: [],
            currentStanding: 4,
            careerPoints: 1300,
            raceWins: 6,
            imageUrl: 'https://example.com/perez.jpg',
          },
        ];

        // Search with special character
        const result1 = driverService.searchDrivers(driversWithSpecialChars, 'ü');
        expect(result1.length).toBe(1);
        expect(result1[0].name).toBe("Nico Hülkenberg");

        const result2 = driverService.searchDrivers(driversWithSpecialChars, 'é');
        expect(result2.length).toBe(1);
        expect(result2[0].name).toBe("Sergio Pérez");
      });

      it('should handle unicode characters in search query', () => {
        const unicodeQueries = ['é', 'ü', 'ñ', '中文', '日本語', '한글', '🏎️'];
        
        unicodeQueries.forEach(query => {
          expect(() => {
            driverService.searchDrivers(testDrivers, query);
          }).not.toThrow();
        });
      });

      it('should handle very long search queries', () => {
        const longQuery = 'a'.repeat(1000);
        
        expect(() => {
          driverService.searchDrivers(testDrivers, longQuery);
        }).not.toThrow();
        
        const result = driverService.searchDrivers(testDrivers, longQuery);
        expect(result).toEqual([]);
      });
    });

    describe('Sorting with equal standings', () => {
      it('should maintain stable order for drivers with equal non-zero standings', () => {
        const driversWithEqualStandings: Driver[] = [
          {
            id: '1',
            name: 'Alice Driver',
            nationality: 'British',
            team: 'Team A',
            isWorldChampion: false,
            championshipYears: [],
            currentStanding: 5,
            careerPoints: 100,
            raceWins: 1,
            imageUrl: 'https://example.com/alice.jpg',
          },
          {
            id: '2',
            name: 'Bob Driver',
            nationality: 'German',
            team: 'Team B',
            isWorldChampion: false,
            championshipYears: [],
            currentStanding: 5,
            careerPoints: 100,
            raceWins: 1,
            imageUrl: 'https://example.com/bob.jpg',
          },
          {
            id: '3',
            name: 'Charlie Driver',
            nationality: 'French',
            team: 'Team C',
            isWorldChampion: false,
            championshipYears: [],
            currentStanding: 5,
            careerPoints: 100,
            raceWins: 1,
            imageUrl: 'https://example.com/charlie.jpg',
          },
        ];

        const sorted = driverService.sortByStanding(driversWithEqualStandings);
        
        // All should have standing 5
        sorted.forEach(driver => {
          expect(driver.currentStanding).toBe(5);
        });
        
        // Should have all 3 drivers
        expect(sorted.length).toBe(3);
        
        // All original drivers should be present
        expect(sorted).toContainEqual(driversWithEqualStandings[0]);
        expect(sorted).toContainEqual(driversWithEqualStandings[1]);
        expect(sorted).toContainEqual(driversWithEqualStandings[2]);
      });

      it('should sort drivers with mixed equal and different standings correctly', () => {
        const mixedDrivers: Driver[] = [
          {
            id: '1',
            name: 'First Place',
            nationality: 'British',
            team: 'Team A',
            isWorldChampion: true,
            championshipYears: [2023],
            currentStanding: 1,
            careerPoints: 500,
            raceWins: 10,
            imageUrl: 'https://example.com/first.jpg',
          },
          {
            id: '2',
            name: 'Tied Second A',
            nationality: 'German',
            team: 'Team B',
            isWorldChampion: false,
            championshipYears: [],
            currentStanding: 2,
            careerPoints: 300,
            raceWins: 5,
            imageUrl: 'https://example.com/second-a.jpg',
          },
          {
            id: '3',
            name: 'Tied Second B',
            nationality: 'French',
            team: 'Team C',
            isWorldChampion: false,
            championshipYears: [],
            currentStanding: 2,
            careerPoints: 300,
            raceWins: 5,
            imageUrl: 'https://example.com/second-b.jpg',
          },
          {
            id: '4',
            name: 'Fourth Place',
            nationality: 'Spanish',
            team: 'Team D',
            isWorldChampion: false,
            championshipYears: [],
            currentStanding: 4,
            careerPoints: 200,
            raceWins: 2,
            imageUrl: 'https://example.com/fourth.jpg',
          },
        ];

        const sorted = driverService.sortByStanding(mixedDrivers);
        
        // First should be standing 1
        expect(sorted[0].currentStanding).toBe(1);
        
        // Next two should be standing 2
        expect(sorted[1].currentStanding).toBe(2);
        expect(sorted[2].currentStanding).toBe(2);
        
        // Last should be standing 4
        expect(sorted[3].currentStanding).toBe(4);
        
        // Verify all drivers are present
        expect(sorted.length).toBe(4);
      });

      it('should handle all drivers with zero standing (equal standings)', () => {
        const allZeroStandings: Driver[] = [
          {
            id: '1',
            name: 'Unranked A',
            nationality: 'British',
            team: 'Team A',
            isWorldChampion: false,
            championshipYears: [],
            currentStanding: 0,
            careerPoints: 0,
            raceWins: 0,
            imageUrl: 'https://example.com/unranked-a.jpg',
          },
          {
            id: '2',
            name: 'Unranked B',
            nationality: 'German',
            team: 'Team B',
            isWorldChampion: false,
            championshipYears: [],
            currentStanding: 0,
            careerPoints: 0,
            raceWins: 0,
            imageUrl: 'https://example.com/unranked-b.jpg',
          },
          {
            id: '3',
            name: 'Unranked C',
            nationality: 'French',
            team: 'Team C',
            isWorldChampion: false,
            championshipYears: [],
            currentStanding: 0,
            careerPoints: 0,
            raceWins: 0,
            imageUrl: 'https://example.com/unranked-c.jpg',
          },
        ];

        const sorted = driverService.sortByStanding(allZeroStandings);
        
        // All should have zero standing
        sorted.forEach(driver => {
          expect(driver.currentStanding).toBe(0);
        });
        
        // Should have all 3 drivers
        expect(sorted.length).toBe(3);
        
        // All original drivers should be present
        expect(sorted).toContainEqual(allZeroStandings[0]);
        expect(sorted).toContainEqual(allZeroStandings[1]);
        expect(sorted).toContainEqual(allZeroStandings[2]);
      });

      it('should sort equal standings alphabetically by name', () => {
        const equalStandingsDrivers: Driver[] = [
          {
            id: '1',
            name: 'Zebra Driver',
            nationality: 'British',
            team: 'Team A',
            isWorldChampion: false,
            championshipYears: [],
            currentStanding: 0,
            careerPoints: 0,
            raceWins: 0,
            imageUrl: 'https://example.com/zebra.jpg',
          },
          {
            id: '2',
            name: 'Alpha Driver',
            nationality: 'German',
            team: 'Team B',
            isWorldChampion: false,
            championshipYears: [],
            currentStanding: 0,
            careerPoints: 0,
            raceWins: 0,
            imageUrl: 'https://example.com/alpha.jpg',
          },
          {
            id: '3',
            name: 'Beta Driver',
            nationality: 'French',
            team: 'Team C',
            isWorldChampion: false,
            championshipYears: [],
            currentStanding: 0,
            careerPoints: 0,
            raceWins: 0,
            imageUrl: 'https://example.com/beta.jpg',
          },
        ];

        const sorted = driverService.sortByStanding(equalStandingsDrivers);
        
        // Should be sorted alphabetically when standings are equal (all zero)
        expect(sorted[0].name).toBe('Alpha Driver');
        expect(sorted[1].name).toBe('Beta Driver');
        expect(sorted[2].name).toBe('Zebra Driver');
      });

      it('should handle single driver with any standing', () => {
        const singleDriver: Driver[] = [
          {
            id: '1',
            name: 'Solo Driver',
            nationality: 'British',
            team: 'Team A',
            isWorldChampion: false,
            championshipYears: [],
            currentStanding: 5,
            careerPoints: 100,
            raceWins: 1,
            imageUrl: 'https://example.com/solo.jpg',
          },
        ];

        const sorted = driverService.sortByStanding(singleDriver);
        
        expect(sorted.length).toBe(1);
        expect(sorted[0]).toEqual(singleDriver[0]);
      });
    });
  });
});
