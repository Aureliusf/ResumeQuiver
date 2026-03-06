import { memo } from 'react';
import { EditorPanel } from '@/components/editor/editor-panel';
import { AIPanel } from '@/components/ai/ai-panel';
import { TailoringPanel } from '@/components/tailoring/tailoring-panel';
import { ResumesPanel } from '@/components/resumes/resumes-panel';

type TabId = 'editor' | 'ai' | 'tailoring' | 'resumes';

interface WorkspacePanelProps {
  activeTab: TabId;
}

function WorkspacePanelComponent({ activeTab }: WorkspacePanelProps) {
  return (
    <div className="flex flex-col h-full w-full bg-df-surface overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="content-fade-in h-full">
          {activeTab === 'editor' && <EditorPanel />}
          {activeTab === 'ai' && <AIPanel />}
          {activeTab === 'tailoring' && <TailoringPanel />}
          {activeTab === 'resumes' && <ResumesPanel />}
        </div>
      </div>
    </div>
  );
}

export const WorkspacePanel = memo(WorkspacePanelComponent);
