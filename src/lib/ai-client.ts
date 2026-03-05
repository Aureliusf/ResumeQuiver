export interface AIClientConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type AIErrorType = 'invalid-key' | 'rate-limit' | 'server-error' | 'network-error' | 'timeout' | 'unknown';

export interface AIError extends Error {
  type: AIErrorType;
  statusCode?: number;
}

export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onError: (error: AIError) => void;
  onDone: () => void;
}

const DEFAULT_TIMEOUT = 60000; // 60 seconds

function createAIError(message: string, type: AIErrorType, statusCode?: number): AIError {
  const error = new Error(message) as AIError;
  error.type = type;
  if (statusCode !== undefined) {
    error.statusCode = statusCode;
  }
  return error;
}

export async function streamCompletion(
  config: AIClientConfig,
  messages: AIMessage[],
  callbacks: StreamCallbacks,
  abortSignal?: AbortSignal
): Promise<void> {
  const { apiKey, baseUrl, model } = config;
  const { onChunk, onError, onDone } = callbacks;

  // Validate configuration
  if (!apiKey.trim()) {
    onError(createAIError('API key is required', 'invalid-key'));
    return;
  }

  if (!baseUrl.trim()) {
    onError(createAIError('Base URL is required', 'invalid-key'));
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, DEFAULT_TIMEOUT);

  // Handle external abort signal
  if (abortSignal) {
    abortSignal.addEventListener('abort', () => {
      controller.abort();
    });
  }

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle HTTP errors
    if (!response.ok) {
      const statusCode = response.status;
      let errorType: AIErrorType = 'unknown';
      let errorMessage = `HTTP error ${statusCode}`;

      if (statusCode === 401) {
        errorType = 'invalid-key';
        errorMessage = 'Invalid API key. Please check your settings.';
      } else if (statusCode === 429) {
        errorType = 'rate-limit';
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (statusCode >= 500) {
        errorType = 'server-error';
        errorMessage = 'Server error. Please try again later.';
      }

      onError(createAIError(errorMessage, errorType, statusCode));
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError(createAIError('No response body available', 'unknown'));
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          
          if (!trimmedLine || trimmedLine === 'data: [DONE]') {
            continue;
          }

          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(trimmedLine.slice(6));
              const content = jsonData.choices?.[0]?.delta?.content;
              
              if (content) {
                onChunk(content);
              }
            } catch {
              // Ignore parsing errors for malformed chunks
            }
          }
        }
      }

      // Process any remaining data
      if (buffer.trim() && buffer.trim() !== 'data: [DONE]') {
        const trimmedLine = buffer.trim();
        if (trimmedLine.startsWith('data: ')) {
          try {
            const jsonData = JSON.parse(trimmedLine.slice(6));
            const content = jsonData.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch {
            // Ignore parsing errors
          }
        }
      }

      onDone();
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        onError(createAIError('Request was aborted', 'timeout'));
      } else if (error.message.includes('fetch')) {
        onError(createAIError('Network error. Please check your connection.', 'network-error'));
      } else {
        onError(createAIError(error.message, 'unknown'));
      }
    } else {
      onError(createAIError('An unknown error occurred', 'unknown'));
    }
  }
}

export function getErrorMessage(error: AIError): string {
  switch (error.type) {
    case 'invalid-key':
      return 'Invalid API key. Please check your settings.';
    case 'rate-limit':
      return 'Rate limit exceeded. Please try again later.';
    case 'server-error':
      return 'Server error. Please try again later.';
    case 'network-error':
      return 'Network error. Please check your connection.';
    case 'timeout':
      return 'Request timed out. Please try again.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
}
