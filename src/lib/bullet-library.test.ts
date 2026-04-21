import { describe, expect, it } from 'vitest';

import {
  buildBulletLibraryGroups,
  getBasicsFieldEntries,
  getDropReorderIndex,
  getVisibleEducationEntries,
  getVisibleProjectEntries,
  getVisibleSkillCategories,
  moveArrayItem,
  moveArrayItemToIndex,
  reorderBasicsFields,
  reorderBasicsFieldsToIndex,
} from '@/lib/bullet-library';
import { cloneResume } from '@/test/fixtures';

describe('bullet-library', () => {
  it('moves items up and down without mutating the original array', () => {
    const original = ['a', 'b', 'c'];

    expect(moveArrayItem(original, 1, 'up')).toEqual(['b', 'a', 'c']);
    expect(moveArrayItem(original, 1, 'down')).toEqual(['a', 'c', 'b']);
    expect(moveArrayItem(original, 0, 'up')).toBe(original);
    expect(moveArrayItem(original, 2, 'down')).toBe(original);
  });

  it('moves items to a target index when the indices are valid', () => {
    const original = ['a', 'b', 'c', 'd'];

    expect(moveArrayItemToIndex(original, 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(moveArrayItemToIndex(original, 3, 1)).toEqual(['a', 'd', 'b', 'c']);
    expect(moveArrayItemToIndex(original, 2, 2)).toBe(original);
    expect(moveArrayItemToIndex(original, 5, 1)).toBe(original);
  });

  it('builds basics entries while honoring empty and hidden-field options', () => {
    const basics = {
      name: 'Taylor',
      email: ' taylor@example.com ',
      phone: '',
      github: ' taylordev ',
      hiddenFields: ['email'] as const,
    };

    expect(getBasicsFieldEntries(basics)).toEqual([
      {
        key: 'github',
        label: 'GitHub',
        value: 'taylordev',
        selected: true,
      },
    ]);

    expect(getBasicsFieldEntries(basics, { includeEmpty: true, includeHidden: true })).toEqual([
      {
        key: 'email',
        label: 'Email',
        value: 'taylor@example.com',
        selected: false,
      },
      {
        key: 'phone',
        label: 'Phone',
        value: '',
        selected: true,
      },
      {
        key: 'github',
        label: 'GitHub',
        value: 'taylordev',
        selected: true,
      },
    ]);
  });

  it('reorders basics fields while preserving summary and hidden field metadata', () => {
    const basics = {
      name: 'Taylor',
      email: 'taylor@example.com',
      phone: '123',
      github: 'taylordev',
      summary: 'Staff engineer',
      hiddenFields: ['email'] as const,
    };

    expect(reorderBasicsFields(basics, 'github', 'up')).toEqual({
      name: 'Taylor',
      summary: 'Staff engineer',
      hiddenFields: ['email'],
      email: 'taylor@example.com',
      github: 'taylordev',
      phone: '123',
    });

    expect(reorderBasicsFieldsToIndex(basics, 'phone', 0)).toEqual({
      name: 'Taylor',
      summary: 'Staff engineer',
      hiddenFields: ['email'],
      phone: '123',
      email: 'taylor@example.com',
      github: 'taylordev',
    });

    expect(reorderBasicsFields(basics, 'linkedin', 'up')).toBe(basics);
  });

  it('computes drop indices for before and after placements', () => {
    expect(getDropReorderIndex(1, 3, 'before')).toBe(2);
    expect(getDropReorderIndex(3, 1, 'before')).toBe(1);
    expect(getDropReorderIndex(1, 3, 'after')).toBe(3);
    expect(getDropReorderIndex(3, 1, 'after')).toBe(2);
    expect(getDropReorderIndex(2, 2, 'after')).toBe(2);
  });

  it('filters education, projects, and skills by selected state', () => {
    const resume = cloneResume();
    resume.education[1].selected = false;
    resume.projects[2].selected = false;
    resume.skills[5].selected = false;

    expect(getVisibleEducationEntries(resume.education)).toHaveLength(1);
    expect(getVisibleProjectEntries(resume.projects)).toHaveLength(2);
    expect(getVisibleSkillCategories(resume.skills)).toHaveLength(5);
  });

  it('builds grouped bullet library sections with selection overrides and project summaries', () => {
    const resume = cloneResume();
    resume.basics.hiddenFields = ['email'];
    resume.projects[1].selected = false;

    const selectedBullets = new Map<string, string[]>([
      ['edu-001', ['edu-b-002']],
      ['exp-001', ['b-004']],
      ['proj-001', ['pb-003']],
    ]);

    const groups = buildBulletLibraryGroups(resume, selectedBullets);

    expect(groups.map((group) => group.kind)).toEqual([
      'basics',
      'education',
      'experience',
      'project',
      'skills',
    ]);

    const basicsGroup = groups[0];
    expect(basicsGroup?.sections.find((section) => section.id === 'basics-email')?.items[0]?.selected).toBe(false);

    const educationGroup = groups[1];
    expect(educationGroup?.sections[0]?.items.map((item) => item.selected)).toEqual([false, true, false]);

    const experienceGroup = groups[2];
    expect(experienceGroup?.sections[0]?.title).toBe('Senior Software Engineer @ Stripe');
    expect(experienceGroup?.sections[0]?.items.find((item) => item.id === 'b-004')?.selected).toBe(true);

    const projectGroup = groups[3];
    expect(projectGroup?.sections[0]?.subtitle).toBe('TypeScript • React • Tailwind CSS +2 | 2023-11 - 2024-01');
    expect(projectGroup?.sections[0]?.items.find((item) => item.id === 'pb-003')?.selected).toBe(true);
    expect(projectGroup?.sections[1]?.visible).toBe(false);

    const skillsGroup = groups[4];
    expect(skillsGroup?.sections[0]).toMatchObject({
      title: 'Languages',
      subtitle: '6 skills',
    });
    expect(skillsGroup?.sections[0]?.items[0]?.text).toContain('TypeScript');
  });
});
