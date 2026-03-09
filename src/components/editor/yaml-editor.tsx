import { useEffect, useRef, useState } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { yaml } from '@codemirror/lang-yaml';
import { oneDark } from '@codemirror/theme-one-dark';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { autocompletion } from '@codemirror/autocomplete';

interface YamlEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

const customTheme = EditorView.theme({
  '&': {
    backgroundColor: '#0A0A0A',
    fontSize: '14px',
    fontFamily: "'JetBrains Mono', monospace",
    height: '100%',
  },
  '.cm-content': {
    backgroundColor: '#0A0A0A',
    color: '#FFFFFF',
    caretColor: '#FF3366',
    padding: '16px',
    minHeight: '100%',
  },
  '.cm-gutters': {
    backgroundColor: '#1A1A1A',
    borderRight: '1px solid #333333',
    color: '#A3A3A3',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '14px',
  },
  '.cm-gutter, .cm-gutterElement': {
    backgroundColor: '#1A1A1A',
    color: '#A3A3A3',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#252525',
    color: '#FFFFFF',
  },
  '.cm-activeLine': {
    backgroundColor: '#252525',
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: '#FF3366',
    borderLeftWidth: '2px',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(255, 51, 102, 0.3)',
  },
  '.cm-selectionBackground': {
    backgroundColor: 'rgba(255, 51, 102, 0.3)',
  },
  '.cm-selectionMatch': {
    backgroundColor: 'rgba(255, 51, 102, 0.2)',
  },
  '.cm-matchingBracket': {
    backgroundColor: 'rgba(255, 51, 102, 0.3)',
    outline: '1px solid #FF3366',
  },
  '.cm-tooltip': {
    backgroundColor: '#1A1A1A',
    border: '1px solid #333333',
    borderRadius: '4px',
  },
  '.cm-tooltip-autocomplete': {
    backgroundColor: '#1A1A1A',
    border: '1px solid #333333',
  },
  '.cm-completionLabel': {
    color: '#FFFFFF',
  },
  '.cm-completionActive': {
    backgroundColor: '#FF3366',
    color: '#FFFFFF',
  },
}, { dark: true });

// YAML error extension placeholder - can be extended for error highlighting
const yamlErrorExtension = EditorView.updateListener.of(() => {
  // This can be extended to handle YAML-specific error highlighting
});

export function YamlEditor({
  value,
  onChange,
  error,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
}: YamlEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        yaml(),
        oneDark,
        customTheme,
        autocompletion(),
        keymap.of([...defaultKeymap, indentWithTab]),
        yamlErrorExtension,
        EditorView.contentAttributes.of({
          ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
          ...(ariaLabelledBy ? { 'aria-labelledby': ariaLabelledBy } : {}),
          ...(ariaDescribedBy ? { 'aria-describedby': ariaDescribedBy } : {}),
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;
    setIsReady(true);

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  // Update editor content when value prop changes (but not from user typing)
  useEffect(() => {
    const view = viewRef.current;
    if (view && value !== view.state.doc.toString()) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: value,
        },
      });
    }
  }, [value]);

  return (
    <div
      ref={editorRef}
      className={`h-full w-full overflow-hidden ${
        error ? 'ring-1 ring-df-accent-red' : ''
      }`}
      style={{
        backgroundColor: '#0A0A0A',
      }}
    >
      {!isReady && (
        <div className="h-full w-full flex items-center justify-center text-df-text-secondary">
          <span className="animate-pulse">Loading editor...</span>
        </div>
      )}
    </div>
  );
}
