import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FloatingResetButton } from '@/components/layout/floating-reset-button';

describe('FloatingResetButton', () => {
  it('renders reset button', () => {
    render(<FloatingResetButton onReset={vi.fn()} />);

    expect(screen.getByTitle('Reset layout to default')).toBeInTheDocument();
  });

  it('calls onReset when clicked', () => {
    const onReset = vi.fn();
    render(<FloatingResetButton onReset={onReset} />);

    fireEvent.click(screen.getByTitle('Reset layout to default'));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it('has a rotate icon for reset', () => {
    render(<FloatingResetButton onReset={vi.fn()} />);

    const button = screen.getByTitle('Reset layout to default');
    expect(button).toBeInTheDocument();
  });
});
