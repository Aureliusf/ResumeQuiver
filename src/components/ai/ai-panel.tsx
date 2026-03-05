import { useState } from 'react';
import { useSettings } from '@/contexts/settings-context';
import { RewriteBullet } from './rewrite-bullet';
import { GenerateBullets } from './generate-bullets';
import { ImproveSummary } from './improve-summary';
import { Wand2, Sparkles, FileText, Settings } from 'lucide-react';

type TabId = 'rewrite' | 'generate' | 'improve';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

export function AIPanel() {
  const { apiKey, baseUrl, model } = useSettings();
  const [activeTab, setActiveTab] = useState<TabId>('rewrite');

  const isConfigured = apiKey && baseUrl && model;

  const tabs: Tab[] = [
    {
      id: 'rewrite',
      label: 'Rewrite',
      icon: <Wand2 className="w-4 h-4" />,
      component: <RewriteBullet />,
    },
    {
      id: 'generate',
      label: 'Generate',
      icon: <Sparkles className="w-4 h-4" />,
      component: <GenerateBullets />,
    },
    {
      id: 'improve',
      label: 'Summary',
      icon: <FileText className="w-4 h-4" />,
      component: <ImproveSummary />,
    },
  ];

  return (
    <div className="h-full flex flex-col pt-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-space font-semibold text-df-text flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-df-accent-red" />
          AI Copywriting
        </h2>
        <div className="flex items-center gap-2">
          {isConfigured ? (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              Connected
            </span>
          ) : (
            <span className="text-xs text-df-accent-red flex items-center gap-1">
              <Settings className="w-3 h-3" />
              Not Configured
            </span>
          )}
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="bg-df-elevated border border-df-border p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-xs text-df-text-secondary">Model</span>
          <span className="text-xs text-df-text font-mono">
            {model || 'Not configured'}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-df-text-secondary">Provider</span>
          <span className="text-xs text-df-text font-mono">
            {baseUrl ? new URL(baseUrl).hostname : 'Not configured'}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-df-text-secondary">API Key</span>
          <span className="text-xs text-df-text font-mono">
            {apiKey ? '••••••••' : 'Not configured'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-df-border mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-3 px-2 flex items-center justify-center gap-2 font-space font-medium text-sm
              transition-colors duration-200 border-b-2
              ${activeTab === tab.id
                ? 'text-df-accent-red border-df-accent-red'
                : 'text-df-text-secondary border-transparent hover:text-df-text hover:border-df-border'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="pb-4">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
}
