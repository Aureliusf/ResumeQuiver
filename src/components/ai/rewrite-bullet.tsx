import { useState, useMemo, memo } from 'react';
import { useResume } from '@/contexts/resume-context';
import { useSettings } from '@/contexts/settings-context';
import { useAI } from '@/hooks/use-ai';
import { SuggestionCard } from './suggestion-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { RefreshCw, Wand2 } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

function RewriteBulletComponent() {
  const { resume, updateBullet } = useResume();
  const { apiKey, baseUrl, model } = useSettings();
  const [selectedExperienceId, setSelectedExperienceId] = useState<string>('');
  const [selectedBulletId, setSelectedBulletId] = useState<string>('');
  const [appliedIndex, setAppliedIndex] = useState<number | null>(null);
  
  const { suggestions, isLoading, error, rewriteBullet, clearSuggestions } = useAI({
    apiKey,
    baseUrl,
    model,
  });

  const experiences = useMemo(() => {
    if (!resume) return [];
    return [
      ...resume.experience.map(exp => ({ ...exp, type: 'experience' as const })),
      ...resume.projects.map(proj => ({ ...proj, type: 'project' as const, company: '', role: '' })),
    ];
  }, [resume]);

  const selectedExperience = useMemo(() => {
    return experiences.find(e => e.id === selectedExperienceId);
  }, [experiences, selectedExperienceId]);

  const bullets = useMemo(() => {
    return selectedExperience?.bullets || [];
  }, [selectedExperience]);

  const selectedBullet = useMemo(() => {
    return bullets.find(b => b.id === selectedBulletId);
  }, [bullets, selectedBulletId]);

  const handleExperienceChange = (id: string) => {
    setSelectedExperienceId(id);
    setSelectedBulletId('');
    setAppliedIndex(null);
    clearSuggestions();
  };

  const handleBulletChange = (id: string) => {
    setSelectedBulletId(id);
    setAppliedIndex(null);
    clearSuggestions();
  };

  const handleRewrite = async () => {
    if (!selectedBullet || !selectedExperience) return;
    
    setAppliedIndex(null);
    
    const companyOrName = selectedExperience.type === 'experience' 
      ? selectedExperience.company 
      : selectedExperience.name;
    
    await rewriteBullet({
      bulletText: selectedBullet.text,
      role: selectedExperience.role || '',
      company: companyOrName,
    });
  };

  const handleUseSuggestion = (index: number) => {
    if (!resume || !selectedBullet || !suggestions[index]) return;
    
    // Update the bullet using the context method
    updateBullet(selectedExperienceId, selectedBulletId, suggestions[index]);
    setAppliedIndex(index);
    showSuccessToast.bulletsUpdated();
  };

  const isConfigured = apiKey && baseUrl && model;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-df-text">
        <Wand2 className="w-5 h-5 text-df-accent-red" />
        <h3 className="font-space font-semibold">Rewrite Bullet</h3>
      </div>

      {!isConfigured && (
        <div className="p-3 bg-df-accent-red/10 border border-df-accent-red text-sm text-df-text">
          Please configure AI settings first. Go to Settings to add your API key.
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-df-text-secondary mb-2">
            Select Experience or Project
          </label>
          <select
            value={selectedExperienceId}
            onChange={(e) => handleExperienceChange(e.target.value)}
            className="w-full p-3 bg-df-surface border border-df-border text-df-text text-sm focus:border-df-accent-cyan focus:outline-none"
            disabled={!isConfigured}
          >
            <option value="">Choose...</option>
            {experiences.map((exp) => (
              <option key={exp.id} value={exp.id}>
                {exp.type === 'experience' ? `${exp.role} @ ${exp.company}` : exp.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-df-text-secondary mb-2">
            Select Bullet to Rewrite
          </label>
          <select
            value={selectedBulletId}
            onChange={(e) => handleBulletChange(e.target.value)}
            className="w-full p-3 bg-df-surface border border-df-border text-df-text text-sm focus:border-df-accent-cyan focus:outline-none"
            disabled={!selectedExperienceId || bullets.length === 0 || !isConfigured}
          >
            <option value="">
              {bullets.length === 0 ? 'No bullets available' : 'Choose bullet...'}
            </option>
            {bullets.map((bullet) => (
              <option key={bullet.id} value={bullet.id}>
                {bullet.text.slice(0, 60)}...
              </option>
            ))}
          </select>
        </div>

        {selectedBullet && (
          <div className="p-3 bg-df-surface border border-df-border">
            <label className="block text-xs font-medium text-df-text-secondary mb-1">
              Current Bullet
            </label>
            <p className="text-sm text-df-text">{selectedBullet.text}</p>
          </div>
        )}

        <button
          onClick={handleRewrite}
          disabled={!selectedBullet || isLoading || !isConfigured}
          className="w-full py-3 bg-df-accent-red text-df-text font-space font-medium hover:bg-df-accent-red/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 focus:outline-2 focus:outline-df-accent-cyan focus:outline-offset-2"
          aria-label="Rewrite selected bullet with AI"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" text="Rewriting..." />
          ) : (
            <>
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Rewrite Bullet
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
            <h4 className="text-sm font-medium text-df-text">Suggestions</h4>
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

export const RewriteBullet = memo(RewriteBulletComponent);
