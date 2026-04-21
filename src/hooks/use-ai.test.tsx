import { renderHook, act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAI } from '@/hooks/use-ai';

const { streamCompletionMock, getErrorMessageMock } = vi.hoisted(() => ({
  streamCompletionMock: vi.fn(),
  getErrorMessageMock: vi.fn((error: { message: string }) => `formatted:${error.message}`),
}));

vi.mock('@/lib/ai-client', async () => {
  const actual = await vi.importActual<typeof import('@/lib/ai-client')>('@/lib/ai-client');
  return {
    ...actual,
    streamCompletion: streamCompletionMock,
    getErrorMessage: getErrorMessageMock,
  };
});

describe('useAI', () => {
  const config = {
    apiKey: 'key',
    baseUrl: 'https://api.example.com',
    model: 'gpt-test',
  };

  beforeEach(() => {
    streamCompletionMock.mockReset();
    getErrorMessageMock.mockClear();
  });

  it('surfaces a configuration error before making requests', async () => {
    const { result } = renderHook(() => useAI({ apiKey: '', baseUrl: '', model: '' }));

    await act(async () => {
      await result.current.rewriteBullet({
        bulletText: 'Built a thing',
        role: 'Engineer',
        company: 'Acme',
      });
    });

    expect(result.current.error).toBe('AI not configured. Please check your settings.');
    expect(result.current.isLoading).toBe(false);
    expect(streamCompletionMock).not.toHaveBeenCalled();
  });

  it('parses and limits streamed suggestions for bullet rewriting', async () => {
    streamCompletionMock.mockImplementationOnce(async (_config, messages, callbacks) => {
      expect(messages[1]?.content).toContain('Engineer at Acme');
      callbacks.onChunk('1. "Improved retention by 25%"\n');
      callbacks.onChunk('- Reduced build times by 40%\n');
      callbacks.onChunk('* Led migration to TypeScript\n');
      callbacks.onChunk('4) Built internal tooling\n');
      callbacks.onChunk('5. Mentored team members\n');
      callbacks.onChunk('6. Extra line that should be trimmed\n');
      callbacks.onDone();
    });

    const { result } = renderHook(() => useAI(config));

    await act(async () => {
      await result.current.rewriteBullet({
        bulletText: 'Did important work',
        role: 'Engineer',
        company: 'Acme',
      });
    });

    expect(result.current.suggestions).toEqual([
      'Improved retention by 25%',
      'Reduced build times by 40%',
      'Led migration to TypeScript',
      'Built internal tooling',
      'Mentored team members',
    ]);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('aborts an in-flight request when a new request starts', async () => {
    let firstSignal: AbortSignal | undefined;
    let secondSignal: AbortSignal | undefined;

    streamCompletionMock
      .mockImplementationOnce(async (_config, _messages, _callbacks, signal) => {
        firstSignal = signal;
        return new Promise<void>(() => {});
      })
      .mockImplementationOnce(async (_config, _messages, callbacks, signal) => {
        secondSignal = signal;
        callbacks.onChunk('Generated bullet');
        callbacks.onDone();
      });

    const { result } = renderHook(() => useAI(config));

    act(() => {
      void result.current.rewriteBullet({
        bulletText: 'Built systems',
        role: 'Engineer',
        company: 'Acme',
      });
    });

    act(() => {
      void result.current.generateBullets({
        description: 'Build systems and improve reliability',
        role: 'Engineer',
      });
    });

    await waitFor(() => {
      expect(result.current.suggestions).toEqual(['Generated bullet']);
    });

    expect(firstSignal?.aborted).toBe(true);
    expect(secondSignal?.aborted).toBe(false);
  });

  it('formats AI errors via the shared error mapper', async () => {
    streamCompletionMock.mockImplementationOnce(async (_config, _messages, callbacks) => {
      callbacks.onError({ type: 'server-error', message: 'downstream failed' });
    });

    const { result } = renderHook(() => useAI(config));

    await act(async () => {
      await result.current.generateBullets({
        description: 'Wrote backend services',
        role: 'Senior Engineer',
      });
    });

    expect(getErrorMessageMock).toHaveBeenCalledWith({
      type: 'server-error',
      message: 'downstream failed',
    });
    expect(result.current.error).toBe('formatted:downstream failed');
    expect(result.current.isLoading).toBe(false);
  });

  it('clears loading when the request throws and exposes reset helpers', async () => {
    streamCompletionMock.mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useAI(config));

    await act(async () => {
      await result.current.improveSummary({
        summary: 'Engineer with broad experience',
      });
    });

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.clearError();
      result.current.clearSuggestions();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.suggestions).toEqual([]);
  });
});
