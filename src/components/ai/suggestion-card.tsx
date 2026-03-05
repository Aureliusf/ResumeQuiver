import { Sparkles, Check } from 'lucide-react';
import { memo } from 'react';

interface SuggestionCardProps {
  text: string;
  index: number;
  onUse: () => void;
  isSelected?: boolean;
}

function SuggestionCardComponent({ text, index, onUse, isSelected = false }: SuggestionCardProps) {
  return (
    <article
      className={`
        relative p-4 border transition-all duration-200
        ${isSelected 
          ? 'bg-df-accent-red/10 border-df-accent-red' 
          : 'bg-df-elevated border-df-border hover:border-df-accent-cyan'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div 
          className={`
            flex-shrink-0 w-8 h-8 rounded flex items-center justify-center font-mono text-sm font-medium
            ${isSelected 
              ? 'bg-df-accent-red text-white' 
              : 'bg-df-surface text-df-text-secondary'
            }
          `}
          aria-hidden="true"
        >
          {isSelected ? <Check className="w-4 h-4" /> : index + 1}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm text-df-text leading-relaxed">
            {text}
          </p>
        </div>
      </div>
      
      <button
        onClick={onUse}
        className={`
          mt-3 w-full py-2 px-4 font-space font-medium text-sm
          transition-colors duration-200 flex items-center justify-center gap-2
          focus:outline-2 focus:outline-df-accent-cyan focus:outline-offset-2
          ${isSelected
            ? 'bg-df-accent-red/20 text-df-accent-red border border-df-accent-red cursor-default'
            : 'bg-df-surface text-df-text hover:bg-df-accent-cyan hover:text-df-primary'
          }
        `}
        aria-label={isSelected ? 'Suggestion applied' : `Use suggestion ${index + 1}`}
        aria-pressed={isSelected}
        disabled={isSelected}
      >
        <Sparkles className="w-4 h-4" aria-hidden="true" />
        {isSelected ? 'Applied' : 'Use This'}
      </button>
    </article>
  );
}

export const SuggestionCard = memo(SuggestionCardComponent);
