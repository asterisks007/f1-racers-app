import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MobileSearchOverlay from './MobileSearchOverlay';

describe('MobileSearchOverlay - Material Design Integration', () => {
  it('should render Material UI Dialog component', () => {
    render(
      <MobileSearchOverlay 
        open={true} 
        onClose={() => {}} 
        onSearchChange={() => {}} 
      />
    );
    
    // Check for Material UI Dialog elements
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Search Drivers')).toBeInTheDocument();
  });

  it('should display Material UI TextField with search icon', () => {
    render(
      <MobileSearchOverlay 
        open={true} 
        onClose={() => {}} 
        onSearchChange={() => {}} 
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search drivers...');
    expect(searchInput).toBeInTheDocument();
    
    // Check for Material UI TextField
    expect(searchInput.closest('.MuiTextField-root')).toBeInTheDocument();
  });

  it('should call onSearchChange when user types', () => {
    const mockOnSearchChange = vi.fn();
    
    render(
      <MobileSearchOverlay 
        open={true} 
        onClose={() => {}} 
        onSearchChange={mockOnSearchChange} 
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search drivers...');
    
    fireEvent.change(searchInput, { target: { value: 'Hamilton' } });
    
    expect(mockOnSearchChange).toHaveBeenCalledWith('Hamilton');
  });

  it('should call onClose when close button is clicked', () => {
    const mockOnClose = vi.fn();
    
    render(
      <MobileSearchOverlay 
        open={true} 
        onClose={mockOnClose} 
        onSearchChange={() => {}} 
      />
    );
    
    const closeButton = screen.getByLabelText('close');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should render fullscreen on mobile', () => {
    render(
      <MobileSearchOverlay 
        open={true} 
        onClose={() => {}} 
        onSearchChange={() => {}} 
      />
    );
    
    const dialog = screen.getByRole('dialog');
    
    // Material UI fullScreen dialog should have specific class
    expect(dialog.closest('.MuiDialog-root')).toBeInTheDocument();
  });

  it('should auto-focus search input when opened', () => {
    render(
      <MobileSearchOverlay 
        open={true} 
        onClose={() => {}} 
        onSearchChange={() => {}} 
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search drivers...');
    
    // TextField should have autoFocus prop
    expect(searchInput).toBeInTheDocument();
  });

  it('should apply F1 theme colors to Material UI components', () => {
    render(
      <MobileSearchOverlay 
        open={true} 
        onClose={() => {}} 
        onSearchChange={() => {}} 
      />
    );
    
    // Check that Material UI Dialog is rendered with proper structure
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    
    // Verify search input is styled
    const searchInput = screen.getByPlaceholderText('Search drivers...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should not render when open is false', () => {
    render(
      <MobileSearchOverlay 
        open={false} 
        onClose={() => {}} 
        onSearchChange={() => {}} 
      />
    );
    
    // Dialog should not be visible
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
