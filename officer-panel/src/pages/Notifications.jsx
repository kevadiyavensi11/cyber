import React from 'react';
import MainLayout from '../layouts/MainLayout';
import {
    Bell,
    CheckCheck,
    LayoutDashboard,
    FolderOpen,
    FileText,
    User,
    Settings,
    ShieldAlert,
    BadgeAlert,
    Info,
    MessageCircle,
    Radio,
    Clock,
    Activity,
    Zap,
    Terminal,
    Target
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
    const { notifications, markAsRead, markAllAsRead } = useNotifications();

    const officerLinks = [
        { label: 'Dashboard', path: '/officer/dashboard', icon: LayoutDashboard },
        { label: 'Assigned Reports', path: '/cases', icon: FolderOpen },
        { label: 'Reports', path: '/reports', icon: FileText },
        { label: 'Profile', path: '/profile', icon: User },
        { label: 'Settings', path: '/settings', icon: Settings },
    ];

    const getIcon = (type) => {
        switch (type) {
            case 'warning': return <ShieldAlert size={24} />;
            case 'assignment': return <BadgeAlert size={24} />;
            case 'update': return <MessageCircle size={24} />;
            default: return <Info size={24} />;
        }
    };

    const getColorClass = (type) => {
        switch (type) {
            case 'warning': return 'text-red-600 bg-red-50 border-red-100';
            case 'assignment': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
            case 'update': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            default: return 'text-blue-600 bg-blue-50 border-blue-100';
        }
    };

    return (
        <MainLayout links={officerLinks} userRole="Officer">
            <div className="max-w-5xl mx-auto relative z-10 p-2 md:p-6">
                {/* Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />
                {/* Header Section */}
                <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-4">
                            <Activity className="text-blue-600" size={12} />
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-600">Tactical Feed Active</span>
                        </div>
                        <h2 className="text-3xl font-bold text-[#2D4A9D] tracking-tight leading-none">Duty Briefings</h2>
                        <p className="text-gray-500 mt-2 font-medium tracking-wide text-xs">Registry Stream Handling: {notifications.filter(n => !n.read).length} Unread Directives</p>
                    </div>

                    {notifications.length > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="group flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all duration-300 active:scale-[0.98] shadow-xl shadow-blue-200/50"
                        >
                            <CheckCheck size={18} className="group-hover:scale-110 transition-transform" />
                            Synchronize All Signals
                        </button>
                    )}
                </div>

                <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
                    {notifications.length > 0 ? (
                        notifications.map((notif, idx) => (
                            <div
                                key={notif._id}
                                onClick={() => !notif.read && markAsRead(notif._id)}
                                className={`group p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col md:flex-row gap-8 relative overflow-hidden cursor-pointer ${!notif.read
                                    ? 'bg-white border-blue-200 shadow-xl shadow-blue-600/10 shadow-[0_20px_50px_-12px_rgba(37,99,235,0.12)] ring-4 ring-blue-50/30'
                                    : 'bg-white border-gray-100 opacity-80 hover:opacity-100 hover:bg-white hover:border-gray-200 hover:shadow-lg'
                                    }`}
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                {/* Background Accent Icon */}
                                {!notif.read && (
                                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] group-hover:scale-125 transition-all duration-1000 text-blue-600">
                                        {getIcon(notif.type)}
                                    </div>
                                )}

                                <div className={`p-6 h-20 w-20 rounded-[1.75rem] border flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-500 ${getColorClass(notif.type)}`}>
                                    {getIcon(notif.type)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                                        <div>
                                            <h3 className={`text-xl font-bold tracking-tight mb-2 leading-none ${!notif.read ? 'text-gray-900' : 'text-gray-500'}`}>
                                                {notif.title}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <Clock size={12} className="text-gray-400" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                    {(notif.createdAt && !isNaN(new Date(notif.createdAt))) ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : 'RECENT SIGNAL'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest border ${getColorClass(notif.type)}`}>
                                                {notif.type || 'PROTOCOL'}
                                            </span>
                                            {!notif.read && (
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100">
                                                    <Zap size={10} className="animate-pulse" />
                                                    <span className="text-[10px] font-semibold uppercase tracking-widest">NEW</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className={`text-sm leading-relaxed mb-6 font-medium ${!notif.read ? 'text-gray-600' : 'text-gray-400'}`}>
                                        {notif.message}
                                    </p>

                                    <div className="flex items-center gap-6 pt-6 border-t border-gray-50">
                                        <div className="flex items-center gap-2 group/meta">
                                            <Terminal size={12} className="text-gray-300 group-hover/meta:text-blue-600 transition-colors" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover/meta:text-gray-600 transition-colors font-mono">OP_NODE_{notif._id.slice(-4).toUpperCase()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 group/meta">
                                            <Target size={12} className="text-gray-300 group-hover/meta:text-blue-600 transition-colors" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover/meta:text-gray-600 transition-colors font-mono">SECTOR_DELTA</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-24 bg-white border-2 border-dashed border-gray-100 rounded-[4rem] text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <div className="relative z-10">
                                <div className="inline-flex p-10 bg-gray-50 rounded-[3rem] mb-10 border border-gray-100 shadow-sm transition-transform group-hover:scale-110 duration-700">
                                    <Bell className="text-gray-300 group-hover:text-blue-600 transition-colors" size={64} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-4 leading-none">All Channels Clear</h3>
                                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">No unread briefings detected in current frequency cluster.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Logistics */}
                <div className="mt-16 pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 group transition-all duration-700">
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Stream Security</span>
                            <span className="text-[11px] font-semibold text-gray-900 uppercase tracking-widest">PROTOCOL-UPSILON-4</span>
                        </div>
                        <div className="w-px h-10 bg-gray-100" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Signal Integrity</span>
                            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">99.8% VERIFIED</span>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Notifications;
