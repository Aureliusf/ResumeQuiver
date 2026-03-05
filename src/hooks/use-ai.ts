import { useState, useCallback, useRef } from 'react';
import { streamCompletion, type AIClientConfig, type AIMessage, type AIError, getErrorMessage } from '@/lib/ai-client';

export interface UseAIResult {
  suggestions: string[];
  isLoading: boolean;
  error: string | null;
  rewriteBullet: (params: RewriteBulletParams) => Promise<void>;
  generateBullets: (params: GenerateBulletsParams) => Promise<void>;
  improveSummary: (params: ImproveSummaryParams) => Promise<void>;
  clearSuggestions: () => void;
  clearError: () => void;
}

export interface RewriteBulletParams {
  bulletText: string;
  role: string;
  company: string;
}

export interface GenerateBulletsParams {
  description: string;
  role: string;
}

export interface ImproveSummaryParams {
  summary: string;
}

export interface UseAIOptions extends AIClientConfig {}

export function useAI(config: UseAIOptions): UseAIResult {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const parseVariations = useCallback((text: string): string[] => {
    // Split by newlines and filter out empty lines
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    // Remove leading numbers/bullets if present (e.g., "1.", "- ", "* ")
    const cleaned = lines.map(line => {
      // Remove leading numbers with periods
      let cleaned = line.replace(/^\d+[.):]\s*/, '');
      // Remove leading bullets
      cleaned = cleaned.replace(/^[-*•]\s*/, '');
      // Remove quotes if the whole line is quoted
      cleaned = cleaned.replace(/^["']|["']$/g, '');
      return cleaned.trim();
    }).filter(line => line.length > 0);
    
    // Return up to 5 variations
    return cleaned.slice(0, 5);
  }, []);

  const rewriteBullet = useCallback(async (params: RewriteBulletParams): Promise<void> => {
    const { bulletText, role, company } = params;
    
    if (!config.apiKey || !config.baseUrl || !config.model) {
      setError('AI not configured. Please check your settings.');
      return;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are a professional resume writer. Help rewrite resume bullet points to be more impactful and achievement-oriented.',
      },
      {
        role: 'user',
        content: `Rewrite this resume bullet to be more impactful. Provide 3-5 variations.

Bullet: ${bulletText}
Context: ${role} at ${company}

Return ONLY variations, one per line.`,
      },
    ];

    let fullResponse = '';

    try {
      await streamCompletion(
        config,
        messages,
        {
          onChunk: (chunk) => {
            fullResponse += chunk;
          },
          onError: (err: AIError) => {
            setError(getErrorMessage(err));
            setIsLoading(false);
          },
          onDone: () => {
            const variations = parseVariations(fullResponse);
            setSuggestions(variations);
            setIsLoading(false);
          },
        },
        abortControllerRef.current.signal
      );
    } catch {
      setIsLoading(false);
    }
  }, [config, parseVariations]);

  const generateBullets = useCallback(async (params: GenerateBulletsParams): Promise<void> => {
    const { description, role } = params;
    
    if (!config.apiKey || !config.baseUrl || !config.model) {
      setError('AI not configured. Please check your settings.');
      return;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are a professional resume writer. Help generate achievement-oriented resume bullet points that focus on metrics and impact.',
      },
      {
        role: 'user',
        content: `Generate 3-5 achievement-oriented resume bullets. Focus on metrics and impact.

Description: ${description}
Context: ${role}

Return ONLY bullets, one per line.`,
      },
    ];

    let fullResponse = '';

    try {
      await streamCompletion(
        config,
        messages,
        {
          onChunk: (chunk) => {
            fullResponse += chunk;
          },
          onError: (err: AIError) => {
            setError(getErrorMessage(err));
            setIsLoading(false);
          },
          onDone: () => {
            const variations = parseVariations(fullResponse);
            setSuggestions(variations);
            setIsLoading(false);
          },
        },
        abortControllerRef.current.signal
      );
    } catch {
      setIsLoading(false);
    }
  }, [config, parseVariations]);

  const improveSummary = useCallback(async (params: ImproveSummaryParams): Promise<void> => {
    const { summary } = params;
    
    if (!config.apiKey || !config.baseUrl || !config.model) {
      setError('AI not configured. Please check your settings.');
      return;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are a professional resume writer. Help improve professional summaries to be more compelling and concise.',
      },
      {
        role: 'user',
        content: `Improve this professional summary. Make it compelling and concise.

Current: ${summary}

Provide 3-5 variations. Return ONLY summaries, one per line.`,
      },
    ];

    let fullResponse = '';

    try {
      await streamCompletion(
        config,
        messages,
        {
          onChunk: (chunk) => {
            fullResponse += chunk;
          },
          onError: (err: AIError) => {
            setError(getErrorMessage(err));
            setIsLoading(false);
          },
          onDone: () => {
            const variations = parseVariations(fullResponse);
            setSuggestions(variations);
            setIsLoading(false);
          },
        },
        abortControllerRef.current.signal
      );
    } catch {
      setIsLoading(false);
    }
  }, [config, parseVariations]);

  return {
    suggestions,
    isLoading,
    error,
    rewriteBullet,
    generateBullets,
    improveSummary,
    clearSuggestions,
    clearError,
  };
}
