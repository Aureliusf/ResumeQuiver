import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WorkspacePanel } from '@/components/layout/workspace-panel';

vi.mock('@/components/editor/editor-panel', () => ({
  EditorPanel: () => <div data-testid="editor-panel">Editor</div>,
}));

describe('WorkspacePanel', () => {
  it('renders editor panel for editor tab', () => {
    render(<WorkspacePanel activeTab="editor" />);

    expect(screen.getByTestId('editor-panel')).toBeInTheDocument();
  });

  it('renders loading state for ai tab', () => {
    render(<WorkspacePanel activeTab="ai" />);

    expect(screen.getByText('Loading AI tools...')).toBeInTheDocument();
  });

  it('renders loading state for tailoring tab', () => {
    render(<WorkspacePanel activeTab="tailoring" />);

    expect(screen.getByText('Loading tailoring tools...')).toBeInTheDocument();
  });

  it('renders loading state for resumes tab', () => {
    render(<WorkspacePanel activeTab="resumes" />);

    expect(screen.getByText('Loading resumes...')).toBeInTheDocument();
  });
});
