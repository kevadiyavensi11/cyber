import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ role: requiredRole }) => {
    const stored = localStorage.getItem('user');
    let user = null;

    try {
        user = stored ? JSON.parse(stored) : null;
    } catch (e) {
        console.error("Failed to parse user session", e);
    }

    if (!user || !user.token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const token = user.token;
        if (!token || typeof token !== 'string') return <Navigate to="/login" replace />;

        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) return <Navigate to="/login" replace />;

        const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const payload = JSON.parse(jsonPayload);

        const userRole = payload.role || user.role;

        if (requiredRole && userRole !== requiredRole) {
            console.warn(`Access Denied: Expected ${requiredRole}, got ${userRole}`);
            return <Navigate to="/unauthorized" replace />;
        }
    } catch (error) {
        console.error('Error decoding security token:', error);
        return <Navigate to="/login" replace />;
    }

    // Role-based Layout or Outlet
    return <Outlet />;
};

export default ProtectedRoute;
