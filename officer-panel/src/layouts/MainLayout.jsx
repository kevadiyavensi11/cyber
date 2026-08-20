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
    ChevronDown,
    LayoutDashboard,
    Maximize2,
    Minimize2,
    Sun,
    Moon
} from 'lucide-react';
import NotificationDropdown from '../components/notifications/NotificationDropdown';
import { useSearch } from '../context/SearchContext';
import { useTheme } from '../context/ThemeContext';

const SidebarLink = ({ link, isActive, isCollapsed }) => {
    const Icon = link.icon || LayoutDashboard;
    return (
        <Link
            to={link.path || '#'}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden ${isActive
                ? 'bg-gradient-to-r from-white to-blue-50 text-[#2D4A9D] shadow-2xl shadow-blue-900/30 translate-x-1'
                : 'text-white hover:bg-white/10 transition-all'
                }`}
        >
            <Icon size={20} className={`${isActive ? 'text-[#2D4A9D]' : 'text-white/60 group-hover:text-white transition-colors'}`} />
            {!isCollapsed && <span className={`font-black text-xs uppercase tracking-widest ${isActive ? 'text-[#2D4A9D]' : 'text-white'}`}>{link.label}</span>}
            {link.badge && !isActive && !isCollapsed && (
                <span className="ml-auto bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
                    {link.badge}
                </span>
            )}
        </Link>
    );
};

const MainLayout = ({ children, links, userRole }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [userData, setUserData] = useState({ name: 'Officer', role: 'officer' });
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUserData(storedUser);
        }
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : 'O';
    const { searchTerm, setSearchTerm } = useSearch();

    return (
        <div className="min-h-screen bg-[#f0f7ff] flex font-app transition-colors duration-500">
            {/* Sidebar */}
            <aside className={`sticky top-0 h-screen bg-[#2D4A9D] border-r border-[#2D4A9D]/20 transition-all duration-500 z-50 shadow-2xl ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
                <div className="h-full flex flex-col p-6">
                    {/* Logo Section */}
                    <div className={`flex items-center gap-4 mb-10 ${isSidebarOpen ? 'px-4' : 'justify-center p-0'}`}>
                        <div className="bg-gradient-to-br from-white/20 to-white/5 p-3 rounded-2xl backdrop-blur-xl border border-white/20 group-hover:rotate-12 transition-all duration-700 shadow-lg relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-transparent opacity-50" />
                            <ShieldAlert className="text-white relative z-10 drop-shadow-sm" size={24} />
                        </div>
                        {isSidebarOpen && (
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-white tracking-tighter uppercase leading-none">CyberGuard</span>
                                <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mt-1 leading-none opacity-70">Officer Command</span>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        {(links || []).map((link, idx) => (
                            <SidebarLink
                                key={idx}
                                link={link}
                                isActive={location.pathname === link.path}
                                isCollapsed={!isSidebarOpen}
                            />
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="mt-auto pt-6">
                        <div className={`bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 ${isSidebarOpen ? '' : 'flex justify-center p-3'}`}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/10 font-bold">
                                    {userInitial}
                                </div>
                                {isSidebarOpen && (
                                    <div className="overflow-hidden flex-1">
                                        <p className="text-sm font-bold text-white truncate">{userData.name}</p>
                                        <p className="text-[10px] font-bold text-white uppercase tracking-widest opacity-60">{userData.role}</p>
                                    </div>
                                )}
                            </div>
                            {isSidebarOpen && (
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all text-xs font-black"
                                >
                                    <LogOut size={14} /> Log out
                                </button>
                            )}
                            {!isSidebarOpen && (
                                <button onClick={handleLogout} className="text-white opacity-60 hover:opacity-100 transition-opacity">
                                    <LogOut size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 transition-all duration-500 min-w-0">
                {/* Top Navbar */}
                <header className="h-24 px-10 flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
                    <div className="flex items-center gap-8 flex-1">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-3 bg-[#2D4A9D]/10 border border-[#2D4A9D]/20 rounded-2xl text-[#2D4A9D] hover:bg-[#2D4A9D]/20 transition-all"
                        >
                            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        {/* Search */}
                        <div className="relative max-w-md w-full group hidden md:block">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D4A9D] transition-colors group-focus-within:scale-110 duration-300" size={18} />
                            <input
                                type="text"
                                placeholder="Search assigned reports..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-gray-50/80 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-200/50 focus:ring-[6px] focus:ring-blue-50/50 transition-all outline-none text-sm font-semibold placeholder:text-gray-400/80 placeholder:font-bold placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={toggleTheme}
                             className="p-3 bg-[#2D4A9D]/10 border border-[#2D4A9D]/20 rounded-2xl text-[#2D4A9D] hover:bg-[#2D4A9D]/20 transition-all"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <NotificationDropdown />

                        <div className="w-px h-8 bg-gray-100" />

                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-4 pl-2 pr-1 py-1 rounded-2xl bg-gray-50 border border-transparent hover:border-blue-100 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform">
                                    {userInitial}
                                </div>
                                <div className="hidden lg:block text-left mr-2">
                                    <p className="text-sm font-semibold text-gray-900 leading-none">{userData.name}</p>
                                    <p className="text-xs text-gray-400 font-medium uppercase mt-1 tracking-wider">{userData.role}</p>
                                </div>
                                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {showProfileMenu && (
                                <div className="absolute right-0 mt-4 w-60 bg-white border border-gray-100 rounded-3xl shadow-xl p-3 animate-in fade-in slide-in-from-top-4 duration-300 z-[100]">
                                    <div className="p-4 border-b border-gray-50 mb-2">
                                        <p className="text-sm font-semibold text-gray-900">{userData.name}</p>
                                        <p className="text-xs text-gray-400 truncate font-medium">{userData.email || 'Officer'}</p>
                                    </div>
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-3 w-full px-4 py-3 text-xs font-semibold text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-all"
                                        onClick={() => setShowProfileMenu(false)}
                                    >
                                        <UserIcon size={16} /> My Account
                                    </Link>
                                    <Link
                                        to="/settings"
                                        className="flex items-center gap-3 w-full px-4 py-3 text-xs font-semibold text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-all"
                                        onClick={() => setShowProfileMenu(false)}
                                    >
                                        <Settings size={16} /> Settings
                                    </Link>
                                    <div className="h-px bg-gray-50 my-2" />
                                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </div>
                            )}
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
