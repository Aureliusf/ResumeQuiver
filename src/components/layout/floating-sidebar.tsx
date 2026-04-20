import { memo, useState, type KeyboardEvent } from 'react';
import {
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Library,
  Minus,
  Plus,
} from 'lucide-react';
import { useResume } from '@/contexts/resume-context';
import { useBulletLibraryDnd } from '@/hooks/use-bullet-library-dnd';
import {
  buildBulletLibraryGroups,
  type BulletLibrarySection,
  type BulletLibrarySectionKind,
} from '@/lib/bullet-library';

interface FloatingSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

type SectionKind = BulletLibrarySectionKind;

const sectionToneStyles: Record<SectionKind, {
  groupBadge: string;
  divider: string;
  cardBorder: string;
  cardSurface: string;
  badge: string;
  icon: string;
  count: string;
  rowSelected: string;
  rowHover: string;
  checkboxSelected: string;
  moveAction: string;
  indicator: string;
}> = {
  basics: {
    groupBadge: 'border border-df-accent-amber/25 bg-df-accent-amber/10 text-df-accent-amber',
    divider: 'from-df-accent-amber/40',
    cardBorder: 'border-df-accent-amber/20',
    cardSurface: 'bg-df-accent-amber/5',
    badge: 'border border-df-accent-amber/25 bg-df-accent-amber/10 text-df-accent-amber',
    icon: 'text-df-accent-amber',
    count: 'text-df-accent-amber',
    rowSelected: 'bg-df-accent-amber/10 text-df-text',
    rowHover: 'hover:bg-df-accent-amber/5 hover:text-df-text',
    checkboxSelected: 'bg-df-accent-amber border-df-accent-amber',
    moveAction: 'hover:text-df-accent-amber',
    indicator: 'bg-df-accent-amber',
  },
  education: {
    groupBadge: 'border border-df-accent-green/25 bg-df-accent-green/10 text-df-accent-green',
    divider: 'from-df-accent-green/40',
    cardBorder: 'border-df-accent-green/20',
    cardSurface: 'bg-df-accent-green/5',
    badge: 'border border-df-accent-green/25 bg-df-accent-green/10 text-df-accent-green',
    icon: 'text-df-accent-green',
    count: 'text-df-accent-green',
    rowSelected: 'bg-df-accent-green/10 text-df-text',
    rowHover: 'hover:bg-df-accent-green/5 hover:text-df-text',
    checkboxSelected: 'bg-df-accent-green border-df-accent-green',
    moveAction: 'hover:text-df-accent-green',
    indicator: 'bg-df-accent-green',
  },
  experience: {
    groupBadge: 'border border-df-accent-cyan/25 bg-df-accent-cyan/10 text-df-accent-cyan',
    divider: 'from-df-accent-cyan/40',
    cardBorder: 'border-df-accent-cyan/20',
    cardSurface: 'bg-df-accent-cyan/5',
    badge: 'border border-df-accent-cyan/25 bg-df-accent-cyan/10 text-df-accent-cyan',
    icon: 'text-df-accent-cyan',
    count: 'text-df-accent-cyan',
    rowSelected: 'bg-df-accent-cyan/10 text-df-text',
    rowHover: 'hover:bg-df-accent-cyan/5 hover:text-df-text',
    checkboxSelected: 'bg-df-accent-cyan border-df-accent-cyan',
    moveAction: 'hover:text-df-accent-cyan',
    indicator: 'bg-df-accent-cyan',
  },
  project: {
    groupBadge: 'border border-df-accent-red/25 bg-df-accent-red/10 text-df-accent-red',
    divider: 'from-df-accent-red/40',
    cardBorder: 'border-df-accent-red/20',
    cardSurface: 'bg-df-accent-red/5',
    badge: 'border border-df-accent-red/25 bg-df-accent-red/10 text-df-accent-red',
    icon: 'text-df-accent-red',
    count: 'text-df-accent-red',
    rowSelected: 'bg-df-accent-red/10 text-df-text',
    rowHover: 'hover:bg-df-accent-red/5 hover:text-df-text',
    checkboxSelected: 'bg-df-accent-red border-df-accent-red',
    moveAction: 'hover:text-df-accent-red',
    indicator: 'bg-df-accent-red',
  },
  skills: {
    groupBadge: 'border border-df-accent-purple/25 bg-df-accent-purple/10 text-df-accent-purple',
    divider: 'from-df-accent-purple/40',
    cardBorder: 'border-df-accent-purple/20',
    cardSurface: 'bg-df-accent-purple/5',
    badge: 'border border-df-accent-purple/25 bg-df-accent-purple/10 text-df-accent-purple',
    icon: 'text-df-accent-purple',
    count: 'text-df-accent-purple',
    rowSelected: 'bg-df-accent-purple/10 text-df-text',
    rowHover: 'hover:bg-df-accent-purple/5 hover:text-df-text',
    checkboxSelected: 'bg-df-accent-purple border-df-accent-purple',
    moveAction: 'hover:text-df-accent-purple',
    indicator: 'bg-df-accent-purple',
  },
};

function FloatingSidebarComponent({ collapsed, onToggle }: FloatingSidebarProps) {
  const {
    resume,
    selectedBullets,
    toggleBullet,
    selectAllBullets,
    deselectAllBullets,
    toggleSectionItem,
    moveSectionItem,
    moveSectionItemToIndex,
  } = useResume();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Partial<Record<SectionKind, boolean>>>({});
  const {
    draggedSectionId,
    startDrag,
    updateDropTarget,
    dropOnSection,
    getDropPosition,
    clearDragState,
  } = useBulletLibraryDnd({
    onReorder: moveSectionItemToIndex,
  });

  if (!resume) return null;

  const groups = buildBulletLibraryGroups(resume, selectedBullets);
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

  const getSectionState = (section: BulletLibrarySection) => {
    const selectedInSection = section.items.filter((item) => item.selected).length;
    const isToggleable = section.items.some((item) => item.toggleable);

    return {
      selectedInSection,
      isToggleable,
      isVisible: section.visible ?? (!isToggleable || selectedInSection > 0),
      isExpandable: section.kind !== 'basics',
    };
  };

  const toggleSectionVisibility = (section: BulletLibrarySection) => {
    if (section.kind === 'experience' || section.kind === 'education') {
      const selectedIds = selectedBullets.get(section.id) || [];
      if (selectedIds.length > 0) {
        deselectAllBullets(section.id);
      } else {
        selectAllBullets(section.id);
      }
      return;
    }

    if (
      (section.kind === 'basics' || section.kind === 'project' || section.kind === 'skills') &&
      section.toggleId !== undefined
    ) {
      toggleSectionItem(section.kind, section.toggleId);
    }
  };

  const toggleGroup = (groupKind: SectionKind) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupKind]: !prev[groupKind],
    }));
  };

  const handleMoveKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    section: BulletLibrarySection
  ) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveSectionItem(section.kind, section.moveId, 'up');
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveSectionItem(section.kind, section.moveId, 'down');
    }
  };

  return (
    <aside id="bullet-library-panel" className="relative flex flex-col h-full w-full">
      <button
        type="button"
        onClick={onToggle}
        className="absolute -right-3 top-6 w-6 h-6 bg-df-elevated border border-df-border rounded-full flex items-center justify-center text-df-text-secondary hover:text-df-text hover:border-df-accent-cyan transition-all z-20"
        aria-controls="bullet-library-panel"
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Expand bullet library' : 'Collapse bullet library'}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      <div className={`p-4 border-b border-df-border flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <Library className="w-5 h-5 text-df-accent-cyan flex-shrink-0" />
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-medium text-df-text truncate">Bullet Library</h2>
            <p className="text-xs text-df-text-muted">
              {selectedCount} of {totalItems} selected
            </p>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {groups.map((group) => {
            const tone = sectionToneStyles[group.kind];
            const groupTotal = group.sections.reduce((total, section) => total + section.items.length, 0);
            const groupSelected = group.sections.reduce(
              (total, section) => total + section.items.filter((item) => item.selected).length,
              0
            );
            const isGroupCollapsed = collapsedGroups[group.kind] === true;

            return (
              <div key={group.kind} className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${tone.groupBadge}`}>
                    {group.label}
                  </span>
                  <span className="text-[11px] text-df-text-muted">
                    {groupSelected}/{groupTotal} selected
                  </span>
                  <div className={`h-px flex-1 bg-gradient-to-r ${tone.divider} to-transparent`} />
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.kind)}
                    className={`p-1.5 rounded-lg text-df-text-secondary hover:bg-df-elevated transition-fluid focus:outline-2 focus:outline-offset-2 ${tone.moveAction}`}
                    aria-expanded={!isGroupCollapsed}
                    aria-controls={`floating-bullet-group-${group.kind}`}
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
                  <div id={`floating-bullet-group-${group.kind}`} className="space-y-3">
                    {group.sections.map((section) => {
                      const { selectedInSection, isToggleable, isVisible, isExpandable } = getSectionState(section);
                      const isExpanded = activeSection === section.id;
                      const dropPosition = getDropPosition(group.kind, section.id);
                      const isDragging = draggedSectionId === section.id;

                      return (
                        <div
                          key={section.id}
                          onDragOver={(event) => updateDropTarget(event, group.kind, section.id)}
                          onDrop={(event) => dropOnSection(event, group.kind, group.sections, section.id)}
                          className={`relative rounded-xl border overflow-hidden transition-all duration-300 ${
                            isVisible ? `${tone.cardBorder} bg-df-elevated/50` : `border-df-border/50 ${tone.cardSurface} opacity-60`
                          } ${isDragging ? 'opacity-45' : ''}`}
                        >
                          {dropPosition === 'before' && (
                            <div className={`absolute left-4 right-4 top-0 h-0.5 rounded-full pointer-events-none ${tone.indicator}`} />
                          )}
                          {dropPosition === 'after' && (
                            <div className={`absolute left-4 right-4 bottom-0 h-0.5 rounded-full pointer-events-none ${tone.indicator}`} />
                          )}
                          <div className="w-full flex items-center justify-between p-5 transition-fluid">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              {isToggleable ? (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    toggleSectionVisibility(section);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-df-elevated-2 transition-fluid flex-shrink-0"
                                  title={isVisible ? 'Hide from resume' : 'Show in resume'}
                                  aria-label={`${isVisible ? 'Hide' : 'Show'} ${section.title}`}
                                >
                                  {isVisible ? (
                                    <Eye className={`w-4 h-4 ${tone.icon}`} />
                                  ) : (
                                    <EyeOff className="w-4 h-4 text-df-text-muted" />
                                  )}
                                </button>
                              ) : (
                                <span className={`mt-1 h-2 w-2 rounded-full ${tone.count}`} aria-hidden="true" />
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${tone.badge}`}>
                                    {group.label}
                                  </span>
                                  <span className={`text-xs font-mono ${tone.count}`}>
                                    {isToggleable ? `${selectedInSection}/${section.items.length}` : 'Visible'}
                                  </span>
                                </div>
                                <span className={`text-sm font-medium text-left pr-3 flex-1 break-words block mt-2 ${
                                  isVisible ? 'text-df-text' : 'text-df-text-secondary'
                                }`}>
                                  {section.title}
                                </span>
                                {section.subtitle && (
                                  <p className="text-xs text-df-text-muted mt-1 break-words">
                                    {section.subtitle}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                              <button
                                type="button"
                                draggable
                                onDragStart={(event) => startDrag(event, group.kind, section)}
                                onDragEnd={clearDragState}
                                onKeyDown={(event) => handleMoveKeyDown(event, section)}
                                className={`p-1.5 rounded-lg hover:bg-df-elevated-2 transition-fluid text-df-text-secondary cursor-grab active:cursor-grabbing focus:outline-2 focus:outline-offset-2 ${tone.moveAction}`}
                                title={`Drag to reorder ${section.title}`}
                                aria-label={`Drag to reorder ${section.title}. Use arrow keys to move with the keyboard.`}
                              >
                                <span className="inline-block rotate-90 text-lg leading-none select-none" aria-hidden="true">
                                  ⠿
                                </span>
                              </button>
                              {isExpandable && (
                                <button
                                  type="button"
                                  onClick={() => setActiveSection(isExpanded ? null : section.id)}
                                  className="p-1.5 rounded-lg hover:bg-df-elevated-2 transition-fluid"
                                  title={isExpanded ? 'Collapse section' : 'Expand section'}
                                  aria-expanded={isExpanded}
                                  aria-controls={`bullet-section-items-${section.id}`}
                                  aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${section.title}`}
                                >
                                  <div className="relative w-4 h-4 flex items-center justify-center">
                                    <Plus
                                      className={`w-4 h-4 text-df-text-secondary absolute transition-all duration-300 ${
                                        isExpanded ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
                                      }`}
                                    />
                                    <Minus
                                      className={`w-4 h-4 ${tone.icon} absolute transition-all duration-300 ${
                                        isExpanded ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
                                      }`}
                                    />
                                  </div>
                                </button>
                              )}
                            </div>
                          </div>

                          {isExpandable && isExpanded && (
                            <div
                              id={`bullet-section-items-${section.id}`}
                              className="border-t border-df-border p-3 space-y-2"
                            >
                              {section.items.map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    if (section.kind === 'experience' || section.kind === 'project' || section.kind === 'education') {
                                      toggleBullet(section.id, item.id);
                                      return;
                                    }

                                    if (section.kind === 'skills' && section.toggleId !== undefined) {
                                      toggleSectionItem(section.kind, section.toggleId);
                                    }
                                  }}
                                  className={`w-full flex items-start gap-3 p-3 rounded-lg text-left text-sm transition-all ${
                                    item.selected ? tone.rowSelected : `text-df-text-secondary ${tone.rowHover}`
                                  }`}
                                >
                                  <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                                    item.selected ? tone.checkboxSelected : 'border-df-border'
                                  }`}>
                                    {item.selected && (
                                      <CheckSquare className="w-3.5 h-3.5 text-df-primary" />
                                    )}
                                  </div>
                                  <span className={`break-words whitespace-normal leading-relaxed ${item.selected ? '' : 'opacity-60'}`}>
                                    {item.text}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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
