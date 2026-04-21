import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { MobileDesktopAlert } from '@/components/layout/mobile-desktop-alert';

describe('MobileDesktopAlert', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows alert when not previously dismissed', () => {
    render(<MobileDesktopAlert />);

    expect(screen.getByText('Desktop recommended')).toBeInTheDocument();
  });

  it('does not show alert when previously dismissed', () => {
    localStorage.setItem('resume-builder-mobile-desktop-alert-dismissed', 'true');

    render(<MobileDesktopAlert />);

    expect(screen.queryByText('Desktop recommended')).not.toBeInTheDocument();
  });

  it('dismisses alert when button clicked and saves to localStorage', () => {
    render(<MobileDesktopAlert />);

    fireEvent.click(screen.getByRole('button', { name: /continue on mobile/i }));

    expect(screen.queryByText('Desktop recommended')).not.toBeInTheDocument();
    expect(localStorage.getItem('resume-builder-mobile-desktop-alert-dismissed')).toBe('true');
  });

  it('has dialog role and aria-modal', () => {
    render(<MobileDesktopAlert />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
});
