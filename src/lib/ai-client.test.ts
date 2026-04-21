import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchAvailableModels, getErrorMessage, streamCompletion } from '@/lib/ai-client';

function createStreamingResponse(lines: string[]): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      lines.forEach((line) => controller.enqueue(encoder.encode(line)));
      controller.close();
    },
  });

  return new Response(stream, { status: 200 });
}

describe('ai-client', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('fetches available models from different payload shapes and deduplicates them', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      data: [{ id: 'gpt-4' }, { name: 'gpt-4' }, { model: 'gpt-5 ' }],
      models: ['custom-model', 'custom-model'],
    }), { status: 200 }));

    await expect(fetchAvailableModels({
      apiKey: 'key',
      baseUrl: 'https://api.example.com/',
    })).resolves.toEqual(['gpt-4', 'gpt-5', 'custom-model']);

    expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/models', expect.objectContaining({
      method: 'GET',
      headers: expect.objectContaining({
        Authorization: 'Bearer key',
      }),
    }));
  });

  it('validates credentials and maps HTTP and network model discovery errors', async () => {
    await expect(fetchAvailableModels({ apiKey: '', baseUrl: 'https://api.example.com' }))
      .rejects.toMatchObject({ type: 'invalid-key', message: 'API key is required' });
    await expect(fetchAvailableModels({ apiKey: 'key', baseUrl: '' }))
      .rejects.toMatchObject({ type: 'invalid-key', message: 'Base URL is required' });

    fetchMock.mockResolvedValueOnce(new Response('', { status: 401 }));
    await expect(fetchAvailableModels({ apiKey: 'key', baseUrl: 'https://api.example.com' }))
      .rejects.toMatchObject({ type: 'invalid-key' });

    fetchMock.mockResolvedValueOnce(new Response('', { status: 429 }));
    await expect(fetchAvailableModels({ apiKey: 'key', baseUrl: 'https://api.example.com' }))
      .rejects.toMatchObject({ type: 'rate-limit' });

    fetchMock.mockResolvedValueOnce(new Response('', { status: 503 }));
    await expect(fetchAvailableModels({ apiKey: 'key', baseUrl: 'https://api.example.com' }))
      .rejects.toMatchObject({ type: 'server-error' });

    fetchMock.mockRejectedValueOnce(Object.assign(new Error('fetch failed'), { name: 'TypeError' }));
    await expect(fetchAvailableModels({ apiKey: 'key', baseUrl: 'https://api.example.com' }))
      .rejects.toMatchObject({ type: 'network-error' });

    fetchMock.mockRejectedValueOnce(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    await expect(fetchAvailableModels({ apiKey: 'key', baseUrl: 'https://api.example.com' }))
      .rejects.toMatchObject({ type: 'timeout' });
  });

  it('streams completion chunks, ignores malformed chunks, and finishes cleanly', async () => {
    fetchMock.mockResolvedValueOnce(createStreamingResponse([
      'data: {"choices":[{"delta":{"content":"Hello "}}]}\n',
      'data: {"choices":[{"delta":{"content":"world"}}]}\n',
      'data: {"choices":[{"delta":{}}]}\n',
      'data: not-json\n',
      'data: [DONE]\n',
    ]));

    const onChunk = vi.fn();
    const onError = vi.fn();
    const onDone = vi.fn();

    await streamCompletion(
      {
        apiKey: 'key',
        baseUrl: 'https://api.example.com/',
        model: 'gpt-test',
      },
      [{ role: 'user', content: 'Hello' }],
      { onChunk, onError, onDone }
    );

    expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello ');
    expect(onChunk).toHaveBeenNthCalledWith(2, 'world');
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/chat/completions', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        model: 'gpt-test',
        messages: [{ role: 'user', content: 'Hello' }],
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    }));
  });

  it('maps invalid configuration, HTTP errors, missing bodies, and fetch failures during streaming', async () => {
    const onChunk = vi.fn();
    const onError = vi.fn();
    const onDone = vi.fn();

    await streamCompletion(
      { apiKey: '', baseUrl: '', model: 'gpt-test' },
      [],
      { onChunk, onError, onDone }
    );
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ type: 'invalid-key' }));

    onError.mockReset();
    fetchMock.mockResolvedValueOnce(new Response('', { status: 429 }));
    await streamCompletion(
      { apiKey: 'key', baseUrl: 'https://api.example.com', model: 'gpt-test' },
      [],
      { onChunk, onError, onDone }
    );
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ type: 'rate-limit' }));

    onError.mockReset();
    fetchMock.mockResolvedValueOnce({ ok: true, body: null });
    await streamCompletion(
      { apiKey: 'key', baseUrl: 'https://api.example.com', model: 'gpt-test' },
      [],
      { onChunk, onError, onDone }
    );
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({
      type: 'unknown',
      message: 'No response body available',
    }));

    onError.mockReset();
    fetchMock.mockRejectedValueOnce(Object.assign(new Error('fetch failed'), { name: 'TypeError' }));
    await streamCompletion(
      { apiKey: 'key', baseUrl: 'https://api.example.com', model: 'gpt-test' },
      [],
      { onChunk, onError, onDone }
    );
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ type: 'network-error' }));

    onError.mockReset();
    fetchMock.mockRejectedValueOnce(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    await streamCompletion(
      { apiKey: 'key', baseUrl: 'https://api.example.com', model: 'gpt-test' },
      [],
      { onChunk, onError, onDone }
    );
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ type: 'timeout' }));
  });

  it('converts AI errors into friendly user-facing messages', () => {
    expect(getErrorMessage({ type: 'invalid-key', message: 'x' } as never)).toBe('Invalid API key. Please check your settings.');
    expect(getErrorMessage({ type: 'rate-limit', message: 'x' } as never)).toBe('Rate limit exceeded. Please try again later.');
    expect(getErrorMessage({ type: 'server-error', message: 'x' } as never)).toBe('Server error. Please try again later.');
    expect(getErrorMessage({ type: 'network-error', message: 'x' } as never)).toBe('Network error. Please check your connection.');
    expect(getErrorMessage({ type: 'timeout', message: 'x' } as never)).toBe('Request timed out. Please try again.');
    expect(getErrorMessage({ type: 'unknown', message: 'fallback' } as never)).toBe('fallback');
  });
});
