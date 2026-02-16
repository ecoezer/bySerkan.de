/**
 * Unified error utilities for consistent error handling across the codebase.
 */

/**
 * Extract a user-safe message from any thrown value.
 * Avoids the repetitive `error instanceof Error ? error.message : String(error)` pattern.
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'Ein unbekannter Fehler ist aufgetreten.';
}

/**
 * Log a service-layer error with consistent formatting.
 * Use in catch blocks within services and pages.
 */
export function logServiceError(context: string, error: unknown): void {
    const message = getErrorMessage(error);
    console.error(`[${context}] ${message}`, error);
}
