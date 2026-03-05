import { useState, memo } from 'react';
import { useResume } from '@/contexts/resume-context';
import { useSettings } from '@/contexts/settings-context';
import { useAI } from '@/hooks/use-ai';
import { SuggestionCard } from './suggestion-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FileText, RefreshCw } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

function ImproveSummaryComponent() {
  const { resume, updateSummary } = useResume();
  const { apiKey, baseUrl, model } = useSettings();
  const [appliedIndex, setAppliedIndex] = useState<number | null>(null);
  
  const { suggestions, isLoading, error, improveSummary, clearSuggestions } = useAI({
    apiKey,
    baseUrl,
    model,
  });

  const currentSummary = resume?.basics?.summary || '';

  const handleImprove = async () => {
    if (!currentSummary.trim()) return;
    
    setAppliedIndex(null);
    
    await improveSummary({
      summary: currentSummary,
    });
  };

  const handleUseSuggestion = (index: number) => {
    if (!resume || !suggestions[index]) return;
    
    updateSummary(suggestions[index]);
    setAppliedIndex(index);
    showSuccessToast.bulletsUpdated();
  };

  const isConfigured = apiKey && baseUrl && model;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-df-text">
        <FileText className="w-5 h-5 text-df-accent-red" />
        <h3 className="font-space font-semibold">Improve Summary</h3>
      </div>

      {!isConfigured && (
        <div className="p-3 bg-df-accent-red/10 border border-df-accent-red text-sm text-df-text">
          Please configure AI settings first. Go to Settings to add your API key.
        </div>
      )}

      <div className="space-y-3">
        <div className="p-4 bg-df-surface border border-df-border">
          <label className="block text-xs font-medium text-df-text-secondary mb-2">
            Current Summary
          </label>
          {currentSummary ? (
            <p className="text-sm text-df-text leading-relaxed">
              {currentSummary}
            </p>
          ) : (
            <p className="text-sm text-df-text-secondary italic">
              No summary found in resume
            </p>
          )}
        </div>

        <button
          onClick={handleImprove}
          disabled={!currentSummary.trim() || isLoading || !isConfigured}
          className="w-full py-3 bg-df-accent-red text-df-text font-space font-medium hover:bg-df-accent-red/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 focus:outline-2 focus:outline-df-accent-cyan focus:outline-offset-2"
          aria-label="Improve professional summary with AI"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" text="Improving..." />
          ) : (
            <>
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Improve Summary
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-df-accent-red/10 border border-df-accent-red text-sm text-df-text" role="alert">
          {error}
          {showErrorToast.apiError(error)}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-df-text">Improved Versions</h4>
            <button
              onClick={clearSuggestions}
              className="text-xs text-df-text-secondary hover:text-df-accent-cyan"
            >
              Clear
            </button>
          </div>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <SuggestionCard
                key={index}
                text={suggestion}
                index={index}
                onUse={() => handleUseSuggestion(index)}
                isSelected={appliedIndex === index}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const ImproveSummary = memo(ImproveSummaryComponent);
