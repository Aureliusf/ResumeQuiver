export type ThemeId = 'direct-flash' | 'purple-accent' | 'gradient' | 'warm' | 'full-color';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  colors: {
    primary: string;
    surface: string;
    elevated: string;
    text: string;
    textSecondary: string;
    accentRed: string;
    accentCyan: string;
    accentPurple?: string;
    accentGreen?: string;
    accentYellow?: string;
    accentAmber?: string;
    border: string;
  };
  gradients?: {
    header?: string;
    activeTab?: string;
    card?: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'direct-flash',
    name: 'Direct Flash',
    description: 'Original dark theme with red/cyan accents',
    colors: {
      primary: '#0A0A0A',
      surface: '#1A1A1A',
      elevated: '#252525',
      text: '#FFFFFF',
      textSecondary: '#888888',
      accentRed: '#FF3366',
      accentCyan: '#00FFFF',
      border: '#333333',
    },
  },
  {
    id: 'purple-accent',
    name: 'Purple Flash',
    description: 'Adds purple accent for special features',
    colors: {
      primary: '#0A0A0A',
      surface: '#1A1A1A',
      elevated: '#252525',
      text: '#FFFFFF',
      textSecondary: '#888888',
      accentRed: '#FF3366',
      accentCyan: '#00FFFF',
      accentPurple: '#9933FF',
      border: '#333333',
    },
  },
  {
    id: 'gradient',
    name: 'Gradient Flow',
    description: 'Subtle gradients on headers and cards',
    colors: {
      primary: '#0A0A0A',
      surface: '#1A1A1A',
      elevated: '#252525',
      text: '#FFFFFF',
      textSecondary: '#888888',
      accentRed: '#FF3366',
      accentCyan: '#00FFFF',
      accentPurple: '#9933FF',
      border: '#333333',
    },
    gradients: {
      header: 'linear-gradient(135deg, #FF3366 0%, #9933FF 100%)',
      activeTab: 'linear-gradient(180deg, transparent 0%, rgba(255, 51, 102, 0.2) 100%)',
      card: 'linear-gradient(180deg, #1A1A1A 0%, #252525 100%)',
    },
  },
  {
    id: 'warm',
    name: 'Warm Amber',
    description: 'Adds warm amber/gold accents',
    colors: {
      primary: '#0A0A0A',
      surface: '#1A1A1A',
      elevated: '#252525',
      text: '#FFFFFF',
      textSecondary: '#888888',
      accentRed: '#FF3366',
      accentCyan: '#00FFFF',
      accentAmber: '#FFAA00',
      border: '#333333',
    },
  },
  {
    id: 'full-color',
    name: 'Full Spectrum',
    description: 'Complete color palette with all accents',
    colors: {
      primary: '#0A0A0A',
      surface: '#1A1A1A',
      elevated: '#252525',
      text: '#FFFFFF',
      textSecondary: '#888888',
      accentRed: '#FF3366',
      accentCyan: '#00FFFF',
      accentPurple: '#9933FF',
      accentGreen: '#00FF88',
      accentYellow: '#FFFF00',
      accentAmber: '#FFAA00',
      border: '#333333',
    },
  },
];

export function getThemeById(id: ThemeId): Theme {
  return themes.find((t) => t.id === id) || themes[0];
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  
  root.style.setProperty('--df-primary', theme.colors.primary);
  root.style.setProperty('--df-surface', theme.colors.surface);
  root.style.setProperty('--df-elevated', theme.colors.elevated);
  root.style.setProperty('--df-text', theme.colors.text);
  root.style.setProperty('--df-text-secondary', theme.colors.textSecondary);
  root.style.setProperty('--df-accent-red', theme.colors.accentRed);
  root.style.setProperty('--df-accent-cyan', theme.colors.accentCyan);
  root.style.setProperty('--df-border', theme.colors.border);
  
  if (theme.colors.accentPurple) {
    root.style.setProperty('--df-accent-purple', theme.colors.accentPurple);
  } else {
    root.style.removeProperty('--df-accent-purple');
  }
  
  if (theme.colors.accentGreen) {
    root.style.setProperty('--df-accent-green', theme.colors.accentGreen);
  } else {
    root.style.removeProperty('--df-accent-green');
  }
  
  if (theme.colors.accentYellow) {
    root.style.setProperty('--df-accent-yellow', theme.colors.accentYellow);
  } else {
    root.style.removeProperty('--df-accent-yellow');
  }
  
  if (theme.colors.accentAmber) {
    root.style.setProperty('--df-accent-amber', theme.colors.accentAmber);
  } else {
    root.style.removeProperty('--df-accent-amber');
  }
  
  // Store theme ID
  root.setAttribute('data-theme', theme.id);
}
