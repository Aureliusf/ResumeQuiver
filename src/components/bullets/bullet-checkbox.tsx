import { Check } from 'lucide-react';
import type { Bullet } from '@/types/resume';

interface BulletCheckboxProps {
  bullet: Bullet;
  isSelected: boolean;
  onToggle: () => void;
}

export function BulletCheckbox({ bullet, isSelected, onToggle }: BulletCheckboxProps) {
  return (
    <div
      className={`group flex items-start gap-3 py-2 px-3 -mx-3 rounded cursor-pointer transition-all ${
        isSelected
          ? 'bg-df-elevated border-l-2 border-df-accent-red'
          : 'hover:bg-df-elevated/50 border-l-2 border-transparent'
      }`}
      onClick={onToggle}
    >
      <div
        className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border transition-all ${
          isSelected
            ? 'bg-df-accent-red border-df-accent-red'
            : 'border-df-text-secondary/50 group-hover:border-df-text-secondary'
        }`}
      >
        {isSelected && (
          <Check className="w-3 h-3 text-white mx-auto mt-0.5" strokeWidth={3} />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-relaxed ${isSelected ? 'text-df-text' : 'text-df-text-secondary'}`}>
          {bullet.text}
        </p>
        
        {bullet.tags && bullet.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {bullet.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 bg-df-primary text-xs text-df-text-secondary rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
