import type { Basics, Education, Resume, SkillCategory } from '@/types/resume';

export type BulletLibrarySectionKind = 'basics' | 'education' | 'experience' | 'project' | 'skills';
export type BulletLibraryItemLocator = string | number;
export type MoveDirection = 'up' | 'down';

const BASIC_FIELD_LABELS = {
  email: 'Email',
  phone: 'Phone',
  location: 'Location',
  website: 'Website',
  linkedin: 'LinkedIn',
  github: 'GitHub',
} as const;

export type BasicFieldKey = keyof typeof BASIC_FIELD_LABELS;

export interface BasicsFieldEntry {
  key: BasicFieldKey;
  label: string;
  value: string;
}

export interface BulletLibraryItem {
  id: string;
  text: string;
  tags?: string[];
  selected: boolean;
  toggleable: boolean;
}

export interface BulletLibrarySection {
  id: string;
  kind: BulletLibrarySectionKind;
  moveId: BulletLibraryItemLocator;
  toggleId?: BulletLibraryItemLocator;
  title: string;
  subtitle?: string;
  items: BulletLibraryItem[];
  role?: string;
  company?: string;
}

export interface BulletLibraryGroup {
  kind: BulletLibrarySectionKind;
  label: string;
  sections: BulletLibrarySection[];
}

function isBasicFieldKey(value: string): value is BasicFieldKey {
  return value in BASIC_FIELD_LABELS;
}

export function moveArrayItem<T>(items: T[], index: number, direction: MoveDirection): T[] {
  const targetIndex = direction === 'up' ? index - 1 : index + 1;

  if (index < 0 || index >= items.length || targetIndex < 0 || targetIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  [nextItems[index], nextItems[targetIndex]] = [nextItems[targetIndex], nextItems[index]];
  return nextItems;
}

export function getBasicsFieldEntries(
  basics: Basics,
  options: { includeEmpty?: boolean } = {}
): BasicsFieldEntry[] {
  const { includeEmpty = false } = options;

  return Object.entries(basics).flatMap(([key, value]) => {
    if (!isBasicFieldKey(key) || typeof value !== 'string') {
      return [];
    }

    if (!includeEmpty && value.trim().length === 0) {
      return [];
    }

    return [
      {
        key,
        label: BASIC_FIELD_LABELS[key],
        value: value.trim(),
      },
    ];
  });
}

export function reorderBasicsFields(
  basics: Basics,
  fieldKey: BasicFieldKey,
  direction: MoveDirection
): Basics {
  const orderedEntries = getBasicsFieldEntries(basics, { includeEmpty: true });
  const index = orderedEntries.findIndex((entry) => entry.key === fieldKey);

  if (index === -1) {
    return basics;
  }

  const reorderedEntries = moveArrayItem(orderedEntries, index, direction);
  if (reorderedEntries === orderedEntries) {
    return basics;
  }

  const nextBasics: Basics = {
    name: basics.name,
  };

  if (typeof basics.summary === 'string' && basics.summary.length > 0) {
    nextBasics.summary = basics.summary;
  }

  reorderedEntries.forEach(({ key }) => {
    const value = basics[key];
    if (typeof value === 'string') {
      nextBasics[key] = value;
    }
  });

  return nextBasics;
}

function getProjectSubtitle(technologies: string[], startDate: string, endDate: string): string {
  const dateLabel = `${startDate} - ${endDate || 'Present'}`;

  if (technologies.length === 0) {
    return dateLabel;
  }

  if (technologies.length <= 3) {
    return `${technologies.join(' • ')} | ${dateLabel}`;
  }

  return `${technologies.slice(0, 3).join(' • ')} +${technologies.length - 3} | ${dateLabel}`;
}

export function getVisibleEducationEntries(education: Education[]) {
  return education.filter((entry) => entry.selected !== false);
}

export function getVisibleSkillCategories(skills: SkillCategory[]) {
  return skills.filter((skill) => skill.selected !== false);
}

export function buildBulletLibraryGroups(
  resume: Resume,
  selectedBullets: Map<string, string[]>
): BulletLibraryGroup[] {
  const groups: BulletLibraryGroup[] = [];

  const basicsSections: BulletLibrarySection[] = getBasicsFieldEntries(resume.basics).map((field) => ({
    id: `basics-${field.key}`,
    kind: 'basics',
    moveId: field.key,
    title: field.label,
    subtitle: field.value,
    items: [
      {
        id: `basics-item-${field.key}`,
        text: field.value,
        selected: true,
        toggleable: false,
      },
    ],
  }));

  if (basicsSections.length > 0) {
    groups.push({
      kind: 'basics',
      label: 'Basics',
      sections: basicsSections,
    });
  }

  const educationSections: BulletLibrarySection[] = resume.education.map((entry) => ({
    id: entry.id,
    kind: 'education',
    moveId: entry.id,
    toggleId: entry.id,
    title: entry.school,
    subtitle: [entry.location, entry.dates].filter(Boolean).join(' • '),
    items: [
      {
        id: `education-item-${entry.id}`,
        text: entry.degree,
        selected: entry.selected !== false,
        toggleable: true,
      },
    ],
  }));

  if (educationSections.length > 0) {
    groups.push({
      kind: 'education',
      label: 'Education',
      sections: educationSections,
    });
  }

  const experienceSections: BulletLibrarySection[] = resume.experience.map((entry) => {
    const selectedIds = selectedBullets.get(entry.id);
    return {
      id: entry.id,
      kind: 'experience',
      moveId: entry.id,
      title: `${entry.role} @ ${entry.company}`,
      subtitle: `${entry.startDate} - ${entry.endDate || 'Present'}`,
      role: entry.role,
      company: entry.company,
      items: entry.bullets.map((bullet) => ({
        id: bullet.id,
        text: bullet.text,
        tags: bullet.tags,
        selected: selectedIds ? selectedIds.includes(bullet.id) : bullet.selected !== false,
        toggleable: true,
      })),
    };
  });

  if (experienceSections.length > 0) {
    groups.push({
      kind: 'experience',
      label: 'Work Experience',
      sections: experienceSections,
    });
  }

  const projectSections: BulletLibrarySection[] = resume.projects.map((entry) => {
    const selectedIds = selectedBullets.get(entry.id);
    return {
      id: entry.id,
      kind: 'project',
      moveId: entry.id,
      title: entry.name,
      subtitle: getProjectSubtitle(entry.technologies, entry.startDate, entry.endDate),
      items: entry.bullets.map((bullet) => ({
        id: bullet.id,
        text: bullet.text,
        tags: bullet.tags,
        selected: selectedIds ? selectedIds.includes(bullet.id) : bullet.selected !== false,
        toggleable: true,
      })),
    };
  });

  if (projectSections.length > 0) {
    groups.push({
      kind: 'project',
      label: 'Projects',
      sections: projectSections,
    });
  }

  const skillSections: BulletLibrarySection[] = resume.skills.map((entry, index) => ({
    id: `skills-${index}`,
    kind: 'skills',
    moveId: index,
    toggleId: index,
    title: entry.category,
    subtitle: `${entry.items.length} skill${entry.items.length === 1 ? '' : 's'}`,
    items: [
      {
        id: `skills-item-${index}`,
        text: entry.items.join(', '),
        selected: entry.selected !== false,
        toggleable: true,
      },
    ],
  }));

  if (skillSections.length > 0) {
    groups.push({
      kind: 'skills',
      label: 'Technical Skills',
      sections: skillSections,
    });
  }

  return groups;
}
