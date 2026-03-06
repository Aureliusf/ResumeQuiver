import { memo, useState } from 'react';
import { 
  Library, 
  ChevronLeft, 
  ChevronRight,
  CheckSquare,
  Eye,
  EyeOff,
  Plus,
  Minus
} from 'lucide-react';
import { useResume } from '@/contexts/resume-context';

interface FloatingSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface BulletSection {
  id: string;
  title: string;
  bullets: { id: string; text: string }[];
}

function FloatingSidebarComponent({ collapsed, onToggle }: FloatingSidebarProps) {
  const { resume, selectedBullets, toggleBullet, selectAllBullets, deselectAllBullets } = useResume();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  if (!resume) return null;

  // Build sections from resume data
  const sections: BulletSection[] = [
    ...resume.experience.map(exp => ({
      id: exp.id,
      title: `${exp.role} @ ${exp.company}`,
      bullets: exp.bullets
    })),
    ...resume.projects.map(proj => ({
      id: proj.id,
      title: proj.name,
      bullets: proj.bullets
    }))
  ];

  const totalBullets = sections.reduce((acc, s) => acc + s.bullets.length, 0);
  const selectedCount = Array.from(selectedBullets.values()).reduce((acc, ids) => acc + ids.length, 0);

  // Check if a section is visible (has any bullets selected)
  const isSectionVisible = (sectionId: string) => {
    const selectedIds = selectedBullets.get(sectionId) || [];
    const section = sections.find(s => s.id === sectionId);
    if (!section) return false;
    return selectedIds.length > 0;
  };

  // Toggle section visibility
  const toggleSectionVisibility = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const selectedIds = selectedBullets.get(sectionId) || [];
    if (selectedIds.length > 0) {
      // Hide section (deselect all bullets)
      deselectAllBullets(sectionId);
    } else {
      // Show section (select all bullets)
      selectAllBullets(sectionId);
    }
  };

  return (
    <aside 
      className="relative flex flex-col h-full w-full overflow-hidden"
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 w-6 h-6 bg-df-elevated border border-df-border rounded-full flex items-center justify-center text-df-text-secondary hover:text-df-text hover:border-df-accent-cyan transition-all z-20"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {/* Header */}
      <div className={`p-4 border-b border-df-border flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <Library className="w-5 h-5 text-df-accent-cyan flex-shrink-0" />
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-medium text-df-text truncate">Bullet Library</h2>
            <p className="text-xs text-df-text-muted">
              {selectedCount} of {totalBullets} selected
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {sections.map((section) => {
            const isExpanded = activeSection === section.id;
            const selectedIds = selectedBullets.get(section.id) || [];
            const selectedInSection = section.bullets.filter(b => selectedIds.includes(b.id));
            const isVisible = isSectionVisible(section.id);

            return (
              <div 
                key={section.id}
                className={`bg-df-elevated/50 rounded-xl border overflow-hidden transition-all duration-300 ${
                  isVisible ? 'border-df-border' : 'border-df-border/50 opacity-60'
                }`}
              >
                {/* Section Header */}
                <div className="w-full flex items-center justify-between p-4 hover:bg-df-elevated transition-fluid">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Show/Hide Section Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSectionVisibility(section.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-df-elevated-2 transition-fluid flex-shrink-0"
                      title={isVisible ? 'Hide from resume' : 'Show in resume'}
                    >
                      {isVisible ? (
                        <Eye className="w-4 h-4 text-df-accent-cyan" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-df-text-muted" />
                      )}
                    </button>
                    <span className={`text-sm font-medium text-left pr-3 flex-1 break-words ${
                      isVisible ? 'text-df-text' : 'text-df-text-secondary'
                    }`}>
                      {section.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-df-text-muted whitespace-nowrap">
                      {selectedInSection.length}/{section.bullets.length}
                    </span>
                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => setActiveSection(isExpanded ? null : section.id)}
                      className="p-1.5 rounded-lg hover:bg-df-elevated-2 transition-fluid"
                      title={isExpanded ? 'Collapse section' : 'Expand section'}
                    >
                      <div className="relative w-4 h-4 flex items-center justify-center">
                        <Plus 
                          className={`w-4 h-4 text-df-text-secondary absolute transition-all duration-300 ${
                            isExpanded ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
                          }`}
                        />
                        <Minus 
                          className={`w-4 h-4 text-df-accent-cyan absolute transition-all duration-300 ${
                            isExpanded ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
                          }`}
                        />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Bullets */}
                {isExpanded && (
                  <div className="border-t border-df-border p-3 space-y-2">
                    {section.bullets.map((bullet) => {
                      const isSelected = selectedIds.includes(bullet.id);
                      
                      return (
                        <button
                          key={bullet.id}
                          onClick={() => toggleBullet(section.id, bullet.id)}
                          className={`w-full flex items-start gap-3 p-3 rounded-lg text-left text-sm transition-all ${
                            isSelected 
                              ? 'bg-df-accent-cyan/10 text-df-text' 
                              : 'text-df-text-secondary hover:text-df-text hover:bg-df-elevated-2'
                          }`}
                        >
                          <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected 
                              ? 'bg-df-accent-cyan border-df-accent-cyan' 
                              : 'border-df-border'
                          }`}>
                            {isSelected && (
                              <CheckSquare className="w-3.5 h-3.5 text-df-primary" />
                            )}
                          </div>
                          <span className={`break-words whitespace-normal leading-relaxed ${isSelected ? '' : 'opacity-60'}`}>
                            {bullet.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Collapsed Icons */}
      {collapsed && (
        <div className="flex-1 flex flex-col items-center py-4 gap-4">
          <div className="relative">
            <Library className="w-5 h-5 text-df-accent-cyan" />
            {selectedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-df-accent-cyan text-df-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                {selectedCount}
              </span>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

export const FloatingSidebar = memo(FloatingSidebarComponent);
