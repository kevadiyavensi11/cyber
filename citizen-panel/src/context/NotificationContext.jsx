import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';


const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error("NotificationContext: Error reading initial user", e);
            return null;
        }
    });
    const location = useLocation();

    // Sync user state with localStorage on route changes
    useEffect(() => {
        try {
            const stored = localStorage.getItem('user');
            if (stored) {
                const storedUser = JSON.parse(stored);
                if (JSON.stringify(storedUser) !== JSON.stringify(user)) {
                    setUser(storedUser);
                }
            } else if (user) {
                setUser(null);
            }
        } catch (e) {
            console.error("NotificationContext: Error syncing user", e);
        }
    }, [location.pathname, user]);

    const fetchNotifications = useCallback(async () => {
        if (!user?._id) return;
        try {
            const { data } = await api.get(`/notifications/user/${user._id}`);
            setNotifications(data);

            const countRes = await api.get(`/notifications/unread-count/${user._id}`);
            setUnreadCount(countRes.data.count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, [user?._id]);

    useEffect(() => {
        if (user?._id) {
            fetchNotifications();

            const newSocket = io('http://localhost:5000');
            setSocket(newSocket);

            newSocket.emit('join', user._id);
            newSocket.emit('joinRole', user.role);

            newSocket.on('newNotification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
                toast.success(`${notification.title}: ${notification.message}`, {
                    icon: '🔔',
                    duration: 4000
                });
            });

            newSocket.on('broadcastNotification', (broadcast) => {
                fetchNotifications();
                toast.success(`Priority: ${broadcast.title}`, { icon: '📢' });
            });

            return () => newSocket.close();
        } else {
            // Clear state if no user
            setNotifications([]);
            setUnreadCount(0);
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user?._id, user?.role, fetchNotifications]);


    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/mark-read/${id}`);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (!user?._id) return;
        try {
            await api.patch(`/notifications/mark-all-read/${user._id}`);
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );
            setUnreadCount(0);
            toast.success('All marked as read');
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const sendNotification = async (payload) => {
        try {
            await api.post('/notifications/send', payload);
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            sendNotification,
            fetchNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
