import { describe, expect, it, vi } from 'vitest';

import { createEmptyResume, sampleResume } from '@/data/sample-resume';

describe('sample resume data', () => {
  it('provides a populated sample resume for onboarding', () => {
    expect(sampleResume.basics.name).toBe('Jake Gutierrez');
    expect(sampleResume.experience).toHaveLength(3);
    expect(sampleResume.projects).toHaveLength(3);
    expect(sampleResume.skills).toHaveLength(6);
  });

  it('creates an empty resume with defaults', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-20T14:30:00.000Z'));
    vi.spyOn(Date, 'now').mockReturnValue(1234567890);

    const resume = createEmptyResume();

    expect(resume).toEqual({
      id: 'resume-1234567890',
      name: 'Untitled Resume',
      createdAt: '2026-04-20T14:30:00.000Z',
      updatedAt: '2026-04-20T14:30:00.000Z',
      version: 1,
      basics: {
        name: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
      },
      education: [],
      experience: [],
      projects: [],
      skills: [],
    });

    vi.useRealTimers();
  });
});
