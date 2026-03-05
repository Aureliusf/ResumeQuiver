import { Check, RotateCcw, Sparkles } from 'lucide-react';
import type { MatchResult } from '@/lib/ai-tailoring';
import type { Resume, Experience, Project } from '@/types/resume';
import { getScoreColor } from '@/lib/ai-tailoring';

interface MatchResultsProps {
  results: MatchResult[];
  resume: Resume;
  selectedBullets: Map<string, string[]>;
  onToggleBullet: (parentId: string, bulletId: string) => void;
  onSelectBest: () => void;
  onReset: () => void;
}

interface SectionMatch {
  parent: Experience | Project;
  bullets: Array<{
    bulletId: string;
    text: string;
    score: number;
    matchedKeywords: string[];
  }>;
  averageScore: number;
}

export function MatchResults({
  results,
  resume,
  selectedBullets,
  onToggleBullet,
  onSelectBest,
  onReset,
}: MatchResultsProps) {
  // Group results by section
  const sections = getSectionsWithMatches(results, resume);

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-space font-semibold text-df-text">
          Match Results
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onSelectBest}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-df-accent-cyan text-df-primary text-xs font-medium hover:bg-df-accent-cyan/90 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Auto-Select Best
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-df-border text-df-text-secondary text-xs font-medium hover:bg-df-surface transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset to Default
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <SectionMatches
            key={section.parent.id}
            section={section}
            selectedBullets={selectedBullets}
            onToggleBullet={onToggleBullet}
          />
        ))}
      </div>
    </div>
  );
}

interface SectionMatchesProps {
  section: SectionMatch;
  selectedBullets: Map<string, string[]>;
  onToggleBullet: (parentId: string, bulletId: string) => void;
}

function getSectionTitle(parent: Experience | Project): string {
  if ('company' in parent && 'role' in parent) {
    return `${parent.role} at ${parent.company}`;
  }
  return parent.name;
}

function SectionMatches({
  section,
  selectedBullets,
  onToggleBullet,
}: SectionMatchesProps) {
  const title = getSectionTitle(section.parent);

  const scoreColors = getScoreColor(section.averageScore);

  return (
    <div className="border border-df-border bg-df-surface">
      <div className="flex items-center justify-between px-3 py-2 border-b border-df-border bg-df-elevated">
        <h4 className="text-xs font-space font-medium text-df-text truncate pr-2">
          {title}
        </h4>
        <span
          className={`text-xs font-mono px-2 py-0.5 ${scoreColors.bg} ${scoreColors.text}`}
        >
          {Math.round(section.averageScore)}
        </span>
      </div>

      <div className="divide-y divide-df-border">
        {section.bullets
          .sort((a, b) => b.score - a.score)
          .map((bullet) => {
            const isSelected =
              selectedBullets.get(section.parent.id)?.includes(bullet.bulletId) || false;
            const bulletScoreColors = getScoreColor(bullet.score);

            return (
              <div
                key={bullet.bulletId}
                className="flex items-start gap-3 p-3 hover:bg-df-elevated/50 transition-colors"
              >
                <button
                  onClick={() => onToggleBullet(section.parent.id, bullet.bulletId)}
                  className={`mt-0.5 flex-shrink-0 w-4 h-4 border transition-colors ${
                    isSelected
                      ? 'bg-df-accent-cyan border-df-accent-cyan'
                      : 'border-df-border bg-df-primary hover:border-df-text-secondary'
                  }`}
                >
                  {isSelected && (
                    <Check className="w-3 h-3 text-df-primary m-auto" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-df-text leading-relaxed">
                    {bullet.text}
                  </p>

                  {bullet.matchedKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {bullet.matchedKeywords.slice(0, 5).map((keyword) => (
                        <span
                          key={keyword}
                          className="text-[10px] px-1.5 py-0.5 bg-df-accent-cyan/10 text-df-accent-cyan rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <span
                  className={`flex-shrink-0 text-xs font-mono px-2 py-0.5 ${bulletScoreColors.bg} ${bulletScoreColors.text}`}
                >
                  {bullet.score}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

function getSectionsWithMatches(
  results: MatchResult[],
  resume: Resume
): SectionMatch[] {
  const sections: SectionMatch[] = [];

  // Process experience sections
  resume.experience.forEach((exp) => {
    const expResults = results.filter((r) => r.parentId === exp.id);
    if (expResults.length > 0) {
      const bullets = expResults.map((r) => {
        const bullet = exp.bullets.find((b) => b.id === r.bulletId);
        return {
          bulletId: r.bulletId,
          text: bullet?.text || '',
          score: r.score,
          matchedKeywords: r.matchedKeywords,
        };
      });

      const averageScore =
        bullets.reduce((sum, b) => sum + b.score, 0) / bullets.length;

      sections.push({
        parent: exp,
        bullets,
        averageScore,
      });
    }
  });

  // Process project sections
  resume.projects.forEach((proj) => {
    const projResults = results.filter((r) => r.parentId === proj.id);
    if (projResults.length > 0) {
      const bullets = projResults.map((r) => {
        const bullet = proj.bullets.find((b) => b.id === r.bulletId);
        return {
          bulletId: r.bulletId,
          text: bullet?.text || '',
          score: r.score,
          matchedKeywords: r.matchedKeywords,
        };
      });

      const averageScore =
        bullets.reduce((sum, b) => sum + b.score, 0) / bullets.length;

      sections.push({
        parent: proj,
        bullets,
        averageScore,
      });
    }
  });

  // Sort by average score descending
  return sections.sort((a, b) => b.averageScore - a.averageScore);
}
