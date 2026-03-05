import { Toaster } from 'sonner';
import { ResumeProvider } from '@/contexts/resume-context';
import { SettingsProvider } from '@/contexts/settings-context';
import { AppShell } from '@/components/layout/app-shell';
import { ErrorBoundary } from '@/components/error-boundary';

function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <ResumeProvider>
          <AppShell />
          <Toaster 
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: '#1A1A1A',
                border: '1px solid #333333',
                color: '#FFFFFF',
              },
            }}
          />
        </ResumeProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}

export default App;
