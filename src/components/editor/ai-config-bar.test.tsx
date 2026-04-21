import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { AIConfigBar } from '@/components/editor/ai-config-bar';
import { SettingsProvider } from '@/contexts/settings-context';

const { fetchModelsMock, getErrorMessageMock } = vi.hoisted(() => ({
  fetchModelsMock: vi.fn(),
  getErrorMessageMock: vi.fn((e: { message: string }) => `Error: ${e.message}`),
}));

vi.mock('@/lib/ai-client', () => ({
  fetchAvailableModels: fetchModelsMock,
  getErrorMessage: getErrorMessageMock,
}));

const { toastMock } = vi.hoisted(() => ({
  toastMock: { settingsSaved: vi.fn() },
}));

vi.mock('@/lib/toast', () => ({
  showSuccessToast: toastMock,
}));

describe('AIConfigBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders API key, base URL, and model inputs', () => {
    render(
      <SettingsProvider>
        <AIConfigBar />
      </SettingsProvider>
    );

    expect(screen.getByPlaceholderText('sk-...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://api.openai.com/v1')).toBeInTheDocument();
  });

  it('renders the save button', () => {
    render(
      <SettingsProvider>
        <AIConfigBar />
      </SettingsProvider>
    );

    expect(screen.getByText('Save AI Configuration')).toBeInTheDocument();
  });

  it('saves settings when save clicked', () => {
    render(
      <SettingsProvider>
        <AIConfigBar />
      </SettingsProvider>
    );

    const saveButton = screen.getByText('Save AI Configuration');
    fireEvent.click(saveButton);

    expect(toastMock.settingsSaved).toHaveBeenCalled();
  });

  it('shows saved state after saving', () => {
    render(
      <SettingsProvider>
        <AIConfigBar />
      </SettingsProvider>
    );

    fireEvent.click(screen.getByText('Save AI Configuration'));

    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('reverts saved state after timeout', () => {
    render(
      <SettingsProvider>
        <AIConfigBar />
      </SettingsProvider>
    );

    fireEvent.click(screen.getByText('Save AI Configuration'));
    expect(screen.getByText('Saved')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('updates form state when inputs change', () => {
    render(
      <SettingsProvider>
        <AIConfigBar />
      </SettingsProvider>
    );

    const apiKeyInput = screen.getByPlaceholderText('sk-...');
    fireEvent.change(apiKeyInput, { target: { value: 'sk-test-key' } });

    expect(apiKeyInput).toHaveValue('sk-test-key');
  });

  it('starts model discovery when API key and base URL are provided', async () => {
    fetchModelsMock.mockResolvedValueOnce(['gpt-4', 'gpt-3.5-turbo']);

    vi.useRealTimers();

    render(
      <SettingsProvider>
        <AIConfigBar />
      </SettingsProvider>
    );

    const apiKeyInput = screen.getByPlaceholderText('sk-...');
    fireEvent.change(apiKeyInput, { target: { value: 'sk-test' } });

    const baseUrlInput = screen.getByPlaceholderText('https://api.openai.com/v1');
    fireEvent.change(baseUrlInput, { target: { value: 'https://api.openai.com/v1' } });

    await waitFor(() => {
      expect(fetchModelsMock).toHaveBeenCalled();
    }, { timeout: 5000 });
  });

  it('shows not configured status when empty', () => {
    render(
      <SettingsProvider>
        <AIConfigBar />
      </SettingsProvider>
    );

    expect(screen.getByText(/configure ai to unlock features/i)).toBeInTheDocument();
  });
});
