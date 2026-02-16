import React, { useEffect } from 'react';

interface NotificationProps {
    message: string;
    type: 'success' | 'error';
    onClose?: () => void;
    duration?: number;
}

export const Notification: React.FC<NotificationProps> = ({
    message,
    type,
    onClose,
    duration = 3000
}) => {
    useEffect(() => {
        if (onClose) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [onClose, duration]);

    return (
        <div
            className={`fixed top-0 left-0 w-full py-4 text-center text-white font-bold z-[100] shadow-xl animate-fade-in transition-all duration-500 ease-in-out ${type === 'success' ? 'bg-green-600' : 'bg-red-600'
                }`}
        >
            {message}
        </div>
    );
};
