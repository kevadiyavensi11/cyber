import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role: requiredRole }) => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || !user.token) {
        return <Navigate to="/login" />;
    }

    try {
        // Robust JWT decoding
        const token = user.token;
        if (!token || typeof token !== 'string' || token.split('.').length < 3) {
            console.error("Invalid token format");
            return <Navigate to="/login" />;
        }

        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const payload = JSON.parse(jsonPayload);

        // Check role from payload OR from user object for robustness
        const userRole = payload.role || user.role;

        if (requiredRole && userRole !== requiredRole) {
            console.warn(`Role mismatch: Expected ${requiredRole}, got ${userRole}`);
            return <Navigate to="/unauthorized" />;
        }
    } catch (error) {
        console.error("Token decoding error:", error);
        localStorage.removeItem('user'); // Clear corrupted session
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;
