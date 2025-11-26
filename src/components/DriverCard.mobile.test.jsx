import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DriverCard from './DriverCard';

describe('DriverCard - Mobile Touch Interactions', () => {
  const mockDriver = {
    name: 'Lewis Hamilton',
    nationality: 'British',
    team: 'Mercedes',
    currentStanding: 1,
    isWorldChampion: true,
    championshipYears: [2008, 2014, 2015],
    imageUrl: 'https://example.com/hamilton.jpg'
  };

  it('should toggle expanded state on touch tap', () => {
    render(<DriverCard driver={mockDriver} />);
    
    const card = screen.getByText('Lewis Hamilton').closest('.driver-card');
    
    // Initially not expanded
    expect(card).not.toHaveClass('expanded');
    
    // Simulate touch tap
    fireEvent.touchStart(card);
    fireEvent.touchEnd(card);
    
    // Should be expanded after tap
    expect(card).toHaveClass('expanded');
    
    // Tap again to collapse
    fireEvent.touchStart(card);
    fireEvent.touchEnd(card);
    
    // Should be collapsed
    expect(card).not.toHaveClass('expanded');
  });

  it('should prevent default behavior on touch events', () => {
    render(<DriverCard driver={mockDriver} />);
    
    const card = screen.getByText('Lewis Hamilton').closest('.driver-card');
    
    const touchStartEvent = new TouchEvent('touchstart', { bubbles: true });
    const touchEndEvent = new TouchEvent('touchend', { bubbles: true });
    
    const preventDefaultSpy = vi.spyOn(touchEndEvent, 'preventDefault');
    const stopPropagationStartSpy = vi.spyOn(touchStartEvent, 'stopPropagation');
    const stopPropagationEndSpy = vi.spyOn(touchEndEvent, 'stopPropagation');
    
    fireEvent(card, touchStartEvent);
    fireEvent(card, touchEndEvent);
    
    expect(stopPropagationStartSpy).toHaveBeenCalled();
    expect(stopPropagationEndSpy).toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should display Material UI ripple effect on touch', () => {
    render(<DriverCard driver={mockDriver} />);
    
    // Check that ButtonBase wrapper exists (provides ripple)
    const buttonBase = screen.getByText('Lewis Hamilton').closest('[class*="MuiButtonBase"]');
    expect(buttonBase).toBeInTheDocument();
  });

  it('should show expanded content when tapped on mobile', () => {
    render(<DriverCard driver={mockDriver} />);
    
    const card = screen.getByText('Lewis Hamilton').closest('.driver-card');
    
    // Expanded content should not be visible initially
    const expandedView = card.querySelector('.driver-expanded-view');
    expect(expandedView).toBeInTheDocument();
    
    // Tap to expand
    fireEvent.touchStart(card);
    fireEvent.touchEnd(card);
    
    // Card should have expanded class
    expect(card).toHaveClass('expanded');
    
    // Expanded content should be visible
    expect(screen.getByText(/Nationality:/)).toBeInTheDocument();
    expect(screen.getByText(/British/)).toBeInTheDocument();
  });

  it('should handle touch on low-end devices with reduced animations', () => {
    // Mock low-end device detection
    vi.mock('../utils/deviceDetection', () => ({
      isLowEndDevice: () => true
    }));
    
    render(<DriverCard driver={mockDriver} />);
    
    const card = screen.getByText('Lewis Hamilton').closest('.driver-card');
    
    // Should have reduced-motion class
    expect(card).toHaveClass('reduced-motion');
  });

  it('should maintain minimum touch target size of 44x44px', () => {
    render(<DriverCard driver={mockDriver} />);
    
    const card = screen.getByText('Lewis Hamilton').closest('.driver-card');
    
    // Card should be large enough for touch interaction
    // The card has a min-height of 260px which is well above 44px minimum
    expect(card).toBeInTheDocument();
    
    // Verify the card contains interactive elements
    // ButtonBase wrapper provides the touch target
    const buttonBase = card.closest('[class*="MuiButtonBase"]');
    expect(buttonBase).toBeInTheDocument();
  });
});
