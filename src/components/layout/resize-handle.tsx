import { memo } from 'react';

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  isDragging: boolean;
  position?: 'left' | 'right';
}

function ResizeHandleComponent({ 
  onMouseDown, 
  onTouchStart, 
  isDragging,
  position = 'right'
}: ResizeHandleProps) {
  const positionClasses = position === 'left' 
    ? 'left-0 -translate-x-1/2' 
    : 'right-0 translate-x-1/2';

  return (
    <div
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className={`
        absolute top-0 h-full w-4 ${positionClasses} cursor-col-resize
        flex items-center justify-center z-50 group
        hover:bg-df-accent-cyan/5 transition-colors
        ${isDragging ? 'bg-df-accent-cyan/10' : ''}
      `}
    >
      <div className={`
        w-0.5 h-8 rounded-full transition-all duration-150
        ${isDragging 
          ? 'bg-df-accent-cyan w-1 h-12' 
          : 'bg-df-border group-hover:bg-df-text-secondary group-hover:h-10'
        }
      `} />
    </div>
  );
}

export const ResizeHandle = memo(ResizeHandleComponent);
