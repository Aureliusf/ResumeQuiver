import { useCallback, useEffect, useRef, useState } from 'react';

type ResizeDirection = 'left' | 'right';

interface ResizablePanelOptions {
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  storageKey?: string;
  direction?: ResizeDirection;
}

interface ResizablePanelState {
  width: number;
  isDragging: boolean;
}

export function useResizablePanel(options: ResizablePanelOptions = {}) {
  const {
    minWidth = 200,
    maxWidth = 800,
    defaultWidth = 320,
    storageKey,
    direction = 'right',
  } = options;

  const [state, setState] = useState<ResizablePanelState>(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return { width: parsed.width ?? defaultWidth, isDragging: false };
        } catch {
          // Invalid saved value, use default
        }
      }
    }
    return { width: defaultWidth, isDragging: false };
  });

  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    startXRef.current = e.clientX;
    startWidthRef.current = state.width;
    setState(prev => ({ ...prev, isDragging: true }));
    
    // Add dragging class to body for cursor
    document.body.classList.add('resizing');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [state.width]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startWidthRef.current = state.width;
    setState(prev => ({ ...prev, isDragging: true }));
  }, [state.width]);

  useEffect(() => {
    if (!state.isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current;
      // For left-positioned handles, invert the delta
      const adjustedDelta = direction === 'left' ? -delta : delta;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + adjustedDelta));
      setState(prev => ({ ...prev, width: newWidth }));
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const delta = touch.clientX - startXRef.current;
      // For left-positioned handles, invert the delta
      const adjustedDelta = direction === 'left' ? -delta : delta;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + adjustedDelta));
      setState(prev => ({ ...prev, width: newWidth }));
    };

    const handleMouseUp = () => {
      setState(prev => ({ ...prev, isDragging: false }));
      document.body.classList.remove('resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      // Save to localStorage
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify({ width: state.width }));
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [state.isDragging, state.width, minWidth, maxWidth, storageKey, direction]);

  const reset = useCallback(() => {
    setState({ width: defaultWidth, isDragging: false });
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  }, [defaultWidth, storageKey]);

  return {
    width: state.width,
    isDragging: state.isDragging,
    handleMouseDown,
    handleTouchStart,
    reset,
  };
}

export function useResizablePanels() {
  const sidebar = useResizablePanel({
    minWidth: 56,
    maxWidth: 400,
    defaultWidth: 320,
    storageKey: 'resume-builder-sidebar-width',
    direction: 'right', // Sidebar handle is on the right
  });

  const workspace = useResizablePanel({
    minWidth: 350,
    maxWidth: 700,
    defaultWidth: 500,
    storageKey: 'resume-builder-workspace-width',
    direction: 'left', // Workspace handle is on the left
  });

  const resetAll = useCallback(() => {
    sidebar.reset();
    workspace.reset();
  }, [sidebar, workspace]);

  return {
    sidebar,
    workspace,
    resetAll,
  };
}
