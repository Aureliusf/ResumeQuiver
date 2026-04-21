import { render, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ResizeHandle } from '@/components/layout/resize-handle';

describe('ResizeHandle', () => {
  it('renders and fires mouse down handler', () => {
    const onMouseDown = vi.fn();
    const onTouchStart = vi.fn();

    const { container } = render(
      <ResizeHandle
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        isDragging={false}
      />
    );

    const handle = container.querySelector('.cursor-col-resize');
    expect(handle).toBeTruthy();
    if (handle) {
      fireEvent.mouseDown(handle, { clientX: 100 });
    }
  });

  it('applies dragging styles when isDragging is true', () => {
    const { container } = render(
      <ResizeHandle
        onMouseDown={vi.fn()}
        onTouchStart={vi.fn()}
        isDragging
      />
    );

    const inner = container.querySelector('.bg-df-accent-cyan\\/10');
    expect(inner).toBeTruthy();
  });

  it('applies left position class', () => {
    const { container } = render(
      <ResizeHandle
        onMouseDown={vi.fn()}
        onTouchStart={vi.fn()}
        isDragging={false}
        position="left"
      />
    );

    const handle = container.querySelector('.left-0');
    expect(handle).toBeTruthy();
  });

  it('applies right position class by default', () => {
    const { container } = render(
      <ResizeHandle
        onMouseDown={vi.fn()}
        onTouchStart={vi.fn()}
        isDragging={false}
      />
    );

    const handle = container.querySelector('.right-0');
    expect(handle).toBeTruthy();
  });
});
