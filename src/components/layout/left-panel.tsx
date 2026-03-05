import { ResumePreview } from '@/components/preview/resume-preview';

export function LeftPanel() {
  return (
    <div className="bg-df-primary h-full overflow-y-auto p-4 sm:p-6">
      <div className="resume-preview-container">
        <div className="resume-preview-label">Print Preview</div>
        <ResumePreview />
      </div>
    </div>
  );
}
