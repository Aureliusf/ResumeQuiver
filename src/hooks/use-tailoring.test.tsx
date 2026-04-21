import { renderHook, act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useTailoring } from '@/hooks/use-tailoring';
import { cloneResume } from '@/test/fixtures';

const { scoreBulletsMock, successToastMock, errorToastMock } = vi.hoisted(() => ({
  scoreBulletsMock: vi.fn(),
  successToastMock: vi.fn(),
  errorToastMock: vi.fn(),
}));

vi.mock('@/lib/ai-tailoring', async () => {
  const actual = await vi.importActual<typeof import('@/lib/ai-tailoring')>('@/lib/ai-tailoring');
  return {
    ...actual,
    scoreBullets: scoreBulletsMock,
  };
});

vi.mock('@/lib/toast', () => ({
  showSuccessToast: {
    tailoringComplete: successToastMock,
  },
  showErrorToast: {
    apiError: errorToastMock,
  },
}));

describe('useTailoring', () => {
  const resume = cloneResume();
  const config = {
    apiKey: 'key',
    baseUrl: 'https://api.example.com',
    model: 'gpt-test',
  };
  const longJobDescription = 'React TypeScript platform role '.repeat(6);

  beforeEach(() => {
    scoreBulletsMock.mockReset();
    successToastMock.mockReset();
    errorToastMock.mockReset();
  });

  it('validates AI configuration and job description length before analyzing', async () => {
    const { result } = renderHook(() => useTailoring());

    await act(async () => {
      await result.current.analyzeJobDescription({
        jobDescription: 'short',
        resume,
        config: { apiKey: '', baseUrl: '', model: '' },
      });
    });

    expect(result.current.error).toBe('AI not configured. Please check your settings.');

    await act(async () => {
      await result.current.analyzeJobDescription({
        jobDescription: 'too short',
        resume,
        config,
      });
    });

    expect(result.current.error).toBe('Job description must be at least 100 characters.');
    expect(scoreBulletsMock).not.toHaveBeenCalled();
  });

  it('collects experience and project bullets, then stores successful results', async () => {
    const { result } = renderHook(() => useTailoring());

    scoreBulletsMock.mockImplementationOnce(async (_config, jobDescription, bullets, callbacks) => {
      expect(jobDescription).toBe(longJobDescription);
      expect(bullets).toHaveLength(20);
      expect(bullets[0]).toEqual({
        parentId: 'exp-001',
        bulletId: 'b-001',
        text: resume.experience[0]?.bullets[0]?.text,
      });
      callbacks.onDone([
        { parentId: 'exp-001', bulletId: 'b-001', score: 91, matchedKeywords: ['react'] },
      ]);
    });

    await act(async () => {
      await result.current.analyzeJobDescription({
        jobDescription: longJobDescription,
        resume,
        config,
      });
    });

    await waitFor(() => {
      expect(result.current.results).toEqual([
        { parentId: 'exp-001', bulletId: 'b-001', score: 91, matchedKeywords: ['react'] },
      ]);
    });
    expect(result.current.isAnalyzing).toBe(false);
    expect(successToastMock).toHaveBeenCalledTimes(1);
  });

  it('formats AI errors and shows the error toast', async () => {
    const { result } = renderHook(() => useTailoring());

    scoreBulletsMock.mockImplementationOnce(async (_config, _jobDescription, _bullets, callbacks) => {
      callbacks.onError({ type: 'network-error', message: 'offline' });
    });

    await act(async () => {
      await result.current.analyzeJobDescription({
        jobDescription: longJobDescription,
        resume,
        config,
      });
    });

    expect(result.current.error).toBe('Network error. Please check your connection.');
    expect(result.current.isAnalyzing).toBe(false);
    expect(errorToastMock).toHaveBeenCalledWith('Network error. Please check your connection.');
  });

  it('aborts prior analyses when a new analysis starts', async () => {
    let firstSignal: AbortSignal | undefined;
    let secondSignal: AbortSignal | undefined;
    const { result } = renderHook(() => useTailoring());

    scoreBulletsMock
      .mockImplementationOnce(async (_config, _jobDescription, _bullets, _callbacks, signal) => {
        firstSignal = signal;
        return new Promise<void>(() => {});
      })
      .mockImplementationOnce(async (_config, _jobDescription, _bullets, callbacks, signal) => {
        secondSignal = signal;
        callbacks.onDone([]);
      });

    act(() => {
      void result.current.analyzeJobDescription({
        jobDescription: longJobDescription,
        resume,
        config,
      });
    });

    act(() => {
      void result.current.analyzeJobDescription({
        jobDescription: `${longJobDescription} plus more`,
        resume,
        config,
      });
    });

    await waitFor(() => {
      expect(scoreBulletsMock).toHaveBeenCalledTimes(2);
    });

    expect(firstSignal?.aborted).toBe(true);
    expect(secondSignal?.aborted).toBe(false);
  });

  it('supports selection helpers and reset helpers', () => {
    const { result } = renderHook(() => useTailoring());

    const selected = result.current.selectBestBullets([
      { parentId: 'exp-1', bulletId: 'b-1', score: 20, matchedKeywords: [] },
      { parentId: 'exp-1', bulletId: 'b-2', score: 90, matchedKeywords: [] },
      { parentId: 'exp-1', bulletId: 'b-3', score: 70, matchedKeywords: [] },
      { parentId: 'exp-1', bulletId: 'b-4', score: 80, matchedKeywords: [] },
      { parentId: 'proj-1', bulletId: 'p-1', score: 60, matchedKeywords: [] },
    ]);

    expect(selected.get('exp-1')).toEqual(['b-2', 'b-4', 'b-3']);
    expect(selected.get('proj-1')).toEqual(['p-1']);

    const original = new Map<string, string[]>([['exp-1', ['b-1', 'b-2']]]);
    const reset = result.current.resetSelections(original);
    reset.get('exp-1')?.push('b-3');

    expect(original.get('exp-1')).toEqual(['b-1', 'b-2']);

    act(() => {
      result.current.clearResults();
      result.current.clearError();
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
