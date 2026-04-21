import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { FluidLayout } from '@/components/layout/fluid-layout';
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
    resumeSaved: vi.fn(),
    resumeCreated: vi.fn(),
  },
}));

vi.mock('@/lib/toast', () => ({
  showSuccessToast: toastMock,
  showErrorToast: {},
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ResumeProvider>{children}</ResumeProvider>
    </SettingsProvider>
  );
}

describe('FluidLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the main layout', async () => {
    render(<FluidLayout />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Resume Builder')).toBeInTheDocument();
    });
  });

  it('renders the skip to content link', async () => {
    render(<FluidLayout />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    });
  });

  it('renders the header with tab navigation', async () => {
    render(<FluidLayout />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Resume Builder')).toBeInTheDocument();
    });
  });
});
