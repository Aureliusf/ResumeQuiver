import { useState } from 'react';
import { useSettings } from '@/contexts/settings-context';
import { RewriteBullet } from './rewrite-bullet';
import { GenerateBullets } from './generate-bullets';
import { ImproveSummary } from './improve-summary';
import { Wand2, Sparkles, FileText, Zap } from 'lucide-react';

type TabId = 'rewrite' | 'generate' | 'improve';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  color: string;
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
      color: 'df-accent-red',
    },
    {
      id: 'generate',
      label: 'Generate',
      icon: <Sparkles className="w-4 h-4" />,
      component: <GenerateBullets />,
      color: 'df-accent-purple',
    },
    {
      id: 'improve',
      label: 'Summary',
      icon: <FileText className="w-4 h-4" />,
      component: <ImproveSummary />,
      color: 'df-accent-cyan',
    },
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="h-full flex flex-col bg-df-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-df-border bg-df-elevated/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-df-accent-purple/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-df-accent-purple" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-df-text">AI Assistant</h2>
            <p className="text-xs text-df-text-muted">
              {isConfigured ? 'Ready to help' : 'Configure AI to unlock features'}
            </p>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          isConfigured 
            ? 'bg-df-accent-green/10 text-df-accent-green' 
            : 'bg-df-text-muted/10 text-df-text-muted'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-df-accent-green status-dot' : 'bg-df-text-muted'}`} />
          {isConfigured ? 'Connected' : 'Not Configured'}
        </div>
      </div>

      {/* Configuration Summary */}
      {isConfigured && (
        <div className="px-6 py-3 border-b border-df-border bg-df-elevated/20">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-df-text-muted">Model</span>
              <span className="font-mono text-df-text">{model}</span>
            </div>
            <div className="h-3 w-px bg-df-border" />
            <div className="flex items-center gap-2">
              <span className="text-df-text-muted">Provider</span>
              <span className="font-mono text-df-text">
                {baseUrl ? new URL(baseUrl).hostname : '-'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-df-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-3 px-2 flex items-center justify-center gap-2 text-sm font-medium
              transition-all duration-300 border-b-2
              ${activeTab === tab.id
                ? `text-df-text border-${tab.color} bg-df-elevated/30`
                : 'text-df-text-secondary border-transparent hover:text-df-text hover:bg-df-elevated/20'
              }
            `}
          >
            <span className={activeTab === tab.id ? `text-${tab.color}` : ''}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="content-fade-in">
          {!isConfigured && (
            <div className="mb-6 p-4 bg-df-accent-amber/10 border border-df-accent-amber/20 rounded-xl">
              <p className="text-sm text-df-accent-amber">
                Please configure AI settings first. Go to the Editor tab and expand AI Configuration.
              </p>
            </div>
          )}
          {activeTabData?.component}
        </div>
      </div>
    </div>
  );
}
