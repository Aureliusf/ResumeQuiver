import { useState, memo } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Minus,
  Plus,
  Sparkles,
  Square,
  X,
} from 'lucide-react';
import { useResume } from '@/contexts/resume-context';
import { useSettings } from '@/contexts/settings-context';
import { useAI } from '@/hooks/use-ai';
import { SuggestionCard } from '@/components/ai/suggestion-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  buildBulletLibraryGroups,
  type BulletLibraryItem,
  type BulletLibrarySectionKind,
} from '@/lib/bullet-library';
import { BulletCheckbox } from './bullet-checkbox';
import { showSuccessToast } from '@/lib/toast';

type SectionKind = BulletLibrarySectionKind;

const sectionToneStyles: Record<SectionKind, {
  badgeLabel: string;
  container: string;
  header: string;
  badge: string;
  count: string;
  action: string;
  divider: string;
}> = {
  basics: {
    badgeLabel: 'Basic',
    container: 'border-df-accent-amber/20',
    header: 'bg-df-accent-amber/5',
    badge: 'border border-df-accent-amber/25 bg-df-accent-amber/10 text-df-accent-amber',
    count: 'border border-df-accent-amber/25 bg-df-accent-amber/10 text-df-accent-amber',
    action: 'hover:text-df-accent-amber focus:outline-df-accent-amber',
    divider: 'from-df-accent-amber/40',
  },
  education: {
    badgeLabel: 'Education',
    container: 'border-df-accent-green/20',
    header: 'bg-df-accent-green/5',
    badge: 'border border-df-accent-green/25 bg-df-accent-green/10 text-df-accent-green',
    count: 'border border-df-accent-green/25 bg-df-accent-green/10 text-df-accent-green',
    action: 'hover:text-df-accent-green focus:outline-df-accent-green',
    divider: 'from-df-accent-green/40',
  },
  experience: {
    badgeLabel: 'Experience',
    container: 'border-df-accent-cyan/20',
    header: 'bg-df-accent-cyan/5',
    badge: 'border border-df-accent-cyan/25 bg-df-accent-cyan/10 text-df-accent-cyan',
    count: 'border border-df-accent-cyan/25 bg-df-accent-cyan/10 text-df-accent-cyan',
    action: 'hover:text-df-accent-cyan focus:outline-df-accent-cyan',
    divider: 'from-df-accent-cyan/40',
  },
  project: {
    badgeLabel: 'Project',
    container: 'border-df-accent-red/20',
    header: 'bg-df-accent-red/5',
    badge: 'border border-df-accent-red/25 bg-df-accent-red/10 text-df-accent-red',
    count: 'border border-df-accent-red/25 bg-df-accent-red/10 text-df-accent-red',
    action: 'hover:text-df-accent-red focus:outline-df-accent-red',
    divider: 'from-df-accent-red/40',
  },
  skills: {
    badgeLabel: 'Skills',
    container: 'border-df-accent-purple/20',
    header: 'bg-df-accent-purple/5',
    badge: 'border border-df-accent-purple/25 bg-df-accent-purple/10 text-df-accent-purple',
    count: 'border border-df-accent-purple/25 bg-df-accent-purple/10 text-df-accent-purple',
    action: 'hover:text-df-accent-purple focus:outline-df-accent-purple',
    divider: 'from-df-accent-purple/40',
  },
};

interface BulletItemProps {
  bullet: BulletLibraryItem;
  parentId: string;
  parentTitle: string;
  role?: string;
  company?: string;
  kind: Extract<SectionKind, 'experience' | 'project'>;
  isSelected: boolean;
  onToggle: () => void;
}

const BulletItem = memo(function BulletItem({
  bullet,
  parentId,
  parentTitle,
  role,
  company,
  kind,
  isSelected,
  onToggle,
}: BulletItemProps) {
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

  const handleRewrite = async (event: React.MouseEvent) => {
    event.stopPropagation();
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
          tone={kind}
        />

        <button
          onClick={handleRewrite}
          disabled={!isConfigured}
          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-df-text-secondary hover:text-df-accent-red disabled:opacity-0 rounded focus:outline-2 focus:outline-df-accent-cyan focus:outline-offset-2"
          title={isConfigured ? 'Rewrite with AI' : 'Configure AI settings first'}
          aria-label={isConfigured ? 'Rewrite bullet with AI' : 'Configure AI settings first'}
        >
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      {showRewriteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-df-surface/95 border border-df-border max-w-lg w-full max-h-[80vh] overflow-y-auto backdrop-blur-md">
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
  kind: SectionKind;
  title: string;
  subtitle?: string;
  items: BulletLibraryItem[];
  parentId?: string;
  parentTitle: string;
  role?: string;
  company?: string;
  onToggleItem?: (itemId: string) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const SectionCard = memo(function SectionCard({
  kind,
  title,
  subtitle,
  items,
  parentId,
  parentTitle,
  role,
  company,
  onToggleItem,
  onSelectAll,
  onDeselectAll,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: SectionCardProps) {
  const selectedCount = items.filter((item) => item.selected).length;
  const hasToggleableItems = items.some((item) => item.toggleable);
  const showBulkActions = (kind === 'experience' || kind === 'project') && items.length > 1;
  const showItems = hasToggleableItems || kind !== 'basics';
  const tone = sectionToneStyles[kind];
  const countLabel = hasToggleableItems ? `${selectedCount} / ${items.length}` : 'Visible';

  return (
    <section className={`bg-df-elevated border ${tone.container}`}>
      <header className={`p-4 border-b border-df-border ${tone.header}`}>
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${tone.badge}`}>
              {tone.badgeLabel}
            </span>
            <h4 className="font-space font-medium text-df-text text-sm mt-2">
              {title}
            </h4>
            {subtitle && (
              <p className="text-xs text-df-text-secondary mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-mono ${tone.count}`}>
              {countLabel}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={onMoveUp}
                disabled={!canMoveUp}
                className={`p-1.5 text-df-text-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-2 focus:outline-offset-2 rounded ${tone.action}`}
                aria-label={`Move ${title} up`}
              >
                <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                onClick={onMoveDown}
                disabled={!canMoveDown}
                className={`p-1.5 text-df-text-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-2 focus:outline-offset-2 rounded ${tone.action}`}
                aria-label={`Move ${title} down`}
              >
                <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {showBulkActions && onSelectAll && onDeselectAll && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={onSelectAll}
              disabled={selectedCount === items.length}
              className={`flex items-center gap-1 px-2 py-1 text-xs text-df-text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-2 focus:outline-offset-2 rounded ${tone.action}`}
              aria-label={`Select all bullets for ${title}`}
            >
              <CheckSquare className="w-3 h-3" aria-hidden="true" />
              Select All
            </button>
            <button
              onClick={onDeselectAll}
              disabled={selectedCount === 0}
              className="flex items-center gap-1 px-2 py-1 text-xs text-df-text-secondary hover:text-df-text disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-2 focus:outline-df-accent-cyan focus:outline-offset-2 rounded"
              aria-label={`Deselect all bullets for ${title}`}
            >
              <Square className="w-3 h-3" aria-hidden="true" />
              Deselect All
            </button>
          </div>
        )}
      </header>

      {showItems && (
        <div className="p-3 space-y-1">
          {items.map((item) => (
            <div key={item.id} className="group">
              {kind === 'experience' || kind === 'project' ? (
                parentId ? (
                  <BulletItem
                    bullet={item}
                    parentId={parentId}
                    parentTitle={parentTitle}
                    role={role}
                    company={company}
                    kind={kind}
                    isSelected={item.selected}
                    onToggle={() => onToggleItem?.(item.id)}
                  />
                ) : null
              ) : (
                <BulletCheckbox
                  bullet={item}
                  isSelected={item.selected}
                  onToggle={() => onToggleItem?.(item.id)}
                  tone={kind}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
});

export const BulletManager = memo(function BulletManager() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Partial<Record<SectionKind, boolean>>>({});
  const {
    resume,
    selectedBullets,
    toggleBullet,
    selectAllBullets,
    deselectAllBullets,
    toggleSectionItem,
    moveSectionItem,
  } = useResume();

  const groups = resume ? buildBulletLibraryGroups(resume, selectedBullets) : [];
  const totalItems = groups.reduce(
    (groupTotal, group) => groupTotal + group.sections.reduce((sectionTotal, section) => sectionTotal + section.items.length, 0),
    0
  );
  const selectedCount = groups.reduce(
    (groupTotal, group) => groupTotal + group.sections.reduce(
      (sectionTotal, section) => sectionTotal + section.items.filter((item) => item.selected).length,
      0
    ),
    0
  );

  const toggleGroup = (groupKind: SectionKind) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupKind]: !prev[groupKind],
    }));
  };

  return (
    <div className="bg-df-surface border-t border-df-border">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-3 flex items-center justify-between hover:bg-df-elevated transition-colors focus:outline-2 focus:outline-df-accent-cyan focus:outline-offset-2"
        aria-expanded={isExpanded}
        aria-controls="bullet-library-content"
        aria-label={`Bullet Library - ${selectedCount} of ${totalItems} items selected`}
      >
        <div className="flex items-center gap-4">
          <span className="font-space font-semibold text-df-text">Bullet Library</span>
          <span className="text-sm text-df-text-secondary" aria-live="polite">
            {selectedCount} / {totalItems} selected
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
          <div className="space-y-8">
            {groups.map((group) => {
              const tone = sectionToneStyles[group.kind];
              const groupTotal = group.sections.reduce((total, section) => total + section.items.length, 0);
              const groupSelected = group.sections.reduce(
                (total, section) => total + section.items.filter((item) => item.selected).length,
                0
              );
              const isGroupCollapsed = collapsedGroups[group.kind] === true;

              return (
                <div key={group.kind} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${tone.badge}`}>
                      {group.label}
                    </span>
                    <span className="text-xs text-df-text-muted">
                      {groupSelected} / {groupTotal} selected
                    </span>
                    <div className={`h-px flex-1 bg-gradient-to-r ${tone.divider} to-transparent`} />
                    <button
                      onClick={() => toggleGroup(group.kind)}
                      className={`p-1.5 rounded-lg text-df-text-secondary hover:bg-df-elevated transition-fluid focus:outline-2 focus:outline-offset-2 ${tone.action}`}
                      aria-expanded={!isGroupCollapsed}
                      aria-controls={`bullet-library-group-${group.kind}`}
                      aria-label={`${isGroupCollapsed ? 'Expand' : 'Collapse'} ${group.label}`}
                    >
                      <div className="relative w-4 h-4 flex items-center justify-center">
                        <Plus
                          className={`w-4 h-4 absolute transition-all duration-300 ${
                            isGroupCollapsed ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'
                          }`}
                          aria-hidden="true"
                        />
                        <Minus
                          className={`w-4 h-4 absolute transition-all duration-300 ${
                            isGroupCollapsed ? '-rotate-90 opacity-0' : 'rotate-0 opacity-100'
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                    </button>
                  </div>
                  {!isGroupCollapsed && (
                    <div id={`bullet-library-group-${group.kind}`} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {group.sections.map((section, index) => (
                        <SectionCard
                          key={section.id}
                          kind={section.kind}
                          title={section.title}
                          subtitle={section.subtitle}
                          items={section.items}
                          parentId={section.kind === 'experience' || section.kind === 'project' ? section.id : undefined}
                          parentTitle={section.title}
                          role={section.role}
                          company={section.company}
                          onToggleItem={
                            section.kind === 'experience' || section.kind === 'project'
                              ? (itemId) => toggleBullet(section.id, itemId)
                              : section.toggleId !== undefined
                              ? () => toggleSectionItem(section.kind as 'basics' | 'education' | 'skills', section.toggleId as string | number)
                              : undefined
                          }
                          onSelectAll={
                            section.kind === 'experience' || section.kind === 'project'
                              ? () => selectAllBullets(section.id)
                              : undefined
                          }
                          onDeselectAll={
                            section.kind === 'experience' || section.kind === 'project'
                              ? () => deselectAllBullets(section.id)
                              : undefined
                          }
                          canMoveUp={index > 0}
                          canMoveDown={index < group.sections.length - 1}
                          onMoveUp={() => moveSectionItem(section.kind, section.moveId, 'up')}
                          onMoveDown={() => moveSectionItem(section.kind, section.moveId, 'down')}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});
