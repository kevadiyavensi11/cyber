import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role: requiredRole }) => {
    let user = null;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) user = JSON.parse(userStr);
    } catch (e) {
        console.error("ProtectedRoute: Error parsing user data", e);
    }

    if (!user || !user.token) {
        return <Navigate to="/login" />;
    }

    try {
        // Robust JWT decoding (payload is the second part)
        const token = user.token;
        const parts = token.split('.');
        if (parts.length < 2) {
            throw new Error("Invalid token format");
        }
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const payload = JSON.parse(jsonPayload);

        if (requiredRole && payload.role !== requiredRole) {
            return <Navigate to="/unauthorized" />;
        }
    } catch (error) {
        console.error('Error decoding token:', error);
        // If token is invalid, clear storage and logout
        localStorage.clear();
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;
