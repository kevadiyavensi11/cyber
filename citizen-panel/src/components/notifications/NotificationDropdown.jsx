import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, ListFilter } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationItem from './NotificationItem';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = (id) => {
        markAsRead(id);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50/50 transition-all group active:scale-95"
            >
                <Bell size={22} className="group-hover:rotate-[15deg] transition-transform" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-4 w-4 shrink-0 transition-all">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white items-center justify-center text-[8px] font-semibold text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-4 w-96 bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-blue-50 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-6 bg-gradient-to-br from-white to-blue-50/30 border-b border-gray-50 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-blue-900 tracking-tight">Intelligence Feed</h3>
                            <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-widest">{unreadCount} Critical Unread</p>
                        </div>
                        <button
                            onClick={markAllAsRead}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all"
                            title="Mark all as read"
                        >
                            <CheckCheck size={20} />
                        </button>
                    </div>

                    <div className="max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-100">
                        {(notifications || []).length > 0 ? (
                            (notifications || []).map(notif => (
                                <NotificationItem
                                    key={notif._id}
                                    notification={notif}
                                    onClick={handleMarkAsRead}
                                />
                            ))
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center px-10">
                                <div className="p-4 bg-blue-50 rounded-full mb-4">
                                    <ListFilter className="text-blue-400" size={32} />
                                </div>
                                <p className="text-sm font-semibold text-gray-900 mb-1">Clear Horizon</p>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-loose">No active threat reports or system alerts detected in your sector.</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-gray-50/50 border-t border-gray-50 text-center">
                        <Link
                            to="/notifications"
                            className="inline-block w-full py-3 text-xs font-semibold uppercase tracking-widest text-blue-600 hover:text-blue-800 hover:bg-white rounded-2xl transition-all"
                            onClick={() => setIsOpen(false)}
                        >
                            Review All Activity
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
