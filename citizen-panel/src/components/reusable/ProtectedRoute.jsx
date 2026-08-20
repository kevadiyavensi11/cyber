import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * A mock ProtectedRoute component.
 * In a real app, this would check the global auth state or a JWT token in cookies/localStorage.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const location = useLocation();

    // MOCK AUTH STATE
    // For demonstration, we assume a user is "logged in" if there's a 'userRole' in localStorage.
    const userRole = localStorage.getItem('userRole');
    const isAuthenticated = !!userRole;

    if (!isAuthenticated) {
        // Redirect to login but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // If the user's role is not authorized, redirect to their own dashboard
        return <Navigate to={`/${userRole}/dashboard`} replace />;
    }

    return children;
};

export default ProtectedRoute;
