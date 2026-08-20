import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import DashboardCard from '../components/reusable/DashboardCard';
import ChartComponent from '../components/reusable/ChartComponent';
import api from '../services/api';
import {
    Clock,
    Eye,
    CheckCircle,
    ShieldAlert,
    LayoutDashboard,
    FolderOpen,
    FileText,
    Radio,
    User,
    Settings,
    Zap,
    Activity,
    ShieldCheck,
    Cpu,
    Lock,
    User as UserIcon,
    Settings as SettingsIcon
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    const officerLinks = [
        { label: 'Dashboard', path: '/officer/dashboard', icon: LayoutDashboard },
        { label: 'Assigned Reports', path: '/cases', icon: FolderOpen },
        { label: 'All Reports', path: '/reports', icon: FileText },
        { label: 'Broadcasts', path: '/broadcast', icon: Radio },
        { label: 'Profile', path: '/profile', icon: UserIcon },
        { label: 'Settings', path: '/settings', icon: SettingsIcon },
    ];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const officerId = user?._id || user?.id;

                if (!officerId) {
                    console.error('No officer ID found');
                    return;
                }

                const { data } = await api.get(`/dashboard/officer-stats/${officerId}`);
                setStats(data.stats);
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const activityData = [
        { name: 'Mon', cases: 5 },
        { name: 'Tue', cases: 8 },
        { name: 'Wed', cases: 12 },
        { name: 'Thu', cases: 7 },
        { name: 'Fri', cases: 15 },
        { name: 'Sat', cases: 3 },
        { name: 'Sun', cases: 2 },
    ];

    const iconMap = {
        Clock: Clock,
        Eye: Eye,
        ShieldAlert: ShieldAlert,
        CheckCircle: CheckCircle,
        FileText: FileText,
        Briefcase: FolderOpen,
        Shield: ShieldAlert
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                    <p className="font-semibold text-xs uppercase tracking-widest text-blue-600">Syncing Dashboard Data...</p>
                </div>
            </div>
        );
    }

    return (
        <MainLayout links={officerLinks} userRole="Officer">
            <div className="min-h-screen -m-10 p-10 bg-[#f0f7ff] transition-colors duration-500 relative">
                {/* Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

                {/* Header Section */}
                <div className="mb-12 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 mb-4">
                        <Activity className="text-blue-600" size={12} />
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-600">Operational Real-Time Feed</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#2D4A9D]">Officer Dashboard</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium text-xs">Monitoring assigned traffic violations and case resolution progress.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 overflow-visible">
                    {(stats || []).length > 0 ? (stats || []).map((stat, idx) => (
                        <DashboardCard
                            key={idx}
                            title={stat?.label || 'METRIC'}
                            value={stat?.value || '0'}
                            icon={iconMap[stat?.iconName] || FileText}
                            color={stat?.color || 'blue'}
                            percentage={stat?.trendValue ? parseFloat(stat.trendValue) : 0}
                        />
                    )) : (
                        <div className="col-span-4 py-20 text-center bg-white dark:bg-slate-800 rounded-[3rem] border border-dashed border-gray-100 dark:border-slate-700">
                            <Lock className="mx-auto text-gray-200 mb-4" size={48} />
                            <p className="text-gray-400 font-semibold uppercase tracking-widest text-[10px]">No mission parameters detected</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Activity Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[3rem] border border-gray-100 dark:border-slate-700 p-10 shadow-sm dark:shadow-none relative group overflow-hidden">
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div>
                                <h3 className="text-xl font-bold tracking-tight text-[#2D4A9D]">Resolution Activity</h3>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">7-day case completion stream</p>
                            </div>
                        </div>

                        <div className="h-80 w-full relative z-10">
                            <ChartComponent type="area" data={activityData} dataKey="cases" colors={['#2563eb']} />
                        </div>
                    </div>

                    {/* Performance & Directives */}
                    <div className="space-y-10">
                        <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-gray-100 dark:border-slate-700 p-10 shadow-sm dark:shadow-none">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800">
                                    <Cpu size={20} className="text-blue-600" />
                                </div>
                                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 dark:text-white">Unit Performance</h3>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Case Load</p>
                                        <p className="text-[10px] font-semibold text-blue-600 uppercase">14%</p>
                                    </div>
                                    <div className="h-2.5 w-full bg-gray-50 dark:bg-slate-900 rounded-full overflow-hidden border border-gray-100 dark:border-slate-700 p-0.5 shadow-inner">
                                        <div className="h-full bg-blue-600 rounded-full w-[14%] shadow-sm" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account Security</p>
                                        <p className="text-[10px] font-semibold text-emerald-600 uppercase">98%</p>
                                    </div>
                                    <div className="h-2.5 w-full bg-gray-50 dark:bg-slate-900 rounded-full overflow-hidden border border-gray-100 dark:border-slate-700 p-0.5 shadow-inner">
                                        <div className="h-full bg-emerald-500 rounded-full w-[98%] shadow-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-600 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-200 dark:shadow-blue-900/20">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <ShieldCheck size={120} />
                            </div>
                            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4 text-blue-100">Portal Directive</h3>
                            <p className="text-sm font-medium leading-relaxed mb-8 opacity-90">
                                "Ensure all <span className="text-white font-bold">HIGH SEVERITY</span> violations are prioritized. Complete case documentation before marking as resolved."
                            </p>
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={20} className="text-blue-200" />
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-200">Official Enforcement Policy</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
