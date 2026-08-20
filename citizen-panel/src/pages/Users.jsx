import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Users as UsersIcon, Plus, LayoutDashboard, FileText, PlusCircle, User as UserIcon, Settings } from 'lucide-react';

const Users = () => {
    const user = JSON.parse(localStorage.getItem('user')) || { email: 'admin@cyber.com' };

    const citizenLinks = [
        { label: 'Dashboard', path: '/citizen/dashboard', icon: LayoutDashboard },
        { label: 'My Reports', path: '/my-reports', icon: FileText },
        { label: 'Submit Report', path: '/submit-report', icon: PlusCircle },
        { label: 'Profile', path: '/profile', icon: UserIcon },
        { label: 'Settings', path: '/settings', icon: Settings },
    ];

    const users = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Citizen', status: 'Active' },
        { id: 2, name: 'Officer Smith', email: 'authority@cyber.com', role: 'Officer', status: 'Active' },
        { id: 3, name: 'Jane Wilson', email: 'jane@example.com', role: 'Citizen', status: 'Inactive' },
    ];

    return (
        <MainLayout links={citizenLinks} userRole="Admin">
            <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">User Registry</h2>
                    <p className="text-gray-500 mt-1 font-medium text-sm">Manage system access and specialized user roles.</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                    <Plus size={18} />
                    Add New User
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 text-xs font-semibold uppercase text-gray-400 tracking-wider">User Profile</th>
                                <th className="px-8 py-5 text-xs font-semibold uppercase text-gray-400 tracking-wider">Contact Email</th>
                                <th className="px-8 py-5 text-xs font-semibold uppercase text-gray-400 tracking-wider">Assigned Role</th>
                                <th className="px-8 py-5 text-xs font-semibold uppercase text-gray-400 tracking-wider">Status</th>
                                <th className="px-8 py-5 text-xs font-semibold uppercase text-gray-400 tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                <UserIcon size={18} />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-medium text-gray-500">{u.email}</td>
                                    <td className="px-8 py-6 text-sm font-semibold text-gray-700">{u.role}</td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${u.status === 'Active'
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                            : 'bg-rose-50 text-rose-600 border border-rose-100'
                                            }`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 uppercase tracking-wider transition-colors">
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </MainLayout>
    );
};

export default Users;
