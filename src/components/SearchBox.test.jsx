import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBox from './SearchBox';

describe('SearchBox', () => {
  it('renders search input with placeholder', () => {
    render(<SearchBox onSearchChange={() => {}} />);
    const input = screen.getByPlaceholderText('Search drivers...');
    expect(input).toBeInTheDocument();
  });

  it('calls onSearchChange when user types', () => {
    const mockOnSearchChange = vi.fn();
    
    render(<SearchBox onSearchChange={mockOnSearchChange} />);
    const input = screen.getByPlaceholderText('Search drivers...');
    
    fireEvent.change(input, { target: { value: 'Lewis' } });
    
    expect(mockOnSearchChange).toHaveBeenCalledWith('Lewis');
  });
});
