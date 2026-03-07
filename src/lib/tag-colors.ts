// Map common tags to theme colors
export const tagColorMap: Record<string, string> = {
  // Purple tags
  'ai': 'df-accent-purple',
  'ml': 'df-accent-purple',
  'python': 'df-accent-purple',
  'tensorflow': 'df-accent-purple',
  'pytorch': 'df-accent-purple',
  'data': 'df-accent-purple',
  'analytics': 'df-accent-purple',
  'model': 'df-accent-purple',
  
  // Green tags
  'backend': 'df-accent-green',
  'api': 'df-accent-green',
  'database': 'df-accent-green',
  'performance': 'df-accent-green',
  'optimization': 'df-accent-green',
  'testing': 'df-accent-green',
  'ci/cd': 'df-accent-green',
  'devops': 'df-accent-green',
  
  // Yellow tags
  'frontend': 'df-accent-yellow',
  'ui': 'df-accent-yellow',
  'ux': 'df-accent-yellow',
  'design': 'df-accent-yellow',
  'react': 'df-accent-yellow',
  'vue': 'df-accent-yellow',
  'css': 'df-accent-yellow',
  
  // Amber tags
  'leadership': 'df-accent-amber',
  'team': 'df-accent-amber',
  'mentoring': 'df-accent-amber',
  'management': 'df-accent-amber',
  'communication': 'df-accent-amber',
  'collaboration': 'df-accent-amber',
  
  // Cyan tags
  'typescript': 'df-accent-cyan',
  'javascript': 'df-accent-cyan',
  'node': 'df-accent-cyan',
  'cloud': 'df-accent-cyan',
  'aws': 'df-accent-cyan',
  'docker': 'df-accent-cyan',
  'kubernetes': 'df-accent-cyan',
  
  // Red tags (default important)
  'architect': 'df-accent-red',
  'scale': 'df-accent-red',
  'security': 'df-accent-red',
  'critical': 'df-accent-red',
};

export function getTagColorClass(tag: string): string {
  const normalizedTag = tag.toLowerCase().trim();
  
  // Find matching color
  for (const [key, color] of Object.entries(tagColorMap)) {
    if (normalizedTag.includes(key)) {
      return color;
    }
  }
  
  // Default to surface color
  return 'df-surface';
}

export function getTagTextColorClass(tag: string): string {
  const color = getTagColorClass(tag);
  
  // For colored tags, use the color for text, otherwise use secondary text
  if (color === 'df-surface') {
    return 'text-df-text-secondary';
  }
  
  // Use the color with text- prefix
  return `text-${color}`;
}

export function getTagBgColorClass(tag: string): string {
  const color = getTagColorClass(tag);
  
  // For colored tags, use the color with low opacity background
  if (color === 'df-surface') {
    return 'bg-df-primary';
  }
  
  // Use the color with bg- prefix and opacity
  return `bg-${color}/10`;
}

export function getTagBorderColorClass(tag: string): string {
  const color = getTagColorClass(tag);
  
  if (color === 'df-surface') {
    return 'border-transparent';
  }
  
  return `border-${color}/30`;
}
