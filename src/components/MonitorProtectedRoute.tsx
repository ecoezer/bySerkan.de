import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Protects monitor routes — requires any authenticated user.
 * Separated from ProtectedAdminRoute which additionally checks admin emails.
 */
export const MonitorProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                Loading...
            </div>
        );
    }

    return currentUser ? <>{children}</> : <Navigate to="/monitor-login" replace />;
};
