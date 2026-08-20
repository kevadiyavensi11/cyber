import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Reports from './pages/Reports';
import UpdateReport from './pages/UpdateReport';
import Broadcast from './pages/Broadcast';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import AdminZoneMap from './pages/AdminZoneMap';

import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './routing/ProtectedRoute';
import { NotificationProvider } from './context/NotificationContext';
import { SearchProvider } from './context/SearchContext';

function App() {
    return (
        <Router>
            <Toaster position="top-right" reverseOrder={false} />
            <SearchProvider>
                <NotificationProvider>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login panelType="admin" />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />

                        {/* Protected Routes - Nested Pattern */}
                        <Route element={<ProtectedRoute role="admin" />}>
                            <Route path="/admin/dashboard" element={<Dashboard />} />
                            <Route path="/admin/zone-map" element={<AdminZoneMap />} />
                            <Route path="/citizens" element={<Users />} />

                            <Route path="/reports">
                                <Route index element={<Reports />} />
                                <Route path="update/:id" element={<UpdateReport />} />
                            </Route>

                            <Route path="/broadcast" element={<Broadcast />} />
                            <Route path="/profile" element={<Profile role="admin" />} />
                            <Route path="/settings" element={<Settings role="admin" />} />
                            <Route path="/logs" element={<Logs />} />
                            <Route path="/notifications" element={<Notifications />} />
                        </Route>

                        {/* Defaults */}
                        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </NotificationProvider>
            </SearchProvider>
        </Router>
    );
}

export default App;
