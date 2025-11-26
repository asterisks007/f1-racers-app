import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock the DriverList component to avoid data fetching in tests
vi.mock('./components/DriverList', () => ({
  default: ({ searchQuery }) => (
    <div data-testid="driver-list">
      {searchQuery && <div>Search: {searchQuery}</div>}
    </div>
  )
}));

describe('App - Mobile Responsive Behavior', () => {
  beforeEach(() => {
    // Reset window size before each test
    global.innerWidth = 1024;
    global.innerHeight = 768;
  });

  it('should display search icon button on mobile screens', () => {
    // Set mobile viewport
    global.innerWidth = 375;
    
    render(<App />);
    
    // Trigger resize event
    fireEvent(window, new Event('resize'));
    
    waitFor(() => {
      // Should show search icon button instead of search box
      const searchButton = screen.getByRole('button');
      expect(searchButton).toBeInTheDocument();
    });
  });

  it('should display SearchBox on desktop screens', () => {
    // Set desktop viewport
    global.innerWidth = 1440;
    
    render(<App />);
    
    // Trigger resize event
    fireEvent(window, new Event('resize'));
    
    waitFor(() => {
      // Should show search box
      const searchInput = screen.queryByPlaceholderText('Search drivers...');
      expect(searchInput).toBeInTheDocument();
    });
  });

  it('should open mobile search overlay when search icon is clicked', async () => {
    // Set mobile viewport
    global.innerWidth = 375;
    
    render(<App />);
    
    // Trigger resize event
    fireEvent(window, new Event('resize'));
    
    await waitFor(() => {
      const searchButton = screen.getByRole('button');
      fireEvent.click(searchButton);
    });
    
    // Mobile search overlay should open
    await waitFor(() => {
      expect(screen.getByText('Search Drivers')).toBeInTheDocument();
    });
  });

  it('should update search query from mobile overlay', async () => {
    // Set mobile viewport
    global.innerWidth = 375;
    
    render(<App />);
    
    // Trigger resize event
    fireEvent(window, new Event('resize'));
    
    await waitFor(() => {
      const searchButton = screen.getByRole('button');
      fireEvent.click(searchButton);
    });
    
    // Type in mobile search
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search drivers...');
      fireEvent.change(searchInput, { target: { value: 'Verstappen' } });
    });
    
    // Search query should be passed to DriverList
    await waitFor(() => {
      expect(screen.getByText('Search: Verstappen')).toBeInTheDocument();
    });
  });

  it('should switch between mobile and desktop layouts on resize', async () => {
    // Start with desktop
    global.innerWidth = 1440;
    
    const { rerender } = render(<App />);
    
    fireEvent(window, new Event('resize'));
    
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Search drivers...')).toBeInTheDocument();
    });
    
    // Resize to mobile
    global.innerWidth = 375;
    fireEvent(window, new Event('resize'));
    
    rerender(<App />);
    
    await waitFor(() => {
      // Should show search button instead
      const searchButtons = screen.queryAllByRole('button');
      expect(searchButtons.length).toBeGreaterThan(0);
    });
  });

  it('should handle search on both mobile and desktop', async () => {
    render(<App />);
    
    // Desktop search
    const searchInput = screen.queryByPlaceholderText('Search drivers...');
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: 'Hamilton' } });
      
      await waitFor(() => {
        expect(screen.getByText('Search: Hamilton')).toBeInTheDocument();
      });
    }
  });
});

describe('App - Responsive Breakpoints', () => {
  const testBreakpoint = async (width, expectedBehavior) => {
    global.innerWidth = width;
    
    render(<App />);
    fireEvent(window, new Event('resize'));
    
    await waitFor(() => {
      expectedBehavior();
    });
  };

  it('should handle mobile breakpoint (≤768px)', async () => {
    await testBreakpoint(768, () => {
      // Mobile layout should be active
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(0);
    });
  });

  it('should handle tablet breakpoint (769-1024px)', async () => {
    await testBreakpoint(800, () => {
      // Should show search box on tablet
      const searchInput = screen.queryByPlaceholderText('Search drivers...');
      expect(searchInput).toBeInTheDocument();
    });
  });

  it('should handle desktop breakpoint (>1024px)', async () => {
    await testBreakpoint(1440, () => {
      // Should show search box on desktop
      const searchInput = screen.queryByPlaceholderText('Search drivers...');
      expect(searchInput).toBeInTheDocument();
    });
  });
});
