import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getShortcutHint,
  keyboardShortcuts,
  useKeyboardShortcuts,
} from '@/hooks/use-keyboard-shortcuts';

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('registers shortcuts for save, PDF, new resume, open resumes, and tab switching', () => {
    const onSave = vi.fn();
    const onGeneratePDF = vi.fn();
    const onNewResume = vi.fn();
    const onOpenResumes = vi.fn();
    const onSwitchTab = vi.fn();

    renderHook(() => useKeyboardShortcuts({
      onSave,
      onGeneratePDF,
      onNewResume,
      onOpenResumes,
      onSwitchTab,
    }));

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', metaKey: true }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', ctrlKey: true }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'o', ctrlKey: true }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '2', ctrlKey: true }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onGeneratePDF).toHaveBeenCalledTimes(1);
    expect(onNewResume).toHaveBeenCalledTimes(1);
    expect(onOpenResumes).toHaveBeenCalledTimes(1);
    expect(onSwitchTab).toHaveBeenCalledWith('ai');
  });

  it('ignores regular typing in inputs but still allows save and print shortcuts there', () => {
    const onSave = vi.fn();
    const onGeneratePDF = vi.fn();

    renderHook(() => useKeyboardShortcuts({ onSave, onGeneratePDF }));

    const input = document.createElement('input');
    const typingEvent = new KeyboardEvent('keydown', { key: 'a' });
    Object.defineProperty(typingEvent, 'target', { value: input });
    window.dispatchEvent(typingEvent);

    const saveEvent = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
    Object.defineProperty(saveEvent, 'target', { value: input });
    window.dispatchEvent(saveEvent);

    const printEvent = new KeyboardEvent('keydown', { key: 'p', ctrlKey: true });
    Object.defineProperty(printEvent, 'target', { value: input });
    window.dispatchEvent(printEvent);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onGeneratePDF).toHaveBeenCalledTimes(1);
  });

  it('uses the latest handler references after rerendering', () => {
    const firstSave = vi.fn();
    const secondSave = vi.fn();

    const { rerender } = renderHook(
      ({ onSave }) => useKeyboardShortcuts({ onSave }),
      { initialProps: { onSave: firstSave } }
    );

    rerender({ onSave: secondSave });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }));

    expect(firstSave).not.toHaveBeenCalled();
    expect(secondSave).toHaveBeenCalledTimes(1);
  });

  it('exposes shortcut metadata and renders platform-specific hints', () => {
    expect(keyboardShortcuts).toHaveLength(8);

    const platformGetter = vi.spyOn(window.navigator, 'platform', 'get');
    platformGetter.mockReturnValue('MacIntel');
    expect(getShortcutHint('Ctrl/Cmd + S')).toBe('⌘ + S');

    platformGetter.mockReturnValue('Linux');
    expect(getShortcutHint('Ctrl/Cmd + S')).toBe('Ctrl + S');
  });
});
