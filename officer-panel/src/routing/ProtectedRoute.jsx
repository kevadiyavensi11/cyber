import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role: requiredRole }) => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || !user.token) {
        return <Navigate to="/login" />;
    }

    try {
        // Robust JWT decoding (payload is the second part)
        const token = user.token;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const payload = JSON.parse(jsonPayload);

        // Normalize roles for comparison
        let userRole = payload.role?.toLowerCase();
        if (userRole === 'authority') userRole = 'officer';

        let targetRole = requiredRole?.toLowerCase();
        if (targetRole === 'authority') targetRole = 'officer';

        if (requiredRole && userRole !== targetRole) {
            return <Navigate to="/unauthorized" />;
        }

    } catch (error) {
        console.error('Error decoding token:', error);
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;
