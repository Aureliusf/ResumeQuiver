import { useState, memo } from 'react';
import { Menu, X } from 'lucide-react';

type TabId = 'editor' | 'ai' | 'tailoring' | 'resumes';

interface MobileNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string }[] = [
  { id: 'editor', label: 'Editor' },
  { id: 'ai', label: 'AI Copywriting' },
  { id: 'tailoring', label: 'Tailoring' },
  { id: 'resumes', label: 'My Resumes' },
];

function MobileNavComponent({ activeTab, onTabChange }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTabClick = (tabId: TabId) => {
    onTabChange(tabId);
    setIsOpen(false);
  };

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-df-text hover:text-df-accent-cyan transition-colors focus:outline-2 focus:outline-df-accent-cyan focus:outline-offset-2 rounded"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-menu"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <nav 
            id="mobile-nav-menu"
            className="absolute top-16 left-0 right-0 bg-df-surface border-b border-df-border z-50"
          >
            <div className="p-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full text-left px-4 py-3 font-space font-medium transition-colors focus:outline-2 focus:outline-df-accent-cyan focus:outline-offset-2 rounded ${
                    activeTab === tab.id
                      ? 'text-df-text bg-df-accent-red/10 border-l-2 border-df-accent-red'
                      : 'text-df-text-secondary hover:text-df-text hover:bg-df-elevated'
                  }`}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}

export const MobileNav = memo(MobileNavComponent);
