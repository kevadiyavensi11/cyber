import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { authService } from '../services/api';
import { format } from 'date-fns';
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
    Radio,
    Settings,
    ShieldCheck,
    Map as MapIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = ({ role = 'admin' }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', avatar: '' });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [updating, setUpdating] = useState(false);

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

    const authorityLinks = [
        { label: 'Dashboard', path: '/officer/dashboard', icon: LayoutDashboard },
        { label: 'Assigned Cases', path: '/cases', icon: FolderOpen },
        { label: 'All Reports', path: '/reports', icon: FileText },
        { label: 'Profile Settings', path: '/profile', icon: UserIcon },
        { label: 'General Settings', path: '/settings', icon: Settings },
    ];

    const citizenLinks = [
        { label: 'Dashboard', path: '/citizen/dashboard', icon: LayoutDashboard },
        { label: 'Report Incident', path: '/report', icon: FileText },
        { label: 'My Reports', path: '/my-reports', icon: ClipboardList },
        { label: 'Profile', path: '/profile', icon: UserIcon },
    ];

    const links = role === 'admin' ? adminLinks : role === 'authority' || role === 'officer' ? authorityLinks : citizenLinks;

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
            localStorage.setItem('user', JSON.stringify({
                ...JSON.parse(localStorage.getItem('user')),
                name: data.name,
                email: data.email,
                token: data.token
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
            <MainLayout links={links} userRole={role.toUpperCase()}>
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                    <p className="font-semibold text-xs uppercase tracking-widest text-blue-600">Retrieving account data...</p>
                </div>
            </MainLayout>
        );
    }

    if (!user) return null;

    return (
        <MainLayout links={links} userRole={user.role.toUpperCase()}>
            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
                <div>
                    <h2 className="text-3xl font-bold text-[#2D4A9D] tracking-tight">Account Profile</h2>
                    <p className="text-gray-500 mt-2 font-medium">Manage your personal information and security credentials.</p>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm ${isEditing
                        ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
                        : 'bg-[#2D4A9D] text-white hover:bg-blue-700 shadow-blue-100/50 shadow-xl'
                        }`}
                >
                    {isEditing ? <X size={16} /> : <Edit3 size={16} />}
                    {isEditing ? 'Discard Changes' : 'Update Profile'}
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Banner */}
                <div className={`h-48 bg-gradient-to-r ${user.role === 'admin'
                    ? 'from-blue-600 to-indigo-700'
                    : user.role === 'officer'
                        ? 'from-emerald-500 to-teal-600'
                        : 'from-blue-400 to-blue-600'}`}>
                </div>

                <div className="p-10 lg:p-12">
                    <div className="relative -mt-24 mb-12 flex items-end gap-8 flex-col md:flex-row text-center md:text-left">
                        <div className="w-40 h-40 bg-white rounded-[2.5rem] p-2 shadow-xl shrink-0 mx-auto md:mx-0">
                            <div
                                className="w-full h-full bg-gray-50 rounded-[2rem] flex items-center justify-center text-blue-600 relative group overflow-hidden border border-gray-50"
                                onClick={() => isEditing && document.getElementById('avatar-input').click()}
                            >
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-5xl font-bold">{String(user.name || 'U').charAt(0).toUpperCase()}</span>
                                )}
                                <div className={`absolute inset-0 bg-gray-900/40 transition-all duration-300 flex items-center justify-center text-white cursor-pointer backdrop-blur-sm ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    <Camera size={28} />
                                </div>
                                <input id="avatar-input" type="file" hidden accept="image/*" onChange={handleFileChange} />
                            </div>
                        </div>
                        <div className="pb-4 flex-1">
                            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{user.name || 'Anonymous user'}</h3>
                            <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${user.role === 'admin'
                                    ? 'bg-blue-50 border-blue-100 text-blue-600'
                                    : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                    }`}>
                                    {user.role} Access
                                </span>
                                <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Active Since {format(new Date(user.createdAt), 'MMM yyyy')}</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Full Legal Name</label>
                                    <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all ${isEditing ? 'bg-white border-blue-400 shadow-sm' : 'bg-gray-50 border-transparent text-gray-500'}`}>
                                        <UserIcon className={isEditing ? 'text-blue-600' : 'text-gray-300'} size={18} />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            readOnly={!isEditing}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-transparent outline-none w-full text-sm font-semibold text-gray-900 placeholder:text-gray-200"
                                            placeholder="Your name..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Official Email Address</label>
                                    <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all ${isEditing ? 'bg-white border-blue-400 shadow-sm' : 'bg-gray-50 border-transparent text-gray-500'}`}>
                                        <Mail className={isEditing ? 'text-blue-600' : 'text-gray-300'} size={18} />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            readOnly={!isEditing}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="bg-transparent outline-none w-full text-sm font-semibold text-gray-900 placeholder:text-gray-200"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                </div>

                                {isEditing ? (
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Update Security Key (Leave blank to keep current)</label>
                                        <div className="flex items-center gap-4 px-6 py-4 bg-white border border-blue-400 rounded-2xl shadow-sm transition-all animate-in slide-in-from-top-2">
                                            <Lock className="text-blue-600" size={18} />
                                            <input
                                                type="password"
                                                placeholder="Enter new strong password (min 6 characters)"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="bg-transparent outline-none w-full text-sm font-semibold text-gray-900 placeholder:text-gray-300"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Registration Date</label>
                                            <div className="flex items-center gap-4 px-6 py-4 bg-gray-50 rounded-2xl border border-transparent text-gray-500">
                                                <Calendar className="text-gray-300" size={18} />
                                                <span className="text-sm font-semibold">{format(new Date(user.createdAt), 'MMMM dd, yyyy')}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Unique Account Identifier</label>
                                            <div className="flex items-center gap-4 px-6 py-4 bg-gray-50 rounded-2xl border border-transparent text-gray-500">
                                                <Shield className="text-gray-300" size={18} />
                                                <span className="text-[10px] font-mono font-bold tracking-widest">{user._id}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {isEditing && (
                                <div className="pt-6 border-t border-gray-50">
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                                    >
                                        {updating ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                                        {updating ? 'Processing...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Side Info */}
                        <div className="space-y-8">
                            <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 relative overflow-hidden group">
                                <ShieldCheck className="absolute -right-8 -bottom-8 text-gray-200 group-hover:scale-110 transition-transform duration-700 opacity-50" size={160} />
                                <div className="relative z-10">
                                    <h4 className="text-xs font-bold text-gray-900 mb-6 uppercase tracking-wider">Account Security</h4>
                                    <ul className="space-y-5">
                                        {[
                                            { l: 'Identity Verified', s: true },
                                            { l: 'Two-Factor Auth', s: false },
                                            { l: 'Security Logs Sync', s: true },
                                            { l: 'Encryption Active', s: true }
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{item.l}</span>
                                                <div className={`w-1.5 h-1.5 rounded-full ${item.s ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-gray-200'}`}></div>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-8 pt-6 border-t border-gray-200/50">
                                        <p className="text-[10px] font-medium text-gray-400 leading-relaxed italic">
                                            Your information is protected under government privacy protocols. Automated auditing records all profile modifications.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
};

// Placeholder icons for missing imports if any
const FolderOpen = (props) => <FileText {...props} />;
const ClipboardList = (props) => <FileText {...props} />;

export default Profile;
