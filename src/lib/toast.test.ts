import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  dismissToast,
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from '@/lib/toast';

const { successMock, errorMock, infoMock, loadingMock, dismissMock } = vi.hoisted(() => ({
  successMock: vi.fn(),
  errorMock: vi.fn(),
  infoMock: vi.fn(),
  loadingMock: vi.fn(),
  dismissMock: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: successMock,
    error: errorMock,
    info: infoMock,
    loading: loadingMock,
    dismiss: dismissMock,
  },
}));

describe('toast helpers', () => {
  beforeEach(() => {
    successMock.mockReset();
    errorMock.mockReset();
    infoMock.mockReset();
    loadingMock.mockReset();
    dismissMock.mockReset();
  });

  describe('showSuccessToast', () => {
    it('shows resume saved toast', () => {
      showSuccessToast.resumeSaved();
      expect(successMock).toHaveBeenCalledWith('Resume saved', expect.objectContaining({
        position: 'bottom-right',
        theme: 'dark',
      }));
    });

    it('shows pdf generated toast', () => {
      showSuccessToast.pdfGenerated();
      expect(successMock).toHaveBeenCalledWith('PDF generated', expect.objectContaining({
        description: 'Your resume PDF has been downloaded.',
      }));
    });

    it('shows settings saved toast', () => {
      showSuccessToast.settingsSaved();
      expect(successMock).toHaveBeenCalledWith('Settings saved', expect.objectContaining({
        description: 'Your AI configuration has been updated.',
      }));
    });

    it('shows bullets updated toast', () => {
      showSuccessToast.bulletsUpdated();
      expect(successMock).toHaveBeenCalledWith('Bullets updated', expect.objectContaining({
        description: 'Your bullet points have been updated.',
      }));
    });

    it('shows resume created toast', () => {
      showSuccessToast.resumeCreated();
      expect(successMock).toHaveBeenCalledWith('New resume created', expect.objectContaining({
        description: 'Start editing your new resume.',
      }));
    });

    it('shows resume loaded toast with name', () => {
      showSuccessToast.resumeLoaded('My Resume');
      expect(successMock).toHaveBeenCalledWith('Resume loaded', expect.objectContaining({
        description: 'Loaded "My Resume" successfully.',
      }));
    });

    it('shows resume duplicated toast', () => {
      showSuccessToast.resumeDuplicated();
      expect(successMock).toHaveBeenCalledWith('Resume duplicated', expect.objectContaining({
        description: 'A copy has been created.',
      }));
    });

    it('shows resume deleted toast', () => {
      showSuccessToast.resumeDeleted();
      expect(successMock).toHaveBeenCalledWith('Resume deleted', expect.objectContaining({
        description: 'The resume has been removed.',
      }));
    });

    it('shows resume exported toast', () => {
      showSuccessToast.resumeExported();
      expect(successMock).toHaveBeenCalledWith('Resume exported', expect.objectContaining({
        description: 'Your resume has been exported as JSON.',
      }));
    });

    it('shows tailoring complete toast', () => {
      showSuccessToast.tailoringComplete();
      expect(successMock).toHaveBeenCalledWith('Analysis complete', expect.objectContaining({
        description: 'Job tailoring recommendations are ready.',
      }));
    });

    it('shows bullets selected toast', () => {
      showSuccessToast.bulletsSelected();
      expect(successMock).toHaveBeenCalledWith('Bullets selected', expect.objectContaining({
        description: 'Best matching bullets have been selected.',
      }));
    });
  });

  describe('showErrorToast', () => {
    it('shows yaml parse error with default description', () => {
      showErrorToast.yamlParse();
      expect(errorMock).toHaveBeenCalledWith('Failed to parse YAML', expect.objectContaining({
        description: 'Please check your YAML syntax.',
      }));
    });

    it('shows yaml parse error with custom description', () => {
      showErrorToast.yamlParse('Custom error detail');
      expect(errorMock).toHaveBeenCalledWith('Failed to parse YAML', expect.objectContaining({
        description: 'Custom error detail',
      }));
    });

    it('shows api key error', () => {
      showErrorToast.apiKey();
      expect(errorMock).toHaveBeenCalledWith('API error: Invalid key', expect.objectContaining({
        description: 'Please check your AI API key in settings.',
      }));
    });

    it('shows api error with message', () => {
      showErrorToast.apiError('Rate limited');
      expect(errorMock).toHaveBeenCalledWith('API error', expect.objectContaining({
        description: 'Rate limited',
      }));
    });

    it('shows api error with default message', () => {
      showErrorToast.apiError();
      expect(errorMock).toHaveBeenCalledWith('API error', expect.objectContaining({
        description: 'An error occurred while communicating with the AI service.',
      }));
    });

    it('shows pdf generation error', () => {
      showErrorToast.pdfGeneration();
      expect(errorMock).toHaveBeenCalledWith('PDF generation failed', expect.objectContaining({
        description: 'Please try again or check your resume data.',
      }));
    });

    it('shows network error', () => {
      showErrorToast.networkError();
      expect(errorMock).toHaveBeenCalledWith('Network error', expect.objectContaining({
        description: 'Please check your internet connection.',
      }));
    });

    it('shows save failed error', () => {
      showErrorToast.saveFailed();
      expect(errorMock).toHaveBeenCalledWith('Failed to save', expect.objectContaining({
        description: 'Could not save your changes. Please try again.',
      }));
    });

    it('shows load failed error', () => {
      showErrorToast.loadFailed();
      expect(errorMock).toHaveBeenCalledWith('Failed to load', expect.objectContaining({
        description: 'Could not load the resume. Please try again.',
      }));
    });

    it('shows delete failed error', () => {
      showErrorToast.deleteFailed();
      expect(errorMock).toHaveBeenCalledWith('Failed to delete', expect.objectContaining({
        description: 'Could not delete the resume. Please try again.',
      }));
    });

    it('shows export failed error', () => {
      showErrorToast.exportFailed();
      expect(errorMock).toHaveBeenCalledWith('Export failed', expect.objectContaining({
        description: 'Could not export the resume. Please try again.',
      }));
    });

    it('shows tailoring failed error', () => {
      showErrorToast.tailoringFailed();
      expect(errorMock).toHaveBeenCalledWith('Analysis failed', expect.objectContaining({
        description: 'Could not analyze job description. Please try again.',
      }));
    });

    it('shows generic error with message', () => {
      showErrorToast.generic('Something broke');
      expect(errorMock).toHaveBeenCalledWith('Error', expect.objectContaining({
        description: 'Something broke',
      }));
    });
  });

  describe('showInfoToast', () => {
    it('shows loading toast', () => {
      showInfoToast.loading('Loading models');
      expect(loadingMock).toHaveBeenCalledWith('Loading models', expect.objectContaining({
        theme: 'dark',
      }));
    });

    it('shows info toast with description', () => {
      showInfoToast.info('Heads up', 'More details');
      expect(infoMock).toHaveBeenCalledWith('Heads up', expect.objectContaining({
        description: 'More details',
      }));
    });

    it('shows info toast without description', () => {
      showInfoToast.info('Heads up');
      expect(infoMock).toHaveBeenCalledWith('Heads up', expect.objectContaining({
        description: undefined,
      }));
    });
  });

  describe('dismissToast', () => {
    it('dismisses toast by id', () => {
      dismissToast('toast-1');
      expect(dismissMock).toHaveBeenCalledWith('toast-1');
    });

    it('dismisses toast by numeric id', () => {
      dismissToast(42);
      expect(dismissMock).toHaveBeenCalledWith(42);
    });
  });
});
