import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TailoringPanel } from '@/components/tailoring/tailoring-panel';
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

const { tailoringHookMock } = vi.hoisted(() => ({
  tailoringHookMock: {
    isAnalyzing: false,
    results: [],
    error: null,
    analyzeJobDescription: vi.fn(),
    selectBestBullets: vi.fn(),
  },
}));

vi.mock('@/hooks/use-tailoring', () => ({
  useTailoring: () => tailoringHookMock,
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ResumeProvider>{children}</ResumeProvider>
    </SettingsProvider>
  );
}

describe('TailoringPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    tailoringHookMock.isAnalyzing = false;
    tailoringHookMock.results = [];
    tailoringHookMock.error = null;
  });

  it('renders Job Tailoring heading', () => {
    render(<TailoringPanel />, { wrapper });

    expect(screen.getByText('Job Tailoring')).toBeInTheDocument();
  });

  it('renders job description input', () => {
    render(<TailoringPanel />, { wrapper });

    expect(screen.getByPlaceholderText(/paste the job description/i)).toBeInTheDocument();
  });

  it('shows empty state when no results', () => {
    render(<TailoringPanel />, { wrapper });

    expect(screen.getByText(/paste a job description and click analyze/i)).toBeInTheDocument();
  });

  it('calls analyzeJobDescription when analyze is triggered', async () => {
    tailoringHookMock.analyzeJobDescription.mockResolvedValueOnce(undefined);

    render(<TailoringPanel />, { wrapper });

    const textarea = screen.getByPlaceholderText(/paste the job description/i);
    fireEvent.change(textarea, { target: { value: 'A'.repeat(150) } });

    const analyzeButton = screen.getByText('Analyze');
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(tailoringHookMock.analyzeJobDescription).toHaveBeenCalled();
    });
  });
});
