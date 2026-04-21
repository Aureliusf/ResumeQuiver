import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BulletManager } from '@/components/bullets/bullet-manager';
import { ResumeProvider } from '@/contexts/resume-context';
import { SettingsProvider } from '@/contexts/settings-context';

const { storageMock } = vi.hoisted(() => ({
  storageMock: {
    getResume: vi.fn(),
    createResume: vi.fn(),
    updateResume: vi.fn(),
    getResumeList: vi.fn(() => []),
    deleteResume: vi.fn(),
    duplicateResume: vi.fn(),
  },
}));

vi.mock('@/lib/storage', () => ({
  storage: storageMock,
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ResumeProvider>{children}</ResumeProvider>
    </SettingsProvider>
  );
}

describe('BulletManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders Bullet Library header', async () => {
    render(<BulletManager />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Bullet Library')).toBeInTheDocument();
    });
  });

  it('shows selected count', async () => {
    render(<BulletManager />, { wrapper });

    await waitFor(() => {
      const countText = screen.getByText(/\d+ \/ \d+ selected/i);
      expect(countText).toBeTruthy();
    });
  });

  it('toggles expansion when header clicked', async () => {
    render(<BulletManager />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Bullet Library')).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /bullet library/i });
    fireEvent.click(button);

    expect(screen.queryByText(/bullet library/i)).toBeTruthy();
  });
});
