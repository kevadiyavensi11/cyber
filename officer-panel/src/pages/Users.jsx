import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { Users as UsersIcon, Plus } from 'lucide-react';

const Users = () => {
    const user = JSON.parse(localStorage.getItem('user')) || { email: 'admin@cyber.com' };

    const users = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Citizen', status: 'Active' },
        { id: 2, name: 'Officer Smith', email: 'authority@cyber.com', role: 'Authority', status: 'Active' },
        { id: 3, name: 'Jane Wilson', email: 'jane@example.com', role: 'Citizen', status: 'Inactive' },
    ];

    return (
        <div className="dashboard-layout">
            <Sidebar role="admin" />
            <div className="main-content">
                <Topbar title="User Management" userEmail={user.email} />

                <div className="animate-fade-in">
                    <div className="table-header" style={{ background: 'transparent', padding: '0 0 1.5rem', boxShadow: 'none', border: 'none' }}>
                        <div>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Manage Users</h1>
                            <p style={{ color: 'var(--text-muted)' }}>View and manage all system users and roles.</p>
                        </div>
                        <button className="btn btn-primary">
                            <Plus size={18} />
                            Add New User
                        </button>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>{u.role}</td>
                                        <td>
                                            <span className={`status-pill ${u.status === 'Active' ? 'status-resolved' : 'status-pending'}`}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Users;
