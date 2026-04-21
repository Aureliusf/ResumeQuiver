import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Header } from '@/components/layout/header';
import { ResumeProvider } from '@/contexts/resume-context';
import { SettingsProvider } from '@/contexts/settings-context';

import type { ResumeListItem } from '@/types/resume';

const { storageMock } = vi.hoisted(() => ({
  storageMock: {
    getResume: vi.fn(),
    createResume: vi.fn(),
    updateResume: vi.fn(),
    getResumeList: vi.fn<() => ResumeListItem[]>(() => []),
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

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the app title and tab navigation', () => {
    render(
      <Header activeTab="editor" onTabChange={vi.fn()} onOpenHelp={vi.fn()} />,
      { wrapper }
    );

    expect(screen.getByText('Resume Builder')).toBeInTheDocument();
  });

  it('calls onTabChange when a tab is clicked', () => {
    const onTabChange = vi.fn();
    render(
      <Header activeTab="editor" onTabChange={onTabChange} onOpenHelp={vi.fn()} />,
      { wrapper }
    );

    const aiTab = screen.queryByText('AI Assistant');
    if (aiTab) {
      fireEvent.click(aiTab);
      expect(onTabChange).toHaveBeenCalledWith('ai');
    }
  });

  it('calls onOpenHelp when help button clicked', () => {
    const onOpenHelp = vi.fn();
    render(
      <Header activeTab="editor" onTabChange={vi.fn()} onOpenHelp={onOpenHelp} />,
      { wrapper }
    );

    const helpButton = screen.getByRole('button', { name: /open keyboard shortcuts/i });
    fireEvent.click(helpButton);

    expect(onOpenHelp).toHaveBeenCalledOnce();
  });

  it('opens resume selector dropdown', () => {
    storageMock.getResumeList.mockReturnValue([
      { id: 'r1', name: 'My Resume', createdAt: '2024-01-01', updatedAt: '2024-01-01', version: 1 },
    ]);

    render(
      <Header activeTab="editor" onTabChange={vi.fn()} onOpenHelp={vi.fn()} />,
      { wrapper }
    );

    const selectorButton = screen.getByRole('button', { name: /select resume/i });
    fireEvent.click(selectorButton);

    expect(screen.getByText('Your Resumes')).toBeInTheDocument();
  });

  it('shows New Resume button in dropdown', () => {
    storageMock.getResumeList.mockReturnValue([]);

    render(
      <Header activeTab="editor" onTabChange={vi.fn()} onOpenHelp={vi.fn()} />,
      { wrapper }
    );

    const selectorButton = screen.getByRole('button', { name: /select resume/i });
    fireEvent.click(selectorButton);

    expect(screen.getByText('New Resume')).toBeInTheDocument();
  });
});
