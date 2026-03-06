import { memo, useState, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Download, RefreshCw } from 'lucide-react';
import { ResumePreview } from '@/components/preview/resume-preview';
import { useResume } from '@/contexts/resume-context';
import { generatePDF, downloadPDF, getPDFFilename } from '@/lib/pdf-export';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

function PreviewPanelComponent() {
  const { resume, isValid } = useResume();
  const [zoom, setZoom] = useState(0.85);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

  const handleGeneratePDF = async () => {
    if (!resume || !isValid) return;
    
    setIsGenerating(true);
    try {
      const blob = await generatePDF(resume, new Map());
      const filename = getPDFFilename(resume);
      downloadPDF(blob, filename);
      showSuccessToast.pdfGenerated();
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      showErrorToast.pdfGeneration();
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!resume) {
    return (
      <div className="flex-1 flex items-center justify-center bg-df-primary">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-df-surface border border-df-border flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-df-text-secondary animate-spin" />
          </div>
          <p className="text-df-text-secondary">Loading resume...</p>
        </div>
      </div>
    );
  }

  // Calculate dimensions - US Letter size: 8.5 x 11 inches
  const baseWidth = 8.5 * 96; // 816px at 96 DPI
  const baseHeight = 11 * 96; // 1056px at 96 DPI
  const scaledWidth = baseWidth * zoom;
  const scaledHeight = baseHeight * zoom;

  return (
    <div 
      ref={containerRef}
      className={`flex-1 flex flex-col bg-df-primary overflow-hidden transition-all ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-df-border bg-df-surface/50 backdrop-blur flex-shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-medium text-df-text">Preview</h2>
          <div className="h-4 w-px bg-df-border" />
          <div className="flex items-center gap-1 bg-df-elevated rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded hover:bg-df-elevated-2 text-df-text-secondary hover:text-df-text transition-fluid"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-df-text-secondary w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded hover:bg-df-elevated-2 text-df-text-secondary hover:text-df-text transition-fluid"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-df-elevated text-df-text-secondary hover:text-df-text transition-fluid"
            title="Toggle fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleGeneratePDF}
            disabled={!isValid || isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-df-accent-cyan text-df-primary text-sm font-medium rounded-lg hover:bg-df-accent-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-fluid"
          >
            {isGenerating ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export PDF
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-8 bg-df-primary bg-grid flex items-start justify-center">
        <div 
          className="relative shadow-2xl shadow-black/50"
          style={{ 
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            maxWidth: '100%',
          }}
        >
          <div 
            className="origin-top-left"
            style={{
              width: `${baseWidth}px`,
              height: `${baseHeight}px`,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
            }}
          >
            <ResumePreview />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-6 py-2 border-t border-df-border bg-df-surface/30 flex items-center justify-between text-xs text-df-text-muted flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className={`flex items-center gap-1.5 ${isValid ? 'text-df-accent-green' : 'text-df-accent-red'}`}>
            <span className={`w-2 h-2 rounded-full ${isValid ? 'bg-df-accent-green status-dot' : 'bg-df-accent-red'}`} />
            {isValid ? 'Valid' : 'Invalid'} YAML
          </span>
        </div>
        <span>Resume will be exported as PDF</span>
      </div>
    </div>
  );
}

export const PreviewPanel = memo(PreviewPanelComponent);
