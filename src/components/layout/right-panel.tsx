import { EditorPanel } from '@/components/editor/editor-panel';
import { AIPanel } from '@/components/ai/ai-panel';
import { TailoringPanel } from '@/components/tailoring/tailoring-panel';
import { ResumesPanel } from '@/components/resumes/resumes-panel';

type TabId = 'editor' | 'ai' | 'tailoring' | 'resumes';

interface RightPanelProps {
  activeTab: TabId;
}

export function RightPanel({ activeTab }: RightPanelProps) {
  return (
    <div className="bg-df-surface border border-df-border h-full overflow-y-auto">
      <div className="p-8">
        {activeTab === 'editor' && <EditorPanel />}
        {activeTab === 'ai' && <AIPanel />}
        {activeTab === 'tailoring' && <TailoringPanel />}
        {activeTab === 'resumes' && <ResumesPanel />}
      </div>
    </div>
  );
}
