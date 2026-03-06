import { memo, useState, useCallback } from 'react';
import { useResume } from '@/contexts/resume-context';
import { YamlEditor } from './yaml-editor';
import { AIConfigBar } from './ai-config-bar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { FileText, Save, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

function EditorPanelComponent() {
  const { yamlText, updateYaml, isValid, saveResume } = useResume();
  const [showConfig, setShowConfig] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      saveResume();
      showSuccessToast.resumeSaved();
    } catch (err) {
      showErrorToast.yamlParse('Failed to save resume');
    } finally {
      setIsSaving(false);
    }
  }, [saveResume]);

  return (
    <div className="h-full flex flex-col bg-df-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-df-border bg-df-elevated/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-df-accent-cyan/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-df-accent-cyan" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-df-text">YAML Editor</h2>
            <p className="text-xs text-df-text-muted">Edit your resume data</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Validation Status */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium ${
            isValid 
              ? 'bg-df-accent-green/10 text-df-accent-green' 
              : 'bg-df-accent-red/10 text-df-accent-red'
          }`}>
            {isValid ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
            {isValid ? 'Valid' : 'Invalid'}
          </div>
          
          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-df-elevated hover:bg-df-elevated-2 border border-df-border rounded-lg text-sm text-df-text transition-fluid disabled:opacity-50"
          >
            {isSaving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </div>

      {/* AI Config Toggle */}
      <div className="px-6 py-3 border-b border-df-border">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-2 text-sm text-df-text-secondary hover:text-df-text transition-fluid"
        >
          <Sparkles className="w-4 h-4 text-df-accent-purple" />
          <span>AI Configuration</span>
          <span className={`transform transition-transform ${showConfig ? 'rotate-180' : ''}`}>▼</span>
        </button>
      </div>

      {/* AI Config Panel */}
      {showConfig && (
        <div className="content-fade-in">
          <AIConfigBar />
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <YamlEditor
          value={yamlText}
          onChange={updateYaml}
          error={!isValid}
        />
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-df-border bg-df-elevated/30 flex items-center justify-between text-xs text-df-text-muted">
        <span>Use YAML format for structured data</span>
        <span className="font-mono">Ctrl+S to save</span>
      </div>
    </div>
  );
}

export const EditorPanel = memo(EditorPanelComponent);
