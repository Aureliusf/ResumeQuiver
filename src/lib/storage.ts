import type { Resume, ResumeListItem } from '@/types/resume';

const STORAGE_KEY = 'resume-builder-data';
const CURRENT_VERSION = 1;

interface StorageData {
  version: number;
  resumes: Record<string, Resume>;
}

interface StorageError extends Error {
  code: 'PARSE_ERROR' | 'QUOTA_EXCEEDED' | 'NOT_FOUND' | 'VERSION_MISMATCH';
}

class StorageManager {
  private getStorageData(): StorageData | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data) as StorageData;
    } catch (error) {
      console.error('Failed to parse storage data:', error);
      return null;
    }
  }

  private setStorageData(data: StorageData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        const storageError = new Error('Storage quota exceeded') as StorageError;
        storageError.code = 'QUOTA_EXCEEDED';
        throw storageError;
      }
      throw error;
    }
  }

  private ensureStorage(): StorageData {
    let data = this.getStorageData();
    if (!data) {
      data = {
        version: CURRENT_VERSION,
        resumes: {},
      };
      this.setStorageData(data);
    }
    return data;
  }

  // CRUD Operations

  /**
   * Create a new resume
   */
  createResume(resume: Omit<Resume, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Resume {
    const now = new Date().toISOString();
    const newResume: Resume = {
      ...resume,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    const data = this.ensureStorage();
    data.resumes[newResume.id] = newResume;
    this.setStorageData(data);

    return newResume;
  }

  /**
   * Get a resume by ID
   */
  getResume(id: string): Resume | null {
    const data = this.getStorageData();
    if (!data) return null;
    return data.resumes[id] || null;
  }

  /**
   * Get all resumes
   */
  getAllResumes(): Resume[] {
    const data = this.getStorageData();
    if (!data) return [];
    return Object.values(data.resumes);
  }

  /**
   * Get resume metadata list (without full content)
   */
  getResumeList(): ResumeListItem[] {
    const resumes = this.getAllResumes();
    return resumes.map(resume => ({
      id: resume.id,
      name: resume.name,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
      version: resume.version,
      preview: this.generatePreview(resume),
    }));
  }

  /**
   * Update an existing resume
   */
  updateResume(id: string, updates: Partial<Omit<Resume, 'id' | 'createdAt'>>): Resume | null {
    const data = this.getStorageData();
    if (!data || !data.resumes[id]) return null;

    const existing = data.resumes[id];
    const updated: Resume = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
      version: existing.version + 1,
    };

    data.resumes[id] = updated;
    this.setStorageData(data);

    return updated;
  }

  /**
   * Delete a resume
   */
  deleteResume(id: string): boolean {
    const data = this.getStorageData();
    if (!data || !data.resumes[id]) return false;

    delete data.resumes[id];
    this.setStorageData(data);
    return true;
  }

  /**
   * Duplicate a resume
   */
  duplicateResume(id: string, newName?: string): Resume | null {
    const existing = this.getResume(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const duplicated: Resume = {
      ...existing,
      id: this.generateId(),
      name: newName || `${existing.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    const data = this.ensureStorage();
    data.resumes[duplicated.id] = duplicated;
    this.setStorageData(data);

    return duplicated;
  }

  /**
   * Import a resume (from JSON/YAML)
   */
  importResume(resume: Omit<Resume, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Resume {
    return this.createResume(resume);
  }

  /**
   * Export a resume to JSON
   */
  exportToJSON(id: string): string | null {
    const resume = this.getResume(id);
    if (!resume) return null;
    return JSON.stringify(resume, null, 2);
  }

  /**
   * Clear all resumes
   */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Get storage statistics
   */
  getStats(): { count: number; lastUpdated: string | null } {
    const resumes = this.getAllResumes();
    const lastUpdated = resumes.length > 0
      ? resumes.reduce((latest, r) => r.updatedAt > latest ? r.updatedAt : latest, resumes[0].updatedAt)
      : null;
    
    return {
      count: resumes.length,
      lastUpdated,
    };
  }

  // Private helpers

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePreview(resume: Resume): string {
    const parts: string[] = [];
    if (resume.basics.name) parts.push(resume.basics.name);
    if (resume.experience.length > 0) {
      parts.push(`${resume.experience.length} experience entries`);
    }
    if (resume.education.length > 0) {
      parts.push(`${resume.education.length} education entries`);
    }
    return parts.join(' • ');
  }
}

// Export singleton instance
export const storage = new StorageManager();

// Export error handling utilities
export function isStorageError(error: unknown): error is StorageError {
  return error instanceof Error && 'code' in error;
}

export function getStorageErrorMessage(error: unknown): string {
  if (!isStorageError(error)) {
    return 'An unexpected error occurred';
  }
  
  switch (error.code) {
    case 'PARSE_ERROR':
      return 'Failed to read saved data. It may be corrupted.';
    case 'QUOTA_EXCEEDED':
      return 'Storage limit reached. Please delete some resumes.';
    case 'NOT_FOUND':
      return 'Resume not found.';
    case 'VERSION_MISMATCH':
      return 'Data version is incompatible. Please update the app.';
    default:
      return error.message;
  }
}
