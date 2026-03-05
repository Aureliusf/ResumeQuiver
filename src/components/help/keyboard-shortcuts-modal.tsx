import { X, Command, CornerDownLeft } from 'lucide-react';
import { keyboardShortcuts, getShortcutHint } from '@/hooks/use-keyboard-shortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-title"
    >
      <div className="bg-df-surface border border-df-border max-w-lg w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-df-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Command className="w-5 h-5 text-df-accent-cyan" />
            <h2 
              id="keyboard-shortcuts-title" 
              className="font-space font-semibold text-df-text"
            >
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-df-text-secondary hover:text-df-text focus:outline-2 focus:outline-df-accent-red focus:outline-offset-2 rounded"
            aria-label="Close keyboard shortcuts modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {keyboardShortcuts.map((shortcut, index) => (
              <div 
                key={index}
                className="flex items-center justify-between py-2 border-b border-df-border last:border-0"
              >
                <span className="text-df-text text-sm">
                  {shortcut.description}
                </span>
                <kbd className="flex items-center gap-1 px-2 py-1 bg-df-elevated border border-df-border text-df-text-secondary text-xs font-mono rounded">
                  {getShortcutHint(shortcut.key).split(' + ').map((part, i) => (
                    <span key={i} className="flex items-center">
                      {part === '⌘' ? (
                        <Command className="w-3 h-3" />
                      ) : part.toLowerCase() === 'enter' ? (
                        <CornerDownLeft className="w-3 h-3" />
                      ) : (
                        part
                      )}
                    </span>
                  ))}
                </kbd>
              </div>
            ))}
          </div>

          {/* Platform note */}
          <div className="mt-6 pt-4 border-t border-df-border">
            <p className="text-xs text-df-text-secondary text-center">
              {isMac 
                ? 'Using Mac? Press ⌘ (Command) instead of Ctrl'
                : 'Using Windows/Linux? Press Ctrl instead of ⌘'
              }
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-df-border bg-df-elevated">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-df-accent-cyan text-df-primary font-space font-medium text-sm hover:bg-df-accent-cyan/90 transition-colors focus:outline-2 focus:outline-df-accent-red focus:outline-offset-2"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
