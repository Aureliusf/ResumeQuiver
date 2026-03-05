import { useState, useEffect, useCallback } from 'react';
import { Palette, X } from 'lucide-react';
import { useSettings } from '@/contexts/settings-context';
import { themes, applyTheme, type ThemeId } from '@/lib/themes';

export function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme: currentTheme, updateSettings } = useSettings();

  useEffect(() => {
    const theme = themes.find((t) => t.id === currentTheme);
    if (theme) {
      applyTheme(theme);
    }
  }, [currentTheme]);

  const handleThemeChange = useCallback((themeId: ThemeId) => {
    updateSettings({ theme: themeId });
    setIsOpen(false);
  }, [updateSettings]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-df-surface border border-df-border rounded-full shadow-lg hover:bg-df-elevated transition-all duration-200 focus-visible:ring-2 focus-visible:ring-df-accent-cyan focus-visible:outline-none group"
        aria-label="Toggle theme switcher"
        title="Change Theme"
      >
        <Palette className="w-6 h-6 text-df-accent-cyan group-hover:rotate-12 transition-transform" />
      </button>

      {/* Theme Switcher Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Theme switcher"
        >
          <div
            className="bg-df-surface border border-df-border p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-space font-semibold text-df-text text-xl">
                Choose Theme
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-df-text-secondary hover:text-df-text transition-colors focus-visible:ring-2 focus-visible:ring-df-accent-cyan focus-visible:outline-none rounded"
                aria-label="Close theme switcher"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Theme Options */}
            <div className="space-y-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`w-full p-4 text-left border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-df-accent-cyan focus-visible:outline-none ${
                    currentTheme === theme.id
                      ? 'border-df-accent-red bg-df-accent-red/10'
                      : 'border-df-border hover:border-df-accent-cyan hover:bg-df-elevated'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-space font-medium text-df-text">
                      {theme.name}
                    </span>
                    {currentTheme === theme.id && (
                      <span className="text-xs text-df-accent-red font-mono">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-df-text-secondary">
                    {theme.description}
                  </p>
                  
                  {/* Color Preview */}
                  <div className="flex items-center gap-2 mt-3">
                    <div
                      className="w-6 h-6 rounded border border-df-border"
                      style={{ backgroundColor: theme.colors.accentRed }}
                      title="Red accent"
                    />
                    <div
                      className="w-6 h-6 rounded border border-df-border"
                      style={{ backgroundColor: theme.colors.accentCyan }}
                      title="Cyan accent"
                    />
                    {theme.colors.accentPurple && (
                      <div
                        className="w-6 h-6 rounded border border-df-border"
                        style={{ backgroundColor: theme.colors.accentPurple }}
                        title="Purple accent"
                      />
                    )}
                    {theme.colors.accentGreen && (
                      <div
                        className="w-6 h-6 rounded border border-df-border"
                        style={{ backgroundColor: theme.colors.accentGreen }}
                        title="Green accent"
                      />
                    )}
                    {theme.colors.accentYellow && (
                      <div
                        className="w-6 h-6 rounded border border-df-border"
                        style={{ backgroundColor: theme.colors.accentYellow }}
                        title="Yellow accent"
                      />
                    )}
                    {theme.colors.accentAmber && (
                      <div
                        className="w-6 h-6 rounded border border-df-border"
                        style={{ backgroundColor: theme.colors.accentAmber }}
                        title="Amber accent"
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-df-border">
              <p className="text-xs text-df-text-secondary text-center">
                Theme preferences are saved automatically
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
