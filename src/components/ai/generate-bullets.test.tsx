import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GenerateBullets } from '@/components/ai/generate-bullets';
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

describe('GenerateBullets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders Generate Bullets heading', async () => {
    render(<GenerateBullets />, { wrapper });

    await waitFor(() => {
      const headings = screen.getAllByText('Generate Bullets');
      expect(headings.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows not configured message when no API key', async () => {
    localStorage.clear();
    render(<GenerateBullets />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/configure ai settings first/i)).toBeInTheDocument();
    });
  });

  it('renders description textarea', async () => {
    render(<GenerateBullets />, { wrapper });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/describe what you did/i)).toBeInTheDocument();
    });
  });

  it('renders target selector', async () => {
    render(<GenerateBullets />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/add to experience or project/i)).toBeInTheDocument();
    });
  });

  it('disables generate button when no description', async () => {
    render(<GenerateBullets />, { wrapper });

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /generate bullets from description/i });
      expect(button).toBeDisabled();
    });
  });

  it('shows character count', async () => {
    render(<GenerateBullets />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/characters/i)).toBeInTheDocument();
    });
  });
});
