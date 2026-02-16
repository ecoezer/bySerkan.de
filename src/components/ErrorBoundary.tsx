import React, { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-red-500/10 border border-red-500 rounded-lg p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-red-300 mb-4">
              {this.props.fallbackMessage || 'An error occurred while loading this page.'}
            </p>
            {this.state.error && (
              <div className="bg-slate-800 rounded p-4 mb-4">
                <p className="text-sm text-slate-300 font-mono text-left break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="space-y-2 text-sm text-slate-400">
              <p>Possible solutions:</p>
              <ul className="list-disc list-inside text-left">
                <li>Check your Supabase environment variables</li>
                <li>Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set</li>
                <li>Try refreshing the page</li>
                <li>Check the browser console for more details</li>
              </ul>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
