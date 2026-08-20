import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import DataTable from '../components/reusable/DataTable';
import { adminService } from '../services/api';
import {
    LayoutDashboard,
    Users as UsersIcon,
    FileText,
    Activity,
    UserPlus,
    Shield,
    Loader,
    Radio,
    Trash2,
    Settings,
    Map as MapIcon,
    UserCheck,
    Globe,
    Lock,
    Unlock,
    Key,
    Mail,
    User,
    ChevronDown,
    X,
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useSearch } from '../context/SearchContext';
import { useNavigate } from 'react-router-dom';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [zones, setZones] = useState([]);
    const { searchTerm } = useSearch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [showProvisionModal, setShowProvisionModal] = useState(false);
    const [officerForm, setOfficerForm] = useState({ name: '', email: '', password: '', zone: '' });
    const [submitting, setSubmitting] = useState(false);

    const adminLinks = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'User Registry', path: '/citizens', icon: UsersIcon },
        { label: 'All Reports', path: '/reports', icon: FileText },
        { label: 'Zone Wise Map', path: '/admin/zone-map', icon: MapIcon },
        { label: 'Broadcasts', path: '/broadcast', icon: Radio },
        { label: 'System Logs', path: '/logs', icon: Activity },
        { label: 'Profile', path: '/profile', icon: User },
        { label: 'Settings', path: '/settings', icon: Settings },
    ];

    const fetchUsers = async () => {
        try {
            const [{ data: userData }, { data: zoneData }] = await Promise.all([
                api.get('/admin/citizens'),
                adminService.getZones()
            ]);
            setUsers(Array.isArray(userData) ? userData : []);
            setZones(Array.isArray(zoneData) ? zoneData : []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to retrieve user database');
            setUsers([]);
            setZones([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleProvisionOfficer = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await adminService.addOfficer(officerForm);
            toast.success('Officer account successfully created');
            setShowProvisionModal(false);
            setOfficerForm({ name: '', email: '', password: '', zone: '' });
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create officer account');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const normalizedStatus = currentStatus || 'active';
        const action = normalizedStatus === 'active' ? 'suspend' : 'restore';

        if (action === 'suspend' && !window.confirm('Are you sure you want to suspend this user? They will be immediately blocked from the system.')) {
            return;
        }

        try {
            const { data } = await api.patch(`/admin/user-status/${id}`);
            toast.success(data.message || `User access ${action === 'suspend' ? 'suspended' : 'restored'}`);
            fetchUsers();
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to update user status';
            toast.error(msg);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this user? This cannot be undone.')) return;
        try {
            await api.delete(`/admin/user/${id}`);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    const columns = [
        {
            header: 'User & Email',
            accessor: 'name',
            render: (row) => (
                <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-110 transition-transform">
                        {String(row?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-sm leading-none">{row?.name || 'Unknown User'}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">{row?.email || 'N/A'}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Role',
            accessor: 'role',
            render: (row) => (
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${row.role === 'admin' ? 'bg-purple-50 border-purple-100 text-purple-600' :
                    row.role === 'officer' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                        'bg-gray-50 border-gray-100 text-gray-500'
                    }`}>
                    <Shield size={10} />
                    {row.role || 'citizen'}
                </span>
            )
        },
        {
            header: 'Zone Assignment',
            accessor: 'zone',
            render: (row) => (
                <div className="flex items-center gap-2">
                    {row.role === 'officer' ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100">
                            <Globe size={10} className="text-gray-400" />
                            <span className="text-[10px] font-bold uppercase text-gray-600 tracking-wider">
                                {row.zone || 'None'}
                            </span>
                        </div>
                    ) : (
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">N/A</span>
                    )}
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${row.status === 'blocked' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${row.status === 'blocked' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {row.status === 'blocked' ? 'Blocked' : 'Active'}
                    </span>
                </div>
            )
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-2">
                    {row.role !== 'admin' && (
                        <>
                            <button
                                onClick={() => handleToggleStatus(row._id, row.status)}
                                title={row.status === 'blocked' ? 'Unlock Account' : 'Suspend Account'}
                                className={`p-2.5 bg-gray-50 border border-gray-100 rounded-xl transition-all ${row.status === 'blocked' ? 'hover:border-emerald-200 hover:text-emerald-600 text-gray-400' : 'hover:border-red-200 hover:text-red-600 text-gray-400'}`}
                            >
                                {row.status === 'blocked' ? <Unlock size={16} /> : <Lock size={16} />}
                            </button>
                            <button
                                onClick={() => handleDeleteUser(row._id)}
                                title="Delete User"
                                className="p-2.5 bg-gray-50 border border-gray-100 hover:border-red-200 hover:text-red-600 text-gray-400 rounded-xl transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                </div>
            )
        }
    ];

    if (loading) {
        return (
            <MainLayout links={adminLinks} userRole="Admin">
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                    <p className="font-semibold text-xs uppercase tracking-widest text-blue-600">Retrieving user registry...</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout links={adminLinks} userRole="Admin">
            {/* Page Header */}
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">User Registry</h2>
                    <p className="text-gray-500 mt-2 font-bold">Manage citizen accessibility and provision law enforcement personnel.</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/logs')}
                        className="flex items-center gap-3 bg-white border border-gray-100 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider text-gray-500 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm group"
                    >
                        <Activity size={16} className="text-gray-400 group-hover:text-blue-600" />
                        Audit Logs
                    </button>
                    <button
                        onClick={() => setShowProvisionModal(true)}
                        className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider text-white shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
                    >
                        <UserPlus size={16} />
                        Add New Officer
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <DataTable
                    columns={columns}
                    data={(users || []).filter(u =>
                        (u.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                        (u.email || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                        (u.role || '').toLowerCase().includes((searchTerm || '').toLowerCase())
                    )}
                    emptyMessage="No users found in the registry."
                />
            </div>

            {/* Provision Modal */}
            {showProvisionModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-gray-100 p-12 relative overflow-hidden">
                        <button
                            onClick={() => setShowProvisionModal(false)}
                            className="absolute top-8 right-8 p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-all hover:rotate-90 duration-300"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-5 mb-10">
                            <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center shadow-sm">
                                <UserCheck className="text-blue-600" size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Create Officer</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Register new field operative</p>
                            </div>
                        </div>

                        <form className="space-y-6" onSubmit={handleProvisionOfficer}>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-300 group-focus-within:text-blue-600 transition-colors">
                                        <User size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        value={officerForm.name}
                                        onChange={(e) => setOfficerForm({ ...officerForm, name: e.target.value })}
                                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 focus:border-blue-400 rounded-2xl outline-none text-sm font-semibold text-gray-900 transition-all placeholder:text-gray-300"
                                        placeholder="Officer's legal name..."
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Work Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-300 group-focus-within:text-blue-600 transition-colors">
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        type="email"
                                        value={officerForm.email}
                                        onChange={(e) => setOfficerForm({ ...officerForm, email: e.target.value })}
                                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 focus:border-blue-400 rounded-2xl outline-none text-sm font-semibold text-gray-900 transition-all placeholder:text-gray-300"
                                        placeholder="officer@service.gov"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Temporary Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-300 group-focus-within:text-blue-600 transition-colors">
                                        <Key size={16} />
                                    </div>
                                    <input
                                        type="password"
                                        value={officerForm.password}
                                        onChange={(e) => setOfficerForm({ ...officerForm, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 focus:border-blue-400 rounded-2xl outline-none text-sm font-semibold text-gray-900 transition-all placeholder:text-gray-300"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Jurisdiction Zone</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-300 group-focus-within:text-blue-600 transition-colors">
                                        <Globe size={16} />
                                    </div>
                                    <select
                                        value={officerForm.zone}
                                        onChange={(e) => setOfficerForm({ ...officerForm, zone: e.target.value })}
                                        className="w-full pl-14 pr-12 py-4 bg-gray-50 border border-gray-100 focus:border-blue-400 rounded-2xl outline-none text-sm font-semibold text-gray-900 transition-all appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="" disabled>Select Sector Zone...</option>
                                        {["Central", "North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"].map(zone => (
                                            <option key={zone} value={zone}>{zone} Zone</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-gray-400">
                                        <ChevronDown size={14} />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98] disabled:opacity-30 mt-4"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {submitting ? (
                                        <>
                                            <Loader className="animate-spin" size={16} />
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            Create Officer Account
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default Users;
