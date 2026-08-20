import React from 'react';
import MainLayout from '../layouts/MainLayout';
import {
    Bell,
    CheckCheck,
    LayoutDashboard,
    Users,
    FileText,
    Activity,
    ShieldAlert,
    BadgeAlert,
    Info,
    MessageCircle,
    Radio,
    Settings,
    Map as MapIcon,
    User as UserIcon
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
    const { notifications, markAsRead, markAllAsRead } = useNotifications();

    const adminLinks = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'User Registry', path: '/citizens', icon: Users },
        { label: 'All Reports', path: '/reports', icon: FileText },
        { label: 'Zone Wise Map', path: '/admin/zone-map', icon: MapIcon },
        { label: 'Broadcasts', path: '/broadcast', icon: Radio },
        { label: 'System Logs', path: '/logs', icon: Activity },
        { label: 'Profile', path: '/profile', icon: UserIcon },
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
        <MainLayout links={adminLinks} userRole="Admin">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-blue-900 tracking-tight">Command Intelligence</h2>
                        <p className="text-gray-500 mt-2 font-medium">Monitoring system-wide alerts and administrative triggers.</p>
                    </div>
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 bg-white border border-blue-50 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
                    >
                        <CheckCheck size={16} /> Mark All Read
                    </button>
                </div>

                <div className="space-y-4">
                    {(notifications || []).length > 0 ? (
                        (notifications || []).map((notif) => (
                            <div
                                key={notif._id}
                                onClick={() => !notif.read && markAsRead(notif._id)}
                                className={`p-6 rounded-[2rem] border transition-all flex gap-6 ${!notif.read
                                    ? 'bg-white border-blue-100 shadow-xl shadow-blue-900/5 ring-1 ring-blue-50'
                                    : 'bg-gray-50/50 border-gray-100 opacity-80'
                                    }`}
                            >
                                <div className={`p-4 h-14 w-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${getColorClass(notif.type)}`}>
                                    {getIcon(notif.type)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className={`text-lg font-black tracking-tight ${!notif.read ? 'text-blue-900' : 'text-gray-700'}`}>
                                            {notif.title}
                                        </h3>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">
                                            {notif.createdAt && !isNaN(new Date(notif.createdAt))
                                                ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                                                : 'Recently'}
                                        </span>
                                    </div>
                                    <p className={`text-sm leading-relaxed mb-4 ${!notif.read ? 'text-gray-600 font-bold' : 'text-gray-500 font-medium'}`}>
                                        {notif.message}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getColorClass(notif.type)}`}>
                                            {notif.type}
                                        </span>
                                        {!notif.read && (
                                            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-blue-600">
                                                <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" /> Primary Alert
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
                            <h3 className="text-xl font-black text-gray-900 mb-2">System Horizon Clear</h3>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">No active monitoring alerts or system triggers logged.</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default Notifications;
