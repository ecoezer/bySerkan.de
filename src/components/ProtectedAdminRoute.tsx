import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>;
    }

    const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map((e: string) => e.trim());
    const isAuthorized = currentUser && currentUser.email && adminEmails.includes(currentUser.email);

    if (!currentUser || !isAuthorized) {
        // Optionally sign out unauthorized user to clear state
        // if (currentUser) { signOut(auth); } 
        return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
};
