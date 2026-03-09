import { useEffect, useState, memo } from 'react';
import { Monitor } from 'lucide-react';

const STORAGE_KEY = 'resume-builder-mobile-desktop-alert-dismissed';

function MobileDesktopAlertComponent() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      setIsOpen(localStorage.getItem(STORAGE_KEY) !== 'true');
    } catch {
      setIsOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);

    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore storage failures and just dismiss for the current session.
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm sm:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-desktop-alert-title"
    >
      <div className="relative isolate w-full max-w-sm overflow-hidden rounded-2xl border border-df-border bg-df-surface/95 shadow-2xl backdrop-blur-md">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-df-accent-red via-df-accent-cyan to-df-accent-purple" />

        <div className="p-6 pt-7">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-df-border bg-df-elevated text-df-accent-cyan">
            <Monitor className="h-6 w-6" />
          </div>

          <h2
            id="mobile-desktop-alert-title"
            className="font-space text-xl font-semibold text-df-text"
          >
            Desktop recommended
          </h2>

          <p className="mt-3 text-sm leading-6 text-df-text-secondary">
            This site is not designed for mobile. You&apos;ll get a better editing,
            layout, and PDF preview experience on a desktop or laptop.
          </p>

          <button
            onClick={handleDismiss}
            className="mt-6 w-full rounded-xl bg-df-accent-cyan px-4 py-3 font-space text-sm font-medium text-df-primary transition-colors hover:bg-df-accent-cyan/90 focus:outline-2 focus:outline-df-accent-red focus:outline-offset-2"
          >
            Continue on mobile
          </button>
        </div>
      </div>
    </div>
  );
}

export const MobileDesktopAlert = memo(MobileDesktopAlertComponent);
