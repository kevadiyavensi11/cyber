import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import {
    Send,
    Users,
    ShieldAlert,
    BadgeAlert,
    Info,
    LayoutDashboard,
    FileText,
    Activity,
    Radio,
    Settings,
    Map as MapIcon,
    User as UserIcon,
    Search,
    Bell
} from 'lucide-react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import toast from 'react-hot-toast';

const Broadcast = () => {
    const { sendNotification } = useNotifications();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetRole, setTargetRole] = useState('all');
    const [type, setType] = useState('system');
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userSearchText, setUserSearchText] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);

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
    
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get('/admin/citizens');
                setUsers(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };
        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) {
            toast.error('Please enter both title and message');
            return;
        }
        
        if (targetRole === 'personal' && !selectedUser) {
            toast.error('Please select a recipient');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title,
                message,
                type,
                broadcast: targetRole !== 'personal',
            };
            
            if (targetRole === 'personal') {
                payload.userId = selectedUser._id;
                payload.role = selectedUser.role; // Fix: role is required by Mongoose schema
            } else {
                payload.role = targetRole;
            }

            await sendNotification(payload);
            toast.success(targetRole === 'personal' ? `Message sent to ${selectedUser.name}` : 'Broadcast sent successfully');
            setTitle('');
            setMessage('');
            if (targetRole === 'personal') {
                setSelectedUser(null);
                setUserSearchText('');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'all', label: 'All Users', icon: <Radio size={16} /> },
        { id: 'citizen', label: 'Citizens', icon: <Users size={16} /> },
        { id: 'officer', label: 'Officers', icon: <ShieldAlert size={16} /> },
        { id: 'personal', label: 'Specific User', icon: <UserIcon size={16} /> },
    ];

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(userSearchText.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchText.toLowerCase())
    );

    const types = [
        { id: 'system', label: 'System Info', icon: <Info size={16} />, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'warning', label: 'Warning', icon: <ShieldAlert size={16} />, color: 'text-amber-600', bg: 'bg-amber-50' },
        { id: 'assignment', label: 'Alert', icon: <BadgeAlert size={16} />, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    return (
        <MainLayout links={adminLinks} userRole="Admin">
            <div className="max-w-4xl mx-auto animate-in fade-in duration-700">
                <div className="mb-10 text-center">
                    <div className="inline-flex p-4 bg-white rounded-3xl shadow-xl shadow-blue-50 mb-6 border border-gray-50">
                        <Bell className="text-blue-600" size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-[#2D4A9D] tracking-tight">System Broadcast</h2>
                    <p className="text-gray-500 font-bold text-sm mt-2">Send important notifications and alerts to specific user networks.</p>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 relative overflow-hidden">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-2">Target Audience</label>
                                <div className="space-y-2">
                                    {roles.map((r) => (
                                        <button
                                            key={r.id}
                                            type="button"
                                            onClick={() => setTargetRole(r.id)}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${targetRole === r.id
                                                ? 'border-blue-300 bg-blue-50 text-blue-700 shadow-sm'
                                                : 'border-gray-50 bg-gray-50 text-gray-500 hover:border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2.5 rounded-xl border ${targetRole === r.id ? 'bg-[#2D4A9D] text-white border-transparent shadow-lg shadow-blue-900/10' : 'bg-white text-gray-400 border-gray-100'}`}>
                                                    {r.icon}
                                                </div>
                                                <span className="text-sm font-bold tracking-tight">
                                                    {r.label}
                                                </span>
                                            </div>
                                            {targetRole === r.id && <div className="h-2 w-2 rounded-full bg-[#2D4A9D]" />}
                                        </button>
                                    ))}
                                </div>

                                {targetRole === 'personal' && (
                                    <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                        <label className="text-[10px] font-black uppercase text-[#2D4A9D] tracking-widest ml-2">Select Recipient</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                <Search size={16} />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Search by name or email..."
                                                value={selectedUser ? selectedUser.name : userSearchText}
                                                onChange={(e) => {
                                                    setUserSearchText(e.target.value);
                                                    if (selectedUser) setSelectedUser(null);
                                                    setShowUserDropdown(true);
                                                }}
                                                onFocus={() => setShowUserDropdown(true)}
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-200 transition-all font-semibold text-sm"
                                            />
                                            
                                            {showUserDropdown && userSearchText && !selectedUser && (
                                                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto p-2 custom-scrollbar">
                                                    {filteredUsers.length > 0 ? (
                                                        filteredUsers.slice(0, 10).map(u => (
                                                            <button
                                                                key={u._id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedUser(u);
                                                                    setShowUserDropdown(false);
                                                                    setUserSearchText('');
                                                                }}
                                                                className="w-full flex items-center justify-between p-3 hover:bg-blue-50 rounded-xl transition-all group"
                                                            >
                                                                <div className="text-left">
                                                                    <p className="text-sm font-bold text-gray-900">{u.name}</p>
                                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{u.email}</p>
                                                                </div>
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-[#2D4A9D] bg-blue-50 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="p-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest italic">No users found</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-2">Notification Type</label>
                                <div className="space-y-2">
                                    {types.map((t) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setType(t.id)}
                                            className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${type === t.id
                                                ? `border-blue-300 ${t.bg} text-${t.color.split('-')[1]}-700`
                                                : 'border-gray-50 bg-gray-50 text-gray-500 hover:border-gray-200'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-xl border bg-white shadow-sm ${type === t.id ? t.color : 'text-gray-400 border-gray-100'}`}>
                                                {t.icon}
                                            </div>
                                            <span className="text-sm font-bold tracking-tight">
                                                {t.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-8 border-t border-gray-50">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-2">Notification Headline</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter circular subject line..."
                                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-200 transition-all font-semibold text-sm text-gray-900"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-2">Message Body</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Compose the full announcement details..."
                                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-200 transition-all font-medium text-sm text-gray-800 min-h-[160px] resize-none leading-relaxed"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <Loader className="animate-spin" size={18} />
                                    Sending Broadcast...
                                </>
                            ) : (
                                <>
                                    <Send size={18} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                                    Send Notification Pulse
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
};

// Helper component for Loader
const Loader = ({ className, size }) => (
    <Activity className={`animate-pulse ${className}`} size={size} />
);

export default Broadcast;
