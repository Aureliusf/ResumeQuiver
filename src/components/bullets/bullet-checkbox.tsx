import { Check } from 'lucide-react';
import { getTagBgColorClass, getTagTextColorClass, getTagBorderColorClass } from '@/lib/tag-colors';

type BulletTone = 'basics' | 'education' | 'experience' | 'project' | 'skills';

interface BulletCheckboxItem {
  id: string;
  text: string;
  tags?: string[];
}

interface BulletCheckboxProps {
  bullet: BulletCheckboxItem;
  isSelected: boolean;
  onToggle: () => void;
  tone?: BulletTone;
}

const toneClasses: Record<BulletTone, {
  selectedRow: string;
  hoverRow: string;
  selectedCheckbox: string;
  hoverCheckbox: string;
}> = {
  experience: {
    selectedRow: 'bg-df-accent-cyan/10 border-df-accent-cyan',
    hoverRow: 'hover:bg-df-accent-cyan/5',
    selectedCheckbox: 'bg-df-accent-cyan border-df-accent-cyan',
    hoverCheckbox: 'group-hover:border-df-accent-cyan/70',
  },
  education: {
    selectedRow: 'bg-df-accent-green/10 border-df-accent-green',
    hoverRow: 'hover:bg-df-accent-green/5',
    selectedCheckbox: 'bg-df-accent-green border-df-accent-green',
    hoverCheckbox: 'group-hover:border-df-accent-green/70',
  },
  project: {
    selectedRow: 'bg-df-accent-red/10 border-df-accent-red',
    hoverRow: 'hover:bg-df-accent-red/5',
    selectedCheckbox: 'bg-df-accent-red border-df-accent-red',
    hoverCheckbox: 'group-hover:border-df-accent-red/70',
  },
  basics: {
    selectedRow: 'bg-df-accent-amber/10 border-df-accent-amber',
    hoverRow: 'hover:bg-df-accent-amber/5',
    selectedCheckbox: 'bg-df-accent-amber border-df-accent-amber',
    hoverCheckbox: 'group-hover:border-df-accent-amber/70',
  },
  skills: {
    selectedRow: 'bg-df-accent-purple/10 border-df-accent-purple',
    hoverRow: 'hover:bg-df-accent-purple/5',
    selectedCheckbox: 'bg-df-accent-purple border-df-accent-purple',
    hoverCheckbox: 'group-hover:border-df-accent-purple/70',
  },
};

export function BulletCheckbox({ bullet, isSelected, onToggle, tone = 'experience' }: BulletCheckboxProps) {
  const toneStyle = toneClasses[tone];

  return (
    <div
      className={`group flex items-start gap-3 py-2 px-3 -mx-3 rounded cursor-pointer transition-all ${
        isSelected
          ? `${toneStyle.selectedRow} border-l-2`
          : `${toneStyle.hoverRow} border-l-2 border-transparent`
      }`}
      onClick={onToggle}
    >
      <div
        className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border transition-all ${
          isSelected
            ? toneStyle.selectedCheckbox
            : `border-df-text-secondary/50 ${toneStyle.hoverCheckbox}`
        }`}
      >
        {isSelected && (
          <Check className="w-3 h-3 text-df-primary mx-auto mt-0.5" strokeWidth={3} />
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
                className={`inline-flex items-center px-2 py-0.5 text-xs rounded border ${getTagBgColorClass(tag)} ${getTagTextColorClass(tag)} ${getTagBorderColorClass(tag)}`}
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
