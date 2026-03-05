import { useState } from 'react';
import { ChevronDown, ChevronUp, Save, Key, Globe, Bot } from 'lucide-react';
import { useSettings } from '@/contexts/settings-context';

export function AIConfigBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { apiKey, baseUrl, model, updateSettings } = useSettings();
  
  const [formState, setFormState] = useState({
    apiKey: apiKey || '',
    baseUrl: baseUrl || 'https://api.openai.com/v1',
    model: model || 'gpt-4',
  });

  const handleSave = () => {
    updateSettings({
      apiKey: formState.apiKey,
      baseUrl: formState.baseUrl,
      model: formState.model,
    });
  };

  const isConfigured = Boolean(apiKey && baseUrl && model);

  return (
    <div className="border-b border-df-border bg-df-surface">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-df-elevated transition-colors"
      >
        <div className="flex items-center gap-3">
          <Bot className="w-4 h-4 text-df-accent-red" />
          <span className="font-space font-medium text-df-text text-sm">
            AI Configuration
          </span>
          {isConfigured ? (
            <span className="text-xs text-df-accent-cyan bg-df-accent-cyan/10 px-2 py-0.5 rounded">
              Configured
            </span>
          ) : (
            <span className="text-xs text-df-text-secondary bg-df-elevated px-2 py-0.5 rounded">
              Not configured
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-df-text-secondary" />
        ) : (
          <ChevronDown className="w-4 h-4 text-df-text-secondary" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-df-border">
          <div className="pt-3 space-y-3">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs text-df-text-secondary font-medium">
                <Key className="w-3 h-3" />
                API Key
              </label>
              <input
                type="password"
                value={formState.apiKey}
                onChange={(e) => setFormState({ ...formState, apiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full px-3 py-2 bg-df-primary border border-df-border text-df-text text-sm placeholder:text-df-text-secondary/50 focus:border-df-accent-cyan focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs text-df-text-secondary font-medium">
                <Globe className="w-3 h-3" />
                Base URL
              </label>
              <input
                type="text"
                value={formState.baseUrl}
                onChange={(e) => setFormState({ ...formState, baseUrl: e.target.value })}
                placeholder="https://api.openai.com/v1"
                className="w-full px-3 py-2 bg-df-primary border border-df-border text-df-text text-sm placeholder:text-df-text-secondary/50 focus:border-df-accent-cyan focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs text-df-text-secondary font-medium">
                <Bot className="w-3 h-3" />
                Model
              </label>
              <input
                type="text"
                value={formState.model}
                onChange={(e) => setFormState({ ...formState, model: e.target.value })}
                placeholder="gpt-4"
                className="w-full px-3 py-2 bg-df-primary border border-df-border text-df-text text-sm placeholder:text-df-text-secondary/50 focus:border-df-accent-cyan focus:outline-none"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-df-accent-red text-white text-sm font-medium hover:bg-df-accent-red/90 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
