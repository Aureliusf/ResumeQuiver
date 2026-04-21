import { describe, expect, it } from 'vitest';

import { formatDate, formatDateRange } from '@/lib/date-utils';

describe('date-utils', () => {
  it('formats a range across supported input formats', () => {
    expect(formatDateRange('2024-01', '2024-12')).toBe('Jan. 2024 -- Dec. 2024');
    expect(formatDateRange('2024/7', '8/2025')).toBe('July 2024 -- Aug. 2025');
    expect(formatDateRange('September 2020', 'Present')).toBe('Sept. 2020 -- Present');
  });

  it('defaults the end date to Present when omitted or explicit present', () => {
    expect(formatDateRange('2021', undefined)).toBe('2021 -- Present');
    expect(formatDateRange('2020-06', 'present')).toBe('June 2020 -- Present');
  });

  it('passes unrecognized values through without throwing', () => {
    expect(formatDateRange('ASAP', 'Later')).toBe('ASAP -- Later');
    expect(formatDate('ASAP')).toBe('ASAP');
  });

  it('formats single dates without adding empty month prefixes', () => {
    expect(formatDate('2024-11')).toBe('Nov. 2024');
    expect(formatDate('2024')).toBe('2024');
  });
});
