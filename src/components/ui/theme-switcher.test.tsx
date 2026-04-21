import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { SettingsProvider } from '@/contexts/settings-context';

function wrapper({ children }: { children: React.ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>;
}

describe('ThemeSwitcher', () => {
  it('renders the palette button', () => {
    render(<ThemeSwitcher />, { wrapper });

    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });

  it('opens theme picker when clicked', () => {
    render(<ThemeSwitcher />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /toggle theme/i }));

    expect(screen.getByText('Choose Theme')).toBeInTheDocument();
  });

  it('shows all available themes', () => {
    render(<ThemeSwitcher />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /toggle theme/i }));

    expect(screen.getByText('Direct Flash')).toBeInTheDocument();
    expect(screen.getByText('Purple Flash')).toBeInTheDocument();
  });

  it('marks the current theme as active', () => {
    render(<ThemeSwitcher />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /toggle theme/i }));

    const activeBadges = screen.getAllByText('Active');
    expect(activeBadges.length).toBeGreaterThanOrEqual(1);
  });

  it('closes when close button clicked', () => {
    render(<ThemeSwitcher />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /toggle theme/i }));
    fireEvent.click(screen.getByRole('button', { name: /close theme switcher/i }));

    expect(screen.queryByText('Choose Theme')).not.toBeInTheDocument();
  });

  it('closes when backdrop clicked', () => {
    render(<ThemeSwitcher />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /toggle theme/i }));

    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);

    expect(screen.queryByText('Choose Theme')).not.toBeInTheDocument();
  });
});
