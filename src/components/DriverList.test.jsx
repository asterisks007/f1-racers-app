import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DriverList from './DriverList';
import * as driverService from '../services/driverService';

vi.mock('../services/driverService', () => ({
  getDrivers: vi.fn(),
  searchDrivers: vi.fn((drivers, query) => {
    if (!query) return drivers;
    return drivers.filter(d => d.name.toLowerCase().includes(query.toLowerCase()));
  })
}));

describe('DriverList', () => {
  const mockDrivers = [
    { id: '1', name: 'Lewis Hamilton', nationality: 'British', team: 'Mercedes', isWorldChampion: true, championshipYears: [2008], currentStanding: 1 },
    { id: '2', name: 'Max Verstappen', nationality: 'Dutch', team: 'Red Bull', isWorldChampion: true, championshipYears: [2021], currentStanding: 2 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays loading message initially', () => {
    driverService.getDrivers.mockReturnValue(new Promise(() => {}));
    render(<DriverList />);
    expect(screen.getByText('Loading drivers...')).toBeInTheDocument();
  });

  it('displays drivers after loading', async () => {
    driverService.getDrivers.mockResolvedValue(mockDrivers);
    
    render(<DriverList />);
    
    await waitFor(() => {
      expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
      expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    });
  });

  it('filters drivers based on search query', async () => {
    driverService.getDrivers.mockResolvedValue(mockDrivers);
    
    render(<DriverList searchQuery="Lewis" />);
    
    await waitFor(() => {
      expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
      expect(screen.queryByText('Max Verstappen')).not.toBeInTheDocument();
    });
  });
});
