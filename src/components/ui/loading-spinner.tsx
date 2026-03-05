import { Loader2 } from 'lucide-react';
import { memo } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const textSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

function LoadingSpinnerComponent({ size = 'md', className = '', text }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`} role="status" aria-live="polite">
      <Loader2 
        className={`${sizeClasses[size]} text-df-accent-cyan animate-spin`} 
        aria-hidden="true"
      />
      {text && (
        <span className={`${textSizes[size]} text-df-text-secondary`}>
          {text}
        </span>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export const LoadingSpinner = memo(LoadingSpinnerComponent);
