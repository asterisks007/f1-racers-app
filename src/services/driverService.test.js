import { describe, it, expect } from 'vitest';
import { searchDrivers } from './driverService';

describe('searchDrivers', () => {
  const mockDrivers = [
    { id: '1', name: 'Lewis Hamilton' },
    { id: '2', name: 'Max Verstappen' },
    { id: '3', name: 'Fernando Alonso' }
  ];

  it('returns all drivers when search query is empty', () => {
    const result = searchDrivers(mockDrivers, '');
    expect(result).toEqual(mockDrivers);
  });

  it('filters drivers by name with case-insensitive matching', () => {
    const result = searchDrivers(mockDrivers, 'lewis');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Lewis Hamilton');
  });

  it('matches partial names', () => {
    const result = searchDrivers(mockDrivers, 'ver');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Max Verstappen');
  });

  it('returns empty array when no matches found', () => {
    const result = searchDrivers(mockDrivers, 'xyz');
    expect(result).toHaveLength(0);
  });
});
