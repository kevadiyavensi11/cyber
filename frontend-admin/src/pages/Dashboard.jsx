import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import DashboardCard from '../components/reusable/DashboardCard';
import ChartComponent from '../components/reusable/ChartComponent';
import { adminService } from '../services/api';
import {
    Users,
    ShieldCheck,
    Database,
    LayoutDashboard,
    Cpu,
    Activity,
    FileText,
    ShieldAlert,
    Radio,
    Settings,
    Map as MapIcon,
    Zap,
    Lock,
    Clock,
    CreditCard,
    User as UserIcon
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const { notifications } = useNotifications();

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

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await adminService.getDashboard();
                setStats(data.stats);
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const trafficData = [
        { name: 'Jan', value: 400 },
        { name: 'Feb', value: 300 },
        { name: 'Mar', value: 600 },
        { name: 'Apr', value: 800 },
        { name: 'May', value: 500 },
        { name: 'Jun', value: 900 },
    ];

    const iconMap = {
        Users: Users,
        ShieldCheck: ShieldCheck,
        ShieldPlus: ShieldAlert,
        Database: Database,
        Activity: Activity,
        CreditCard: CreditCard
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                    <p className="font-semibold text-xs uppercase tracking-widest text-blue-600">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <MainLayout links={adminLinks} userRole="Admin">
            <div className="min-h-screen -m-10 p-10 bg-[#f0f7ff] transition-colors duration-500">
                {/* Header Section */}
                <div className="mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
                    <h2 className="text-3xl font-bold tracking-tight text-[#2D4A9D]">Admin Dashboard</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-bold">Overview of system performance, user activity, and violation reports.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 overflow-visible">
                    {(stats || []).length > 0 ? (stats || []).map((stat, idx) => (
                        <DashboardCard
                            key={idx}
                            title={stat?.label || 'Metric Target'}
                            value={stat?.value || '0'}
                            icon={iconMap[stat?.iconName] || Database}
                            color={stat?.color || 'blue'}
                            percentage={stat?.trendValue ? parseFloat(stat.trendValue) : 0}
                        />
                    )) : (
                        <div className="col-span-4 py-20 text-center bg-white dark:bg-slate-800 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700">
                            <Database className="mx-auto text-gray-200 mb-4" size={48} />
                            <p className="text-gray-400 font-semibold uppercase tracking-widest text-xs">No active data streams detected</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Activity Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 p-10 shadow-sm dark:shadow-none hover:shadow-md transition-shadow duration-500 relative group overflow-hidden">
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div>
                                <h3 className="text-xl font-bold tracking-tight text-[#2D4A9D]">Violation Trends</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Monthly frequency analysis</p>
                            </div>
                        </div>

                        <div className="h-80 w-full relative z-10">
                            <ChartComponent type="area" data={trafficData} dataKey="value" colors={['#2563eb']} />
                        </div>
                    </div>

                    {/* Resources & Activity */}
                    <div className="space-y-10">
                        {/* Resource Monitor */}
                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 p-8 shadow-sm dark:shadow-none">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                                    <Cpu size={20} className="text-purple-600" />
                                </div>
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">System Resources</h3>
                            </div>

                            <div className="space-y-8 text-gray-900 dark:text-white">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Server CPU Load</p>
                                        <p className="text-xs font-bold text-blue-600">42%</p>
                                    </div>
                                    <div className="h-2 w-full bg-gray-50 dark:bg-slate-900 rounded-full overflow-hidden border border-gray-100 dark:border-slate-700 p-0.5">
                                        <div className="h-full bg-blue-600 rounded-full w-[42%]" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Data Cache Usage</p>
                                        <p className="text-xs font-bold text-emerald-600">18%</p>
                                    </div>
                                    <div className="h-2 w-full bg-gray-50 dark:bg-slate-900 rounded-full overflow-hidden border border-gray-100 dark:border-slate-700 p-0.5">
                                        <div className="h-full bg-emerald-500 rounded-full w-[18%]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Mini-Log */}
                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 p-8 shadow-sm dark:shadow-none">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                    <Activity size={20} className="text-blue-600" />
                                </div>
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">Recent Activity</h3>
                            </div>

                            <div className="space-y-6">
                                {(notifications || []).length > 0 ? (notifications || []).slice(0, 4).map((notif) => (
                                    <div key={notif._id} className="flex gap-4 items-start group">
                                        <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${notif.isRead ? 'bg-gray-300 dark:bg-slate-600' : 'bg-blue-600 animate-pulse'}`} />
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-tight line-clamp-2">
                                                {notif.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Clock className="text-gray-400" size={10} />
                                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                                                    {notif.createdAt && !isNaN(new Date(notif.createdAt))
                                                        ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                                                        : 'Just now'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="flex flex-col items-center py-4 opacity-30 text-center">
                                        <Lock size={24} className="mb-2 text-gray-400" />
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Activity Empty</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
