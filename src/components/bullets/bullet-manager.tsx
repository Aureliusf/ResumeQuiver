import { useState, memo } from 'react';
import { ChevronUp, ChevronDown, Sparkles, X, CheckSquare, Square } from 'lucide-react';
import { useResume } from '@/contexts/resume-context';
import { useSettings } from '@/contexts/settings-context';
import { useAI } from '@/hooks/use-ai';
import { SuggestionCard } from '@/components/ai/suggestion-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { BulletCheckbox } from './bullet-checkbox';
import { showSuccessToast } from '@/lib/toast';

interface BulletItemProps {
  bullet: { id: string; text: string; tags: string[]; selected?: boolean };
  parentId: string;
  parentTitle: string;
  role?: string;
  company?: string;
  isSelected: boolean;
  onToggle: () => void;
}

const BulletItem = memo(function BulletItem({ bullet, parentId, parentTitle, role, company, isSelected, onToggle }: BulletItemProps) {
  const { updateBullet } = useResume();
  const { apiKey, baseUrl, model } = useSettings();
  const [showRewriteModal, setShowRewriteModal] = useState(false);
  const [appliedIndex, setAppliedIndex] = useState<number | null>(null);
  
  const { suggestions, isLoading, error, rewriteBullet, clearSuggestions } = useAI({
    apiKey,
    baseUrl,
    model,
  });

  const isConfigured = apiKey && baseUrl && model;

  const handleRewrite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConfigured) return;
    
    setAppliedIndex(null);
    clearSuggestions();
    setShowRewriteModal(true);
    
    await rewriteBullet({
      bulletText: bullet.text,
      role: role || '',
      company: company || '',
    });
  };

  const handleUseSuggestion = (index: number) => {
    updateBullet(parentId, bullet.id, suggestions[index]);
    setAppliedIndex(index);
    showSuccessToast.bulletsUpdated();
  };

  const handleClose = () => {
    setShowRewriteModal(false);
    clearSuggestions();
    setAppliedIndex(null);
  };

  return (
    <>
      <div className="relative">
        <BulletCheckbox
          bullet={bullet}
          isSelected={isSelected}
          onToggle={onToggle}
        />
        
        {/* AI Rewrite Button */}
        <button
          onClick={handleRewrite}
          disabled={!isConfigured}
          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-df-text-secondary hover:text-df-accent-red disabled:opacity-0 rounded focus:outline-2 focus:outline-df-accent-cyan focus:outline-offset-2"
          title={isConfigured ? "Rewrite with AI" : "Configure AI settings first"}
          aria-label={isConfigured ? "Rewrite bullet with AI" : "Configure AI settings first"}
        >
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      {showRewriteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-df-surface border border-df-border max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-df-border flex items-center justify-between">
              <div>
                <h3 className="font-space font-semibold text-df-text">AI Rewrite</h3>
                <p className="text-xs text-df-text-secondary">{parentTitle}</p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-df-text-secondary hover:text-df-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="p-3 bg-df-elevated border border-df-border">
                <p className="text-xs text-df-text-secondary mb-1">Original</p>
                <p className="text-sm text-df-text">{bullet.text}</p>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" text="Generating variations..." />
                </div>
              )}

              {error && (
                <div className="p-3 bg-df-accent-red/10 border border-df-accent-red text-sm text-df-text" role="alert">
                  {error}
                </div>
              )}

              {!isLoading && suggestions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-df-text">AI Suggestions</h4>
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
              )}

              {!isLoading && suggestions.length === 0 && !error && (
                <div className="text-center py-8 text-df-text-secondary text-sm">
                  Click the button above to generate rewrite suggestions
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

interface SectionCardProps {
  title: string;
  subtitle?: string;
  bullets: { id: string; text: string; tags: string[]; selected?: boolean }[];
  parentId: string;
  role?: string;
  company?: string;
  selectedCount: number;
  onToggleBullet: (bulletId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  isBulletSelected: (bulletId: string) => boolean;
}

const SectionCard = memo(function SectionCard({
  title,
  subtitle,
  bullets,
  parentId,
  role,
  company,
  selectedCount,
  onToggleBullet,
  onSelectAll,
  onDeselectAll,
  isBulletSelected,
}: SectionCardProps) {
  const allSelected = selectedCount === bullets.length && bullets.length > 0;

  return (
    <section className="bg-df-elevated border border-df-border">
      {/* Header */}
      <header className="p-3 border-b border-df-border bg-df-surface">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-space font-medium text-df-text text-sm">
              {title}
            </h4>
            {subtitle && (
              <p className="text-xs text-df-text-secondary mt-0.5">{subtitle}</p>
            )}
          </div>
          <span className="text-xs text-df-text-secondary font-mono">
            {selectedCount} / {bullets.length}
          </span>
        </div>
        
        {/* Bulk Actions */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={onSelectAll}
            disabled={allSelected}
            className="flex items-center gap-1 px-2 py-1 text-xs text-df-text-secondary hover:text-df-accent-cyan disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-2 focus:outline-df-accent-cyan focus:outline-offset-2 rounded"
            aria-label={`Select all bullets for ${title}`}
          >
            <CheckSquare className="w-3 h-3" aria-hidden="true" />
            Select All
          </button>
          <button
            onClick={onDeselectAll}
            disabled={selectedCount === 0}
            className="flex items-center gap-1 px-2 py-1 text-xs text-df-text-secondary hover:text-df-accent-red disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-2 focus:outline-df-accent-red focus:outline-offset-2 rounded"
            aria-label={`Deselect all bullets for ${title}`}
          >
            <Square className="w-3 h-3" aria-hidden="true" />
            Deselect All
          </button>
        </div>
      </header>
      
      {/* Bullets */}
      <div className="p-3 space-y-1">
        {bullets.map((bullet) => (
          <div key={bullet.id} className="group">
            <BulletItem
              bullet={bullet}
              parentId={parentId}
              parentTitle={title}
              role={role}
              company={company}
              isSelected={isBulletSelected(bullet.id)}
              onToggle={() => onToggleBullet(bullet.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
});

export const BulletManager = memo(function BulletManager() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { resume, selectedBullets, toggleBullet, selectAllBullets, deselectAllBullets } = useResume();

  const getTotalBulletCount = () => {
    if (!resume) return 0;
    const expBullets = resume.experience.reduce((acc, exp) => acc + exp.bullets.length, 0);
    const projBullets = resume.projects.reduce((acc, proj) => acc + proj.bullets.length, 0);
    return expBullets + projBullets;
  };

  const getSelectedBulletCount = () => {
    let count = 0;
    selectedBullets.forEach((ids) => {
      count += ids.length;
    });
    return count;
  };

  const isBulletSelected = (parentId: string, bulletId: string) => {
    const selected = selectedBullets.get(parentId);
    return selected ? selected.includes(bulletId) : false;
  };

  const totalBullets = getTotalBulletCount();
  const selectedCount = getSelectedBulletCount();

  return (
    <div className="bg-df-surface border-t border-df-border">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-3 flex items-center justify-between hover:bg-df-elevated transition-colors focus:outline-2 focus:outline-df-accent-cyan focus:outline-offset-2"
        aria-expanded={isExpanded}
        aria-controls="bullet-library-content"
        aria-label={`Bullet Library - ${selectedCount} of ${totalBullets} bullets selected`}
      >
        <div className="flex items-center gap-4">
          <span className="font-space font-semibold text-df-text">Bullet Library</span>
          <span className="text-sm text-df-text-secondary" aria-live="polite">
            {selectedCount} / {totalBullets} selected
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-df-text-secondary" aria-hidden="true" />
        ) : (
          <ChevronUp className="w-5 h-5 text-df-text-secondary" aria-hidden="true" />
        )}
      </button>

      {isExpanded && (
        <div id="bullet-library-content" className="h-96 border-t border-df-border overflow-y-auto px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {resume?.experience.map((exp) => (
              <SectionCard
                key={exp.id}
                title={`${exp.role} @ ${exp.company}`}
                subtitle={`${exp.startDate} - ${exp.endDate || 'Present'}`}
                bullets={exp.bullets}
                parentId={exp.id}
                role={exp.role}
                company={exp.company}
                selectedCount={selectedBullets.get(exp.id)?.length || 0}
                onToggleBullet={(bulletId) => toggleBullet(exp.id, bulletId)}
                onSelectAll={() => selectAllBullets(exp.id)}
                onDeselectAll={() => deselectAllBullets(exp.id)}
                isBulletSelected={(bulletId) => isBulletSelected(exp.id, bulletId)}
              />
            ))}
            
            {resume?.projects.map((proj) => (
              <SectionCard
                key={proj.id}
                title={proj.name}
                subtitle={proj.technologies.join(', ')}
                bullets={proj.bullets}
                parentId={proj.id}
                selectedCount={selectedBullets.get(proj.id)?.length || 0}
                onToggleBullet={(bulletId) => toggleBullet(proj.id, bulletId)}
                onSelectAll={() => selectAllBullets(proj.id)}
                onDeselectAll={() => deselectAllBullets(proj.id)}
                isBulletSelected={(bulletId) => isBulletSelected(proj.id, bulletId)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
