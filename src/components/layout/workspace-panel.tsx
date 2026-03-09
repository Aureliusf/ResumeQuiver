import { memo, lazy, Suspense } from 'react';
import { EditorPanel } from '@/components/editor/editor-panel';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

type TabId = 'editor' | 'ai' | 'tailoring' | 'resumes';

interface WorkspacePanelProps {
  activeTab: TabId;
}

const LazyAIPanel = lazy(() =>
  import('@/components/ai/ai-panel').then((module) => ({
    default: module.AIPanel,
  }))
);

const LazyTailoringPanel = lazy(() =>
  import('@/components/tailoring/tailoring-panel').then((module) => ({
    default: module.TailoringPanel,
  }))
);

const LazyResumesPanel = lazy(() =>
  import('@/components/resumes/resumes-panel').then((module) => ({
    default: module.ResumesPanel,
  }))
);

function PanelFallback({ text }: { text: string }) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}

function WorkspacePanelComponent({ activeTab }: WorkspacePanelProps) {
  return (
    <div className="flex flex-col h-full w-full bg-df-surface overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="content-fade-in h-full">
          {activeTab === 'editor' && <EditorPanel />}
          {activeTab === 'ai' && (
            <Suspense fallback={<PanelFallback text="Loading AI tools..." />}>
              <LazyAIPanel />
            </Suspense>
          )}
          {activeTab === 'tailoring' && (
            <Suspense fallback={<PanelFallback text="Loading tailoring tools..." />}>
              <LazyTailoringPanel />
            </Suspense>
          )}
          {activeTab === 'resumes' && (
            <Suspense fallback={<PanelFallback text="Loading resumes..." />}>
              <LazyResumesPanel />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}

export const WorkspacePanel = memo(WorkspacePanelComponent);
