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
    ArrowRight,
    X
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
        { label: 'Dashboard', path: '/citizen/dashboard', icon: LayoutDashboard },
        { label: 'User Registry', path: '/users', icon: Users },
        { label: 'All Reports', path: '/reports', icon: FileText },
        { label: 'Global Config', path: '/settings', icon: Activity },
    ];

    const authorityLinks = [
        { label: 'Dashboard', path: '/citizen/dashboard', icon: LayoutDashboard },
        { label: 'Case Handling', path: '/cases', icon: FileText },
        { label: 'Profile', path: '/profile', icon: UserIcon },
    ];

    const citizenLinks = [
        { label: 'Dashboard', path: '/citizen/dashboard', icon: LayoutDashboard },
        { label: 'My Reports', path: '/my-reports', icon: FileText },
        { label: 'Profile', path: '/profile', icon: UserIcon },
    ];

    const links = role === 'admin' ? adminLinks : role === 'authority' ? authorityLinks : citizenLinks;

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
            window.location.reload(); // Refresh to update MainLayout header
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <MainLayout links={links} userRole={role.toUpperCase()}>
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader className="animate-spin text-blue-600 mb-4" size={40} />
                    <p className="font-semibold text-xs uppercase tracking-wider text-gray-400">Loading Profile Data...</p>
                </div>
            </MainLayout>
        );
    }

    if (!user) return null;

    return (
        <MainLayout links={links} userRole={user.role.toUpperCase()}>
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-[#2D4A9D] tracking-tight">Profile Settings</h2>
                    <p className="text-gray-500 mt-2 font-normal">Manage your personal information and account security.</p>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-xs uppercase tracking-wider transition-all ${isEditing ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-[#2D4A9D] text-white shadow-xl shadow-blue-100/50 hover:bg-blue-700'
                        }`}
                >
                    {isEditing ? <X size={16} /> : <Edit3 size={16} />}
                    {isEditing ? 'Discard' : 'Edit Profile'}
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
                <div className={`h-40 bg-gradient-to-r ${user.role === 'admin' ? 'from-indigo-600 to-blue-700' : user.role === 'authority' ? 'from-emerald-600 to-teal-700' : 'from-blue-500 to-sky-600'}`}></div>
                <div className="px-12 pb-12">
                    <div className="relative -mt-16 mb-10 flex items-end gap-8">
                        <div className="w-36 h-36 bg-white rounded-[2rem] p-2 shadow-2xl">
                            <div
                                className="w-full h-full bg-gray-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 relative group overflow-hidden border border-gray-100"
                                onClick={() => isEditing && document.getElementById('avatar-input').click()}
                            >
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-5xl font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                                )}
                                <div className={`absolute inset-0 bg-black/40 transition-all duration-300 flex items-center justify-center text-white cursor-pointer backdrop-blur-sm ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    <Camera size={28} />
                                </div>
                                <input id="avatar-input" type="file" hidden accept="image/*" onChange={handleFileChange} />
                            </div>
                        </div>
                        <div className="pb-4">
                            <h3 className="text-3xl font-semibold text-gray-900 leading-tight tracking-tight">{user.name}</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : user.role === 'authority' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {user.role}
                                </span>
                                <div className="w-1 h-1 bg-gray-300 rounded-full mx-1"></div>
                                <p className="text-gray-400 font-normal text-xs uppercase tracking-wider">Account Active</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider ml-1">Full Name</label>
                                    <div className={`flex items-center gap-4 p-5 rounded-3xl border transition-all group ${isEditing ? 'bg-white border-blue-100 ring-4 ring-blue-50' : 'bg-gray-50 border-transparent'}`}>
                                        <UserIcon className={`${isEditing ? 'text-blue-600' : 'text-gray-400'}`} size={20} />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            readOnly={!isEditing}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-transparent outline-none w-full text-sm font-semibold text-gray-800"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider ml-1">Email Address</label>
                                    <div className={`flex items-center gap-4 p-5 rounded-3xl border transition-all group ${isEditing ? 'bg-white border-blue-100 ring-4 ring-blue-50' : 'bg-gray-50 border-transparent'}`}>
                                        <Mail className={`${isEditing ? 'text-blue-600' : 'text-gray-400'}`} size={20} />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            readOnly={!isEditing}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="bg-transparent outline-none w-full text-sm font-semibold text-gray-800"
                                        />
                                    </div>
                                </div>
                                {isEditing && (
                                    <div className="space-y-3">
                                        <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider ml-1">New Password (Optional)</label>
                                        <div className="flex items-center gap-4 p-5 bg-white border border-blue-100 ring-4 ring-blue-50 rounded-3xl transition-all">
                                            <Lock className="text-blue-600" size={20} />
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="bg-transparent outline-none w-full text-sm font-semibold text-gray-800"
                                            />
                                        </div>
                                    </div>
                                )}
                                {!isEditing && (
                                    <>
                                        <div className="space-y-3">
                                            <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider ml-1">Created On</label>
                                            <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-3xl border border-transparent group transition-all">
                                                <Calendar className="text-gray-400" size={20} />
                                                <input type="text" value={new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })} readOnly className="bg-transparent outline-none w-full text-sm font-semibold text-gray-800" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider ml-1">Account ID</label>
                                            <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-3xl border border-transparent group transition-all">
                                                <Lock className="text-gray-400" size={20} />
                                                <input type="text" value={user._id} readOnly className="bg-transparent outline-none w-full text-xs font-mono font-semibold text-gray-500" />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {isEditing && (
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-semibold text-xs uppercase tracking-wider hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {updating ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                                        {updating ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-8">
                            <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                    <Shield size={120} />
                                </div>
                                <h4 className="text-xs font-semibold text-gray-900 mb-6 uppercase tracking-wider relative">Account Status</h4>
                                <ul className="space-y-5 relative">
                                    {[
                                        { l: 'Identity Verified', s: true },
                                        { l: 'Email Confirmed', s: true },
                                        { l: 'Access Monitoring', s: true },
                                        { l: 'Secure Encryption', s: true }
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-gray-600">{item.l}</span>
                                            <div className={`w-1.5 h-1.5 rounded-full ${item.s ? 'bg-emerald-500 shadow-sm' : 'bg-gray-300'}`}></div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
};

export default Profile;
