import { useEffect, useMemo, useRef, useState } from 'react';
import { Key, Globe, Bot, Check, Lock, ChevronDown, LoaderCircle } from 'lucide-react';
import { useSettings } from '@/contexts/settings-context';
import { showSuccessToast } from '@/lib/toast';
import { fetchAvailableModels, getErrorMessage } from '@/lib/ai-client';

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4';
const MODEL_DISCOVERY_DEBOUNCE_MS = 500;
const MAX_VISIBLE_MODELS = 8;

type DiscoveryStatus = 'idle' | 'loading' | 'success' | 'error';

interface ModelDiscoveryState {
  status: DiscoveryStatus;
  models: string[];
  message: string | null;
}

const initialDiscoveryState: ModelDiscoveryState = {
  status: 'idle',
  models: [],
  message: null,
};

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function getDiscoveryMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'type' in error) {
    const message = getErrorMessage(error as Parameters<typeof getErrorMessage>[0]).replace(/\.$/, '');
    return `${message}. You can still type a model manually.`;
  }

  return 'Could not load /models. You can still type a model manually.';
}

function normalizeModelValue(value: string): string {
  return value.trim().toLowerCase();
}

export function AIConfigBar() {
  const { apiKey, baseUrl, model, updateSettings } = useSettings();

  const [formState, setFormState] = useState({
    apiKey: apiKey || '',
    baseUrl: baseUrl || DEFAULT_BASE_URL,
    model: model || DEFAULT_MODEL,
  });
  const [isSaved, setIsSaved] = useState(false);
  const [modelDiscovery, setModelDiscovery] = useState<ModelDiscoveryState>(initialDiscoveryState);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const modelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormState({
      apiKey: apiKey || '',
      baseUrl: baseUrl || DEFAULT_BASE_URL,
      model: model || DEFAULT_MODEL,
    });
  }, [apiKey, baseUrl, model]);

  useEffect(() => {
    const trimmedApiKey = formState.apiKey.trim();
    const trimmedBaseUrl = formState.baseUrl.trim();

    if (!trimmedApiKey || !trimmedBaseUrl) {
      setModelDiscovery(initialDiscoveryState);
      return;
    }

    if (!isHttpUrl(trimmedBaseUrl)) {
      setModelDiscovery({
        status: 'error',
        models: [],
        message: 'Enter a valid base URL to load models, or type the model manually.',
      });
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        setModelDiscovery({
          status: 'loading',
          models: [],
          message: 'Loading models from /models...',
        });

        try {
          const models = await fetchAvailableModels(
            {
              apiKey: trimmedApiKey,
              baseUrl: trimmedBaseUrl,
            },
            controller.signal
          );

          if (controller.signal.aborted) {
            return;
          }

          if (models.length === 0) {
            setModelDiscovery({
              status: 'error',
              models: [],
              message: 'No models were returned from /models. You can still type one manually.',
            });
            return;
          }

          setModelDiscovery({
            status: 'success',
            models,
            message: `${models.length} model${models.length === 1 ? '' : 's'} loaded from /models. Select one or type your own.`,
          });
        } catch (error) {
          if (controller.signal.aborted) {
            return;
          }

          setModelDiscovery({
            status: 'error',
            models: [],
            message: getDiscoveryMessage(error),
          });
        }
      })();
    }, MODEL_DISCOVERY_DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [formState.apiKey, formState.baseUrl]);

  const filteredModels = useMemo(() => {
    const query = normalizeModelValue(formState.model);

    if (modelDiscovery.models.length === 0) {
      return [];
    }

    if (!query) {
      return modelDiscovery.models.slice(0, MAX_VISIBLE_MODELS);
    }

    return modelDiscovery.models
      .filter((candidate) => candidate.toLowerCase().includes(query))
      .slice(0, MAX_VISIBLE_MODELS);
  }, [formState.model, modelDiscovery.models]);

  const hasDiscoveredModels = modelDiscovery.models.length > 0;
  const hasExactModelMatch = useMemo(
    () => modelDiscovery.models.some((candidate) => normalizeModelValue(candidate) === normalizeModelValue(formState.model)),
    [formState.model, modelDiscovery.models]
  );
  const showModelMenu = hasDiscoveredModels && isModelMenuOpen;

  const handleModelInputBlur = () => {
    window.setTimeout(() => {
      setIsModelMenuOpen(false);
    }, 120);
  };

  const handleModelSelect = (nextModel: string) => {
    setFormState((current) => ({
      ...current,
      model: nextModel,
    }));
    setIsModelMenuOpen(false);
  };

  const handleSave = () => {
    const nextSettings = {
      apiKey: formState.apiKey.trim(),
      baseUrl: formState.baseUrl.trim(),
      model: formState.model.trim(),
    };

    updateSettings({
      apiKey: nextSettings.apiKey,
      baseUrl: nextSettings.baseUrl,
      model: nextSettings.model,
    });
    setFormState(nextSettings);
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
            <div className="relative isolate">
              <div className="relative">
                <input
                  ref={modelInputRef}
                  type="text"
                  value={formState.model}
                  onChange={(e) => {
                    setFormState({ ...formState, model: e.target.value });
                    if (hasDiscoveredModels) {
                      setIsModelMenuOpen(true);
                    }
                  }}
                  onFocus={() => {
                    if (hasDiscoveredModels) {
                      setIsModelMenuOpen(true);
                    }
                  }}
                  onBlur={handleModelInputBlur}
                  placeholder={hasDiscoveredModels ? 'Search or type a model' : DEFAULT_MODEL}
                  spellCheck={false}
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={showModelMenu}
                  aria-haspopup="listbox"
                  aria-autocomplete={hasDiscoveredModels ? 'list' : 'none'}
                  className="w-full px-4 py-3 pr-12 bg-df-surface border border-df-border rounded-xl text-sm text-df-text placeholder:text-df-text-muted focus:border-df-accent-cyan focus:outline-none transition-fluid"
                />
                <div className="absolute inset-y-0 right-3 flex items-center gap-2">
                  {modelDiscovery.status === 'loading' ? (
                    <LoaderCircle className="w-4 h-4 text-df-text-muted animate-spin" />
                  ) : hasDiscoveredModels ? (
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => setIsModelMenuOpen((current) => !current)}
                      className="rounded-md p-1 text-df-text-muted hover:text-df-text transition-fluid"
                      aria-label="Toggle model suggestions"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${showModelMenu ? 'rotate-180' : ''}`} />
                    </button>
                  ) : null}
                </div>
              </div>

              {showModelMenu && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-df-border bg-df-elevated/95 shadow-2xl backdrop-blur-md">
                  <div className="max-h-64 overflow-y-auto py-2">
                    {filteredModels.length > 0 ? (
                      filteredModels.map((candidate) => {
                        const isSelected = normalizeModelValue(candidate) === normalizeModelValue(formState.model);

                        return (
                          <button
                            key={candidate}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => handleModelSelect(candidate)}
                            className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-fluid ${
                              isSelected
                                ? 'bg-df-accent-cyan/10 text-df-text'
                                : 'text-df-text-secondary hover:bg-df-surface hover:text-df-text'
                            }`}
                          >
                            <span className="truncate font-mono">{candidate}</span>
                            {isSelected && <Check className="w-4 h-4 text-df-accent-cyan" />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-3 text-sm text-df-text-muted">
                        No matching models found. You can still use a custom value.
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setIsModelMenuOpen(false);
                      modelInputRef.current?.focus();
                    }}
                    className="flex w-full items-center justify-between border-t border-df-border bg-df-surface/60 px-4 py-3 text-left text-sm text-df-text-secondary transition-fluid hover:text-df-text"
                  >
                    <span>{formState.model.trim() && !hasExactModelMatch ? `Use "${formState.model.trim()}"` : 'Type a custom model'}</span>
                    <span className="font-mono text-xs text-df-text-muted">fallback</span>
                  </button>
                </div>
              )}
            </div>

            {modelDiscovery.message && (
              <p className={`text-xs ${
                modelDiscovery.status === 'error'
                  ? 'text-df-accent-amber'
                  : modelDiscovery.status === 'success'
                    ? 'text-df-accent-green'
                    : 'text-df-text-muted'
              }`}>
                {modelDiscovery.message}
              </p>
            )}
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
