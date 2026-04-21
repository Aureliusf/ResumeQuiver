import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useBulletLibraryDnd } from '@/hooks/use-bullet-library-dnd';

function createDragEvent(clientY: number) {
  return {
    preventDefault: vi.fn(),
    clientY,
    currentTarget: {
      getBoundingClientRect: () => ({
        top: 100,
        height: 40,
      }),
    },
    dataTransfer: {
      effectAllowed: '',
      dropEffect: '',
      setData: vi.fn(),
    },
  } as unknown as React.DragEvent<HTMLElement>;
}

describe('useBulletLibraryDnd', () => {
  it('tracks drag state, computes drop targets, and reorders sections on drop', () => {
    const onReorder = vi.fn();
    const { result } = renderHook(() => useBulletLibraryDnd({ onReorder }));

    act(() => {
      result.current.startDrag(createDragEvent(0), 'experience', {
        id: 'exp-1',
        moveId: 'exp-1',
      });
    });

    expect(result.current.draggedSectionId).toBe('exp-1');

    act(() => {
      result.current.updateDropTarget(createDragEvent(105), 'experience', 'exp-2');
    });

    expect(result.current.getDropPosition('experience', 'exp-2')).toBe('before');

    act(() => {
      result.current.dropOnSection(createDragEvent(135), 'experience', [
        { id: 'exp-1', moveId: 'exp-1', kind: 'experience', title: 'A', items: [] },
        { id: 'exp-2', moveId: 'exp-2', kind: 'experience', title: 'B', items: [] },
        { id: 'exp-3', moveId: 'exp-3', kind: 'experience', title: 'C', items: [] },
      ], 'exp-2');
    });

    expect(onReorder).toHaveBeenCalledWith('experience', 'exp-1', 1);
    expect(result.current.draggedSectionId).toBeNull();
    expect(result.current.getDropPosition('experience', 'exp-2')).toBeNull();
  });

  it('ignores mismatched groups and invalid targets, and supports clearing drag state', () => {
    const onReorder = vi.fn();
    const { result } = renderHook(() => useBulletLibraryDnd({ onReorder }));

    act(() => {
      result.current.startDrag(createDragEvent(0), 'project', {
        id: 'proj-1',
        moveId: 'proj-1',
      });
    });

    act(() => {
      result.current.updateDropTarget(createDragEvent(120), 'experience', 'exp-2');
      result.current.dropOnSection(createDragEvent(120), 'experience', [], 'exp-2');
    });

    expect(result.current.getDropPosition('experience', 'exp-2')).toBeNull();
    expect(onReorder).not.toHaveBeenCalled();

    act(() => {
      result.current.clearDragState();
    });

    expect(result.current.draggedSectionId).toBeNull();
  });
});
