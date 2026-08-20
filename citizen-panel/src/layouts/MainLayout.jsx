import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    ShieldAlert,
    LogOut,
    Search,
    Bell,
    User as UserIcon,
    Menu,
    X,
    Settings,
    HelpCircle,
    Sun,
    Moon
} from 'lucide-react';
import NotificationDropdown from '../components/notifications/NotificationDropdown';
import { useSearch } from '../context/SearchContext';
import { useTheme } from '../context/ThemeContext';

const SidebarLink = ({ link, isActive }) => {
    const Icon = link.icon;
    return (
        <Link
            to={link.path}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden ${isActive
                ? 'bg-gradient-to-r from-white to-blue-50 text-[#2D4A9D] shadow-2xl shadow-blue-900/30 translate-x-1'
                : 'text-white hover:bg-white/10 transition-all'
                }`}
        >
            <Icon size={20} className={`${isActive ? 'text-[#2D4A9D]' : 'text-white/60 group-hover:text-white transition-colors'}`} />
            <span className={`font-black text-xs uppercase tracking-widest ${isActive ? 'text-[#2D4A9D]' : 'text-white'}`}>{link.label}</span>
            {link.badge && !isActive && (
                <span className="ml-auto bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full font-semibold uppercase">
                    {link.badge}
                </span>
            )}
        </Link>
    );
};

const MainLayout = ({ children, links, userRole }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [userData, setUserData] = useState({ name: 'User', role: 'citizen' });
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const storedUser = JSON.parse(userStr);
                if (storedUser) {
                    setUserData(storedUser);
                }
            }
        } catch (e) {
            console.error("MainLayout: Error parsing user data", e);
        }
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';

    const { searchTerm, setSearchTerm } = useSearch();

    return (
        <div className="min-h-screen bg-[#f0f7ff] dark:bg-slate-900 flex font-app transition-colors duration-500">
            {/* Sidebar */}
            <aside className={`sticky top-0 h-screen bg-[#2D4A9D] border-r border-[#2D4A9D]/20 transition-all duration-500 z-50 shadow-2xl ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
                <div className="h-full flex flex-col p-6">
                    <div className={`flex items-center gap-4 mb-10 ${isSidebarOpen ? 'px-4' : 'justify-center p-0'}`}>
                        <div className="bg-gradient-to-br from-white/20 to-white/5 p-3 rounded-2xl backdrop-blur-xl border border-white/20 group-hover:rotate-12 transition-all duration-700 shadow-lg relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-transparent opacity-50" />
                            <ShieldAlert className="text-white relative z-10 drop-shadow-sm" size={24} />
                        </div>
                        {isSidebarOpen && (
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-white tracking-tighter uppercase leading-none">Citizen Safety</span>
                                <span className="text-[9px] font-bold text-white uppercase tracking-[0.2em] mt-1 leading-none opacity-70">Official Portal</span>
                            </div>
                        )}
                    </div>

                    <nav className="flex-1 space-y-2">
                        {links.map((link, idx) => (
                            <SidebarLink
                                key={idx}
                                link={link}
                                isActive={location.pathname === link.path}
                            />
                        ))}
                    </nav>

                    <div className="mt-auto space-y-4">
                        {isSidebarOpen && (
                            <div className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white shadow-sm border border-white/10 font-black">
                                        {userInitial}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-white truncate">{userData.name}</p>
                                        <p className="text-[10px] font-bold text-white uppercase tracking-widest opacity-60">{userData.role}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all text-xs font-black"
                                >
                                    <LogOut size={14} /> Log out
                                </button>
                            </div>
                        )}
                        {!isSidebarOpen && (
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center p-3 rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all"
                            >
                                <LogOut size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 transition-all duration-500 min-w-0">
                {/* Navbar */}
                <header className="h-24 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-10 sticky top-0 z-40 transition-colors duration-500">
                    <div className="flex items-center gap-8 flex-1">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-3 bg-white/10 border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all shadow-sm"
                        >
                            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        <div className="relative max-w-md w-full group hidden md:block">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D4A9D] transition-colors group-focus-within:scale-110 duration-300" size={18} />
                            <input
                                type="text"
                                placeholder="Search records, trackers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-gray-50/80 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-200/50 focus:ring-[6px] focus:ring-blue-50/50 transition-all outline-none text-sm font-semibold placeholder:text-gray-400/80 placeholder:font-bold placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-3 bg-white/10 border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all shadow-sm"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <NotificationDropdown />
                        <div className="h-10 w-px bg-gray-100 mx-2"></div>

                        <div className="flex items-center gap-4 bg-[#2D4A9D] py-2 pl-2 pr-6 rounded-3xl shadow-lg shadow-blue-100 hover:scale-105 transition-all cursor-pointer group border border-white/10">
                            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-white font-black backdrop-blur-md border border-white/25">
                                {userInitial}
                            </div>
                            <div className="hidden lg:block overflow-hidden">
                                <p className="text-sm font-black text-white leading-none truncate max-w-[120px] mb-1">{userData.name}</p>
                                <p className="text-[9px] text-blue-200 font-bold uppercase tracking-widest leading-none">Status: {userData.role}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="p-10 min-h-[calc(100vh-6rem)] animate-in fade-in duration-700">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
