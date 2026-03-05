import { useState, useCallback, useRef } from 'react';
import { useResume } from '@/contexts/resume-context';
import { useSettings } from '@/contexts/settings-context';
import { useTailoring } from '@/hooks/use-tailoring';
import { JobDescriptionInput } from './job-description-input';
import { MatchResults } from './match-results';
import { Sparkles } from 'lucide-react';

export function TailoringPanel() {
  const { resume, selectedBullets, toggleBullet, selectAllBullets, deselectAllBullets } = useResume();
  const { apiKey, baseUrl, model } = useSettings();
  const { isAnalyzing, results, error, analyzeJobDescription, selectBestBullets } = useTailoring();
  const [jobDescription, setJobDescription] = useState('');
  const originalSelectionsRef = useRef<Map<string, string[]>>(new Map());

  // Save original selections when analysis starts
  const handleAnalyze = useCallback(async () => {
    if (!resume) return;

    // Save current selections before analysis
    const original = new Map<string, string[]>();
    selectedBullets.forEach((bullets, parentId) => {
      original.set(parentId, [...bullets]);
    });
    originalSelectionsRef.current = original;

    await analyzeJobDescription({
      jobDescription,
      resume,
      config: {
        apiKey,
        baseUrl,
        model,
      },
    });
  }, [jobDescription, resume, apiKey, baseUrl, model, analyzeJobDescription, selectedBullets]);

  const handleSelectBest = useCallback(() => {
    const bestSelections = selectBestBullets(results);
    
    // Apply selections
    bestSelections.forEach((bullets, parentId) => {
      // First deselect all
      deselectAllBullets(parentId);
      // Then select the best ones
      bullets.forEach((bulletId) => {
        toggleBullet(parentId, bulletId);
      });
    });
  }, [results, selectBestBullets, toggleBullet, deselectAllBullets]);

  const handleReset = useCallback(() => {
    const original = originalSelectionsRef.current;
    
    if (original.size === 0) {
      // If no original saved, select all bullets
      if (resume) {
        resume.experience.forEach((exp) => selectAllBullets(exp.id));
        resume.projects.forEach((proj) => selectAllBullets(proj.id));
      }
      return;
    }
    
    // Restore original selections
    // First deselect all
    if (resume) {
      resume.experience.forEach((exp) => deselectAllBullets(exp.id));
      resume.projects.forEach((proj) => deselectAllBullets(proj.id));
      
      // Then restore selections
      original.forEach((bullets, parentId) => {
        bullets.forEach((bulletId) => {
          toggleBullet(parentId, bulletId);
        });
      });
    }
  }, [originalSelectionsRef, resume, toggleBullet, selectAllBullets, deselectAllBullets]);

  const hasResults = results.length > 0;

  return (
    <div className="h-full flex flex-col pt-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-df-accent-cyan" />
          <h2 className="font-space font-semibold text-df-text">Job Tailoring</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Job Description Input */}
        <JobDescriptionInput
          value={jobDescription}
          onChange={setJobDescription}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          error={error}
        />

        {/* Match Results */}
        {hasResults && resume && (
          <MatchResults
            results={results}
            resume={resume}
            selectedBullets={selectedBullets}
            onToggleBullet={toggleBullet}
            onSelectBest={handleSelectBest}
            onReset={handleReset}
          />
        )}

        {/* Empty State */}
        {!hasResults && !isAnalyzing && (
          <div className="text-center py-8">
            <p className="text-sm text-df-text-secondary">
              Paste a job description and click Analyze to see how your bullets match.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
