import { useEffect, useCallback, useRef } from 'react';

type TabId = 'editor' | 'ai' | 'tailoring' | 'resumes';

interface KeyboardShortcutHandlers {
  onSave?: () => void;
  onGeneratePDF?: () => void;
  onNewResume?: () => void;
  onOpenResumes?: () => void;
  onSwitchTab?: (tab: TabId) => void;
}

// Keyboard shortcut metadata type
export interface KeyboardShortcutMeta {
  key: string;
  description: string;
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  const handlersRef = useRef(handlers);
  
  // Keep handlers ref up to date
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if user is typing in an input, textarea, or contentEditable element
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Allow Ctrl+S and Ctrl+P even in inputs (common expectation)
      if (!(event.key === 's' || event.key === 'p') || !(event.ctrlKey || event.metaKey)) {
        return;
      }
    }

    const isCtrlOrCmd = event.ctrlKey || event.metaKey;

    // Ctrl/Cmd + S: Save resume
    if (isCtrlOrCmd && event.key === 's') {
      event.preventDefault();
      handlersRef.current.onSave?.();
      return;
    }

    // Ctrl/Cmd + P: Generate PDF
    if (isCtrlOrCmd && event.key === 'p') {
      event.preventDefault();
      handlersRef.current.onGeneratePDF?.();
      return;
    }

    // Ctrl/Cmd + N: New resume
    if (isCtrlOrCmd && event.key === 'n') {
      event.preventDefault();
      handlersRef.current.onNewResume?.();
      return;
    }

    // Ctrl/Cmd + O: Open resumes list
    if (isCtrlOrCmd && event.key === 'o') {
      event.preventDefault();
      handlersRef.current.onOpenResumes?.();
      return;
    }

    // Ctrl/Cmd + 1-4: Switch tabs
    if (isCtrlOrCmd && ['1', '2', '3', '4'].includes(event.key)) {
      event.preventDefault();
      const tabIndex = parseInt(event.key, 10) - 1;
      const tabs: TabId[] = ['editor', 'ai', 'tailoring', 'resumes'];
      const tab = tabs[tabIndex];
      if (tab) {
        handlersRef.current.onSwitchTab?.(tab);
      }
      return;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

export const keyboardShortcuts = [
  { key: 'Ctrl/Cmd + S', description: 'Save resume' },
  { key: 'Ctrl/Cmd + P', description: 'Generate PDF' },
  { key: 'Ctrl/Cmd + N', description: 'New resume' },
  { key: 'Ctrl/Cmd + O', description: 'Open resumes list' },
  { key: 'Ctrl/Cmd + 1', description: 'Switch to Editor tab' },
  { key: 'Ctrl/Cmd + 2', description: 'Switch to AI Copywriting tab' },
  { key: 'Ctrl/Cmd + 3', description: 'Switch to Tailoring tab' },
  { key: 'Ctrl/Cmd + 4', description: 'Switch to My Resumes tab' },
];

export function getShortcutHint(shortcut: string): string {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  return shortcut.replace('Ctrl/Cmd', isMac ? '⌘' : 'Ctrl');
}
