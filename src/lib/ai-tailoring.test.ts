import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getScoreColor, scoreBullets } from '@/lib/ai-tailoring';
import type { AIClientConfig, AIError } from '@/lib/ai-client';

const { streamCompletionMock } = vi.hoisted(() => ({
  streamCompletionMock: vi.fn(),
}));

vi.mock('@/lib/ai-client', async () => {
  const actual = await vi.importActual<typeof import('@/lib/ai-client')>('@/lib/ai-client');
  return {
    ...actual,
    streamCompletion: streamCompletionMock,
  };
});

describe('ai-tailoring', () => {
  const config: AIClientConfig = {
    apiKey: 'key',
    baseUrl: 'https://api.example.com',
    model: 'gpt-test',
  };

  const bullets = [
    { parentId: 'exp-1', bulletId: 'b-1', text: 'Built features in React' },
    { parentId: 'exp-1', bulletId: 'b-2', text: 'Improved performance' },
  ];

  beforeEach(() => {
    streamCompletionMock.mockReset();
  });

  it('rejects missing AI configuration before streaming', async () => {
    const onError = vi.fn();

    await scoreBullets(
      { apiKey: '', baseUrl: '', model: '' },
      'job description',
      bullets,
      {
        onError,
        onDone: vi.fn(),
      }
    );

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ type: 'invalid-key' }));
    expect(streamCompletionMock).not.toHaveBeenCalled();
  });

  it('parses streamed JSON results, clamps scores, and fills missing parent ids', async () => {
    const onChunk = vi.fn();
    const onDone = vi.fn();

    streamCompletionMock.mockImplementationOnce(async (_config, _messages, callbacks) => {
      callbacks.onChunk('```json\n');
      callbacks.onChunk('[{"bulletId":"b-1","score":120,"matchedKeywords":["react"]},');
      callbacks.onChunk('{"parentId":"exp-1","bulletId":"b-2","score":-5,"matchedKeywords":["performance"]}]');
      callbacks.onChunk('\n```');
      callbacks.onDone();
    });

    await scoreBullets(config, 'Great React role', bullets, {
      onChunk,
      onError: vi.fn(),
      onDone,
    });

    expect(onChunk).toHaveBeenCalled();
    expect(onDone).toHaveBeenCalledWith([
      {
        parentId: 'exp-1',
        bulletId: 'b-1',
        score: 100,
        matchedKeywords: ['react'],
      },
      {
        parentId: 'exp-1',
        bulletId: 'b-2',
        score: 0,
        matchedKeywords: ['performance'],
      },
    ]);
  });

  it('returns empty results when the AI payload cannot be parsed', async () => {
    const onDone = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    streamCompletionMock.mockImplementationOnce(async (_config, _messages, callbacks) => {
      callbacks.onChunk('not json');
      callbacks.onDone();
    });

    await scoreBullets(config, 'Great React role', bullets, {
      onError: vi.fn(),
      onDone,
    });

    expect(onDone).toHaveBeenCalledWith([]);
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('forwards stream errors and unknown thrown errors', async () => {
    const aiError = Object.assign(new Error('Rate limited'), { type: 'rate-limit' as const });
    const onError = vi.fn();

    streamCompletionMock.mockImplementationOnce(async (_config, _messages, callbacks) => {
      callbacks.onError(aiError as AIError);
    });

    await scoreBullets(config, 'Great React role', bullets, {
      onError,
      onDone: vi.fn(),
    });

    expect(onError).toHaveBeenCalledWith(aiError);

    streamCompletionMock.mockRejectedValueOnce(new Error('kaboom'));

    await scoreBullets(config, 'Great React role', bullets, {
      onError,
      onDone: vi.fn(),
    });

    expect(onError).toHaveBeenLastCalledWith(expect.objectContaining({
      type: 'unknown',
      message: 'kaboom',
    }));
  });

  it('returns styling buckets for low, medium, and high scores', () => {
    expect(getScoreColor(85)).toEqual({
      bg: 'bg-df-accent-green/20',
      text: 'text-df-accent-green',
    });
    expect(getScoreColor(70)).toEqual({
      bg: 'bg-df-accent-yellow/20',
      text: 'text-df-accent-yellow',
    });
    expect(getScoreColor(20)).toEqual({
      bg: 'bg-df-accent-red/20',
      text: 'text-df-accent-red',
    });
  });
});
