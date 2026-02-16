import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, LogIn } from 'lucide-react';

export default function MonitorLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const MONITOR_EMAIL = 'monitor@byserkan.de';

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: MONITOR_EMAIL,
        password,
      });

      if (error) {
        if (error.status === 400) {
          setError('Ungültiges Passwort.');
        } else {
          setError(error.message);
        }
        return;
      }

      navigate('/monitor');
    } catch (err: unknown) {
      console.error('Monitor login error:', err);
      setError('Ein Fehler ist aufgetreten. Bitte prüfen Sie Ihre Internetverbindung.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="flex justify-center mb-8">
            <div className="bg-blue-500 p-4 rounded-full">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Bestellmonitor
          </h1>
          <p className="text-slate-300 text-center mb-8">
            Bitte geben Sie das Monitor-Passwort ein
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                Passwort
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Passwort eingeben"
                required
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-400 bg-red-400/10 p-2 rounded">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !password}
              className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 flex items-center justify-center gap-2
                ${isLoading || !password
                  ? 'bg-blue-600/50 text-white/50 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Wird angemeldet...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Monitor starten
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

