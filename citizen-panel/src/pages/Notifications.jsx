import React from 'react';
import MainLayout from '../layouts/MainLayout';
import {
    Bell,
    CheckCheck,
    LayoutDashboard,
    FileText,
    PlusCircle,
    User,
    Settings,
    ShieldAlert,
    BadgeAlert,
    Info,
    MessageCircle
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
    const { notifications, markAsRead, markAllAsRead } = useNotifications();

    const citizenLinks = [
        { label: 'Dashboard', path: '/citizen/dashboard', icon: LayoutDashboard },
        { label: 'My Reports', path: '/reports', icon: FileText },
        { label: 'New Report', path: '/create-report', icon: PlusCircle },
        { label: 'Profile', path: '/profile', icon: User },
        { label: 'Settings', path: '/settings', icon: Settings },
    ];

    const getIcon = (type) => {
        switch (type) {
            case 'warning': return <ShieldAlert size={20} />;
            case 'assignment': return <BadgeAlert size={20} />;
            case 'update': return <MessageCircle size={20} />;
            default: return <Info size={20} />;
        }
    };

    const getColorClass = (type) => {
        switch (type) {
            case 'warning': return 'bg-red-50 text-red-600 border-red-100';
            case 'assignment': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'update': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default: return 'bg-blue-50 text-blue-600 border-blue-100';
        }
    };

    return (
        <MainLayout links={citizenLinks} userRole="Citizen">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-2xl font-semibold text-blue-900 tracking-tight">System Notifications</h2>
                        <p className="text-gray-500 mt-2 font-medium">History of all account updates and safety alerts.</p>
                    </div>
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 bg-white border border-blue-50 px-6 py-3 rounded-2xl font-semibold text-xs uppercase tracking-wider text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
                    >
                        <CheckCheck size={16} /> Mark All Read
                    </button>
                </div>

                <div className="space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <div
                                key={notif._id}
                                onClick={() => !notif.read && markAsRead(notif._id)}
                                className={`p-6 rounded-[2rem] border transition-all flex gap-6 ${!notif.read
                                    ? 'bg-white border-blue-100 shadow-xl shadow-blue-900/5 ring-1 ring-blue-50'
                                    : 'bg-gray-50/50 border-gray-100 opacity-80 hover:opacity-100'
                                    }`}
                            >
                                <div className={`p-4 h-14 w-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${getColorClass(notif.type)}`}>
                                    {getIcon(notif.type)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className={`text-lg font-semibold tracking-tight ${!notif.read ? 'text-blue-900' : 'text-gray-700'}`}>
                                            {notif.title}
                                        </h3>
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                            {notif.createdAt && !isNaN(new Date(notif.createdAt)) ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : 'Recently'}
                                        </span>
                                    </div>
                                    <p className={`text-sm leading-relaxed mb-4 ${!notif.read ? 'text-gray-600 font-semibold' : 'text-gray-500 font-medium'}`}>
                                        {notif.message}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider border ${getColorClass(notif.type)}`}>
                                            {notif.type}
                                        </span>
                                        {!notif.read && (
                                            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600">
                                                <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" /> New Info
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-gray-200">
                            <div className="inline-flex p-6 bg-gray-50 rounded-full mb-6">
                                <Bell className="text-gray-300" size={48} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Inbox is Empty</h3>
                            <p className="text-gray-400 font-semibold text-xs uppercase tracking-wider">No notification history found for your account.</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default Notifications;
