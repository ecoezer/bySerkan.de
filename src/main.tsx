
import { createRoot } from 'react-dom/client';
import React from 'react';
import App from './App.tsx';
import './index.css';
import { cleanupDuplicateCategories } from './services/cleanupService';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  handleRepair = async () => {
    try {
      if (!confirm('Reparatur starten?')) return;
      const result = await cleanupDuplicateCategories();
      alert(result.message);
      window.location.reload();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      alert('Fehler: ' + message);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 p-8 rounded-xl max-w-lg w-full text-center border border-red-500/30 shadow-2xl">
            <h1 className="text-2xl font-bold text-white mb-4">Ein Fehler ist aufgetreten 😕</h1>
            <p className="text-gray-400 mb-6">Die Anwendung konnte nicht geladen werden. Dies liegt oft an doppelten Datenbank-Einträgen.</p>

            <div className="bg-black/30 p-4 rounded-lg mb-6 text-left overflow-auto max-h-32">
              <code className="text-red-400 text-xs font-mono">{this.state.error?.toString()}</code>
            </div>

            <button
              onClick={this.handleRepair}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
            >
              🔧 Datenbank Reparieren & Neustarten
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
