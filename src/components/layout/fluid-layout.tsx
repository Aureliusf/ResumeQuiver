import { useState, useCallback, memo, useEffect } from 'react';
import { Header } from './header';
import { FloatingSidebar } from './floating-sidebar';
import { PreviewPanel } from './preview-panel';
import { WorkspacePanel } from './workspace-panel';
import { ResizeHandle } from './resize-handle';
import { FloatingResetButton } from './floating-reset-button';
import { KeyboardShortcutsModal } from '@/components/help/keyboard-shortcuts-modal';
import { useResume } from '@/contexts/resume-context';
import { useSettings } from '@/contexts/settings-context';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { showSuccessToast } from '@/lib/toast';
import { themes, applyTheme } from '@/lib/themes';
import { useResizablePanels } from '@/hooks/use-resizable-panels';

type TabId = 'editor' | 'ai' | 'tailoring' | 'resumes';

function FluidLayoutComponent() {
  const [activeTab, setActiveTab] = useState<TabId>('editor');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const { saveResume, createNewResume } = useResume();
  const { theme: currentTheme } = useSettings();
  
  // Use resizable panels
  const { sidebar, workspace, resetAll } = useResizablePanels();

  // Apply theme
  useEffect(() => {
    const theme = themes.find((t) => t.id === currentTheme);
    if (theme) {
      applyTheme(theme);
    }
  }, [currentTheme]);

  // Keyboard shortcuts
  const handleSave = useCallback(() => {
    saveResume();
    showSuccessToast.resumeSaved();
  }, [saveResume]);

  const handleNewResume = useCallback(() => {
    createNewResume();
    showSuccessToast.resumeCreated();
  }, [createNewResume]);

  const handleSwitchTab = useCallback((tab: TabId) => {
    setActiveTab(tab);
  }, []);

  useKeyboardShortcuts({
    onSave: handleSave,
    onNewResume: handleNewResume,
    onOpenResumes: () => setActiveTab('resumes'),
    onSwitchTab: handleSwitchTab,
  });

  // Calculate preview width (fills remaining space)
  const previewWidth = `calc(100% - ${sidebar.width + workspace.width}px)`;

  return (
    <div className="min-h-screen bg-df-primary bg-grid flex flex-col overflow-hidden">
      {/* Header */}
      <Header 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      {/* Main Layout */}
      <div className="flex-1 flex relative">
        {/* Floating Sidebar - Resizable */}
        <div 
          className="relative flex flex-col bg-df-surface border-r border-df-border flex-shrink-0 transition-all duration-75"
          style={{ width: sidebarCollapsed ? 56 : sidebar.width }}
        >
          <FloatingSidebar 
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          {!sidebarCollapsed && (
            <ResizeHandle 
              onMouseDown={sidebar.handleMouseDown}
              onTouchStart={sidebar.handleTouchStart}
              isDragging={sidebar.isDragging}
            />
          )}
        </div>

        {/* Preview Panel - Flexible */}
        <div 
          className="flex flex-col bg-df-primary overflow-hidden"
          style={{ width: previewWidth }}
        >
          <PreviewPanel />
        </div>

        {/* Workspace Panel - Resizable */}
        <div 
          className="relative flex flex-col bg-df-surface border-l border-df-border flex-shrink-0"
          style={{ width: workspace.width }}
        >
          <WorkspacePanel activeTab={activeTab} />
          <ResizeHandle 
            onMouseDown={workspace.handleMouseDown}
            onTouchStart={workspace.handleTouchStart}
            isDragging={workspace.isDragging}
            position="left"
          />
        </div>
      </div>

      {/* Floating Reset Button */}
      <FloatingResetButton onReset={resetAll} />

      {/* Help Modal */}
      <KeyboardShortcutsModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
}

export const FluidLayout = memo(FluidLayoutComponent);
