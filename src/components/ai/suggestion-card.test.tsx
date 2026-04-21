import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SuggestionCard } from '@/components/ai/suggestion-card';

describe('SuggestionCard', () => {
  it('renders suggestion text and index', () => {
    const onUse = vi.fn();
    render(<SuggestionCard text="Improved retention by 25%" index={0} onUse={onUse} />);

    expect(screen.getByText('Improved retention by 25%')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Use This')).toBeInTheDocument();
  });

  it('calls onUse when button clicked', () => {
    const onUse = vi.fn();
    render(<SuggestionCard text="A suggestion" index={2} onUse={onUse} />);

    fireEvent.click(screen.getByRole('button', { name: /use suggestion 3/i }));
    expect(onUse).toHaveBeenCalledOnce();
  });

  it('shows applied state when selected', () => {
    const onUse = vi.fn();
    render(<SuggestionCard text="A suggestion" index={0} onUse={onUse} isSelected />);

    expect(screen.getByText('Applied')).toBeInTheDocument();
    expect(screen.queryByText('Use This')).not.toBeInTheDocument();
  });

  it('disables button when selected', () => {
    const onUse = vi.fn();
    render(<SuggestionCard text="A suggestion" index={0} onUse={onUse} isSelected />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('does not call onUse when already selected', () => {
    const onUse = vi.fn();
    render(<SuggestionCard text="A suggestion" index={0} onUse={onUse} isSelected />);

    fireEvent.click(screen.getByRole('button'));
    expect(onUse).not.toHaveBeenCalled();
  });

  it('shows index number when not selected', () => {
    render(<SuggestionCard text="test" index={4} onUse={vi.fn()} />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
