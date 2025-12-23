import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  it('renders with default title', () => {
    render(<ErrorState message="Something went wrong" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<ErrorState title="Network Error" message="Failed to fetch data" />);
    expect(screen.getByText('Network Error')).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(<ErrorState message="Connection timeout" />);
    expect(screen.getByText('Connection timeout')).toBeInTheDocument();
  });

  it('renders error icon', () => {
    render(<ErrorState message="Error occurred" />);
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('renders retry button when onRetry provided', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={onRetry} />);
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('does not render retry button when onRetry not provided', () => {
    render(<ErrorState message="Error" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onRetry when retry button clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={onRetry} />);
    
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('centers content', () => {
    const { container } = render(<ErrorState message="Error" />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex');
    expect(wrapper).toHaveClass('items-center');
    expect(wrapper).toHaveClass('justify-center');
  });
});
