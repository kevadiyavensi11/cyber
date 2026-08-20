import React from 'react';
import { Search, User as UserIcon } from 'lucide-react';
import NotificationDropdown from './notifications/NotificationDropdown';

const Topbar = ({ title, userName, userEmail }) => {
    return (
        <header className="topbar">
            <div className="topbar-left">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--blue-900)', letterSpacing: '-0.025em' }}>{title}</h2>
            </div>

            <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div className="topbar-search">
                    <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" placeholder="Global Search..." />
                </div>

                <NotificationDropdown />

                <div className="user-profile">
                    <div style={{ textAlign: 'right' }} className="hidden md:block">
                        <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{userName || userEmail?.split('@')[0] || 'Authenticated User'}</p>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', margin: 0 }}>{userEmail || 'session@active.ctrl'}</p>
                    </div>
                    <div className="avatar bg-blue-600 text-white border-blue-100">
                        <UserIcon size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;


