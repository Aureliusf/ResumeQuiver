import { useState } from 'react';
import { Key, Globe, Bot, Check, Lock } from 'lucide-react';
import { useSettings } from '@/contexts/settings-context';
import { showSuccessToast } from '@/lib/toast';

export function AIConfigBar() {
  const { apiKey, baseUrl, model, updateSettings } = useSettings();
  
  const [formState, setFormState] = useState({
    apiKey: apiKey || '',
    baseUrl: baseUrl || 'https://api.openai.com/v1',
    model: model || 'gpt-4',
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    updateSettings({
      apiKey: formState.apiKey,
      baseUrl: formState.baseUrl,
      model: formState.model,
    });
    setIsSaved(true);
    showSuccessToast.settingsSaved();
    setTimeout(() => setIsSaved(false), 2000);
  };

  const isConfigured = Boolean(apiKey && baseUrl && model);

  return (
    <div className="p-6 bg-df-elevated/30 border-b border-df-border">
      <div className="space-y-4">
        {/* API Key */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-df-text-secondary font-medium uppercase tracking-wider">
            <Key className="w-3.5 h-3.5" />
            API Key
          </label>
          <div className="relative">
            <input
              type="password"
              value={formState.apiKey}
              onChange={(e) => setFormState({ ...formState, apiKey: e.target.value })}
              placeholder="sk-..."
              spellCheck={false}
              autoComplete="off"
              className="w-full px-4 py-3 bg-df-surface border border-df-border rounded-xl text-sm text-df-text placeholder:text-df-text-muted focus:border-df-accent-cyan focus:outline-none transition-fluid"
            />
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-df-text-muted" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Base URL */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-df-text-secondary font-medium uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" />
              Base URL
            </label>
            <input
              type="url"
              value={formState.baseUrl}
              onChange={(e) => setFormState({ ...formState, baseUrl: e.target.value })}
              placeholder="https://api.openai.com/v1"
              spellCheck={false}
              autoComplete="off"
              className="w-full px-4 py-3 bg-df-surface border border-df-border rounded-xl text-sm text-df-text placeholder:text-df-text-muted focus:border-df-accent-cyan focus:outline-none transition-fluid"
            />
          </div>

          {/* Model */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-df-text-secondary font-medium uppercase tracking-wider">
              <Bot className="w-3.5 h-3.5" />
              Model
            </label>
            <input
              type="text"
              value={formState.model}
              onChange={(e) => setFormState({ ...formState, model: e.target.value })}
              placeholder="gpt-4"
              spellCheck={false}
              autoComplete="off"
              className="w-full px-4 py-3 bg-df-surface border border-df-border rounded-xl text-sm text-df-text placeholder:text-df-text-muted focus:border-df-accent-cyan focus:outline-none transition-fluid"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            isSaved
              ? 'bg-df-accent-green text-df-primary'
              : 'bg-df-accent-cyan text-df-primary hover:bg-df-accent-cyan/90'
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4" />
              Saved
            </>
          ) : (
            'Save AI Configuration'
          )}
        </button>

        {/* Status */}
        <div className="flex items-center justify-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-df-accent-green status-dot' : 'bg-df-text-muted'}`} />
          <span className={isConfigured ? 'text-df-accent-green' : 'text-df-text-muted'}>
            {isConfigured ? 'AI is configured and ready' : 'Configure AI to unlock features'}
          </span>
        </div>
      </div>
    </div>
  );
}
