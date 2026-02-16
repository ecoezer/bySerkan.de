import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { updatePassword } from '../services/authService';
import { Notification } from '../components/Notification';
import { useNotification } from '../hooks/useNotification';

const AdminProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { notification, showSuccess, showError, clearNotification } = useNotification();

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            showError('Die neuen Passwörter stimmen nicht überein');
            return;
        }

        if (newPassword.length < 6) {
            showError('Das neue Passwort muss mindestens 6 Zeichen lang sein');
            return;
        }

        setLoading(true);
        try {
            const result = await updatePassword(newPassword);

            if (!result.success) {
                showError(result.errorMessage || 'Fehler beim Ändern des Passworts');
                return;
            }

            showSuccess('Passwort erfolgreich geändert!');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: unknown) {
            console.error('Password change error:', error);
            showError('Ein unbekannter Fehler ist aufgetreten.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1a2332]">
            <header className="bg-[#1a2332] border-b border-gray-700 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold text-white">Admin-Einstellungen</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-[#2a3648] rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
                    <div className="p-8 border-b border-gray-700">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-orange-500/10 rounded-xl">
                                <Lock className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Passwort ändern</h2>
                                <p className="text-gray-400 text-sm">Aktualisieren Sie Ihren Admin-Zugang</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordChange} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            {/* New Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Neues Passwort</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-gray-700 text-white rounded-lg pl-4 pr-12 py-3 focus:ring-2 focus:ring-orange-500 outline-none border border-gray-600 transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Passwort bestätigen</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none border border-gray-600 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex items-center justify-center gap-2 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-orange-500/20 transform hover:-translate-y-0.5 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Wird aktualisiert...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="w-5 h-5" />
                                        Passwort aktualisieren
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="p-6 bg-[#1e2836] border-t border-gray-700">
                        <p className="text-xs text-center text-gray-500">
                            Supabase benötigt keine erneute Authentifizierung für Passwortänderungen in einer aktiven Sitzung.
                        </p>
                    </div>
                </div>
            </main>

            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={clearNotification}
                />
            )}
        </div>
    );
};

export default AdminProfilePage;
