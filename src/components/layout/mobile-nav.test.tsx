import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MobileNav } from '@/components/layout/mobile-nav';

describe('MobileNav', () => {
  it('renders the menu toggle button', () => {
    render(<MobileNav activeTab="editor" onTabChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: /open navigation/i })).toBeInTheDocument();
  });

  it('opens the menu when toggle clicked', () => {
    render(<MobileNav activeTab="editor" onTabChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /open navigation/i }));

    expect(screen.getByText('AI Copywriting')).toBeInTheDocument();
    expect(screen.getByText('Tailoring')).toBeInTheDocument();
  });

  it('calls onTabChange and closes menu when tab clicked', () => {
    const onTabChange = vi.fn();
    render(<MobileNav activeTab="editor" onTabChange={onTabChange} />);

    fireEvent.click(screen.getByRole('button', { name: /open navigation/i }));
    fireEvent.click(screen.getByText('AI Copywriting'));

    expect(onTabChange).toHaveBeenCalledWith('ai');
  });

  it('closes menu when toggle clicked again', () => {
    render(<MobileNav activeTab="editor" onTabChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /open navigation/i }));
    fireEvent.click(screen.getByRole('button', { name: /close navigation/i }));

    expect(screen.queryByText('AI Copywriting')).not.toBeInTheDocument();
  });

  it('highlights the active tab', () => {
    render(<MobileNav activeTab="editor" onTabChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /open navigation/i }));

    const editorButton = screen.getByText('Editor').closest('button');
    expect(editorButton).toHaveAttribute('aria-current', 'page');
  });
});
