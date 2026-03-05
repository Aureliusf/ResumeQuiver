import { useState, useCallback, useRef } from 'react';
import { scoreBullets, type MatchResult, type BulletToScore } from '@/lib/ai-tailoring';
import type { AIClientConfig, AIError } from '@/lib/ai-client';
import type { Resume } from '@/types/resume';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

export interface UseTailoringResult {
  isAnalyzing: boolean;
  results: MatchResult[];
  error: string | null;
  analyzeJobDescription: (params: AnalyzeParams) => Promise<void>;
  selectBestBullets: (results: MatchResult[]) => Map<string, string[]>;
  resetSelections: (originalSelections: Map<string, string[]>) => Map<string, string[]>;
  clearResults: () => void;
  clearError: () => void;
}

export interface AnalyzeParams {
  jobDescription: string;
  resume: Resume;
  config: AIClientConfig;
}

export function useTailoring(): UseTailoringResult {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const collectBulletsFromResume = useCallback((resume: Resume): BulletToScore[] => {
    const bullets: BulletToScore[] = [];
    
    // Collect from experience
    resume.experience.forEach((exp) => {
      exp.bullets.forEach((bullet) => {
        bullets.push({
          parentId: exp.id,
          bulletId: bullet.id,
          text: bullet.text,
        });
      });
    });
    
    // Collect from projects
    resume.projects.forEach((proj) => {
      proj.bullets.forEach((bullet) => {
        bullets.push({
          parentId: proj.id,
          bulletId: bullet.id,
          text: bullet.text,
        });
      });
    });
    
    return bullets;
  }, []);

  const analyzeJobDescription = useCallback(async (params: AnalyzeParams): Promise<void> => {
    const { jobDescription, resume, config } = params;
    
    if (!config.apiKey || !config.baseUrl || !config.model) {
      setError('AI not configured. Please check your settings.');
      return;
    }
    
    if (jobDescription.trim().length < 100) {
      setError('Job description must be at least 100 characters.');
      return;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsAnalyzing(true);
    setError(null);
    setResults([]);

    const bullets = collectBulletsFromResume(resume);

    try {
      await scoreBullets(
        config,
        jobDescription,
        bullets,
        {
          onError: (err: AIError) => {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            setIsAnalyzing(false);
            showErrorToast.apiError(errorMessage);
          },
          onDone: (matchResults: MatchResult[]) => {
            setResults(matchResults);
            setIsAnalyzing(false);
            if (matchResults.length > 0) {
              showSuccessToast.tailoringComplete();
            }
          },
        },
        abortControllerRef.current?.signal
      );
    } catch {
      setIsAnalyzing(false);
    }
  }, [collectBulletsFromResume]);

  const selectBestBullets = useCallback((matchResults: MatchResult[]): Map<string, string[]> => {
    // Group results by parentId
    const groupedByParent = new Map<string, MatchResult[]>();
    
    matchResults.forEach((result) => {
      const current = groupedByParent.get(result.parentId) || [];
      current.push(result);
      groupedByParent.set(result.parentId, current);
    });
    
    // Select top 3 per parent
    const selected = new Map<string, string[]>();
    
    groupedByParent.forEach((parentResults, parentId) => {
      // Sort by score descending and take top 3
      const topResults = parentResults
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((r) => r.bulletId);
      
      selected.set(parentId, topResults);
    });
    
    return selected;
  }, []);

  const resetSelections = useCallback((originalSelections: Map<string, string[]>): Map<string, string[]> => {
    // Return a deep copy of original selections
    const reset = new Map<string, string[]>();
    originalSelections.forEach((bullets, parentId) => {
      reset.set(parentId, [...bullets]);
    });
    return reset;
  }, []);

  return {
    isAnalyzing,
    results,
    error,
    analyzeJobDescription,
    selectBestBullets,
    resetSelections,
    clearResults,
    clearError,
  };
}

function getErrorMessage(error: AIError): string {
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
