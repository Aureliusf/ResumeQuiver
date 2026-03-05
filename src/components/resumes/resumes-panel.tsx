import { useResume } from '@/contexts/resume-context';
import { storage } from '@/lib/storage';
import type { ResumeListItem } from '@/types/resume';
import { useState, useEffect, memo } from 'react';
import { Trash2, Copy, Download, FilePlus } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

function ResumesPanelComponent() {
  const { resume, currentResumeId, loadResume, createNewResume } = useResume();
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);

  useEffect(() => {
    setResumes(storage.getResumeList());
  }, [currentResumeId, resume]);

  const handleDelete = (id: string) => {
    try {
      storage.deleteResume(id);
      setResumes(storage.getResumeList());
      showSuccessToast.resumeDeleted();
    } catch {
      showErrorToast.deleteFailed();
    }
  };

  const handleDuplicate = (id: string) => {
    try {
      const original = storage.getResume(id);
      if (original) {
        storage.duplicateResume(id, `${original.name} (Copy)`);
        setResumes(storage.getResumeList());
        showSuccessToast.resumeDuplicated();
      }
    } catch {
      showErrorToast.generic('Failed to duplicate resume');
    }
  };

  const handleExport = (id: string) => {
    try {
      const resume = storage.getResume(id);
      if (resume) {
        const blob = new Blob([JSON.stringify(resume, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resume.name.replace(/\s+/g, '_').toLowerCase()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showSuccessToast.resumeExported();
      }
    } catch {
      showErrorToast.exportFailed();
    }
  };

  const handleCreateNew = () => {
    createNewResume();
    showSuccessToast.resumeCreated();
  };

  return (
    <div className="h-full flex flex-col pt-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-space font-semibold text-df-text">My Resumes</h2>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-1 bg-df-accent-red text-df-text text-sm font-space hover:bg-df-accent-red/80 transition-colors focus:outline-2 focus:outline-df-accent-cyan focus:outline-offset-2"
          aria-label="Create new resume"
        >
          <FilePlus className="w-4 h-4" aria-hidden="true" />
          New Resume
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {resumes.length === 0 ? (
          <div className="text-center py-8 text-df-text-secondary">
            No resumes yet. Create your first resume!
          </div>
        ) : (
          <div className="space-y-2">
            {resumes.map((r) => (
                <article
                key={r.id}
                className={`p-4 border cursor-pointer transition-colors ${
                  r.id === currentResumeId
                    ? 'bg-df-elevated border-df-accent-cyan'
                    : 'bg-df-surface border-df-border hover:bg-df-elevated'
                }`}
                onClick={() => {
                  loadResume(r.id);
                  showSuccessToast.resumeLoaded(r.name);
                }}
                role="button"
                tabIndex={0}
                aria-label={`Load resume: ${r.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    loadResume(r.id);
                    showSuccessToast.resumeLoaded(r.name);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-space font-medium text-df-text">{r.name}</h3>
                    <p className="text-xs text-df-text-secondary mt-1">
                      Updated: {new Date(r.updatedAt).toLocaleDateString()}
                    </p>
                    {r.preview && (
                      <p className="text-xs text-df-text-secondary mt-1 truncate">
                        {r.preview}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(r.id);
                      }}
                      className="p-2 text-df-text-secondary hover:text-df-accent-cyan transition-colors focus:outline-2 focus:outline-df-accent-cyan focus:outline-offset-2 rounded"
                      aria-label={`Duplicate resume: ${r.name}`}
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport(r.id);
                      }}
                      className="p-2 text-df-text-secondary hover:text-df-accent-cyan transition-colors focus:outline-2 focus:outline-df-accent-cyan focus:outline-offset-2 rounded"
                      aria-label={`Export resume: ${r.name}`}
                      title="Export"
                    >
                      <Download className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(r.id);
                      }}
                      className="p-2 text-df-text-secondary hover:text-df-accent-red transition-colors focus:outline-2 focus:outline-df-accent-red focus:outline-offset-2 rounded"
                      aria-label={`Delete resume: ${r.name}`}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const ResumesPanel = memo(ResumesPanelComponent);
