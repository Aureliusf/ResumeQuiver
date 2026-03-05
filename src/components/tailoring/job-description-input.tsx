import { useState, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  error: string | null;
}

const MIN_CHARS = 100;
const MAX_CHARS = 5000;

export function JobDescriptionInput({
  value,
  onChange,
  onAnalyze,
  isAnalyzing,
  error,
}: JobDescriptionInputProps) {
  const [charCount, setCharCount] = useState(value.length);
  const [showValidation, setShowValidation] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (newValue.length <= MAX_CHARS) {
        onChange(newValue);
        setCharCount(newValue.length);
      }
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange('');
    setCharCount(0);
    setShowValidation(false);
  }, [onChange]);

  const handleAnalyze = useCallback(() => {
    setShowValidation(true);
    if (value.trim().length >= MIN_CHARS) {
      onAnalyze();
    }
  }, [value, onAnalyze]);

  const isValidLength = value.trim().length >= MIN_CHARS;
  const isNearLimit = charCount > MAX_CHARS * 0.9;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-space font-medium text-df-text">
          Job Description
        </label>
        <span
          className={`text-xs font-mono ${
            isNearLimit ? 'text-df-accent-red' : 'text-df-text-secondary'
          }`}
        >
          {charCount}/{MAX_CHARS}
        </span>
      </div>

      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Paste the job description here..."
        disabled={isAnalyzing}
        className="w-full min-h-[200px] p-4 bg-df-primary text-df-text font-mono text-sm resize-y border border-df-border focus:border-df-accent-cyan focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {showValidation && !isValidLength && (
        <p className="text-xs text-df-accent-red">
          Job description must be at least {MIN_CHARS} characters.
        </p>
      )}

      {error && (
        <p className="text-xs text-df-accent-red">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !value.trim()}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-df-accent-red text-white font-space font-medium text-sm hover:bg-df-accent-red/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Analyze
            </>
          )}
        </button>

        <button
          onClick={handleClear}
          disabled={isAnalyzing || !value}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-df-border text-df-text-secondary font-space font-medium text-sm hover:bg-df-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <X className="w-4 h-4" />
          Clear
        </button>
      </div>
    </div>
  );
}
