# Resume Builder Architecture Plan

## Project Overview
A YAML-based resume builder with AI-assisted copywriting and bullet selection management. All data (resume details and contact information) stays local in the browser.

## Core Value Propositions

1. **AI-Assisted Copywriting (BYOK - Bring Your Own Key)**: Browser-only AI integration for rewriting bullets, generating achievements, and tailoring content.
2. **Bullet Library Management**: Save multiple bullet points per role and toggle selections for resume customization.

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **YAML Editor**: CodeMirror 6 with YAML language support
- **PDF Generation**: @react-pdf/renderer (client-side)
- **State Management**: React hooks + Context (no external state library)
- **Validation**: Zod
- **Persistence**: localStorage

## Data Model

### Resume Schema

```typescript
interface Resume {
  basics: {
    name: string
    email: string
    phone: string
    location: string
    website?: string
    linkedin?: string
    github?: string
    summary?: string
  }
  experience: Experience[]
  skills: SkillCategory[]
  education: Education[]
  projects?: Project[]
}

interface Experience {
  company: string
  role: string
  dates: string
  bullets: Bullet[]
}

interface Bullet {
  id: string          // nanoid
  text: string        // content
  tags: string[]      // for filtering
  selected: boolean   // included in output
  aiGenerated: boolean
}
```

## Layout Structure

```
┌─────────────────────────────────────────────────────┬─────────────────────────────────────────────┐
│ YAML Resume Builder         [Resume Selector ▼]     │  ≡  AI Copywriting  Tailoring  My Resumes   │
├─────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
│                                                     │              RIGHT PANEL                    │
│              LEFT PANEL                             │        (content switches by tab)            │
│         (always the same)                           │                                             │
│                                                     │  Tab: default (YAML editing)                │
│  ┌──────── Rendered Resume Preview ──────────┐      │    [AI Config ▼ collapsible]               │
│  │                                            │      │    ┌─────── YAML Editor ──────────┐       │
│  │  Live preview showing only                 │      │    │ CodeMirror 6                  │       │
│  │  selected bullets                          │      │    │                               │       │
│  │                                            │      │    └───────────────────────────────┘       │
│  └────────────────────────────────────────────┘      │    [Generate PDF]                          │
│                                                     │                                             │
│                                                     │  Tab: AI Copywriting                       │
│                                                     │    - Rewrite bullet                        │
│                                                     │    - Generate bullets                      │
│                                                     │    - Improve summary                       │
│                                                     │                                             │
│                                                     │  Tab: Tailoring                            │
│                                                     │    - Paste job description                 │
│                                                     │    - AI selects matching bullets           │
│                                                     │    - Shows match scores                    │
│                                                     │                                             │
│                                                     │  Tab: My Resumes                           │
│                                                     │    - List of saved resumes                 │
│                                                     │    - Create / Duplicate / Delete           │
│                                                     │    - Import YAML                           │
├─────────────────────────────────────────────────────┴─────────────────────────────────────────────┤
│  Bullet Manager (accordion per role)                                                              │
│  ┌─ TechCorp - Senior Software Engineer ──────────────────────────────────────────── [▼] ─┐      │
│  │  [✓] Architected microservices handling 10M+ daily requests          #backend #scale   │      │
│  │  [✓] Led team of 5 engineers through platform migration              #leadership       │      │
│  └────────────────────────────────────────────────────────────────────────────────────────┘      │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
src/
├── main.tsx                        # Entry point
├── app.tsx                         # Root: layout shell, context providers
│
├── types/
│   └── resume.ts                   # Resume types
│
├── schemas/
│   └── resume-schema.ts            # Zod validation
│
├── lib/
│   ├── storage.ts                  # localStorage: resumes + settings
│   ├── yaml-utils.ts               # YAML parse/stringify
│   ├── pdf-export.ts               # PDF generation
│   └── ai-client.ts                # OpenAI-compatible fetch wrapper
│
├── hooks/
│   ├── use-resume-store.ts         # Current resume state
│   ├── use-resume-list.ts          # CRUD for multiple resumes
│   ├── use-bullet-selection.ts     # Toggle bullets
│   ├── use-ai.ts                   # AI operations
│   └── use-settings.ts             # AI config preferences
│
├── contexts/
│   ├── resume-context.tsx          # Resume context provider
│   └── settings-context.tsx        # Settings context provider
│
├── components/
│   ├── layout/
│   │   ├── app-shell.tsx           # Grid layout
│   │   ├── header.tsx              # Logo, dropdown, nav tabs
│   │   └── right-panel.tsx         # Switches content by tab
│   │
│   ├── preview/
│   │   └── resume-preview.tsx      # Rendered resume
│   │
│   ├── editor/
│   │   ├── yaml-editor.tsx         # CodeMirror 6
│   │   ├── ai-config-bar.tsx       # Collapsible provider/model/key
│   │   └── editor-panel.tsx        # Editor + config + PDF button
│   │
│   ├── ai/
│   │   ├── ai-panel.tsx            # AI Copywriting tab
│   │   ├── rewrite-bullet.tsx
│   │   ├── generate-bullets.tsx
│   │   └── improve-summary.tsx
│   │
│   ├── tailoring/
│   │   ├── tailoring-panel.tsx     # Tailoring tab
│   │   ├── job-description-input.tsx
│   │   └── match-results.tsx
│   │
│   ├── resumes/
│   │   ├── resume-list-panel.tsx   # My Resumes tab
│   │   ├── resume-card.tsx
│   │   └── import-yaml.tsx
│   │
│   └── bullets/
│       ├── bullet-manager.tsx      # Bottom panel
│       ├── role-accordion.tsx
│       └── bullet-row.tsx
│
└── styles/
    ├── index.css                   # Tailwind + base styles
    └── pdf.css                     # Print overrides
```

## State Management

### Data Flow

```
YAML Editor (source of truth)
    │
    ▼
yaml-utils.ts parse ──▶ Zod validate ──▶ Resume object (derived state)
    │                                          │
    ▼                                          ▼
use-resume-store                         Resume Preview
    │                                          │
    ▼                                          ▼
localStorage                           use-bullet-selection
(persist on save)                      (toggles which bullets render)
                                              │
                                              ▼
                                        Bullet Manager UI
                                        PDF Export
```

### Key State

**ResumeContext**:
- `yamlText`: Raw YAML string (source of truth)
- `resume`: Parsed Resume object
- `selectedBullets`: Map<experienceIndex, bulletId[]>
- `updateYaml(text)`: Parse, validate, update
- `save()`: Persist to localStorage
- `toggleBullet(expIdx, bulletId)`: Toggle bullet selection

**SettingsContext**:
- `apiKey`: API key for AI provider
- `apiBaseUrl`: Provider base URL
- `model`: Model identifier
- `updateSettings()`: Update and persist

## AI Service Layer

### OpenAI-Compatible Client

```typescript
interface AIClientConfig {
  apiKey: string
  baseUrl: string
  model: string
}

interface AIOperations {
  rewriteBullet(bullet: string, role: string, company: string): Promise<string[]>
  generateBullets(description: string, role: string): Promise<string[]>
  tailorToJob(resume: Resume, jobDescription: string): Promise<TailoringResult>
  improveSummary(summary: string, experience: Experience[]): Promise<string[]>
}
```

### AI Features

1. **Rewrite Bullet**: Select a bullet point, get 3-5 rewritten variations
2. **Generate Bullets**: Describe your work, get achievement-oriented bullets
3. **Improve Summary**: Current summary → 3-5 professional alternatives
4. **Tailor to Job**: Paste job description → AI scores and selects best bullets

All AI calls are made directly from browser → LLM API using `fetch()`. No backend server involved. API keys stored only in localStorage.

## Supported AI Providers

Any OpenAI-compatible API endpoint:
- **OpenAI**: https://api.openai.com/v1
- **Anthropic**: https://api.anthropic.com (via proxy or adapter)
- **Ollama**: http://localhost:11434/v1
- **Groq**: https://api.groq.com/openai/v1
- **Together**: https://api.together.xyz/v1
- **LM Studio**: http://localhost:1234/v1

## Implementation Phases

### Phase 1: Foundation
1. TypeScript + Tailwind setup
2. Types and Zod schema
3. Storage layer (localStorage)
4. YAML utilities

### Phase 2: Layout
1. App shell with header, split panels, tabs
2. CodeMirror YAML editor
3. Resume preview component

### Phase 3: Core Features
1. Bullet manager with accordion
2. Toggle bullets, persist selections
3. Multiple resume support
4. YAML import/export

### Phase 4: AI Integration
1. Settings panel (provider, model, key)
2. AI copywriting panel
3. Rewrite bullets feature
4. Generate bullets feature
5. Improve summary feature

### Phase 5: Tailoring
1. Job description input
2. AI scoring algorithm
3. Auto-select matching bullets
4. Manual override controls

### Phase 6: Export
1. @react-pdf/renderer integration
2. PDF export button
3. Print-friendly styles

### Phase 7: Polish
1. Error handling
2. Loading states
3. Responsive design
4. Keyboard shortcuts

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "yaml": "^2.3.4",
    "codemirror": "^6.0.1",
    "@codemirror/lang-yaml": "^6.0.0",
    "@react-pdf/renderer": "^3.1.14",
    "zod": "^3.22.4",
    "nanoid": "^5.0.4",
    "@sentry/react": "^7.91.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.0",
    "@vitejs/plugin-react": "^4.2.1"
  }
}
```

## Security Considerations

- **API Keys**: Never leave the browser. Stored in localStorage only.
- **Resume Data**: Never sent to any server. All processing is local.
- **AI Calls**: Made directly from browser to user's chosen provider.
- **No Telemetry**: No analytics, tracking, or data collection.
- **No Backend**: No server component required for any feature.

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires:
- ES2020+ JavaScript support
- localStorage
- IndexedDB (optional, for future expansion)
- fetch() API

## Observability

### Sentry Integration (Privacy-First)

Error tracking with strict PII scrubbing. All sensitive data is stripped before sending.

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/react';

export const initSentry = () => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      
      // Privacy: Don't send default PII
      sendDefaultPii: false,
      
      // Strip all sensitive data before sending
      beforeSend(event) {
        // Remove any potentially sensitive data from error messages
        if (event.exception?.values) {
          event.exception.values.forEach((exception) => {
            if (exception.stacktrace?.frames) {
              exception.stacktrace.frames.forEach((frame) => {
                // Don't include local variable values that might contain resume data
                delete frame.vars;
              });
            }
          });
        }
        
        // Remove any extra context that might contain resume data
        delete event.extra?.yamlText;
        delete event.extra?.resumeData;
        delete event.extra?.apiKey;
        delete event.contexts?.localStorage;
        
        // Sanitize breadcrumbs
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map((crumb) => {
            if (crumb.data) {
              // Remove any data that might be sensitive
              delete crumb.data.input;
              delete crumb.data.response;
            }
            return crumb;
          });
        }
        
        return event;
      },
      
      // Only track specific errors
      ignoreErrors: [
        // Ignore YAML parsing errors (user-facing, handled in UI)
        /YAMLException/,
        // Ignore network errors from AI providers (expected, user handles these)
        /Failed to fetch/,
        /NetworkError/,
      ],
      
      // Sampling
      tracesSampleRate: 0.1, // 10% of transactions
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    });
  }
};
```

**Environment Variable:**
```bash
VITE_SENTRY_DSN=your-sentry-dsn-here
```

**What Gets Tracked:**
- JavaScript errors (without variable values)
- Performance transactions (10% sample)
- Component render errors

**What Gets Stripped:**
- Resume YAML content
- API keys
- Local storage data
- User input values
- Network response bodies

## UI Design System

### Theme Choice: Direct Flash

**Why Direct Flash?**
- **High contrast**: Excellent for long editing sessions (resume work)
- **Modern aesthetic**: Appeals to tech professionals who use this tool
- **Clear hierarchy**: Neon accents naturally draw attention to actions
- **Professional edge**: Bold but not playful - conveys confidence

**Color Palette:**

```css
:root {
  /* Backgrounds */
  --bg-primary: #0A0A0A;        /* Deepest black */
  --bg-surface: #1A1A1A;        /* Card backgrounds */
  --bg-elevated: #252525;       /* Hover states */
  
  /* Text */
  --text-primary: #FFFFFF;      /* Pure white */
  --text-secondary: #888888;    /* Muted gray */
  --text-tertiary: #555555;     /* Very muted */
  
  /* Accents - Direct Flash */
  --accent-red: #FF3366;        /* Primary - actions, CTAs */
  --accent-cyan: #00FFFF;       /* Secondary - highlights */
  --accent-yellow: #FFFF00;     /* Warnings, important */
  --accent-purple: #9933FF;     /* Special features */
  
  /* Functional */
  --border-color: #333333;
  --border-accent: #FF3366;
  --success: #00FF88;
  --error: #FF3366;
  --warning: #FFFF00;
}
```

**Typography:**

```css
/* Display / Headings */
font-family: 'Bebas Neue', sans-serif;
font-weight: 400;
/* Used for: App title, major headings */

/* Body / UI Text */
font-family: 'Space Grotesk', sans-serif;
font-weight: 400; /* regular */
font-weight: 500; /* medium */
font-weight: 600; /* semibold */
/* Used for: UI labels, buttons, descriptions */

/* Monospace / Code */
font-family: 'JetBrains Mono', monospace;
font-weight: 400;
font-weight: 500;
/* Used for: YAML editor, technical values */
```

**Google Fonts Link:**
```html
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Component Patterns:**

```css
/* Card / Surface */
.surface {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 0; /* No border-radius for brutalist feel */
  box-shadow: 4px 4px 0 var(--accent-red);
}

/* Primary Button */
.btn-primary {
  background: var(--accent-red);
  color: var(--text-primary);
  border: none;
  border-radius: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 4px 4px 0 rgba(255, 51, 102, 0.3);
  transition: all 0.1s ease;
}

.btn-primary:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--accent-red);
}

.btn-primary:active {
  transform: translate(0, 0);
  box-shadow: 2px 2px 0 var(--accent-red);
}

/* Accent Borders */
.border-accent {
  border: 2px solid var(--accent-red);
}

.border-cyan {
  border: 2px solid var(--accent-cyan);
}

/* Selected State */
.selected {
  background: rgba(255, 51, 102, 0.1);
  border: 2px solid var(--accent-red);
}

/* YAML Editor Theme */
.yaml-editor {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
}

.yaml-editor .cm-gutters {
  background: var(--bg-surface);
  border-right: 1px solid var(--border-color);
}

.yaml-editor .cm-activeLineGutter {
  background: var(--bg-elevated);
}

.yaml-editor .cm-activeLine {
  background: rgba(255, 51, 102, 0.05);
}

/* Animations */
@keyframes flashIn {
  0% {
    opacity: 0;
    transform: scale(0.95);
    filter: brightness(2);
  }
  50% {
    filter: brightness(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: brightness(1);
  }
}

.animate-flash {
  animation: flashIn 0.3s ease-out;
}
```

**Color Usage Guide:**

- **Red (#FF3366)**: Primary actions, selected states, error messages, borders
- **Cyan (#00FFFF)**: Secondary accents, AI features, links, highlights
- **Yellow (#FFFF00)**: Warnings, unsaved changes indicator, important notices
- **Purple (#9933FF)**: Special features, premium indicators, experimental features
- **Green (#00FF88)**: Success states, saved indicators, valid states

**Visual Character:**

- **No rounded corners**: 0 border-radius for that raw, industrial feel
- **Sharp shadows**: Hard drop shadows (not blur) for depth
- **High contrast**: Pure white on pure black
- **Borders everywhere**: Elements are clearly defined with visible borders
- **Generous spacing**: Comfortable padding (1.5rem - 2rem) for a premium feel
- **Accent glow**: Subtle glow on active elements using accent colors
