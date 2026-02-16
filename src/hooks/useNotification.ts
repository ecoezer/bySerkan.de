import { useState, useCallback, useRef } from 'react';

export interface NotificationState {
    message: string;
    type: 'success' | 'error';
}

/**
 * Reusable notification hook — replaces the identical pattern
 * duplicated across 5+ admin pages.
 */
export function useNotification(autoHideMs = 3000) {
    const [notification, setNotification] = useState<NotificationState | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout>>();

    const showNotification = useCallback((message: string, type: NotificationState['type'] = 'success') => {
        clearTimeout(timerRef.current);
        setNotification({ message, type });
        timerRef.current = setTimeout(() => setNotification(null), autoHideMs);
    }, [autoHideMs]);

    const showSuccess = useCallback((message: string) => {
        showNotification(message, 'success');
    }, [showNotification]);

    const showError = useCallback((message: string) => {
        showNotification(message, 'error');
    }, [showNotification]);

    const clearNotification = useCallback(() => {
        clearTimeout(timerRef.current);
        setNotification(null);
    }, []);

    return { notification, showSuccess, showError, showNotification, clearNotification };
}
