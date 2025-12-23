import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SeverityBadge } from './SeverityBadge';

describe('SeverityBadge', () => {
  it('renders critical severity with correct styling', () => {
    render(<SeverityBadge severity="critical" />);
    
    const badge = screen.getByText('critical');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('renders high severity correctly', () => {
    render(<SeverityBadge severity="high" />);
    
    const badge = screen.getByText('high');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-orange-100', 'text-orange-800');
  });

  it('renders medium severity correctly', () => {
    render(<SeverityBadge severity="medium" />);
    
    const badge = screen.getByText('medium');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('renders low severity correctly', () => {
    render(<SeverityBadge severity="low" />);
    
    const badge = screen.getByText('low');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('falls back to low styling for unknown severity', () => {
    render(<SeverityBadge severity="unknown" />);
    
    const badge = screen.getByText('unknown');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });
});
