import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SettingsProvider, useSettings } from '@/contexts/settings-context';

function wrapper({ children }: { children: React.ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>;
}

describe('SettingsContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads default settings on mount when localStorage is empty', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.apiKey).toBe('');
    expect(result.current.baseUrl).toBe('https://api.openai.com/v1');
    expect(result.current.model).toBe('gpt-4');
    expect(result.current.theme).toBe('direct-flash');
  });

  it('loads stored settings from localStorage on mount', () => {
    localStorage.setItem(
      'resume-builder-settings',
      JSON.stringify({
        apiKey: 'sk-test',
        baseUrl: 'https://custom.api.com/v1',
        model: 'gpt-3.5-turbo',
        theme: 'purple',
      })
    );

    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.apiKey).toBe('sk-test');
    expect(result.current.baseUrl).toBe('https://custom.api.com/v1');
    expect(result.current.model).toBe('gpt-3.5-turbo');
    expect(result.current.theme).toBe('purple');
  });

  it('updates settings and persists to localStorage', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.updateSettings({ apiKey: 'sk-new' });
    });

    expect(result.current.apiKey).toBe('sk-new');

    const stored = JSON.parse(localStorage.getItem('resume-builder-settings') || '{}');
    expect(stored.apiKey).toBe('sk-new');
  });

  it('merges partial updates into existing localStorage data', () => {
    localStorage.setItem(
      'resume-builder-settings',
      JSON.stringify({ apiKey: 'sk-old', baseUrl: 'https://old.com' })
    );

    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.updateSettings({ model: 'claude-3' });
    });

    const stored = JSON.parse(localStorage.getItem('resume-builder-settings') || '{}');
    expect(stored.apiKey).toBe('sk-old');
    expect(stored.model).toBe('claude-3');
  });

  it('falls back to defaults when localStorage contains invalid JSON', () => {
    localStorage.setItem('resume-builder-settings', 'not-json');

    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.apiKey).toBe('');
    expect(result.current.baseUrl).toBe('https://api.openai.com/v1');
    expect(result.current.model).toBe('gpt-4');
  });

  it('updates theme and persists it', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.updateSettings({ theme: 'warm' });
    });

    expect(result.current.theme).toBe('warm');

    const stored = JSON.parse(localStorage.getItem('resume-builder-settings') || '{}');
    expect(stored.theme).toBe('warm');
  });

  it('does not overwrite undefined fields', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.updateSettings({ apiKey: 'sk-first' });
    });

    act(() => {
      result.current.updateSettings({ model: 'new-model' });
    });

    expect(result.current.apiKey).toBe('sk-first');
    expect(result.current.model).toBe('new-model');
  });

  it('throws when useSettings is used outside SettingsProvider', () => {
    expect(() => {
      renderHook(() => useSettings());
    }).toThrow('useSettings must be used within a SettingsProvider');
  });

  it('handles localStorage write failures gracefully', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.updateSettings({ apiKey: 'sk-should-not-throw' });
    });

    expect(result.current.apiKey).toBe('sk-should-not-throw');
    expect(consoleSpy).toHaveBeenCalled();

    spy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('handles localStorage read failures gracefully', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.apiKey).toBe('');
    expect(result.current.baseUrl).toBe('https://api.openai.com/v1');

    spy.mockRestore();
    consoleSpy.mockRestore();
  });
});
