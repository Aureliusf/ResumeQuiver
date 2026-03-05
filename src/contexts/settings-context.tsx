import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

const SETTINGS_KEY = 'resume-builder-settings';

interface Settings {
  apiKey: string;
  baseUrl: string;
  model: string;
}

interface SettingsContextState {
  apiKey: string;
  baseUrl: string;
  model: string;
}

interface SettingsContextActions {
  updateSettings: (settings: Partial<Settings>) => void;
  loadSettings: () => void;
}

type SettingsContextValue = SettingsContextState & SettingsContextActions;

const SettingsContext = createContext<SettingsContextValue | null>(null);

const defaultSettings: Settings = {
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4',
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState<string>('');
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [model, setModel] = useState<string>('');

  const updateSettings = useCallback((settings: Partial<Settings>) => {
    if (settings.apiKey !== undefined) setApiKey(settings.apiKey);
    if (settings.baseUrl !== undefined) setBaseUrl(settings.baseUrl);
    if (settings.model !== undefined) setModel(settings.model);

    try {
      const currentSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      const newSettings = { ...currentSettings, ...settings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, []);

  const loadSettings = useCallback(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<Settings>;
        setApiKey(parsed.apiKey || defaultSettings.apiKey);
        setBaseUrl(parsed.baseUrl || defaultSettings.baseUrl);
        setModel(parsed.model || defaultSettings.model);
      } else {
        setApiKey(defaultSettings.apiKey);
        setBaseUrl(defaultSettings.baseUrl);
        setModel(defaultSettings.model);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setApiKey(defaultSettings.apiKey);
      setBaseUrl(defaultSettings.baseUrl);
      setModel(defaultSettings.model);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const value = useMemo(
    () => ({
      apiKey,
      baseUrl,
      model,
      updateSettings,
      loadSettings,
    }),
    [apiKey, baseUrl, model, updateSettings, loadSettings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
