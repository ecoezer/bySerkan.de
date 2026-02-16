/**
 * Authentication service — centralizes all Supabase auth interactions.
 * No page or component should import `supabase` for auth purposes.
 */
import { supabase } from '../lib/supabase';
import { logServiceError } from '../lib/errors';

export interface AuthResult {
    success: boolean;
    errorMessage?: string;
}

/** Sign in with email and password. Returns a structured result. */
export async function signIn(email: string, password: string): Promise<AuthResult> {
    try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            const message = error.status === 400
                ? 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Email und Passwort.'
                : error.message;
            return { success: false, errorMessage: message };
        }

        return { success: true };
    } catch (error) {
        logServiceError('authService.signIn', error);
        return { success: false, errorMessage: 'Ein Fehler ist aufgetreten.' };
    }
}

/** Sign out the current user. */
export async function signOut(): Promise<void> {
    try {
        await supabase.auth.signOut();
    } catch (error) {
        logServiceError('authService.signOut', error);
    }
}

/** Update the current user's password. */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
    try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            return { success: false, errorMessage: error.message };
        }

        return { success: true };
    } catch (error) {
        logServiceError('authService.updatePassword', error);
        return { success: false, errorMessage: 'Fehler beim Aktualisieren des Passworts.' };
    }
}
