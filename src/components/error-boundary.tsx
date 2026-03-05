import { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, ExternalLink } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    // Clear all localStorage data
    try {
      localStorage.clear();
      console.log('Application data cleared');
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
    }
    
    // Reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-df-primary flex items-center justify-center p-4">
          <div className="bg-df-surface border border-df-border max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-df-accent-red/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-df-accent-red" />
            </div>
            
            <h1 className="font-bebas text-3xl text-df-text mb-2">
              Something Went Wrong
            </h1>
            
            <p className="text-df-text-secondary mb-6">
              We encountered an unexpected error. Your data has been preserved, but you may need to reset the application.
            </p>

            {this.state.error && (
              <div className="bg-df-elevated border border-df-border p-4 mb-6 text-left overflow-auto max-h-32">
                <p className="text-xs text-df-accent-red font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-df-accent-red text-df-text font-space font-medium hover:bg-df-accent-red/90 transition-colors focus:outline-2 focus:outline-df-accent-red focus:outline-offset-2"
                aria-label="Reset Application - clears all data and reloads"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Application
              </button>
              
              <a
                href="https://github.com/anomalyco/opencode/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-df-elevated border border-df-border text-df-text font-space font-medium hover:bg-df-border transition-colors focus:outline-2 focus:outline-df-accent-cyan focus:outline-offset-2"
                aria-label="Report Issue on GitHub - opens in new tab"
              >
                <ExternalLink className="w-4 h-4" />
                Report Issue
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
