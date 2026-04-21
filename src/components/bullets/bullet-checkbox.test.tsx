import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BulletCheckbox } from '@/components/bullets/bullet-checkbox';

describe('BulletCheckbox', () => {
  const defaultBullet = { id: 'b-1', text: 'Built scalable microservices' };

  it('renders bullet text', () => {
    render(<BulletCheckbox bullet={defaultBullet} isSelected={false} onToggle={vi.fn()} />);

    expect(screen.getByText('Built scalable microservices')).toBeInTheDocument();
  });

  it('shows check icon when selected', () => {
    const { container } = render(<BulletCheckbox bullet={defaultBullet} isSelected onToggle={vi.fn()} />);

    const checkIcon = container.querySelector('[stroke-width="3"]');
    expect(checkIcon).toBeTruthy();
  });

  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn();
    render(<BulletCheckbox bullet={defaultBullet} isSelected={false} onToggle={onToggle} />);

    fireEvent.click(screen.getByText('Built scalable microservices'));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('renders tags when provided', () => {
    const bulletWithTags = { id: 'b-2', text: 'Led migration', tags: ['TypeScript', 'React'] };
    render(<BulletCheckbox bullet={bulletWithTags} isSelected={false} onToggle={vi.fn()} />);

    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('renders without tags', () => {
    render(<BulletCheckbox bullet={defaultBullet} isSelected={false} onToggle={vi.fn()} />);

    expect(screen.queryByText('TypeScript')).not.toBeInTheDocument();
  });

  it('applies different tone styles', () => {
    const { container: c1 } = render(
      <BulletCheckbox bullet={defaultBullet} isSelected onToggle={vi.fn()} tone="experience" />
    );
    const { container: c2 } = render(
      <BulletCheckbox bullet={defaultBullet} isSelected onToggle={vi.fn()} tone="education" />
    );

    expect(c1.firstChild).not.toEqual(c2.firstChild);
  });
});
