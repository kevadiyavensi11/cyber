import React from 'react';
import { Bell, Info, AlertTriangle, CheckCircle } from 'lucide-react';

const NotificationsPanel = ({ notifications }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'alert': return <AlertTriangle size={18} color="#ef4444" />;
            case 'success': return <CheckCircle size={18} color="#10b981" />;
            default: return <Info size={18} color="#3b82f6" />;
        }
    };

    return (
        <div className="table-container animate-fade-in" style={{ height: 'fit-content' }}>
            <div className="table-header">
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>System Notifications</h3>
            </div>
            <div style={{ padding: '0.5rem' }}>
                {notifications.map((notif, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '1rem',
                        borderBottom: index !== notifications.length - 1 ? '1px solid var(--border)' : 'none',
                        alignItems: 'flex-start'
                    }}>
                        <div style={{ marginTop: '2px' }}>
                            {getIcon(notif.type)}
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.25rem' }}>{notif.title}</p>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 0.25rem' }}>{notif.message}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{notif.time}</p>
                        </div>
                    </div>
                ))}
                {notifications.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No new notifications.
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;
