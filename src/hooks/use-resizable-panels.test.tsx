import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useResizablePanel, useResizablePanels } from '@/hooks/use-resizable-panels';

describe('useResizablePanel', () => {
  it('hydrates width from storage and falls back on invalid stored values', () => {
    localStorage.setItem('panel-width', JSON.stringify({ width: 280 }));
    const { result, unmount } = renderHook(() =>
      useResizablePanel({ storageKey: 'panel-width', defaultWidth: 200 })
    );

    expect(result.current.width).toBe(280);

    unmount();
    localStorage.setItem('broken-panel-width', '{bad-json');

    const fallbackHook = renderHook(() =>
      useResizablePanel({ storageKey: 'broken-panel-width', defaultWidth: 200 })
    );

    expect(fallbackHook.result.current.width).toBe(200);
  });

  it('resizes with mouse events, clamps values, and persists them on mouseup', () => {
    const { result } = renderHook(() =>
      useResizablePanel({
        minWidth: 150,
        maxWidth: 300,
        defaultWidth: 200,
        storageKey: 'mouse-panel',
      })
    );

    act(() => {
      result.current.handleMouseDown({
        preventDefault: vi.fn(),
        clientX: 100,
      } as unknown as React.MouseEvent);
    });

    expect(result.current.isDragging).toBe(true);
    expect(document.body.classList.contains('resizing')).toBe(true);
    expect(document.body.style.cursor).toBe('col-resize');

    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 260 }));
    });

    expect(result.current.width).toBe(300);

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'));
    });

    expect(result.current.isDragging).toBe(false);
    expect(document.body.classList.contains('resizing')).toBe(false);
    expect(document.body.style.cursor).toBe('');
    expect(localStorage.getItem('mouse-panel')).toBe(JSON.stringify({ width: 300 }));
  });

  it('supports left-direction and touch resizing', () => {
    const { result } = renderHook(() =>
      useResizablePanel({
        minWidth: 100,
        maxWidth: 400,
        defaultWidth: 250,
        direction: 'left',
      })
    );

    act(() => {
      result.current.handleTouchStart({
        touches: [{ clientX: 200 }],
      } as unknown as React.TouchEvent);
    });

    act(() => {
      document.dispatchEvent(new TouchEvent('touchmove', {
        touches: [{ clientX: 260 }] as unknown as TouchList,
      }));
    });

    expect(result.current.width).toBe(190);

    act(() => {
      document.dispatchEvent(new TouchEvent('touchend'));
    });

    expect(result.current.isDragging).toBe(false);
  });

  it('resets width and clears persisted state', () => {
    const { result } = renderHook(() =>
      useResizablePanel({
        defaultWidth: 220,
        storageKey: 'reset-panel',
      })
    );

    localStorage.setItem('reset-panel', JSON.stringify({ width: 500 }));

    act(() => {
      result.current.reset();
    });

    expect(result.current.width).toBe(220);
    expect(localStorage.getItem('reset-panel')).toBeNull();
  });
});

describe('useResizablePanels', () => {
  it('creates coordinated sidebar and workspace panels and resets both', () => {
    const { result } = renderHook(() => useResizablePanels());

    act(() => {
      result.current.sidebar.handleMouseDown({
        preventDefault: vi.fn(),
        clientX: 100,
      } as unknown as React.MouseEvent);
    });

    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150 }));
      document.dispatchEvent(new MouseEvent('mouseup'));
    });

    act(() => {
      result.current.workspace.handleMouseDown({
        preventDefault: vi.fn(),
        clientX: 400,
      } as unknown as React.MouseEvent);
    });

    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 360 }));
      document.dispatchEvent(new MouseEvent('mouseup'));
    });

    expect(result.current.sidebar.width).not.toBe(320);
    expect(result.current.workspace.width).not.toBe(500);

    act(() => {
      result.current.resetAll();
    });

    expect(result.current.sidebar.width).toBe(320);
    expect(result.current.workspace.width).toBe(500);
    expect(localStorage.getItem('resume-builder-sidebar-width')).toBeNull();
    expect(localStorage.getItem('resume-builder-workspace-width')).toBeNull();
  });
});
