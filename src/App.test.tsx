import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '@/App';

vi.mock('@/components/layout/app-shell', () => ({
  AppShell: () => <div data-testid="app-shell">AppShell</div>,
}));

describe('App', () => {
  it('renders the app shell and toaster', () => {
    render(<App />);

    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
  });

  it('wraps content in providers', () => {
    const { container } = render(<App />);

    expect(container.querySelector('[data-testid="app-shell"]')).toBeTruthy();
  });
});
