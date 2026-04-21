import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { FloatingSidebar } from '@/components/layout/floating-sidebar';
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

describe('FloatingSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders Bullet Library header when expanded', async () => {
    render(<FloatingSidebar collapsed={false} onToggle={vi.fn()} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Bullet Library')).toBeInTheDocument();
    });
  });

  it('calls onToggle when toggle button clicked', async () => {
    const onToggle = vi.fn();
    render(<FloatingSidebar collapsed={false} onToggle={onToggle} />, { wrapper });

    await waitFor(() => {
      const toggleButton = screen.getByRole('button', { name: /collapse bullet library/i });
      fireEvent.click(toggleButton);
    });

    expect(onToggle).toHaveBeenCalled();
  });

  it('renders library icon when collapsed', async () => {
    render(<FloatingSidebar collapsed onToggle={vi.fn()} />, { wrapper });

    await waitFor(() => {
      const expandButton = screen.getByRole('button', { name: /expand bullet library/i });
      expect(expandButton).toBeInTheDocument();
    });
  });

  it('shows section groups when expanded', async () => {
    render(<FloatingSidebar collapsed={false} onToggle={vi.fn()} />, { wrapper });

    await waitFor(() => {
      const badges = document.querySelectorAll('[class*="uppercase"]');
      expect(badges.length).toBeGreaterThan(0);
    });
  });
});
