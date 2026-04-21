import { describe, expect, it } from 'vitest';

import {
  getTagBgColorClass,
  getTagBorderColorClass,
  getTagColorClass,
  getTagTextColorClass,
} from '@/lib/tag-colors';

describe('tag-colors', () => {
  it('matches tags case-insensitively using partial matches', () => {
    expect(getTagColorClass(' React Performance ')).toBe('df-accent-green');
    expect(getTagColorClass('TypeScript')).toBe('df-accent-cyan');
    expect(getTagColorClass('AI/ML')).toBe('df-accent-purple');
  });

  it('falls back to surface styling for unknown tags', () => {
    expect(getTagColorClass('storytelling')).toBe('df-surface');
    expect(getTagTextColorClass('storytelling')).toBe('text-df-text-secondary');
    expect(getTagBgColorClass('storytelling')).toBe('bg-df-primary');
    expect(getTagBorderColorClass('storytelling')).toBe('border-transparent');
  });

  it('builds matching text, background, and border utility classes for known tags', () => {
    expect(getTagTextColorClass('docker')).toBe('text-df-accent-cyan');
    expect(getTagBgColorClass('docker')).toBe('bg-df-accent-cyan/10');
    expect(getTagBorderColorClass('docker')).toBe('border-df-accent-cyan/30');
  });
});
