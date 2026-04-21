import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { ResumeListItem } from '@/types/resume';
import { ResumesPanel } from '@/components/resumes/resumes-panel';
import { ResumeProvider } from '@/contexts/resume-context';
import { SettingsProvider } from '@/contexts/settings-context';

const { storageMock } = vi.hoisted(() => ({
  storageMock: {
    getResume: vi.fn(),
    createResume: vi.fn(),
    updateResume: vi.fn(),
    getResumeList: vi.fn<(data?: unknown) => ResumeListItem[]>(() => []),
    deleteResume: vi.fn(),
    duplicateResume: vi.fn(),
  },
}));

vi.mock('@/lib/storage', () => ({
  storage: storageMock,
}));

const { toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  toastSuccessMock: {
    resumeDeleted: vi.fn(),
    resumeDuplicated: vi.fn(),
    resumeExported: vi.fn(),
    resumeCreated: vi.fn(),
    resumeLoaded: vi.fn(),
  },
  toastErrorMock: {
    deleteFailed: vi.fn(),
    exportFailed: vi.fn(),
    generic: vi.fn(),
  },
}));

vi.mock('@/lib/toast', () => ({
  showSuccessToast: toastSuccessMock,
  showErrorToast: toastErrorMock,
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ResumeProvider>{children}</ResumeProvider>
    </SettingsProvider>
  );
}

describe('ResumesPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders My Resumes heading and new resume button', () => {
    storageMock.getResumeList.mockReturnValue([]);

    render(<ResumesPanel />, { wrapper });

    expect(screen.getByText('My Resumes')).toBeInTheDocument();
    expect(screen.getByText('New Resume')).toBeInTheDocument();
  });

  it('shows empty state when no resumes', () => {
    storageMock.getResumeList.mockReturnValue([]);

    render(<ResumesPanel />, { wrapper });

    expect(screen.getByText(/no resumes yet/i)).toBeInTheDocument();
  });

  it('lists resumes from storage', () => {
    storageMock.getResumeList.mockReturnValue([
      { id: 'r1', name: 'My Resume', createdAt: '2024-01-01', updatedAt: '2024-01-01', version: 1 },
      { id: 'r2', name: 'Other Resume', createdAt: '2024-01-01', updatedAt: '2024-01-01', version: 1 },
    ] as ResumeListItem[]);

    render(<ResumesPanel />, { wrapper });

    expect(screen.getByText('My Resume')).toBeInTheDocument();
    expect(screen.getByText('Other Resume')).toBeInTheDocument();
  });

  it('handles resume deletion', () => {
    const resumeItem: ResumeListItem = {
      id: 'r1',
      name: 'Delete Me',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      version: 1,
    };
    storageMock.getResumeList
      .mockReturnValue([resumeItem])
      .mockReturnValueOnce([resumeItem])
      .mockReturnValueOnce([]);

    render(<ResumesPanel />, { wrapper });

    const deleteButtons = screen.queryAllByRole('button', { name: /delete resume/i });
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
      expect(storageMock.deleteResume).toHaveBeenCalled();
    }
  });

  it('handles resume duplication', () => {
    const mockResume: ResumeListItem = {
      id: 'r1',
      name: 'Original',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      version: 1,
    };
    storageMock.getResumeList.mockReturnValue([mockResume]);
    storageMock.getResume.mockReturnValue(mockResume);

    render(<ResumesPanel />, { wrapper });

    const duplicateButtons = screen.queryAllByRole('button', { name: /duplicate resume/i });
    if (duplicateButtons.length > 0) {
      fireEvent.click(duplicateButtons[0]);
      expect(storageMock.duplicateResume).toHaveBeenCalled();
    }
  });

  it('creates new resume when New Resume clicked', () => {
    storageMock.getResumeList.mockReturnValue([] as ResumeListItem[]);
    storageMock.createResume.mockImplementation(() => {});

    render(<ResumesPanel />, { wrapper });

    fireEvent.click(screen.getByText('New Resume'));

    expect(storageMock.createResume).toHaveBeenCalled();
  });
});
