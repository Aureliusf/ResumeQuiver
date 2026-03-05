import { useState, useCallback, memo } from 'react';
import { FileText, Download } from 'lucide-react';
import { useResume } from '@/contexts/resume-context';
import { generatePDF, downloadPDF, getPDFFilename } from '@/lib/pdf-export';
import { YamlEditor } from './yaml-editor';
import { AIConfigBar } from './ai-config-bar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

function EditorPanelComponent() {
  const { yamlText, updateYaml, isValid, resume, selectedBullets, saveResume } = useResume();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePDF = useCallback(async () => {
    if (!resume || !isValid) return;

    setIsGenerating(true);
    setError(null);

    try {
      const blob = await generatePDF(resume, selectedBullets);
      const filename = getPDFFilename(resume);
      downloadPDF(blob, filename);
      showSuccessToast.pdfGenerated();
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setError('Failed to generate PDF. Please try again.');
      showErrorToast.pdfGeneration();
    } finally {
      setIsGenerating(false);
    }
  }, [resume, isValid, selectedBullets]);

  // Listen for keyboard shortcut event
  const handleSave = useCallback(() => {
    saveResume();
    showSuccessToast.resumeSaved();
  }, [saveResume]);

  // Set up event listeners
  useState(() => {
    const handleKeyboardSave = () => handleSave();
    const handleKeyboardPDF = () => handleGeneratePDF();
    
    window.addEventListener('save-resume', handleKeyboardSave);
    window.addEventListener('generate-pdf', handleKeyboardPDF);
    
    return () => {
      window.removeEventListener('save-resume', handleKeyboardSave);
      window.removeEventListener('generate-pdf', handleKeyboardPDF);
    };
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-df-border bg-df-surface">
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-df-accent-red" />
          <h2 className="font-space font-semibold text-df-text">YAML Editor</h2>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Validation Status */}
          <span
            className={`text-xs px-2 py-1 font-mono rounded ${
              isValid
                ? 'text-df-accent-cyan bg-df-accent-cyan/10'
                : 'text-df-accent-red bg-df-accent-red/10'
            }`}
            role="status"
            aria-live="polite"
          >
            {isValid ? 'Valid YAML' : 'Invalid YAML'}
          </span>
          
          {/* Generate PDF Button */}
          <button
            onClick={handleGeneratePDF}
            disabled={!isValid || isGenerating}
            className="flex items-center gap-2 px-3 py-1.5 bg-df-accent-cyan text-df-primary text-xs font-medium hover:bg-df-accent-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-2 focus:outline-df-accent-red focus:outline-offset-2"
            aria-label="Generate and download PDF resume"
          >
            {isGenerating ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Download className="w-3 h-3" aria-hidden="true" />
            )}
            {isGenerating ? 'Generating...' : 'Generate PDF'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-df-accent-red/10 border-b border-df-accent-red/20" role="alert">
          <p className="text-xs text-df-accent-red">{error}</p>
        </div>
      )}

      {/* AI Config Bar */}
      <AIConfigBar />

      {/* YAML Editor */}
      <div className="flex-1 min-h-0">
        <YamlEditor
          value={yamlText}
          onChange={updateYaml}
          error={!isValid}
        />
      </div>
    </div>
  );
}

export const EditorPanel = memo(EditorPanelComponent);
