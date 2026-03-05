import { ResumePreview } from '@/components/preview/resume-preview';

export function LeftPanel() {
  return (
    <div className="bg-df-primary h-full overflow-y-auto p-6 sm:p-10">
      <div className="resume-preview-container">
        <div className="resume-preview-label">Print Preview</div>
        <ResumePreview />
      </div>
    </div>
  );
}
