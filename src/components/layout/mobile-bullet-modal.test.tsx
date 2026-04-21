import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MobileBulletModal } from '@/components/layout/mobile-bullet-modal';

vi.mock('@/components/bullets/bullet-manager', () => ({
  BulletManager: () => <div data-testid="bullet-manager">BulletManager</div>,
}));

describe('MobileBulletModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not render when closed', () => {
    render(<MobileBulletModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    render(<MobileBulletModal isOpen onClose={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Bullet Library')).toBeInTheDocument();
    expect(screen.getByTestId('bullet-manager')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<MobileBulletModal isOpen onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /close bullet library/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when backdrop clicked', () => {
    const onClose = vi.fn();
    render(<MobileBulletModal isOpen onClose={onClose} />);

    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
