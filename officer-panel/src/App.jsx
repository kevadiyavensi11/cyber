import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import Reports from './pages/Reports';
import OfficerInvestigation from './pages/ReportDetail';
import Broadcast from './pages/Broadcast';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './routing/ProtectedRoute';
import ErrorBoundary from './components/reusable/ErrorBoundary';
import { NotificationProvider } from './context/NotificationContext';
import { SearchProvider } from './context/SearchContext';

function App() {
    return (
        <Router>
            <Toaster position="top-right" reverseOrder={false} />
            <SearchProvider>
                <NotificationProvider>
                    <Routes>
                        <Route path="/login" element={<Login panelType="officer" />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />

                        <Route path="/officer/dashboard" element={
                            <ProtectedRoute role="officer">
                                <ErrorBoundary>
                                    <Dashboard />
                                </ErrorBoundary>
                            </ProtectedRoute>
                        } />
                        <Route path="/cases" element={
                            <ProtectedRoute role="officer">
                                <ErrorBoundary>
                                    <Cases />
                                </ErrorBoundary>
                            </ProtectedRoute>
                        } />
                        <Route path="/reports" element={
                            <ProtectedRoute role="officer">
                                <ErrorBoundary>
                                    <Reports />
                                </ErrorBoundary>
                            </ProtectedRoute>
                        } />
                        <Route path="/officer/investigation/:id" element={
                            <ProtectedRoute role="officer">
                                <ErrorBoundary>
                                    <OfficerInvestigation />
                                </ErrorBoundary>
                            </ProtectedRoute>
                        } />
                        <Route path="/broadcast" element={
                            <ProtectedRoute role="officer">
                                <ErrorBoundary>
                                    <Broadcast />
                                </ErrorBoundary>
                            </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute role="officer">
                                <ErrorBoundary>
                                    <Profile role="officer" />
                                </ErrorBoundary>
                            </ProtectedRoute>
                        } />
                        <Route path="/settings" element={
                            <ProtectedRoute role="officer">
                                <ErrorBoundary>
                                    <Settings role="officer" />
                                </ErrorBoundary>
                            </ProtectedRoute>
                        } />
                        <Route path="/notifications" element={
                            <ProtectedRoute role="officer">
                                <ErrorBoundary>
                                    <Notifications />
                                </ErrorBoundary>
                            </ProtectedRoute>
                        } />


                        <Route path="/" element={<Navigate to="/officer/dashboard" />} />
                        <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                </NotificationProvider>
            </SearchProvider>
        </Router>
    );
}

export default App;

