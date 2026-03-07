import { useCallback, useState } from 'react';
import type { DragEvent } from 'react';
import {
  getDropReorderIndex,
  type BulletLibraryItemLocator,
  type BulletLibrarySection,
  type BulletLibrarySectionKind,
  type DropPosition,
} from '@/lib/bullet-library';

interface DraggedSectionState {
  groupKind: BulletLibrarySectionKind;
  sectionId: string;
  moveId: BulletLibraryItemLocator;
}

interface DropTargetState {
  groupKind: BulletLibrarySectionKind;
  sectionId: string;
  position: DropPosition;
}

interface UseBulletLibraryDndOptions {
  onReorder: (
    sectionKind: BulletLibrarySectionKind,
    itemId: BulletLibraryItemLocator,
    targetIndex: number
  ) => void;
}

export function useBulletLibraryDnd({ onReorder }: UseBulletLibraryDndOptions) {
  const [draggedSection, setDraggedSection] = useState<DraggedSectionState | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTargetState | null>(null);

  const clearDragState = useCallback(() => {
    setDraggedSection(null);
    setDropTarget(null);
  }, []);

  const startDrag = useCallback((
    event: DragEvent<HTMLElement>,
    groupKind: BulletLibrarySectionKind,
    section: Pick<BulletLibrarySection, 'id' | 'moveId'>
  ) => {
    setDraggedSection({
      groupKind,
      sectionId: section.id,
      moveId: section.moveId,
    });
    setDropTarget(null);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', section.id);
  }, []);

  const updateDropTarget = useCallback((
    event: DragEvent<HTMLElement>,
    groupKind: BulletLibrarySectionKind,
    sectionId: string
  ) => {
    if (!draggedSection || draggedSection.groupKind !== groupKind) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    if (draggedSection.sectionId === sectionId) {
      setDropTarget(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const position: DropPosition = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';

    setDropTarget({
      groupKind,
      sectionId,
      position,
    });
  }, [draggedSection]);

  const dropOnSection = useCallback((
    event: DragEvent<HTMLElement>,
    groupKind: BulletLibrarySectionKind,
    sections: BulletLibrarySection[],
    targetSectionId: string
  ) => {
    if (!draggedSection || draggedSection.groupKind !== groupKind) {
      return;
    }

    event.preventDefault();

    const sourceIndex = sections.findIndex((section) => section.id === draggedSection.sectionId);
    const targetIndex = sections.findIndex((section) => section.id === targetSectionId);

    if (sourceIndex === -1 || targetIndex === -1) {
      clearDragState();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const position: DropPosition = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
    const nextIndex = getDropReorderIndex(sourceIndex, targetIndex, position);

    if (nextIndex !== sourceIndex) {
      onReorder(groupKind, draggedSection.moveId, nextIndex);
    }

    clearDragState();
  }, [clearDragState, draggedSection, onReorder]);

  const getDropPosition = useCallback((
    groupKind: BulletLibrarySectionKind,
    sectionId: string
  ): DropPosition | null => {
    if (!dropTarget) {
      return null;
    }

    if (dropTarget.groupKind !== groupKind || dropTarget.sectionId !== sectionId) {
      return null;
    }

    return dropTarget.position;
  }, [dropTarget]);

  return {
    draggedSectionId: draggedSection?.sectionId ?? null,
    startDrag,
    updateDropTarget,
    dropOnSection,
    getDropPosition,
    clearDragState,
  };
}
