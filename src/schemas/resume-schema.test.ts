import { describe, expect, it } from 'vitest';
import { resumeSchema, basicsSchema, bulletSchema } from '@/schemas/resume-schema';

describe('resumeSchema', () => {
  it('validates a complete resume object', () => {
    const validResume = {
      id: 'test',
      name: 'Test Resume',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      version: 1,
      basics: {
        name: 'Jane Doe',
        email: 'jane@example.com',
      },
      education: [],
      experience: [],
      projects: [],
      skills: [],
    };

    const result = resumeSchema.safeParse(validResume);
    expect(result.success).toBe(true);
  });

  it('rejects a resume missing required fields', () => {
    const invalidResume = {
      id: 'test',
      name: 'Test',
    };

    const result = resumeSchema.safeParse(invalidResume);
    expect(result.success).toBe(false);
  });

  it('provides default values for optional fields', () => {
    const bullet = { id: 'b1', text: 'Test bullet' };
    const result = bulletSchema.safeParse(bullet);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.selected).toBe(true);
      expect(result.data.tags).toEqual([]);
    }
  });

  it('validates basics with empty strings for email', () => {
    const result = basicsSchema.safeParse({
      name: 'Test',
      email: '',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid email format', () => {
    const result = basicsSchema.safeParse({
      name: 'Test',
      email: 'not-an-email',
    });

    expect(result.success).toBe(false);
  });

  it('validates basics without email', () => {
    const result = basicsSchema.safeParse({
      name: 'Test',
    });

    expect(result.success).toBe(true);
  });

  it('accepts valid hiddenFields', () => {
    const result = basicsSchema.safeParse({
      name: 'Test',
      hiddenFields: ['email', 'phone'],
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid hiddenFields values', () => {
    const result = basicsSchema.safeParse({
      name: 'Test',
      hiddenFields: ['invalid-field'],
    });

    expect(result.success).toBe(false);
  });

  it('defaults version to 1 when omitted', () => {
    const resume = {
      id: 'test',
      name: 'Test',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      basics: { name: 'Test' },
      education: [],
      experience: [],
      projects: [],
      skills: [],
    };

    const result = resumeSchema.safeParse(resume);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.version).toBe(1);
    }
  });
});
