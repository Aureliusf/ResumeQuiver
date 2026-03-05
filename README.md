# YAML Resume Builder

A modern, AI-powered resume builder with YAML editing, AI copywriting assistance, job tailoring, and PDF export. Features a sleek dark theme inspired by Direct Flash aesthetics.

![Resume Builder](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-06B6D4.svg)

## Features

- **YAML-based editing** - Edit your resume in YAML format with real-time validation
- **AI-powered copywriting** - Rewrite bullets, generate new ones, or improve your summary using AI
- **Job tailoring** - Paste a job description and let AI suggest which bullets match best
- **Bullet library** - Toggle individual bullets on/off for customization
- **Multiple resumes** - Manage multiple resumes with localStorage persistence
- **PDF export** - Generate professional PDFs using React-PDF with Jake's Resume template
- **Dark mode** - Direct Flash theme with cyan/red accents on dark background
- **Keyboard shortcuts** - Full keyboard support for power users
- **Responsive design** - Works on desktop, tablet, and mobile

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd resume-builder
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

## AI Provider Setup

To use AI features, you need to configure an AI provider:

### OpenAI
1. Get your API key from [OpenAI](https://platform.openai.com/api-keys)
2. Go to Settings in the app
3. Enter your API key, base URL (https://api.openai.com/v1), and model (e.g., gpt-4)

### Other Providers
You can use any OpenAI-compatible API:
- **Anthropic Claude**: Use https://api.anthropic.com/v1
- **OpenRouter**: Use https://openrouter.ai/api/v1
- **Local LLM**: Use your local endpoint (e.g., http://localhost:8080/v1)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save resume |
| `Ctrl/Cmd + P` | Generate PDF |
| `Ctrl/Cmd + N` | New resume |
| `Ctrl/Cmd + O` | Open resumes list |
| `Ctrl/Cmd + 1` | Switch to Editor tab |
| `Ctrl/Cmd + 2` | Switch to AI Copywriting tab |
| `Ctrl/Cmd + 3` | Switch to Tailoring tab |
| `Ctrl/Cmd + 4` | Switch to My Resumes tab |

Press `?` or click the help icon to view all shortcuts.

## Usage

### Creating a Resume

1. Start with the sample resume or create a new one
2. Edit the YAML in the Editor tab
3. Use the Bullet Library to select which bullets to include
4. Click "Generate PDF" to download your resume

### Using AI Features

1. Configure your AI provider in Settings
2. Go to the "AI Copywriting" tab
3. Choose from:
   - **Rewrite**: Rewrite existing bullets to be more impactful
   - **Generate**: Generate new bullets from a job description
   - **Summary**: Improve your professional summary

### Job Tailoring

1. Go to the "Tailoring" tab
2. Paste a job description
3. Click "Analyze"
4. Review match scores for each bullet
5. Click "Select Best Bullets" to automatically choose the best matches

### Managing Resumes

- **Create**: Start fresh with a new resume
- **Duplicate**: Create a copy of an existing resume
- **Export**: Save as JSON for backup or sharing
- **Delete**: Remove unwanted resumes

## Architecture

- **React 18** with hooks and context for state management
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **CodeMirror 6** for YAML editing with syntax highlighting
- **React-PDF** for PDF generation
- **Zod** for schema validation
- **Sonner** for toast notifications

See [AGENTS.md](./AGENTS.md) for detailed architecture documentation.

## Development

### Running Tests

```bash
# Type checking
npx tsc --noEmit

# Build
npm run build
```

### Project Structure

```
src/
├── components/     # React components
├── contexts/       # React context providers
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
├── schemas/        # Zod validation schemas
├── styles/         # CSS styles
└── types/          # TypeScript type definitions
```

### Styling

The app uses a Direct Flash theme with the following color palette:
- Background: `#0A0A0A`
- Surface: `#1A1A1A`
- Text: `#FFFFFF`
- Accent Red: `#FF3366`
- Accent Cyan: `#00FFFF`

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

See [TESTING.md](./TESTING.md) for the testing checklist.

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/anomalyco/opencode/issues) page.
