import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

describe('LoadingSpinner', () => {
  it('renders with default medium size', () => {
    render(<LoadingSpinner />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with small size and custom text', () => {
    render(<LoadingSpinner size="sm" text="Please wait" />);

    expect(screen.getByText('Please wait')).toBeInTheDocument();
  });

  it('renders with large size and no text', () => {
    const { container } = render(<LoadingSpinner size="lg" />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(container.querySelector('span:not(.sr-only)')).toBeNull();
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="test-class" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains('test-class')).toBe(true);
  });

  it('has aria-live for accessibility', () => {
    render(<LoadingSpinner />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });
});
