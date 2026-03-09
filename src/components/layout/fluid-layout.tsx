import { useState, useCallback, memo, useEffect, lazy, Suspense } from 'react';
import { Header } from './header';
import { FloatingSidebar } from './floating-sidebar';
import { PreviewPanel } from './preview-panel';
import { WorkspacePanel } from './workspace-panel';
import { ResizeHandle } from './resize-handle';
import { FloatingResetButton } from './floating-reset-button';
import { useResume } from '@/contexts/resume-context';
import { useSettings } from '@/contexts/settings-context';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { showSuccessToast } from '@/lib/toast';
import { themes, applyTheme } from '@/lib/themes';
import { useResizablePanels } from '@/hooks/use-resizable-panels';

type TabId = 'editor' | 'ai' | 'tailoring' | 'resumes';

const LazyKeyboardShortcutsModal = lazy(() =>
  import('@/components/help/keyboard-shortcuts-modal').then((module) => ({
    default: module.KeyboardShortcutsModal,
  }))
);

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
  const activeSidebarWidth = sidebarCollapsed ? 56 : sidebar.width;
  const previewWidth = `calc(100% - ${activeSidebarWidth + workspace.width}px)`;

  return (
    <div className="min-h-screen bg-df-primary bg-grid flex flex-col overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-df-surface focus:px-4 focus:py-2 focus:text-sm focus:text-df-text"
      >
        Skip to main content
      </a>

      {/* Header */}
      <Header 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      {/* Main Layout */}
      <main id="main-content" tabIndex={-1} className="flex-1 flex relative min-h-0">
        {/* Floating Sidebar - Resizable */}
        <div 
          className="relative flex flex-col bg-df-surface border-r border-df-border flex-shrink-0 transition-all duration-75"
          style={{ width: activeSidebarWidth }}
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
          className="flex min-w-0 flex-col bg-df-primary overflow-hidden"
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
      </main>

      {/* Floating Reset Button */}
      <FloatingResetButton onReset={resetAll} />

      {/* Help Modal */}
      {isHelpModalOpen && (
        <Suspense fallback={null}>
          <LazyKeyboardShortcutsModal
            isOpen={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}

export const FluidLayout = memo(FluidLayoutComponent);
