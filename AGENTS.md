# Resume Builder - Agent Documentation

## Project Overview

A modern, AI-powered resume builder that uses YAML for editing and features a Direct Flash dark theme. Built with React, TypeScript, and Tailwind CSS.

### Key Features
- **YAML-based editing** with real-time validation and syntax highlighting
- **AI-powered copywriting** for bullet rewriting and generation
- **Job tailoring** with AI-powered bullet matching
- **PDF generation** using React-PDF with Jake's Resume template
- **Bullet library** for selecting which bullets to include
- **Multiple resumes** with localStorage persistence
- **Resizable panels** - Drag-to-resize sidebar, preview, and workspace
- **Multi-theme support** - 5 color themes including Direct Flash (default), Purple, Gradient, Warm, and Full Color
- **Enhanced preview** with zoom, fullscreen, PDF export, and page overflow detection

## Architecture

### Tech Stack
- **React 18** with hooks and context
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **CodeMirror 6** for YAML editing
- **React-PDF** for PDF generation
- **Zod** for schema validation
- **Sonner** for toast notifications

### Project Structure

```
src/
├── components/
│   ├── ai/
│   │   ├── ai-panel.tsx           # Main AI panel container
│   │   ├── generate-bullets.tsx   # Generate bullets from description
│   │   ├── improve-summary.tsx    # Improve professional summary
│   │   ├── rewrite-bullet.tsx     # Rewrite single bullet
│   │   └── suggestion-card.tsx    # Reusable suggestion card
│   ├── bullets/
│   │   ├── bullet-checkbox.tsx    # Individual bullet checkbox
│   │   └── bullet-manager.tsx     # Bullet library manager
│   ├── editor/
│   │   ├── ai-config-bar.tsx      # AI settings configuration
│   │   ├── editor-panel.tsx       # Main editor panel
│   │   └── yaml-editor.tsx        # CodeMirror YAML editor
│   ├── error-boundary.tsx         # Error boundary component
│   ├── help/
│   │   └── keyboard-shortcuts-modal.tsx  # Keyboard shortcuts help
│   ├── layout/
│   │   ├── app-shell.tsx          # Main app container (wraps FluidLayout)
│   │   ├── floating-reset-button.tsx # Layout reset button
│   │   ├── floating-sidebar.tsx   # Collapsible bullet library sidebar
│   │   ├── fluid-layout.tsx       # Three-panel resizable layout (main)
│   │   ├── header.tsx             # App header with tabs and resume selector
│   │   ├── left-panel.tsx         # Legacy resume preview panel
│   │   ├── mobile-bullet-modal.tsx # Mobile bullet library modal
│   │   ├── mobile-nav.tsx         # Mobile navigation
│   │   ├── preview-panel.tsx      # Enhanced resume preview with zoom/PDF
│   │   ├── resize-handle.tsx      # Resizable panel drag handle
│   │   ├── responsive-app-shell.tsx # Legacy responsive layout
│   │   ├── right-panel.tsx        # Legacy editor panel
│   │   └── workspace-panel.tsx    # Editor/AI/Tailoring container
│   ├── preview/
│   │   ├── pdf-document.tsx       # React-PDF document
│   │   └── resume-preview.tsx     # HTML resume preview
│   ├── resumes/
│   │   └── resumes-panel.tsx      # Resume list management
│   ├── tailoring/
│   │   ├── job-description-input.tsx # Job description textarea
│   │   ├── match-results.tsx      # Tailoring match results
│   │   └── tailoring-panel.tsx    # Job tailoring panel
│   └── ui/
│       ├── loading-spinner.tsx    # Reusable loading spinner
│       └── theme-switcher.tsx     # Theme selection UI
├── contexts/
│   ├── resume-context.tsx         # Resume data context
│   └── settings-context.tsx       # AI settings and theme context
├── data/
│   └── sample-resume.ts           # Sample resume data
├── hooks/
│   ├── use-ai.ts                  # AI operations hook
│   ├── use-keyboard-shortcuts.ts  # Keyboard shortcuts hook
│   ├── use-resizable-panels.ts    # Resizable panels hook
│   └── use-tailoring.ts           # Job tailoring hook
├── lib/
│   ├── ai-client.ts               # AI API client
│   ├── ai-tailoring.ts            # AI tailoring logic
│   ├── date-utils.ts              # Date formatting utilities
│   ├── pdf-export.ts              # PDF generation
│   ├── storage.ts                 # localStorage persistence
│   ├── tag-colors.ts              # Skill tag color mappings
│   ├── themes.ts                  # Multi-theme system
│   ├── toast.ts                   # Toast notification utilities
│   └── yaml-utils.ts              # YAML parsing/stringifying
├── schemas/
│   └── resume-schema.ts           # Zod validation schemas
├── styles/
│   └── resume.css                 # Resume preview styles
├── types/
│   └── resume.ts                  # TypeScript type definitions
├── App.tsx                        # Root component
├── index.css                      # Global styles
└── main.tsx                       # Entry point
```

### State Management

**Resume Context** (`contexts/resume-context.tsx`)
- Manages current resume data (YAML text, parsed resume object)
- Handles bullet selection state
- Provides methods for CRUD operations
- Auto-parses YAML and validates with Zod

**Settings Context** (`contexts/settings-context.tsx`)
- Manages AI provider configuration and theme selection
- Persists settings to localStorage
- Provides API key, base URL, model, and theme selection

### Key Design Decisions

1. **YAML as Source of Truth**: The resume is stored as YAML text, parsed into structured data
2. **Bullet Selection**: Users can toggle individual bullets on/off for customization
3. **AI Integration**: Modular AI client supports multiple providers (OpenAI, etc.)
4. **PDF Generation**: Server-side rendering with React-PDF for consistency
5. **Responsive Design**: Mobile-first with breakpoints at 640px and 1024px

## File Structure by Feature

### Editor Feature
- `components/editor/editor-panel.tsx` - Main editor UI
- `components/editor/yaml-editor.tsx` - CodeMirror integration
- `components/editor/ai-config-bar.tsx` - AI settings form

### AI Features
- `components/ai/ai-panel.tsx` - Container with tabs
- `components/ai/rewrite-bullet.tsx` - Bullet rewriting
- `components/ai/generate-bullets.tsx` - Bullet generation
- `components/ai/improve-summary.tsx` - Summary improvement
- `hooks/use-ai.ts` - Shared AI logic
- `lib/ai-client.ts` - API client

### Tailoring Feature
- `components/tailoring/tailoring-panel.tsx` - Main tailoring UI
- `components/tailoring/job-description-input.tsx` - Input component
- `components/tailoring/match-results.tsx` - Results display
- `hooks/use-tailoring.ts` - Tailoring logic
- `lib/ai-tailoring.ts` - AI analysis

### PDF Export
- `components/preview/pdf-document.tsx` - React-PDF template
- `components/preview/resume-preview.tsx` - HTML preview
- `lib/pdf-export.ts` - Export utilities

### Layout System
- `components/layout/fluid-layout.tsx` - Three-panel resizable layout (main)
- `components/layout/floating-sidebar.tsx` - Collapsible bullet library sidebar
- `components/layout/preview-panel.tsx` - Enhanced resume preview with zoom/PDF
- `components/layout/workspace-panel.tsx` - Editor/AI/Tailoring container
- `components/layout/resize-handle.tsx` - Resizable panel drag handle
- `components/layout/floating-reset-button.tsx` - Layout reset button
- `hooks/use-resizable-panels.ts` - Resizable panels hook

### Theme System
- `components/ui/theme-switcher.tsx` - Theme selection UI
- `lib/themes.ts` - Multi-theme system (5 themes)
- `lib/tag-colors.ts` - Skill tag color mappings

## How to Add Features

### Adding a New AI Feature

1. Create component in `components/ai/`
2. Add route/tab in `components/ai/ai-panel.tsx`
3. Use `useAI` hook for AI operations
4. Add success/error toast notifications
5. Export with `React.memo` for performance

Example:
```tsx
import { useAI } from '@/hooks/use-ai';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { showSuccessToast } from '@/lib/toast';

function NewAIFeature() {
  const { isLoading, suggestions, generate } = useAI(config);
  
  const handleGenerate = async () => {
    await generate(params);
    showSuccessToast.bulletsUpdated();
  };
  
  return (
    <button disabled={isLoading} onClick={handleGenerate}>
      {isLoading ? <LoadingSpinner /> : 'Generate'}
    </button>
  );
}

export default memo(NewAIFeature);
```

### Adding a New Tab

1. Update `TabId` type in `components/layout/header.tsx`
2. Add tab configuration to tabs array
3. Add case in `components/layout/workspace-panel.tsx` (or `right-panel.tsx` for legacy layout)
4. Create the panel component
5. Add keyboard shortcut in `use-keyboard-shortcuts.ts`

### Adding Keyboard Shortcuts

1. Add shortcut definition to `keyboardShortcuts` array in `use-keyboard-shortcuts.ts`
2. Add handler to `KeyboardShortcutHandlers` interface
3. Implement handler in `useKeyboardShortcuts` hook
4. Pass handler to `useKeyboardShortcuts` in `fluid-layout.tsx` (or `responsive-app-shell.tsx` for legacy layout)

### Adding Toast Notifications

Import from toast utilities:
```tsx
import { showSuccessToast, showErrorToast } from '@/lib/toast';

// Success
showSuccessToast.resumeSaved();
showSuccessToast.bulletsUpdated();
showSuccessToast.pdfGenerated();

// Error
showErrorToast.yamlParse(error.message);
showErrorToast.apiError(error.message);
showErrorToast.pdfGeneration();
```

### Adding Loading States

Use the `LoadingSpinner` component:
```tsx
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// With text
<LoadingSpinner size="sm" text="Loading..." />

// Without text
<LoadingSpinner size="md" />
```

## Styling Guidelines

### Color Palette (Direct Flash Theme)
- Primary background: `#0A0A0A` (`--df-primary`)
- Surface: `#111111` (`--df-surface`)
- Elevated: `#1A1A1A` (`--df-elevated`)
- Elevated 2: `#252525` (`--df-elevated-2`)
- Text: `#FFFFFF` (`--df-text`)
- Text secondary: `#A0A0A0` (`--df-text-secondary`)
- Accent red: `#FF3366` (`--df-accent-red`)
- Accent cyan: `#00FFFF` (`--df-accent-cyan`)
- Accent purple: `#9933FF` (`--df-accent-purple`)
- Accent green: `#33FF99` (`--df-accent-green`)
- Accent yellow: `#FFFF33` (`--df-accent-yellow`)
- Accent amber: `#FFAA00` (`--df-accent-amber`)
- Border: `#2A2A2A` (`--df-border`)

### Focus States
Always add focus indicators:
```tsx
className="focus:outline-2 focus:outline-df-accent-cyan focus:outline-offset-2"
```

### Responsive Breakpoints
- Mobile: < 640px (`sm:`)
- Tablet: 640px - 1024px (`md:`, `lg:`)
- Desktop: > 1024px

## Performance Guidelines

1. **Use React.memo** for expensive components
2. **Use useMemo** for expensive computations
3. **Use useCallback** for function props
4. **Lazy load** heavy components if needed
5. **Debounce** user input (already done for YAML parsing)

## Layout System

The app uses a **three-panel fluid layout** with resizable panels:

### Panel Structure
1. **Floating Sidebar** (Left) - Collapsible bullet library
   - Min width: 56px (collapsed), Max width: 400px
   - Default: 320px
   - Toggle button to collapse/expand
   - Shows bullet selection count when collapsed

2. **Preview Panel** (Center) - Enhanced resume preview
   - Fixed center position
   - Zoom controls (50% - 150%)
   - Fullscreen mode toggle
   - Page overflow detection
   - PDF export button

3. **Workspace Panel** (Right) - Editor/AI/Tailoring container
   - Min width: 350px, Max width: 700px
   - Default: 500px
   - Tab-based content switching

### Resizable Panels Hook
The `useResizablePanels` hook manages panel widths with:
- localStorage persistence (panel widths saved across sessions)
- Mouse and touch drag support
- Visual feedback during resizing
- Reset to defaults functionality

### Panel Reset
Users can reset all panels to default widths using the floating reset button (bottom-left) or keyboard shortcut.

## Theme System

The app supports **5 color themes**:

1. **Direct Flash** (default) - Original dark theme with red/cyan accents
2. **Purple Accent** - Adds purple accent color
3. **Gradient** - Gradient backgrounds for headers, tabs, and cards
4. **Warm** - Amber/gold accent colors
5. **Full Color** - Complete palette with all accent colors

Theme selection is available via the floating theme switcher button (bottom-right) and persists to localStorage.

## Testing

See TESTING.md for manual testing checklist.

For automated testing:
- Unit tests: Test individual hooks and utilities
- Component tests: Test component rendering and interactions
- E2E tests: Test complete user workflows

## Common Tasks

### Update Resume Schema
1. Modify `types/resume.ts`
2. Update `schemas/resume-schema.ts` with Zod
3. Update sample data in `data/sample-resume.ts`
4. Update PDF template in `components/preview/pdf-document.tsx`
5. Update HTML preview in `components/preview/resume-preview.tsx`

### Add New AI Provider
1. Update AI client in `lib/ai-client.ts`
2. Add provider-specific configuration in `components/editor/ai-config-bar.tsx`
3. Update settings context if needed

### Fix TypeScript Errors
Run type check: `npx tsc --noEmit`

### Build for Production
```bash
npm run build
```

Output in `dist/` directory.
