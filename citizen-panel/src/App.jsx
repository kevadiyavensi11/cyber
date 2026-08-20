import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import TrackIncident from './pages/TrackIncident';
import SubmitReport from './pages/SubmitReport';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';

import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
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
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/login" element={<Login panelType="citizen" />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />

                        <Route path="/citizen/dashboard" element={
                            <ProtectedRoute role="citizen">
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/my-reports" element={
                            <ProtectedRoute role="citizen">
                                <Reports />
                            </ProtectedRoute>
                        } />
                        <Route path="/track/:referenceId" element={
                            <ProtectedRoute role="citizen">
                                <TrackIncident />
                            </ProtectedRoute>
                        } />

                        <Route path="/submit-report" element={
                            <ProtectedRoute role="citizen">
                                <SubmitReport />
                            </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute role="citizen">
                                <Profile role="citizen" />
                            </ProtectedRoute>
                        } />
                        <Route path="/settings" element={
                            <ProtectedRoute role="citizen">
                                <Settings role="citizen" />
                            </ProtectedRoute>
                        } />
                        <Route path="/notifications" element={
                            <ProtectedRoute role="citizen">
                                <Notifications />
                            </ProtectedRoute>
                        } />

                        <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                </NotificationProvider>
            </SearchProvider>
        </Router>
    );
}

export default App;
