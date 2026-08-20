import { Bell, Search, User, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user } = useAuth();

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search reports or entities..."
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-10 w-px bg-gray-200 mx-2"></div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name}</p>
                        <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">{user?.role}</p>
                    </div>
                    <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 font-semibold border-2 border-white shadow-sm">
                        {user?.name?.charAt(0)}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
