import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChampionBadge from './ChampionBadge';

describe('ChampionBadge', () => {
  it('should display championship years', () => {
    const years = [2008, 2014, 2015];
    render(<ChampionBadge championshipYears={years} />);

    expect(screen.getByText(/2008, 2014, 2015/)).toBeInTheDocument();
  });

  it('should display correct champion count', () => {
    const years = [2008, 2014, 2015];
    render(<ChampionBadge championshipYears={years} />);

    expect(screen.getByText(/3x World Champion/)).toBeInTheDocument();
  });

  it('should not render when no championship years provided', () => {
    const { container } = render(<ChampionBadge championshipYears={[]} />);

    expect(container.firstChild).toBeNull();
  });
});
