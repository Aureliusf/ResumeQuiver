import { useState, memo, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Target, 
  Briefcase, 
  ChevronLeft,
  Plus,
  HelpCircle
} from 'lucide-react';
import { useResume } from '@/contexts/resume-context';
import { storage } from '@/lib/storage';
import type { ResumeListItem } from '@/types/resume';
import { getShortcutHint } from '@/hooks/use-keyboard-shortcuts';

type TabId = 'editor' | 'ai' | 'tailoring' | 'resumes';

interface HeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onOpenHelp: () => void;
}

const tabs: { 
  id: TabId; 
  label: string; 
  icon: typeof FileText;
  shortcut: string; 
  color: string;
  description: string;
}[] = [
  { 
    id: 'editor', 
    label: 'Editor', 
    icon: FileText,
    shortcut: 'Ctrl/Cmd + 1', 
    color: 'text-df-accent-cyan',
    description: 'Edit resume content'
  },
  { 
    id: 'ai', 
    label: 'AI Assistant', 
    icon: Sparkles,
    shortcut: 'Ctrl/Cmd + 2', 
    color: 'text-df-accent-purple',
    description: 'AI-powered writing'
  },
  { 
    id: 'tailoring', 
    label: 'Tailor', 
    icon: Target,
    shortcut: 'Ctrl/Cmd + 3', 
    color: 'text-df-accent-green',
    description: 'Match job descriptions'
  },
  { 
    id: 'resumes', 
    label: 'Resumes', 
    icon: Briefcase,
    shortcut: 'Ctrl/Cmd + 4', 
    color: 'text-df-accent-amber',
    description: 'Manage resumes'
  },
];

function HeaderComponent({ activeTab, onTabChange, onOpenHelp }: HeaderProps) {
  const { currentResumeId, loadResume, createNewResume, resume } = useResume();
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [showResumeDropdown, setShowResumeDropdown] = useState(false);

  useEffect(() => {
    setResumes(storage.getResumeList());
  }, [currentResumeId]);

  return (
    <header className="glass border-b border-df-border h-16 flex items-center justify-between px-6 z-50">
      {/* Left: Logo & Resume Selector */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-df-accent-red to-df-accent-cyan flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-bebas text-xl text-df-text tracking-wider hidden sm:block">
            Resume Builder
          </h1>
        </div>

        {/* Resume Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowResumeDropdown(!showResumeDropdown)}
            className="flex items-center gap-2 px-5 py-2.5 bg-df-elevated hover:bg-df-elevated-2 border border-df-border rounded-lg text-sm text-df-text-secondary hover:text-df-text transition-fluid"
            aria-controls="resume-selector-menu"
            aria-expanded={showResumeDropdown}
            aria-haspopup="menu"
            aria-label={`Select resume. Current resume: ${resume?.basics.name || 'Untitled Resume'}`}
          >
            <span className="max-w-[150px] truncate">
              {resume?.basics.name || 'Untitled Resume'}
            </span>
            <ChevronLeft className={`w-4 h-4 transition-transform ${showResumeDropdown ? '-rotate-90' : ''}`} />
          </button>

          {showResumeDropdown && (
            <div
              id="resume-selector-menu"
              className="absolute top-full left-0 mt-2 w-64 bg-df-surface/95 border border-df-border rounded-xl shadow-2xl overflow-hidden z-50 content-fade-in backdrop-blur-md"
            >
              <div className="p-2">
                <p className="text-xs text-df-text-muted px-3 py-2 uppercase tracking-wider">Your Resumes</p>
                {resumes.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      loadResume(r.id);
                      setShowResumeDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-fluid ${
                      r.id === currentResumeId 
                        ? 'bg-df-accent-cyan/10 text-df-accent-cyan' 
                        : 'text-df-text-secondary hover:text-df-text hover:bg-df-elevated'
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
                <div className="border-t border-df-border my-2" />
                <button
                  type="button"
                  onClick={() => {
                    createNewResume();
                    setShowResumeDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-df-accent-cyan hover:bg-df-accent-cyan/10 transition-fluid"
                >
                  <Plus className="w-4 h-4" />
                  New Resume
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Tab Navigation */}
      <nav className="hidden md:flex items-center gap-1 bg-df-surface/50 rounded-full p-1.5 border border-df-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                isActive 
                  ? 'bg-df-elevated text-df-text shadow-lg' 
                  : 'text-df-text-secondary hover:text-df-text hover:bg-df-elevated/50'
              }`}
              title={`${tab.label} (${getShortcutHint(tab.shortcut)})`}
            >
              <Icon className={`w-4 h-4 ${isActive ? tab.color : ''}`} />
              <span className="hidden lg:inline">{tab.label}</span>
              {isActive && (
                <span className={`absolute inset-0 rounded-full border border-${tab.color.replace('text-', '')}/30`} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenHelp}
          className="p-2 text-df-text-secondary hover:text-df-text hover:bg-df-elevated rounded-lg transition-fluid"
          title="Keyboard shortcuts"
          aria-label="Open keyboard shortcuts"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

export const Header = memo(HeaderComponent);
