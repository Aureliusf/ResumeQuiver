import { describe, expect, it } from 'vitest';

import { applyTheme, getThemeById } from '@/lib/themes';

describe('themes', () => {
  it('returns the requested theme or falls back to the default theme', () => {
    expect(getThemeById('warm').name).toBe('Warm Amber');
    expect(getThemeById('not-a-theme' as never).id).toBe('direct-flash');
  });

  it('applies theme colors and removes optional colors that do not exist', () => {
    const root = document.documentElement;

    applyTheme(getThemeById('full-color'));
    expect(root.style.getPropertyValue('--df-accent-purple')).toBe('#9933FF');
    expect(root.style.getPropertyValue('--df-accent-amber')).toBe('#FFAA00');
    expect(root.getAttribute('data-theme')).toBe('full-color');

    applyTheme(getThemeById('direct-flash'));
    expect(root.style.getPropertyValue('--df-primary')).toBe('#0A0A0A');
    expect(root.style.getPropertyValue('--df-accent-purple')).toBe('');
    expect(root.style.getPropertyValue('--df-accent-amber')).toBe('');
    expect(root.getAttribute('data-theme')).toBe('direct-flash');
  });
});
