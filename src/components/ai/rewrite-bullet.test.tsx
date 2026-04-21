import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RewriteBullet } from '@/components/ai/rewrite-bullet';
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

const { toastMock } = vi.hoisted(() => ({
  toastMock: {
    bulletsUpdated: vi.fn(),
    apiError: vi.fn(),
  },
}));

vi.mock('@/lib/toast', () => ({
  showSuccessToast: toastMock,
  showErrorToast: toastMock,
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ResumeProvider>{children}</ResumeProvider>
    </SettingsProvider>
  );
}

describe('RewriteBullet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the Rewrite Bullet heading', async () => {
    render(<RewriteBullet />, { wrapper });

    await waitFor(() => {
      const headings = screen.getAllByText('Rewrite Bullet');
      expect(headings.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows not configured message when no API key', async () => {
    localStorage.clear();
    render(<RewriteBullet />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/configure ai settings first/i)).toBeInTheDocument();
    });
  });

  it('renders experience/project selector', async () => {
    render(<RewriteBullet />, { wrapper });

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('disables rewrite button when no bullet selected', async () => {
    render(<RewriteBullet />, { wrapper });

    await waitFor(() => {
      const rewriteButton = screen.getByRole('button', { name: /rewrite selected bullet/i });
      expect(rewriteButton).toBeDisabled();
    });
  });
});
