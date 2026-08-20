import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { authService } from '../services/api';
import {
    LayoutDashboard,
    Users,
    FileText,
    Activity,
    User as UserIcon,
    Mail,
    Shield,
    Camera,
    Loader,
    Calendar,
    Lock,
    Save,
    Edit3,
    X,
    Fingerprint,
    Cpu,
    Zap,
    Key,
    ShieldCheck,
    Globe,
    Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = ({ role = 'officer' }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', avatar: '' });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [updating, setUpdating] = useState(false);

    const officerLinks = [
        { label: 'Dashboard', path: '/officer/dashboard', icon: LayoutDashboard },
        { label: 'Assigned Reports', path: '/cases', icon: FileText },
        { label: 'All Reports', path: '/reports', icon: FileText },
        { label: 'Profile', path: '/profile', icon: UserIcon },
        { label: 'Settings', path: '/settings', icon: Settings },
    ];

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await authService.getMe();
            setUser(data);
            setFormData({ name: data.name, email: data.email, password: '', avatar: data.avatar });
            setAvatarPreview(data.avatar);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const updateForm = new FormData();
            updateForm.append('name', formData.name);
            updateForm.append('email', formData.email);
            if (formData.password) updateForm.append('password', formData.password);
            if (avatarFile) updateForm.append('avatar', avatarFile);

            const { data } = await authService.updateProfile(updateForm);
            setUser(data);
            const localUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({
                ...localUser,
                name: data.name,
                email: data.email
            }));
            toast.success('Profile updated successfully');
            setIsEditing(false);
            window.location.reload();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <MainLayout links={officerLinks} userRole="Officer">
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                    <p className="font-semibold text-xs uppercase tracking-widest text-blue-600">Accessing Personnel Records...</p>
                </div>
            </MainLayout>
        );
    }

    if (!user) return null;

    return (
        <MainLayout links={officerLinks} userRole="Officer">
            <div className="relative z-10">
                {/* Header Section */}
                <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-4">
                            <ShieldCheck className="text-blue-600" size={12} />
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-600">Verified Personnel Protocol</span>
                        </div>
                        <h2 className="text-3xl font-bold text-[#2D4A9D] tracking-tight leading-none">Identity Profile</h2>
                        <p className="text-gray-500 mt-2 font-medium tracking-wide text-xs">Registry Encryption Level: Tier 04 Clearance</p>
                    </div>

                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all relative overflow-hidden ${isEditing
                            ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
                            : 'bg-[#2D4A9D] text-white shadow-xl shadow-blue-200/50 hover:bg-blue-700 hover:-translate-y-1'
                            }`}
                    >
                        {isEditing ? <X size={16} /> : <Edit3 size={16} className="group-hover:rotate-12 transition-transform" />}
                        <span className="relative z-10">{isEditing ? 'Cancel Update' : 'Modify Credentials'}</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    {/* Identity Card */}
                    <div className="lg:col-span-1 space-y-8 animate-in slide-in-from-left-6 duration-700">
                        <div className="bg-white rounded-[2.5rem] p-3 border border-gray-100 shadow-sm overflow-hidden relative group">
                            <div className="relative aspect-square rounded-[2rem] bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-blue-100 transition-all duration-700">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt={user.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                ) : (
                                    <span className="text-8xl font-black text-gray-200 group-hover:text-blue-600/10 transition-all group-hover:scale-110 duration-700">{user.name.charAt(0).toUpperCase()}</span>
                                )}
                                <div
                                    onClick={() => isEditing && document.getElementById('avatar-input').click()}
                                    className={`absolute inset-0 bg-blue-600/90 transition-all duration-500 flex flex-col items-center justify-center gap-4 backdrop-blur-sm cursor-pointer ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                >
                                    <div className="p-4 bg-white text-blue-600 rounded-3xl shadow-lg">
                                        <Camera size={24} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Update Bio-Metrics</span>
                                </div>
                                <input id="avatar-input" type="file" hidden accept="image/*" onChange={handleFileChange} />
                            </div>

                            <div className="p-8 text-center bg-white rounded-b-[2.5rem]">
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight leading-none truncate mb-4">{user.name}</h3>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 mb-6">
                                    <Cpu size={12} className="text-blue-600" />
                                    <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-600">
                                        {user.role} RANK
                                    </span>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-gray-50">
                                    <div className="flex justify-between items-center transition-all hover:translate-x-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sector Access</span>
                                        <span className="text-[10px] font-semibold text-gray-900 uppercase tracking-widest">Global_Cluster</span>
                                    </div>
                                    <div className="flex justify-between items-center transition-all hover:translate-x-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID Hash</span>
                                        <span className="text-[10px] font-mono font-semibold text-blue-600 uppercase tracking-widest">#{user._id.slice(-6)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Stats */}
                        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:rotate-12 duration-1000 text-blue-600">
                                <Shield size={100} />
                            </div>
                            <h4 className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest mb-10 flex items-center gap-3">
                                <Key size={14} /> Global Clearance
                            </h4>
                            <div className="space-y-8">
                                {[
                                    { l: 'Identity Verified', s: true },
                                    { l: 'Encryption Active', s: true },
                                    { l: 'Neural Link Secured', s: true },
                                    { l: 'Protocol-Gamma', s: false }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between group/item">
                                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest transition-colors group-hover/item:text-gray-900">{item.l}</span>
                                        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 border-2 ${item.s ? 'bg-blue-600 border-blue-100 shadow-[0_0_12px_rgba(37,99,235,0.4)]' : 'bg-gray-100 border-gray-200'}`}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Modification Form */}
                    <div className="lg:col-span-3 animate-in slide-in-from-bottom-6 duration-700">
                        <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-10">
                            <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
                                <h4 className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest mb-12 flex items-center gap-3">
                                    <Activity size={14} /> Network Credentials
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-4">Personnel Designation</label>
                                        <div className={`flex items-center gap-5 p-6 rounded-3xl border transition-all duration-500 group relative ${isEditing
                                            ? 'bg-white border-blue-600 shadow-xl shadow-blue-50 ring-4 ring-blue-50/50'
                                            : 'bg-gray-50 border-gray-100'
                                            }`}>
                                            <UserIcon size={20} className={isEditing ? 'text-blue-600' : 'text-gray-300'} />
                                            <input
                                                type="text"
                                                value={formData.name}
                                                readOnly={!isEditing}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="bg-transparent outline-none w-full text-sm font-bold text-gray-900 placeholder:text-gray-300 uppercase tracking-wide"
                                            />
                                            {isEditing && <Zap size={14} className="text-blue-600 animate-pulse absolute right-8" />}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-4">Data Communication Uplink</label>
                                        <div className={`flex items-center gap-5 p-6 rounded-3xl border transition-all duration-500 group relative ${isEditing
                                            ? 'bg-white border-blue-600 shadow-xl shadow-blue-50 ring-4 ring-blue-50/50'
                                            : 'bg-gray-50 border-gray-100'
                                            }`}>
                                            <Mail size={20} className={isEditing ? 'text-blue-600' : 'text-gray-300'} />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                readOnly={!isEditing}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="bg-transparent outline-none w-full text-sm font-bold text-gray-900 placeholder:text-gray-300"
                                            />
                                            {isEditing && <Zap size={14} className="text-blue-600 animate-pulse absolute right-8" />}
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-4">Security Cipher (Reset Only)</label>
                                            <div className="flex items-center gap-5 p-6 bg-white border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-3xl transition-all group relative">
                                                <Lock size={20} className="text-blue-600" />
                                                <input
                                                    type="password"
                                                    placeholder="NEW_SECURITY_HASH"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    className="bg-transparent outline-none w-full text-sm font-bold text-gray-900 placeholder:text-gray-200 uppercase tracking-wide"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {!isEditing && (
                                        <>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Activation Timestamp</label>
                                                <div className="flex items-center gap-5 p-6 bg-gray-50 border border-gray-100 rounded-3xl transition-all">
                                                    <Calendar size={20} className="text-gray-300" />
                                                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                                                        {new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-4">Personnel Node UUID</label>
                                                <div className="flex items-center gap-5 p-6 bg-gray-50 border border-gray-100 rounded-3xl transition-all">
                                                    <Globe size={20} className="text-gray-300" />
                                                    <span className="text-[11px] font-mono font-semibold text-gray-500 uppercase tracking-widest truncate">
                                                        {user._id}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {isEditing && (
                                    <div className="mt-12 pt-10 border-t border-gray-50 flex flex-col md:flex-row gap-6">
                                        <button
                                            type="submit"
                                            disabled={updating}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-3xl font-bold text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-4 group active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {updating ? <Loader className="animate-spin" size={18} /> : <Save size={18} className="group-hover:scale-125 transition-transform" />}
                                            {updating ? 'Transmitting Data...' : 'Synchronize Identity'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-10 py-5 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-3xl font-black text-[11px] uppercase tracking-widest transition-all border border-gray-100"
                                        >
                                            Abort
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Activity Overview */}
                            {!isEditing && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:translate-y-1 transition-all group/info">
                                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-8 group-hover/info:scale-110 transition-transform">
                                            <ShieldCheck size={28} />
                                        </div>
                                        <h4 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest mb-4">Security Clearance</h4>
                                        <p className="text-gray-400 text-xs font-bold leading-relaxed uppercase tracking-widest italic">
                                            You are currently operating on an authorized tactical link. All actions are logged under the CyberGuard operative protocol.
                                        </p>
                                    </div>
                                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:translate-y-1 transition-all group/info">
                                        <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-8 group-hover/info:scale-110 transition-transform">
                                            <Key size={28} />
                                        </div>
                                        <h4 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest mb-4">Privacy Standards</h4>
                                        <p className="text-gray-400 text-xs font-bold leading-relaxed uppercase tracking-widest italic">
                                            Biometric data and identity hashes are encrypted using the SHA-512 protocol and siloed from unauthorized registry access.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Profile;
