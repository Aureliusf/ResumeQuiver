import { toast as sonnerToast } from 'sonner';

// Toast configuration
const toastConfig = {
  position: 'bottom-right' as const,
  theme: 'dark' as const,
  style: {
    background: '#1A1A1A',
    border: '1px solid #333333',
    color: '#FFFFFF',
  },
};

// Success toasts
export const showSuccessToast = {
  resumeSaved: () => sonnerToast.success('Resume saved', {
    ...toastConfig,
    description: 'Your changes have been saved successfully.',
  }),
  
  pdfGenerated: () => sonnerToast.success('PDF generated', {
    ...toastConfig,
    description: 'Your resume PDF has been downloaded.',
  }),
  
  settingsSaved: () => sonnerToast.success('Settings saved', {
    ...toastConfig,
    description: 'Your AI configuration has been updated.',
  }),
  
  bulletsUpdated: () => sonnerToast.success('Bullets updated', {
    ...toastConfig,
    description: 'Your bullet points have been updated.',
  }),
  
  resumeCreated: () => sonnerToast.success('New resume created', {
    ...toastConfig,
    description: 'Start editing your new resume.',
  }),
  
  resumeLoaded: (name: string) => sonnerToast.success('Resume loaded', {
    ...toastConfig,
    description: `Loaded "${name}" successfully.`,
  }),
  
  resumeDuplicated: () => sonnerToast.success('Resume duplicated', {
    ...toastConfig,
    description: 'A copy has been created.',
  }),
  
  resumeDeleted: () => sonnerToast.success('Resume deleted', {
    ...toastConfig,
    description: 'The resume has been removed.',
  }),
  
  resumeExported: () => sonnerToast.success('Resume exported', {
    ...toastConfig,
    description: 'Your resume has been exported as JSON.',
  }),
  
  tailoringComplete: () => sonnerToast.success('Analysis complete', {
    ...toastConfig,
    description: 'Job tailoring recommendations are ready.',
  }),
  
  bulletsSelected: () => sonnerToast.success('Bullets selected', {
    ...toastConfig,
    description: 'Best matching bullets have been selected.',
  }),
};

// Error toasts
export const showErrorToast = {
  yamlParse: (details?: string) => sonnerToast.error('Failed to parse YAML', {
    ...toastConfig,
    description: details || 'Please check your YAML syntax.',
  }),
  
  apiKey: () => sonnerToast.error('API error: Invalid key', {
    ...toastConfig,
    description: 'Please check your AI API key in settings.',
  }),
  
  apiError: (message?: string) => sonnerToast.error('API error', {
    ...toastConfig,
    description: message || 'An error occurred while communicating with the AI service.',
  }),
  
  pdfGeneration: () => sonnerToast.error('PDF generation failed', {
    ...toastConfig,
    description: 'Please try again or check your resume data.',
  }),
  
  networkError: () => sonnerToast.error('Network error', {
    ...toastConfig,
    description: 'Please check your internet connection.',
  }),
  
  saveFailed: () => sonnerToast.error('Failed to save', {
    ...toastConfig,
    description: 'Could not save your changes. Please try again.',
  }),
  
  loadFailed: () => sonnerToast.error('Failed to load', {
    ...toastConfig,
    description: 'Could not load the resume. Please try again.',
  }),
  
  deleteFailed: () => sonnerToast.error('Failed to delete', {
    ...toastConfig,
    description: 'Could not delete the resume. Please try again.',
  }),
  
  exportFailed: () => sonnerToast.error('Export failed', {
    ...toastConfig,
    description: 'Could not export the resume. Please try again.',
  }),
  
  tailoringFailed: () => sonnerToast.error('Analysis failed', {
    ...toastConfig,
    description: 'Could not analyze job description. Please try again.',
  }),
  
  generic: (message: string) => sonnerToast.error('Error', {
    ...toastConfig,
    description: message,
  }),
};

// Info toasts
export const showInfoToast = {
  loading: (message: string) => sonnerToast.loading(message, {
    ...toastConfig,
  }),
  
  info: (title: string, description?: string) => sonnerToast.info(title, {
    ...toastConfig,
    description,
  }),
};

// Dismiss toast
export const dismissToast = (toastId: string | number) => {
  sonnerToast.dismiss(toastId);
};
