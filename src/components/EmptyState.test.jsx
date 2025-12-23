import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders with default props', () => {
    render(<EmptyState />);
    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.getByText('There is nothing to display')).toBeInTheDocument();
    expect(screen.getByText('📭')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<EmptyState title="No alerts" />);
    expect(screen.getByText('No alerts')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<EmptyState message="Check back later for updates" />);
    expect(screen.getByText('Check back later for updates')).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    render(<EmptyState icon="🔔" />);
    expect(screen.getByText('🔔')).toBeInTheDocument();
  });

  it('renders with all custom props', () => {
    render(
      <EmptyState 
        title="No sensors" 
        message="Add a sensor to get started" 
        icon="📡" 
      />
    );
    expect(screen.getByText('No sensors')).toBeInTheDocument();
    expect(screen.getByText('Add a sensor to get started')).toBeInTheDocument();
    expect(screen.getByText('📡')).toBeInTheDocument();
  });

  it('centers content', () => {
    const { container } = render(<EmptyState />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex');
    expect(wrapper).toHaveClass('items-center');
    expect(wrapper).toHaveClass('justify-center');
  });
});
