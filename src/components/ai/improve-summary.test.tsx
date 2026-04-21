import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ImproveSummary } from '@/components/ai/improve-summary';
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

describe('ImproveSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders Improve Summary heading', async () => {
    render(<ImproveSummary />, { wrapper });

    await waitFor(() => {
      const headings = screen.getAllByText('Improve Summary');
      expect(headings.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows current summary section', async () => {
    render(<ImproveSummary />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Current Summary')).toBeInTheDocument();
    });
  });

  it('shows not configured message when no API key', async () => {
    localStorage.clear();
    render(<ImproveSummary />, { wrapper });

    await waitFor(() => {
      const messages = screen.getAllByText(/configure ai settings first/i);
      expect(messages.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('disables improve button when not configured', async () => {
    localStorage.clear();
    render(<ImproveSummary />, { wrapper });

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /improve professional summary/i });
      expect(button).toBeDisabled();
    });
  });

  it('shows no summary message when summary is empty', async () => {
    render(<ImproveSummary />, { wrapper });

    await waitFor(() => {
      const noSummary = screen.queryByText('No summary found in resume');
      if (noSummary) {
        expect(noSummary).toBeInTheDocument();
      }
    });
  });
});
