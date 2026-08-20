import React from 'react';
import { Search, User as UserIcon } from 'lucide-react';
import NotificationDropdown from './notifications/NotificationDropdown';

const Topbar = ({ title, userEmail }) => {
    return (
        <header className="topbar">
            <div className="topbar-left">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</h2>
            </div>

            <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div className="topbar-search">
                    <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" placeholder="Search..." />
                </div>

                <NotificationDropdown />

                <div className="user-profile">
                    <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{userEmail?.split('@')[0] || 'User'}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{userEmail || 'user@cyber.com'}</p>
                    </div>
                    <div className="avatar">
                        <UserIcon size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;


