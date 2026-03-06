import { memo, useState } from 'react';
import { RotateCcw, Check } from 'lucide-react';

interface FloatingResetButtonProps {
  onReset: () => void;
}

function FloatingResetButtonComponent({ onReset }: FloatingResetButtonProps) {
  const [showFeedback, setShowFeedback] = useState(false);

  const handleReset = () => {
    onReset();
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 1500);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <button
        onClick={handleReset}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-xl
          bg-df-elevated border border-df-border
          text-df-text-secondary text-sm font-medium
          shadow-lg shadow-black/20
          hover:text-df-text hover:border-df-accent-cyan
          hover:bg-df-surface
          transition-all duration-300
          group
          ${showFeedback ? 'scale-105' : ''}
        `}
        title="Reset layout to default"
      >
        {showFeedback ? (
          <>
            <Check className="w-4 h-4 text-df-accent-green" />
            <span className="text-df-accent-green">Reset</span>
          </>
        ) : (
          <>
            <RotateCcw className="w-4 h-4 group-hover:rotate-[-360deg] transition-transform duration-500" />
            <span>Reset Layout</span>
          </>
        )}
      </button>
    </div>
  );
}

export const FloatingResetButton = memo(FloatingResetButtonComponent);
