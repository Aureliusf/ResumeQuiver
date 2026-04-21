import { describe, expect, it, vi } from 'vitest';

import { sampleResume } from '@/data/sample-resume';
import {
  getYamlErrors,
  isValidResumeYaml,
  isValidYamlSyntax,
  mergeWithDefaults,
  parseYaml,
  parseYamlLoose,
  stringifyYaml,
} from '@/lib/yaml-utils';

describe('yaml-utils', () => {
  it('round-trips a valid resume through YAML parsing and stringifying', () => {
    const yaml = stringifyYaml(sampleResume);
    const parsed = parseYaml(yaml);

    expect(parsed.success).toBe(true);
    expect(parsed.data?.basics.name).toBe(sampleResume.basics.name);
    expect(parsed.data?.experience[0]?.bullets).toHaveLength(5);
  });

  it('reports schema validation issues separately from YAML syntax issues', () => {
    const invalidYaml = `
id: resume-1
name: Resume
createdAt: "2026-04-20T00:00:00.000Z"
updatedAt: "2026-04-20T00:00:00.000Z"
version: 1
basics:
  name: Jake
  email: not-an-email
education: []
experience: []
projects: []
skills: []
`;

    const result = parseYaml(invalidYaml);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Validation error');
    expect(result.error).toContain('basics.email');
    expect(isValidResumeYaml(invalidYaml)).toBe(false);
    expect(getYamlErrors(invalidYaml)).toHaveLength(1);
  });

  it('reports YAML syntax failures clearly', () => {
    const brokenYaml = 'basics:\n  name: Jake\n  email: [oops';

    expect(parseYaml(brokenYaml)).toEqual({
      success: false,
      error: expect.stringContaining('YAML parsing error:'),
    });
    expect(parseYamlLoose(brokenYaml)).toEqual({
      success: false,
      error: expect.stringContaining('YAML parsing error:'),
    });
    expect(isValidYamlSyntax(brokenYaml)).toBe(false);
    expect(getYamlErrors(brokenYaml)[0]).toContain('Flow sequence');
  });

  it('parses loose YAML content for incomplete data entry scenarios', () => {
    const result = parseYamlLoose('draft: true\nnotes:\n  - first\n  - second');

    expect(result).toEqual({
      success: true,
      data: {
        draft: true,
        notes: ['first', 'second'],
      },
    });
  });

  it('merges partial data with generated defaults while preserving provided values', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-20T09:15:00.000Z'));
    vi.spyOn(Date, 'now').mockReturnValue(99999);

    const merged = mergeWithDefaults({
      name: 'Imported Resume',
      basics: {
        name: 'Taylor',
        email: 'taylor@example.com',
        hiddenFields: ['email'],
      },
      experience: sampleResume.experience.slice(0, 1),
    });

    expect(merged).toEqual({
      id: 'resume-99999',
      name: 'Imported Resume',
      createdAt: '2026-04-20T09:15:00.000Z',
      updatedAt: '2026-04-20T09:15:00.000Z',
      version: 1,
      basics: {
        name: 'Taylor',
        email: 'taylor@example.com',
        hiddenFields: ['email'],
      },
      education: [],
      experience: sampleResume.experience.slice(0, 1),
      projects: [],
      skills: [],
    });

    vi.useRealTimers();
  });
});
