import { useResume } from '@/contexts/resume-context';
import { storage } from '@/lib/storage';
import type { ResumeListItem } from '@/types/resume';
import { useState, useEffect, memo } from 'react';
import { getShortcutHint } from '@/hooks/use-keyboard-shortcuts';

type TabId = 'editor' | 'ai' | 'tailoring' | 'resumes';

interface HeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; shortcut: string; color: string }[] = [
  { id: 'editor', label: 'Editor', shortcut: 'Ctrl/Cmd + 1', color: 'df-accent-cyan' },
  { id: 'ai', label: 'AI Copywriting', shortcut: 'Ctrl/Cmd + 2', color: 'df-accent-purple' },
  { id: 'tailoring', label: 'Tailoring', shortcut: 'Ctrl/Cmd + 3', color: 'df-accent-green' },
  { id: 'resumes', label: 'My Resumes', shortcut: 'Ctrl/Cmd + 4', color: 'df-accent-amber' },
];

function HeaderComponent({ activeTab, onTabChange }: HeaderProps) {
  const { currentResumeId, loadResume, createNewResume } = useResume();
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);

  useEffect(() => {
    setResumes(storage.getResumeList());
  }, [currentResumeId]);

  return (
    <header 
      className="bg-df-surface border-b border-df-border h-16 flex items-center justify-between px-8"
      role="banner"
    >
      <div className="flex items-center pl-8">
        <h1 className="font-bebas text-2xl text-df-text tracking-wider">
          YAML Resume Builder
        </h1>
      </div>

      {resumes.length > 1 && (
        <div className="flex items-center">
          <label htmlFor="resume-selector" className="sr-only">Select Resume</label>
          <select
            id="resume-selector"
            value={currentResumeId || ''}
            onChange={(e) => e.target.value === 'new' ? createNewResume() : loadResume(e.target.value)}
            className="bg-df-elevated text-df-text text-sm px-3 py-1 border border-df-border focus:border-df-accent-cyan focus:outline-2 focus:outline-df-accent-cyan"
            aria-label="Select or create a resume"
          >
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
            <option value="new">+ New Resume</option>
          </select>
        </div>
      )}

      <nav className="flex items-center gap-2" role="navigation" aria-label="Main navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-8 py-4 text-sm font-space transition-colors border-b-2 focus:outline-2 focus:outline-df-accent-cyan focus:outline-offset-2 ${
              activeTab === tab.id
                ? `text-df-text border-${tab.color}`
                : 'text-df-text-secondary border-transparent hover:text-df-text hover:border-df-border'
            }`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            title={`${tab.label} (${getShortcutHint(tab.shortcut)})`}
          >
            <span className={activeTab === tab.id ? `text-${tab.color}` : ''}>
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
    </header>
  );
}

export const Header = memo(HeaderComponent);
