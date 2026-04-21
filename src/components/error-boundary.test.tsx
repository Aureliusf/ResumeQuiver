import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from '@/components/error-boundary';

function ThrowError({ error }: { error: Error }): React.ReactElement {
  throw error;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <p>Normal content</p>
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('catches errors and displays error UI', () => {
    const error = new Error('Test error message');

    render(
      <ErrorBoundary>
        <ThrowError error={error} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('has a reset button that clears localStorage and reloads', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError error={new Error('boom')} />
      </ErrorBoundary>
    );

    const resetButton = screen.getByRole('button', { name: /reset application/i });
    fireEvent.click(resetButton);

    expect(reloadMock).toHaveBeenCalled();
  });

  it('shows a report issue link', () => {
    render(
      <ErrorBoundary>
        <ThrowError error={new Error('fail')} />
      </ErrorBoundary>
    );

    const link = screen.getByRole('link', { name: /report issue/i });
    expect(link).toHaveAttribute('target', '_blank');
  });
});
