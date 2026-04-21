import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { JobDescriptionInput } from '@/components/tailoring/job-description-input';

describe('JobDescriptionInput', () => {
  it('renders textarea and analyze button', () => {
    render(
      <JobDescriptionInput
        value=""
        onChange={vi.fn()}
        onAnalyze={vi.fn()}
        isAnalyzing={false}
        error={null}
      />
    );

    expect(screen.getByPlaceholderText(/paste the job description/i)).toBeInTheDocument();
    expect(screen.getByText('Analyze')).toBeInTheDocument();
  });

  it('calls onChange when text is entered', () => {
    const onChange = vi.fn();
    render(
      <JobDescriptionInput
        value=""
        onChange={onChange}
        onAnalyze={vi.fn()}
        isAnalyzing={false}
        error={null}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/paste the job description/i), {
      target: { value: 'Some job description text' },
    });

    expect(onChange).toHaveBeenCalledWith('Some job description text');
  });

  it('calls onAnalyze when analyze clicked with enough text', () => {
    const onAnalyze = vi.fn();
    const longText = 'A'.repeat(150);

    render(
      <JobDescriptionInput
        value={longText}
        onChange={vi.fn()}
        onAnalyze={onAnalyze}
        isAnalyzing={false}
        error={null}
      />
    );

    fireEvent.click(screen.getByText('Analyze'));
    expect(onAnalyze).toHaveBeenCalledOnce();
  });

  it('shows validation error when text is too short', () => {
    const onAnalyze = vi.fn();

    render(
      <JobDescriptionInput
        value="short"
        onChange={vi.fn()}
        onAnalyze={onAnalyze}
        isAnalyzing={false}
        error={null}
      />
    );

    fireEvent.click(screen.getByText('Analyze'));
    expect(onAnalyze).not.toHaveBeenCalled();
    expect(screen.getByText(/at least 100 characters/i)).toBeInTheDocument();
  });

  it('disables textarea when analyzing', () => {
    render(
      <JobDescriptionInput
        value="test"
        onChange={vi.fn()}
        onAnalyze={vi.fn()}
        isAnalyzing
        error={null}
      />
    );

    expect(screen.getByPlaceholderText(/paste the job description/i)).toBeDisabled();
  });

  it('shows analyzing state', () => {
    render(
      <JobDescriptionInput
        value="test"
        onChange={vi.fn()}
        onAnalyze={vi.fn()}
        isAnalyzing
        error={null}
      />
    );

    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(
      <JobDescriptionInput
        value=""
        onChange={vi.fn()}
        onAnalyze={vi.fn()}
        isAnalyzing={false}
        error="Something went wrong"
      />
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('clears input when clear button clicked', () => {
    const onChange = vi.fn();
    render(
      <JobDescriptionInput
        value="some text"
        onChange={onChange}
        onAnalyze={vi.fn()}
        isAnalyzing={false}
        error={null}
      />
    );

    fireEvent.click(screen.getByText('Clear'));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('disables analyze button when value is empty', () => {
    render(
      <JobDescriptionInput
        value=""
        onChange={vi.fn()}
        onAnalyze={vi.fn()}
        isAnalyzing={false}
        error={null}
      />
    );

    expect(screen.getByText('Analyze').closest('button')).toBeDisabled();
  });
});
