import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { PreviewPanel } from '@/components/layout/preview-panel';
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
    pdfGenerated: vi.fn(),
    pdfGeneration: vi.fn(),
  },
}));

vi.mock('@/lib/toast', () => ({
  showSuccessToast: toastMock,
  showErrorToast: toastMock,
}));

vi.mock('@/components/preview/resume-preview', () => ({
  ResumePreview: () => <div data-testid="resume-preview">Preview</div>,
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ResumeProvider>{children}</ResumeProvider>
    </SettingsProvider>
  );
}

describe('PreviewPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the preview toolbar with zoom controls', async () => {
    render(<PreviewPanel />, { wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
  });

  it('renders the resume preview component', async () => {
    render(<PreviewPanel />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('resume-preview')).toBeInTheDocument();
    });
  });

  it('shows zoom percentage', async () => {
    render(<PreviewPanel />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument();
    });
  });

  it('renders fullscreen toggle button', async () => {
    render(<PreviewPanel />, { wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /fullscreen/i })).toBeInTheDocument();
    });
  });

  it('renders export PDF button', async () => {
    render(<PreviewPanel />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Export PDF')).toBeInTheDocument();
    });
  });

  it('shows valid YAML status', async () => {
    render(<PreviewPanel />, { wrapper });

    await waitFor(() => {
      const statusEl = document.querySelector('.status-dot');
      expect(statusEl).toBeTruthy();
    });
  });
});
