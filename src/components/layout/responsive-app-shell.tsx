import { useState, useCallback, memo } from 'react';
import { Library, HelpCircle } from 'lucide-react';
import { Header } from './header';
import { LeftPanel } from './left-panel';
import { RightPanel } from './right-panel';
import { BulletManager } from '@/components/bullets/bullet-manager';
import { MobileBulletModal } from './mobile-bullet-modal';
import { MobileNav } from './mobile-nav';
import { KeyboardShortcutsModal } from '@/components/help/keyboard-shortcuts-modal';
import { useResume } from '@/contexts/resume-context';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { showSuccessToast } from '@/lib/toast';

type TabId = 'editor' | 'ai' | 'tailoring' | 'resumes';

function ResponsiveAppShellComponent() {
  const [activeTab, setActiveTab] = useState<TabId>('editor');
  const [isBulletModalOpen, setIsBulletModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  
  const { saveResume, createNewResume } = useResume();

  // Keyboard shortcut handlers
  const handleSave = useCallback(() => {
    saveResume();
    showSuccessToast.resumeSaved();
  }, [saveResume]);

  const handleNewResume = useCallback(() => {
    createNewResume();
    showSuccessToast.resumeCreated();
  }, [createNewResume]);

  const handleOpenResumes = useCallback(() => {
    setActiveTab('resumes');
  }, []);

  const handleGeneratePDF = useCallback(() => {
    // This will be handled by the editor panel's PDF button
    // We trigger a custom event that the editor can listen to
    window.dispatchEvent(new CustomEvent('generate-pdf'));
  }, []);

  const handleSwitchTab = useCallback((tab: TabId) => {
    setActiveTab(tab);
  }, []);

  // Register keyboard shortcuts
  useKeyboardShortcuts({
    onSave: handleSave,
    onGeneratePDF: handleGeneratePDF,
    onNewResume: handleNewResume,
    onOpenResumes: handleOpenResumes,
    onSwitchTab: handleSwitchTab,
  });

  return (
    <div className="bg-df-primary h-screen flex flex-col">
      {/* Mobile Header */}
      <div className="sm:hidden bg-df-surface border-b border-df-border h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
          <h1 className="font-bebas text-xl text-df-text tracking-wider">
            Resume Builder
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="p-2 text-df-text-secondary hover:text-df-accent-cyan transition-colors focus:outline-2 focus:outline-df-accent-cyan focus:outline-offset-2 rounded"
            aria-label="Open keyboard shortcuts help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsBulletModalOpen(true)}
            className="p-2 text-df-text-secondary hover:text-df-accent-cyan transition-colors focus:outline-2 focus:outline-df-accent-cyan focus:outline-offset-2 rounded"
            aria-label="Open bullet library"
          >
            <Library className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:block">
        <Header 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />
      </div>
      
      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-2 sm:gap-4 p-2 sm:p-4 overflow-hidden">
        {/* Mobile: Preview on top (order-1), Editor on bottom (order-2) */}
        {/* Desktop: Preview on left (order-1), Editor on right (order-2) */}
        <div className="order-1 h-full overflow-hidden sm:overflow-y-auto min-h-0">
          <LeftPanel />
        </div>
        <div className="order-2 h-full overflow-hidden min-h-0">
          <RightPanel activeTab={activeTab} />
        </div>
      </main>

      {/* Desktop Bullet Manager */}
      <div className="hidden sm:block">
        <BulletManager />
      </div>

      {/* Mobile Bullet Modal */}
      <MobileBulletModal 
        isOpen={isBulletModalOpen} 
        onClose={() => setIsBulletModalOpen(false)} 
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
}

export const ResponsiveAppShell = memo(ResponsiveAppShellComponent);
