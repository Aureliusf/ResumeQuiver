import { beforeEach, describe, expect, it, vi } from 'vitest';

import { storage, getStorageErrorMessage, isStorageError } from '@/lib/storage';
import { cloneResume } from '@/test/fixtures';

describe('storage', () => {
  beforeEach(() => {
    storage.clearAll();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-20T12:00:00.000Z'));
    vi.spyOn(Date, 'now').mockReturnValue(1234567890);
    vi.spyOn(Math, 'random').mockReturnValue(0.123456789);
  });

  it('creates, reads, updates, lists, exports, duplicates, and deletes resumes', () => {
    const seed = cloneResume();
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, version: _version, ...input } = seed;

    const created = storage.createResume(input);
    expect(created.id).toBe('1234567890-4fzzzxjyl');
    expect(created.createdAt).toBe('2026-04-20T12:00:00.000Z');
    expect(storage.getResume(created.id)?.name).toBe(seed.name);
    expect(storage.getAllResumes()).toHaveLength(1);

    const list = storage.getResumeList();
    expect(list[0]?.preview).toContain(seed.basics.name);
    expect(list[0]?.preview).toContain('3 experience entries');
    expect(list[0]?.preview).toContain('2 education entries');

    vi.setSystemTime(new Date('2026-04-20T12:05:00.000Z'));
    const updated = storage.updateResume(created.id, { name: 'Updated Resume' });
    expect(updated?.id).toBe(created.id);
    expect(updated?.createdAt).toBe(created.createdAt);
    expect(updated?.updatedAt).toBe('2026-04-20T12:05:00.000Z');
    expect(updated?.version).toBe(2);

    vi.setSystemTime(new Date('2026-04-20T12:10:00.000Z'));
    vi.spyOn(Date, 'now').mockReturnValue(1234567891);
    vi.spyOn(Math, 'random').mockReturnValue(0.987654321);
    const duplicate = storage.duplicateResume(created.id, 'Duplicated Resume');
    expect(duplicate?.id).not.toBe(created.id);
    expect(duplicate?.name).toBe('Duplicated Resume');
    expect(duplicate?.version).toBe(1);

    expect(storage.exportToJSON(created.id)).toContain('"name": "Updated Resume"');
    expect(storage.deleteResume(created.id)).toBe(true);
    expect(storage.getResume(created.id)).toBeNull();
    expect(storage.deleteResume('missing')).toBe(false);
  });

  it('returns empty states when there is no saved data', () => {
    expect(storage.getResume('missing')).toBeNull();
    expect(storage.getAllResumes()).toEqual([]);
    expect(storage.getResumeList()).toEqual([]);
    expect(storage.exportToJSON('missing')).toBeNull();
    expect(storage.getStats()).toEqual({ count: 0, lastUpdated: null });
  });

  it('imports resumes and clears saved state', () => {
    const seed = cloneResume();
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, version: _version, ...input } = seed;

    const imported = storage.importResume(input);
    expect(storage.getResume(imported.id)).not.toBeNull();

    storage.clearAll();
    expect(storage.getAllResumes()).toEqual([]);
  });

  it('calculates stats using the most recently updated resume', () => {
    const first = cloneResume();
    first.updatedAt = '2026-01-01T00:00:00.000Z';
    const second = cloneResume();
    second.id = 'resume-2';
    second.updatedAt = '2026-04-01T00:00:00.000Z';

    localStorage.setItem('resume-builder-data', JSON.stringify({
      version: 1,
      resumes: {
        [first.id]: first,
        [second.id]: second,
      },
    }));

    expect(storage.getStats()).toEqual({
      count: 2,
      lastUpdated: '2026-04-01T00:00:00.000Z',
    });
  });

  it('handles corrupted storage data gracefully', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('resume-builder-data', '{not-json');

    expect(storage.getResume('broken')).toBeNull();
    expect(storage.getAllResumes()).toEqual([]);
    expect(consoleError).toHaveBeenCalled();
  });

  it('converts quota errors into typed storage errors', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      const error = new Error('quota hit');
      error.name = 'QuotaExceededError';
      throw error;
    });

    const seed = cloneResume();
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, version: _version, ...input } = seed;

    expect(() => storage.createResume(input)).toThrowError('Storage quota exceeded');

    try {
      storage.createResume(input);
    } catch (error) {
      expect(isStorageError(error)).toBe(true);
      expect(getStorageErrorMessage(error)).toBe('Storage limit reached. Please delete some resumes.');
    }
  });

  it('maps storage errors and unknown errors to user-facing messages', () => {
    const parseError = Object.assign(new Error('bad json'), { code: 'PARSE_ERROR' as const });
    const notFoundError = Object.assign(new Error('missing'), { code: 'NOT_FOUND' as const });
    const versionError = Object.assign(new Error('version'), { code: 'VERSION_MISMATCH' as const });

    expect(getStorageErrorMessage(parseError)).toBe('Failed to read saved data. It may be corrupted.');
    expect(getStorageErrorMessage(notFoundError)).toBe('Resume not found.');
    expect(getStorageErrorMessage(versionError)).toBe('Data version is incompatible. Please update the app.');
    expect(getStorageErrorMessage(new Error('boom'))).toBe('An unexpected error occurred');
  });
});
