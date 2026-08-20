import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ShieldAlert, BadgeAlert, Info, MessageCircle } from 'lucide-react';

const NotificationItem = ({ notification, onClick }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'warning': return <ShieldAlert size={16} />;
            case 'assignment': return <BadgeAlert size={16} />;
            case 'update': return <MessageCircle size={16} />;
            default: return <Info size={16} />;
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
        <div
            onClick={() => onClick(notification._id)}
            className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-gray-50 flex gap-4 ${!notification.read ? 'bg-blue-50/30' : ''}`}
        >
            <div className={`mt-1 p-2 h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${getColorClass(notification.type)}`}>
                {getIcon(notification.type)}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className={`text-sm font-black tracking-tight leading-tight ${!notification.read ? 'text-blue-900' : 'text-gray-700'}`}>
                        {notification.title}
                    </h4>
                    {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                </div>
                <p className="text-xs text-gray-500 font-medium leading-relaxed mb-2 line-clamp-2">
                    {notification.message}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {notification.createdAt && !isNaN(new Date(notification.createdAt))
                        ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                        : 'Just now'}
                </p>
            </div>
        </div>
    );
};

export default NotificationItem;
