import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<PageHeader title="Sensors" subtitle="Monitor your equipment" />);
    expect(screen.getByText('Monitor your equipment')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    const { container } = render(<PageHeader title="Alerts" />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(0);
  });

  it('renders children in action area', () => {
    render(
      <PageHeader title="Settings">
        <button>Save</button>
      </PageHeader>
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <PageHeader title="Alerts">
        <button>Export</button>
        <button>Filter</button>
      </PageHeader>
    );
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filter' })).toBeInTheDocument();
  });

  it('applies correct heading level', () => {
    render(<PageHeader title="Reports" />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Reports');
  });

  it('uses page-header class', () => {
    const { container } = render(<PageHeader title="Test" />);
    expect(container.firstChild).toHaveClass('page-header');
  });
});
