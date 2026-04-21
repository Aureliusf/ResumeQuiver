import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { EditorPanel } from '@/components/editor/editor-panel';
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
    yamlParse: vi.fn(),
  },
}));

vi.mock('@/lib/toast', () => ({
  showSuccessToast: toastMock,
  showErrorToast: toastMock,
}));

vi.mock('@/components/editor/yaml-editor', () => ({
  YamlEditor: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea
      data-testid="yaml-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock('@/components/editor/ai-config-bar', () => ({
  AIConfigBar: () => <div data-testid="ai-config-bar">AI Config</div>,
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ResumeProvider>{children}</ResumeProvider>
    </SettingsProvider>
  );
}

describe('EditorPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the YAML editor heading', () => {
    render(<EditorPanel />, { wrapper });

    expect(screen.getByText('YAML Editor')).toBeInTheDocument();
  });

  it('renders the yaml editor component', () => {
    render(<EditorPanel />, { wrapper });

    expect(screen.getByTestId('yaml-editor')).toBeInTheDocument();
  });

  it('shows save button', () => {
    render(<EditorPanel />, { wrapper });

    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('shows validation status when invalid', async () => {
    render(<EditorPanel />, { wrapper });

    const editor = screen.getByTestId('yaml-editor');
    fireEvent.change(editor, { target: { value: 'invalid: yaml: [' } });

    await waitFor(() => {
      expect(screen.getByText('Invalid')).toBeInTheDocument();
    });
  });

  it('shows AI Configuration toggle', () => {
    render(<EditorPanel />, { wrapper });

    expect(screen.getByText('AI Configuration')).toBeInTheDocument();
  });

  it('toggles AI config panel when clicked', async () => {
    render(<EditorPanel />, { wrapper });

    fireEvent.click(screen.getByText('AI Configuration'));

    await waitFor(() => {
      expect(screen.getByTestId('ai-config-bar')).toBeInTheDocument();
    });
  });
});
