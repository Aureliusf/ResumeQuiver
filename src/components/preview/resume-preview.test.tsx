import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ResumePreview } from '@/components/preview/resume-preview';
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

describe('ResumePreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders resume name from context', async () => {
    render(<ResumePreview />, { wrapper });

    await waitFor(() => {
      const nameEl = document.querySelector('.resume-name');
      expect(nameEl).toBeTruthy();
    });
  });

  it('renders experience section', async () => {
    render(<ResumePreview />, { wrapper });

    await waitFor(() => {
      const experienceSection = document.querySelector('.resume-section-title');
      expect(experienceSection).toBeTruthy();
    });
  });

  it('renders with dark mode class', async () => {
    render(<ResumePreview isDarkMode />, { wrapper });

    await waitFor(() => {
      const paper = document.querySelector('.resume-paper-preview-dark');
      expect(paper).toBeTruthy();
    });
  });

  it('renders without dark mode by default', async () => {
    render(<ResumePreview />, { wrapper });

    await waitFor(() => {
      const paper = document.querySelector('.resume-paper');
      expect(paper).toBeTruthy();
    });
  });
});
