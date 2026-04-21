/**
 * Date formatting utilities for resume dates
 * Matches Jake's Resume LaTeX style
 */

const MONTH_NAMES = [
  'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June',
  'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'
];

/**
 * Parse a date string in various formats and return month and year
 * Supports: YYYY-MM, YYYY/MM, MM/YYYY, Mon YYYY, etc.
 */
function parseDate(dateStr: string): { month: string; year: string } | null {
  if (!dateStr || dateStr.toLowerCase() === 'present') {
    return null;
  }

  // Try YYYY-MM format (ISO)
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})$/);
  if (isoMatch) {
    const year = isoMatch[1];
    const monthIndex = parseInt(isoMatch[2], 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return { month: MONTH_NAMES[monthIndex], year };
    }
  }

  // Try YYYY/MM format
  const slashMatch = dateStr.match(/^(\d{4})\/(\d{1,2})$/);
  if (slashMatch) {
    const year = slashMatch[1];
    const monthIndex = parseInt(slashMatch[2], 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return { month: MONTH_NAMES[monthIndex], year };
    }
  }

  // Try MM/YYYY format
  const usMatch = dateStr.match(/^(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const year = usMatch[2];
    const monthIndex = parseInt(usMatch[1], 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return { month: MONTH_NAMES[monthIndex], year };
    }
  }

  // Try "Mon YYYY" or "Month YYYY" format
  const monthMatch = dateStr.match(/^([A-Za-z]+)\.?\s+(\d{4})$/);
  if (monthMatch) {
    const monthAbbr = monthMatch[1].toLowerCase();
    const year = monthMatch[2];
    
    // Find matching month
    const monthIndex = MONTH_NAMES.findIndex(m => 
      m.toLowerCase().replace('.', '').startsWith(monthAbbr) ||
      monthAbbr.startsWith(m.toLowerCase().replace('.', ''))
    );
    
    if (monthIndex !== -1) {
      return { month: MONTH_NAMES[monthIndex], year };
    }
  }

  // Try just year
  const yearMatch = dateStr.match(/^(\d{4})$/);
  if (yearMatch) {
    return { month: '', year: yearMatch[1] };
  }

  // Return original if we can't parse
  return { month: '', year: dateStr };
}

/**
 * Format a date range in Jake's Resume style
 * Example: "Aug. 2018 -- May 2021" or "June 2020 -- Present"
 * 
 * @param start - Start date string
 * @param end - End date string (optional, defaults to "Present")
 * @returns Formatted date range string
 */
export function formatDateRange(start: string, end?: string): string {
  const startDate = parseDate(start);
  const endDate = end ? parseDate(end) : null;

  const startStr = startDate 
    ? startDate.month 
      ? `${startDate.month} ${startDate.year}`
      : startDate.year
    : start;

  const endStr = endDate
    ? endDate.month
      ? `${endDate.month} ${endDate.year}`
      : endDate.year
    : 'Present';

  return `${startStr} -- ${endStr}`;
}

/**
 * Format a single date for education or other sections
 * Example: "Aug. 2018 -- May 2021"
 */
export function formatDate(dateStr: string): string {
  const parsed = parseDate(dateStr);
  if (!parsed) return dateStr;
  
  return parsed.month 
    ? `${parsed.month} ${parsed.year}`
    : parsed.year;
}
