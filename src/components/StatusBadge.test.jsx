import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders status text correctly', () => {
    render(<StatusBadge status="Online" />);
    
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('renders active variant with green styling', () => {
    render(<StatusBadge status="Active" variant="active" />);
    
    const badge = screen.getByText('Active');
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('renders inactive variant with gray styling', () => {
    render(<StatusBadge status="Offline" variant="inactive" />);
    
    const badge = screen.getByText('Offline');
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('renders warning variant with yellow styling', () => {
    render(<StatusBadge status="Degraded" variant="warning" />);
    
    const badge = screen.getByText('Degraded');
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('renders error variant with red styling', () => {
    render(<StatusBadge status="Error" variant="error" />);
    
    const badge = screen.getByText('Error');
    expect(badge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('falls back to default styling for unknown variant', () => {
    render(<StatusBadge status="Unknown" variant="unknown" />);
    
    const badge = screen.getByText('Unknown');
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('uses default variant when none specified', () => {
    render(<StatusBadge status="Pending" />);
    
    const badge = screen.getByText('Pending');
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });
});
