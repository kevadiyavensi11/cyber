import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import {
    Send,
    ShieldAlert,
    BadgeAlert,
    Info,
    LayoutDashboard,
    FolderOpen,
    FileText,
    Cpu,
    Search,
    User as UserIcon,
    Radio,
    Activity,
    Zap,
    Terminal,
    Target,
    Globe,
    Signal,
    Settings
} from 'lucide-react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import toast from 'react-hot-toast';

const Broadcast = () => {
    const { sendNotification } = useNotifications();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetRole, setTargetRole] = useState('citizen');
    const [type, setType] = useState('system');
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userSearchText, setUserSearchText] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    const officerLinks = [
        { label: 'Dashboard', path: '/officer/dashboard', icon: LayoutDashboard },
        { label: 'Assigned Reports', path: '/cases', icon: FolderOpen },
        { label: 'Reports', path: '/reports', icon: FileText },
        { label: 'Broadcasts', path: '/broadcast', icon: Radio },
        { label: 'Profile', path: '/profile', icon: UserIcon },
        { label: 'Settings', path: '/settings', icon: Settings },
    ];

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get('/users/all');
                setUsers(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };
        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (targetRole === 'personal' && !selectedUser) {
            toast.error('Recipient mandatory for point-to-point signal');
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
                payload.role = selectedUser.role;
            } else {
                payload.role = targetRole;
            }

            await sendNotification(payload);
            toast.success(targetRole === 'personal' ? `Direct signal uplink established: ${selectedUser.name}` : 'Broadcast transmitted successfully');
            setTitle('');
            setMessage('');
            if (targetRole === 'personal') {
                setSelectedUser(null);
                setUserSearchText('');
            }
        } catch (error) {
            toast.error('Transmission failed: Context rejected or timeout');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'citizen', label: 'Citizen Network', icon: <Globe size={18} /> },
        { id: 'personal', label: 'Direct Uplink', icon: <UserIcon size={18} /> },
        { id: 'all', label: 'Global Distribution', icon: <Radio size={18} /> },
    ];

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(userSearchText.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchText.toLowerCase())
    );

    const types = [
        { id: 'system', label: 'System Alert', icon: <Info size={18} />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        { id: 'warning', label: 'Emergency', icon: <ShieldAlert size={18} />, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
        { id: 'update', label: 'Tactical Update', icon: <BadgeAlert size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    ];

    return (
        <MainLayout links={officerLinks} userRole="Officer">
            <div className="max-w-6xl mx-auto relative z-10 p-2 md:p-6">
                {/* Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

                {/* Header Section */}
                <div className="mb-12 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-4">
                        <Signal className="text-blue-600" size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Communication Terminal</span>
                    </div>
                    <h2 className="text-3xl font-bold text-[#2D4A9D] tracking-tight">Broadcast Center</h2>
                    <p className="text-gray-500 mt-2 font-medium text-xs">Transmit direct guidance and system-wide alerts across the network.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-[3rem] p-12 shadow-xl shadow-blue-600/5 border border-gray-100 relative overflow-hidden group">
                            {/* Decorative Icon */}
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000 text-blue-600">
                                <Radio size={160} />
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {/* Channel Selection */}
                                    <div className="space-y-6">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-4 flex items-center gap-3">
                                            <Target size={14} /> Transmission Channel
                                        </label>
                                        <div className="space-y-4">
                                            {roles.map((r) => (
                                                <button
                                                    key={r.id}
                                                    type="button"
                                                    onClick={() => setTargetRole(r.id)}
                                                    className={`w-full group/btn flex items-center justify-between p-6 rounded-3xl border transition-all duration-500 ${targetRole === r.id
                                                        ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-900/20'
                                                        : 'bg-white border-gray-100 hover:border-blue-100/50'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-5">
                                                        <div className={`p-3 rounded-2xl transition-all duration-500 ${targetRole === r.id ? 'bg-white/20 text-white shadow-inner' : 'bg-gray-50 text-gray-400 group-hover/btn:bg-blue-50 group-hover/btn:text-blue-600'}`}>
                                                            {r.icon}
                                                        </div>
                                                        <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${targetRole === r.id ? 'text-white' : 'text-gray-500'}`}>
                                                            {r.label}
                                                        </span>
                                                    </div>
                                                    {targetRole === r.id && (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse mr-2 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        {targetRole === 'personal' && (
                                            <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-top-2 duration-700">
                                                <label className="text-[10px] font-black uppercase text-[#2D4A9D] tracking-widest pl-4 flex items-center gap-3">
                                                    <Search size={14} /> Recipient Identifier
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="SEARCH_REGISTRY: NAME_OR_EMAIL..."
                                                        value={selectedUser ? selectedUser.name : userSearchText}
                                                        onChange={(e) => {
                                                            setUserSearchText(e.target.value);
                                                            if (selectedUser) setSelectedUser(null);
                                                            setShowUserDropdown(true);
                                                        }}
                                                        onFocus={() => setShowUserDropdown(true)}
                                                        className="w-full pl-8 pr-4 py-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] outline-none focus:bg-white focus:border-blue-200 transition-all font-black text-xs placeholder:text-gray-300 shadow-inner"
                                                    />
                                                    
                                                    {showUserDropdown && userSearchText && !selectedUser && (
                                                        <div className="absolute top-full left-0 w-full mt-3 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-50 max-h-60 overflow-y-auto p-3 custom-scrollbar">
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
                                                                        className="w-full flex items-center justify-between p-4 hover:bg-blue-50/50 rounded-2xl transition-all group"
                                                                    >
                                                                        <div className="text-left">
                                                                            <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">{u.name}</p>
                                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">{u.email}</p>
                                                                        </div>
                                                                        <span className="text-[9px] font-black uppercase tracking-widest text-[#2D4A9D] bg-blue-50 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">Lock System</span>
                                                                    </button>
                                                                ))
                                                            ) : (
                                                                <div className="p-6 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest italic flex flex-col gap-2 items-center">
                                                                    <Cpu size={24} className="opacity-20" />
                                                                    Zero Match in Registry
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Intent Selection */}
                                    <div className="space-y-6">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-4 flex items-center gap-3">
                                            <Cpu size={14} /> Signal Priority
                                        </label>
                                        <div className="space-y-4">
                                            {types.map((t) => (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() => setType(t.id)}
                                                    className={`w-full group/btn flex items-center gap-5 p-6 rounded-3xl border transition-all duration-500 ${type === t.id
                                                        ? `${t.bg} ${t.border} shadow-sm`
                                                        : 'bg-white border-gray-100 hover:border-gray-200'
                                                        }`}
                                                >
                                                    <div className={`p-3 rounded-2xl transition-all duration-500 ${type === t.id ? `${t.color} bg-white shadow-sm` : 'bg-gray-50 text-gray-400'}`}>
                                                        {t.icon}
                                                    </div>
                                                    <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${type === t.id ? 'text-gray-900' : 'text-gray-500'}`}>
                                                        {t.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Message Content */}
                                <div className="space-y-10 pt-10 border-t border-gray-50">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-4">Signal Header</label>
                                        <div className="relative group/input">
                                            <div className="absolute top-1/2 left-6 -translate-y-1/2 text-gray-300 group-focus-within/input:text-blue-600 transition-colors">
                                                <Terminal size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="Enter broadcast subject..."
                                                className="w-full pl-16 pr-8 py-6 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50/50 transition-all font-bold text-sm text-gray-900 placeholder:text-gray-300 shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-4">Transmission Payload</label>
                                        <div className="relative group/input">
                                            <div className="absolute top-8 left-6 text-gray-300 group-focus-within/input:text-blue-600 transition-colors">
                                                <FileText size={18} />
                                            </div>
                                            <textarea
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Detailed instructions or alert information..."
                                                className="w-full pl-16 pr-8 py-8 bg-gray-50 border border-gray-100 rounded-[2rem] outline-none focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50/50 transition-all font-medium text-sm text-gray-700 placeholder:text-gray-300 min-h-[220px] resize-none leading-relaxed shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-8 rounded-[2.5rem] font-black text-[12px] uppercase tracking-widest transition-all duration-500 group relative overflow-hidden shadow-xl shadow-blue-600/20 active:scale-[0.98] disabled:opacity-20"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-4">
                                            <Zap className="animate-spin" size={18} />
                                            SYNC_MODULATING...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-4 uppercase">
                                            <Send size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                            Dispatch Signal
                                        </div>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-10">
                        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-600/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] transition-transform group-hover:scale-110 duration-1000 text-blue-600">
                                <Activity size={80} />
                            </div>
                            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-10 flex items-center gap-3">
                                <ShieldAlert size={14} /> Rule Protocols
                            </h4>
                            <ul className="space-y-8">
                                {[
                                    { k: 'Encrypted Stream', v: 'End-to-End active' },
                                    { k: 'Latency Buffer', v: '4ms (Node-Alpha)' },
                                    { k: 'Data Audit', v: 'System Logged' },
                                    { k: 'Sector Reach', v: 'Global-Cluster' }
                                ].map((item, i) => (
                                    <li key={i} className="space-y-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{item.k}</p>
                                        <p className="text-[11px] font-black text-gray-700 uppercase tracking-widest leading-none">{item.v}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-blue-50/50 rounded-[3rem] p-10 border border-blue-100 relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 opacity-[0.05] group-hover:scale-110 transition-transform duration-1000 text-blue-600">
                                <Zap size={120} />
                            </div>
                            <h4 className="text-[10px] font-black text-blue-600 tracking-widest uppercase mb-8">Mission Critical</h4>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed italic">
                                Broadcasts are permanent records in the registry. Ensure absolute clarity before committing signal.
                            </p>
                            <div className="mt-8 pt-8 border-t border-blue-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">TRANSMITTER_ONLINE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Broadcast;
