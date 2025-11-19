import { describe, it, expect } from 'vitest';
import { sortDriversByStanding, filterChampions } from './driverService';

describe('driverService', () => {
  describe('sortDriversByStanding', () => {
    it('should sort drivers by standing position', () => {
      const drivers = [
        { name: 'Driver A', currentStanding: 3 },
        { name: 'Driver B', currentStanding: 1 },
        { name: 'Driver C', currentStanding: 2 },
      ];

      const sorted = sortDriversByStanding(drivers);

      expect(sorted[0].currentStanding).toBe(1);
      expect(sorted[1].currentStanding).toBe(2);
      expect(sorted[2].currentStanding).toBe(3);
    });
  });

  describe('filterChampions', () => {
    it('should return only world champions', () => {
      const drivers = [
        { name: 'Champion 1', isWorldChampion: true },
        { name: 'Non-Champion', isWorldChampion: false },
        { name: 'Champion 2', isWorldChampion: true },
      ];

      const champions = filterChampions(drivers);

      expect(champions).toHaveLength(2);
      expect(champions.every(d => d.isWorldChampion)).toBe(true);
    });
  });
});
