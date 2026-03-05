import { X, Library } from 'lucide-react';
import { memo } from 'react';
import { BulletManager } from '@/components/bullets/bullet-manager';

interface MobileBulletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileBulletModalComponent({ isOpen, onClose }: MobileBulletModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-end sm:hidden z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bullet-library-title"
    >
      <div className="bg-df-surface border-t border-df-border w-full h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-df-border flex items-center justify-between bg-df-elevated">
          <div className="flex items-center gap-3">
            <Library className="w-5 h-5 text-df-accent-cyan" />
            <h2 
              id="bullet-library-title"
              className="font-space font-semibold text-df-text"
            >
              Bullet Library
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-df-text-secondary hover:text-df-text focus:outline-2 focus:outline-df-accent-red focus:outline-offset-2 rounded"
            aria-label="Close bullet library"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-4">
            <BulletManager />
          </div>
        </div>
      </div>
    </div>
  );
}

export const MobileBulletModal = memo(MobileBulletModalComponent);
