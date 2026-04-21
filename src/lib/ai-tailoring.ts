import { streamCompletion, type AIClientConfig, type AIMessage, type AIError } from './ai-client';

export interface BulletToScore {
  parentId: string;
  bulletId: string;
  text: string;
}

export interface MatchResult {
  parentId: string;
  bulletId: string;
  score: number;
  matchedKeywords: string[];
}

export async function scoreBullets(
  config: AIClientConfig,
  jobDescription: string,
  bullets: BulletToScore[],
  callbacks: {
    onChunk?: (chunk: string) => void;
    onError: (error: AIError) => void;
    onDone: (results: MatchResult[]) => void;
  },
  signal?: AbortSignal
): Promise<void> {
  if (!config.apiKey || !config.baseUrl || !config.model) {
    const error = Object.assign(new Error('AI not configured. Please check your settings.'), {
      type: 'invalid-key' as const,
    }) as AIError;
    callbacks.onError(error);
    return;
  }

  const messages: AIMessage[] = [
    {
      role: 'system',
      content: 'You are a professional resume analyzer. Your task is to score how well each resume bullet point matches a job description.',
    },
    {
      role: 'user',
      content: `Analyze how well each resume bullet point matches this job description. Score 0-100 based on keyword overlap, skills match, and relevance.

Job Description:
${jobDescription}

Bullets to Score (JSON):
${JSON.stringify(bullets, null, 2)}

Return ONLY a JSON array:
[{"parentId": "...", "bulletId": "...", "score": 85, "matchedKeywords": ["react", "typescript"]}]

Important: Return ONLY the JSON array, no markdown, no explanation.`,
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
          if (callbacks.onChunk) {
            callbacks.onChunk(chunk);
          }
        },
        onError: (err: AIError) => {
          callbacks.onError(err);
        },
        onDone: () => {
          const results = parseMatchResults(fullResponse, bullets);
          callbacks.onDone(results);
        },
      },
      signal
    );
  } catch (error) {
    const err = Object.assign(new Error(error instanceof Error ? error.message : 'Unknown error occurred'), {
      type: 'unknown' as const,
    }) as AIError;
    callbacks.onError(err);
  }
}

function parseMatchResults(response: string, originalBullets: BulletToScore[]): MatchResult[] {
  try {
    // Clean up the response - remove markdown code blocks if present
    let cleaned = response.trim();
    
    // Remove markdown code blocks
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    
    cleaned = cleaned.trim();
    
    // Parse JSON
    const parsed = JSON.parse(cleaned);
    
    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array');
    }
    
    // Validate and map results
    const results: MatchResult[] = parsed
      .filter((item: unknown) => {
        const r = item as Record<string, unknown>;
        return (
          typeof r.bulletId === 'string' &&
          typeof r.score === 'number' &&
          Array.isArray(r.matchedKeywords)
        );
      })
      .map((item: Record<string, unknown>) => {
        const bullet = originalBullets.find((b) => b.bulletId === item.bulletId);
        return {
          parentId: (item.parentId as string) || (bullet?.parentId || ''),
          bulletId: item.bulletId as string,
          score: Math.max(0, Math.min(100, item.score as number)),
          matchedKeywords: (item.matchedKeywords as string[]) || [],
        };
      });
    
    return results;
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    console.error('Raw response:', response);
    
    // Return empty results on parse error
    return [];
  }
}

export function getScoreColor(score: number): { bg: string; text: string } {
  if (score >= 80) {
    return { bg: 'bg-df-accent-green/20', text: 'text-df-accent-green' };
  } else if (score >= 60) {
    return { bg: 'bg-df-accent-yellow/20', text: 'text-df-accent-yellow' };
  } else {
    return { bg: 'bg-df-accent-red/20', text: 'text-df-accent-red' };
  }
}
