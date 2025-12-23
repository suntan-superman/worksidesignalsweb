import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders children content', () => {
    render(<Card>Test Content</Card>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies default card class', () => {
    const { container } = render(<Card>Content</Card>);
    const cardDiv = container.firstChild;
    expect(cardDiv).toHaveClass('card');
    expect(cardDiv).toHaveClass('p-6');
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const cardDiv = container.firstChild;
    expect(cardDiv).toHaveClass('custom-class');
  });

  it('renders multiple children', () => {
    render(
      <Card>
        <div>Child 1</div>
        <div>Child 2</div>
      </Card>
    );
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });
});
