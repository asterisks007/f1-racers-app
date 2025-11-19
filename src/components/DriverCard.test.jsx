import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DriverCard from './DriverCard';

describe('DriverCard', () => {
  it('should render driver information', () => {
    const driver = {
      name: 'Lewis Hamilton',
      nationality: 'British',
      team: 'Mercedes',
      currentStanding: 1,
      isWorldChampion: false,
    };

    render(<DriverCard driver={driver} />);

    expect(screen.getByText('Lewis Hamilton')).toBeInTheDocument();
    expect(screen.getByText(/British/)).toBeInTheDocument();
    expect(screen.getByText(/Mercedes/)).toBeInTheDocument();
  });

  it('should display champion badge for world champions', () => {
    const driver = {
      name: 'Lewis Hamilton',
      nationality: 'British',
      team: 'Mercedes',
      currentStanding: 1,
      isWorldChampion: true,
      championshipYears: [2008, 2014, 2015],
    };

    render(<DriverCard driver={driver} />);

    expect(screen.getByText(/World Champion/)).toBeInTheDocument();
  });
});
