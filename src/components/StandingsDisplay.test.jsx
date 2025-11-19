import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StandingsDisplay from './StandingsDisplay';

describe('StandingsDisplay', () => {
  it('should format 1st position correctly', () => {
    render(<StandingsDisplay position={1} />);
    expect(screen.getByText('1st')).toBeInTheDocument();
  });

  it('should format 2nd position correctly', () => {
    render(<StandingsDisplay position={2} />);
    expect(screen.getByText('2nd')).toBeInTheDocument();
  });

  it('should format 3rd position correctly', () => {
    render(<StandingsDisplay position={3} />);
    expect(screen.getByText('3rd')).toBeInTheDocument();
  });

  it('should format 4th position correctly', () => {
    render(<StandingsDisplay position={4} />);
    expect(screen.getByText('4th')).toBeInTheDocument();
  });

  it('should display N/A for position 0', () => {
    render(<StandingsDisplay position={0} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});
