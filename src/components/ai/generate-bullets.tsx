import { useState, useMemo, memo } from 'react';
import { useResume } from '@/contexts/resume-context';
import { useSettings } from '@/contexts/settings-context';
import { useAI } from '@/hooks/use-ai';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Sparkles, Plus } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

function GenerateBulletsComponent() {
  const { resume } = useResume();
  const { apiKey, baseUrl, model } = useSettings();
  const [description, setDescription] = useState('');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [addedIndices, setAddedIndices] = useState<Set<number>>(new Set());
  
  const { suggestions, isLoading, error, generateBullets, clearSuggestions } = useAI({
    apiKey,
    baseUrl,
    model,
  });

  const targets = useMemo(() => {
    if (!resume) return [];
    return [
      ...resume.experience.map(exp => ({ ...exp, type: 'experience' as const })),
      ...resume.projects.map(proj => ({ ...proj, type: 'project' as const, company: '', role: '' })),
    ];
  }, [resume]);

  const selectedTarget = useMemo(() => {
    return targets.find(t => t.id === selectedTargetId);
  }, [targets, selectedTargetId]);

  const handleTargetChange = (id: string) => {
    setSelectedTargetId(id);
    setAddedIndices(new Set());
    clearSuggestions();
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    setAddedIndices(new Set());
    clearSuggestions();
  };

  const handleGenerate = async () => {
    if (!description.trim() || !selectedTarget) return;
    
    setAddedIndices(new Set());
    
    await generateBullets({
      description: description.trim(),
      role: selectedTarget?.role || '',
    });
  };

  const handleAddSuggestion = (index: number) => {
    if (!resume || !suggestions[index]) return;
    
    // Mark as added
    setAddedIndices(prev => new Set([...prev, index]));
    showSuccessToast.bulletsUpdated();
    
    // In a full implementation, this would append the bullet to the YAML
    // For now, we just mark it as added
  };

  const isConfigured = apiKey && baseUrl && model;
  const canGenerate = description.trim().length > 10 && selectedTargetId && isConfigured;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-df-text">
        <Sparkles className="w-5 h-5 text-df-accent-red" />
        <h3 className="font-space font-semibold">Generate Bullets</h3>
      </div>

      {!isConfigured && (
        <div className="p-3 bg-df-accent-red/10 border border-df-accent-red text-sm text-df-text">
          Please configure AI settings first. Go to Settings to add your API key.
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-df-text-secondary mb-2">
            Describe Your Work
          </label>
          <textarea
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Describe what you did, your responsibilities, and any achievements or metrics..."
            className="w-full h-32 p-3 bg-df-surface border border-df-border text-df-text text-sm resize-none focus:border-df-accent-cyan focus:outline-none"
            disabled={!isConfigured}
          />
          <p className="mt-1 text-xs text-df-text-secondary">
            {description.length} characters (min 10 recommended)
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-df-text-secondary mb-2">
            Add to Experience or Project
          </label>
          <select
            value={selectedTargetId}
            onChange={(e) => handleTargetChange(e.target.value)}
            className="w-full p-3 bg-df-surface border border-df-border text-df-text text-sm focus:border-df-accent-cyan focus:outline-none"
            disabled={!isConfigured}
          >
            <option value="">Choose...</option>
            {targets.map((target) => (
              <option key={target.id} value={target.id}>
                {target.type === 'experience' ? `${target.role} @ ${target.company}` : target.name}
              </option>
            ))}
          </select>
        </div>

        {selectedTarget && (
          <div className="p-3 bg-df-surface border border-df-border">
            <label className="block text-xs font-medium text-df-text-secondary mb-1">
              Target
            </label>
            <p className="text-sm text-df-text">
              {selectedTarget.type === 'experience' 
                ? `${selectedTarget.role} at ${selectedTarget.company}` 
                : selectedTarget.name}
            </p>
            <p className="text-xs text-df-text-secondary mt-1">
              {selectedTarget.bullets.length} existing bullets
            </p>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!canGenerate || isLoading}
          className="w-full py-3 bg-df-accent-red text-df-text font-space font-medium hover:bg-df-accent-red/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 focus:outline-2 focus:outline-df-accent-cyan focus:outline-offset-2"
          aria-label="Generate bullets from description"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" text="Generating..." />
          ) : (
            <>
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              Generate Bullets
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
            <h4 className="text-sm font-medium text-df-text">Generated Bullets</h4>
            <button
              onClick={clearSuggestions}
              className="text-xs text-df-text-secondary hover:text-df-accent-cyan"
            >
              Clear
            </button>
          </div>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`
                  relative p-4 border transition-all duration-200
                  ${addedIndices.has(index)
                    ? 'bg-green-500/10 border-green-500'
                    : 'bg-df-elevated border-df-border hover:border-df-accent-cyan'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    flex-shrink-0 w-8 h-8 rounded flex items-center justify-center font-mono text-sm font-medium
                    ${addedIndices.has(index)
                      ? 'bg-green-500 text-white'
                      : 'bg-df-surface text-df-text-secondary'
                    }
                  `}>
                    {addedIndices.has(index) ? <Plus className="w-4 h-4" /> : index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-df-text leading-relaxed">
                      {suggestion}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleAddSuggestion(index)}
                  disabled={addedIndices.has(index)}
                  className={`
                    mt-3 w-full py-2 px-4 font-space font-medium text-sm
                    transition-colors duration-200 flex items-center justify-center gap-2
                    ${addedIndices.has(index)
                      ? 'bg-green-500/20 text-green-400 border border-green-500 cursor-default'
                      : 'bg-df-surface text-df-text hover:bg-df-accent-cyan hover:text-df-primary'
                    }
                  `}
                >
                  {addedIndices.has(index) ? (
                    <>Added</>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add to Resume
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const GenerateBullets = memo(GenerateBulletsComponent);
