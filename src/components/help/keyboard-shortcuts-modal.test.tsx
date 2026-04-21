import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { KeyboardShortcutsModal } from '@/components/help/keyboard-shortcuts-modal';

describe('KeyboardShortcutsModal', () => {
  it('does not render when closed', () => {
    render(<KeyboardShortcutsModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    render(<KeyboardShortcutsModal isOpen onClose={vi.fn()} />);

    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('Got it')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsModal isOpen onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /close keyboard shortcuts/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when footer button clicked', () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsModal isOpen onClose={onClose} />);

    fireEvent.click(screen.getByText('Got it'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when backdrop clicked', () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsModal isOpen onClose={onClose} />);

    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('lists keyboard shortcuts', () => {
    render(<KeyboardShortcutsModal isOpen onClose={vi.fn()} />);

    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    const shortcuts = screen.getAllByRole('generic');
    expect(shortcuts.length).toBeGreaterThan(0);
  });

  it('has dialog role and aria-modal', () => {
    render(<KeyboardShortcutsModal isOpen onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
});
