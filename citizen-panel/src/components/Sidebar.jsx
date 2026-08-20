import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    FilePlus,
    ClipboardList,
    Users,
    Settings,
    ShieldAlert,
    Tags,
    LogOut
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const userLinks = [
        { name: 'Dashboard', path: '/user/dashboard', icon: LayoutDashboard },
        { name: 'New Report', path: '/user/report/new', icon: FilePlus },
        { name: 'My Reports', path: '/user/reports', icon: ClipboardList },
    ];

    const authorityLinks = [
        { name: 'Dashboard', path: '/authority/dashboard', icon: LayoutDashboard },
        { name: 'All Reports', path: '/authority/reports', icon: ClipboardList },
    ];

    const adminLinks = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Reports', path: '/admin/dashboard', icon: ClipboardList }, // Reuse dashboard for now or all reports
        { name: 'Categories', path: '/admin/categories', icon: Tags },
    ];

    const links = user?.role === 'admin' ? adminLinks : user?.role === 'authority' ? authorityLinks : userLinks;

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-50 transition-all duration-300">
            <div className="p-6 flex items-center gap-3 border-b border-gray-100">
                <div className="bg-primary-600 p-2 rounded-lg">
                    <ShieldAlert className="text-white w-6 h-6" />
                </div>
                <span className="text-xl font-semibold text-gray-900 tracking-tight">CyberGuard</span>
            </div>

            <nav className="mt-8 px-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-primary-50 text-primary-600 font-semibold'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'group-hover:text-gray-900'}`} />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="absolute bottom-4 left-0 w-full px-4">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-semibold transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
