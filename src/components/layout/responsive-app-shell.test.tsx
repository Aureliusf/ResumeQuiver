import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ResponsiveAppShell } from '@/components/layout/responsive-app-shell';
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

describe('ResponsiveAppShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the app layout', async () => {
    render(<ResponsiveAppShell />, { wrapper });

    await waitFor(() => {
      const headings = screen.getAllByText('Resume Builder');
      expect(headings.length).toBeGreaterThanOrEqual(1);
    });
  });
});
