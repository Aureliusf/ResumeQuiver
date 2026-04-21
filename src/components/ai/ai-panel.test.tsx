import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AIPanel } from '@/components/ai/ai-panel';
import { SettingsProvider } from '@/contexts/settings-context';
import { ResumeProvider } from '@/contexts/resume-context';

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

describe('AIPanel', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders AI Assistant heading', () => {
    render(<AIPanel />, { wrapper });

    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });

  it('shows not configured status when no API key', () => {
    localStorage.clear();

    render(<AIPanel />, { wrapper });

    expect(screen.getByText('Not Configured')).toBeInTheDocument();
  });

  it('shows configure message when not configured', () => {
    localStorage.clear();

    render(<AIPanel />, { wrapper });

    const messages = screen.getAllByText(/configure ai settings first/i);
    expect(messages.length).toBeGreaterThanOrEqual(1);
  });

  it('has rewrite and generate tabs', () => {
    render(<AIPanel />, { wrapper });

    expect(screen.getByText('Rewrite')).toBeInTheDocument();
    expect(screen.getByText('Generate')).toBeInTheDocument();
  });

  it('switches tabs when clicked', () => {
    render(<AIPanel />, { wrapper });

    fireEvent.click(screen.getByText('Generate'));

    const headings = screen.getAllByText('Generate Bullets');
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });
});
