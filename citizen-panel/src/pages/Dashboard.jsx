import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import DashboardCard from '../components/reusable/DashboardCard';
import ChartComponent from '../components/reusable/ChartComponent';
import { citizenService } from '../services/api';
import {
    Send,
    Search,
    Shield,
    Bell,
    LayoutDashboard,
    FileText,
    PlusCircle,
    User,
    Settings,
    Loader,
    Info,
    CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
    const [stats, setStats] = useState([]);
    const [charts, setCharts] = useState({ zones: [], threatTypes: [] });
    const [loading, setLoading] = useState(true);
    const { notifications } = useNotifications();

    const citizenLinks = [
        { label: 'Dashboard', path: '/citizen/dashboard', icon: LayoutDashboard },
        { label: 'My Reports', path: '/my-reports', icon: FileText },
        { label: 'Submit Report', path: '/submit-report', icon: PlusCircle },
        { label: 'Profile', path: '/profile', icon: User },
        { label: 'Settings', path: '/settings', icon: Settings },
    ];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const { data } = await citizenService.getDashboard(user._id);
                setStats(data.stats);
                if (data.charts) {
                    setCharts(data.charts);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const iconMap = {
        Send: Send,
        Search: Search,
        Shield: Shield,
        Bell: Bell,
        CreditCard: CreditCard
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="animate-spin text-blue-600" size={48} />
                    <p className="font-semibold text-xs uppercase tracking-widest text-slate-400">Syncing Secure Data...</p>
                </div>
            </div>
        );
    }

    return (
        <MainLayout links={citizenLinks} userRole="Citizen">
            <div className="min-h-screen bg-[#f0f7ff] -m-10 p-10 transition-colors duration-500 text-slate-700">
                <div className="mb-10 animate-in fade-in slide-in-from-left-8 duration-700">
                        <h2 className="text-3xl font-bold text-[#2D4A9D] tracking-tight">Dashboard Overview</h2>
                    <p className="text-slate-700 mt-3 font-semibold text-lg max-w-2xl">Manage your reports, track incidents, and view security updates in real-time.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                    {(stats || []).length > 0 ? stats.map((stat, idx) => (
                        <DashboardCard
                            key={idx}
                            title={stat.label || 'Metric'}
                            value={stat.value || '0'}
                            icon={iconMap[stat.iconName] || FileText}
                            color={stat.color || 'blue'}
                            percentage={stat.trendValue ? parseFloat(stat.trendValue) : 0}
                        />
                    )) : (
                        <p className="text-slate-400 font-semibold col-span-4">No report activity found in current session.</p>
                    )}
                </div>

                {/* Unified Tactical Command & Intelligence Hub */}
                {/* Unified Tactical Command & Intelligence Hub - Updated with #2D4A9D */}
                <div className="bg-gradient-to-br from-[#2D4A9D] via-[#3b5eb8] to-[#2D4A9D] p-10 md:p-14 rounded-[3.5rem] shadow-2xl relative overflow-hidden group border border-white/5 mb-12">
                    {/* Background Decorative Ambient Glare */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[130px] rounded-full -mr-48 -mt-48 group-hover:scale-125 transition-transform duration-[3s]" />
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]"></div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left Side: Reporting CTA */}
                        <div className="space-y-8 pr-0 lg:pr-10 lg:border-r border-white/5 pb-12 lg:pb-0">
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full border border-white/20 text-white">
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Operational Readiness</span>
                            </div>
                            <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                                Facing a <br/> 
                                <span className="text-blue-500">Cyber Threat?</span>
                            </h3>
                            <p className="text-white text-lg font-medium max-w-md">
                                Rapid-response units are active. Report now for immediate zone-based officer allocation.
                            </p>
                            <Link to="/submit-report" className="inline-flex items-center gap-4 bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-bold text-xs uppercase tracking-[0.4em] hover:bg-blue-500 hover:shadow-[0_0_50px_rgba(37,99,235,0.4)] transition-all">
                                <span>Report Now</span>
                                <Send size={18} />
                            </Link>
                        </div>

                        {/* Right Side: Essential Guidelines */}
                        <div className="space-y-8 pl-0 lg:pl-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-blue-400"><Shield size={24} /></div>
                                <h4 className="text-xl font-bold text-white uppercase tracking-widest">Safety Directives</h4>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-5">
                                {[
                                    "Never share OTPs or confidential credentials.",
                                    "Verify suspicious links before clicking.",
                                    "Enable Multi-Factor Authentication (MFA).",
                                    "Regularly update systems and security patches.",
                                    "Report phishing emails immediately."
                                ].map((tip, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,1)]"></div>
                                        <p className="text-sm font-semibold text-white leading-snug">{tip}</p>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Verified Pulse Indicator */}
                            <div className="mt-4 pt-8 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[9px] font-bold text-white uppercase tracking-[0.3em]">Encrypted Signal Verified</span>
                                </div>
                                <span className="text-[9px] font-bold text-white uppercase tracking-widest opacity-80">Status_Operational</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytical Charts Group */}
                <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Reports Analytics - Matching Admin Structure */}
                    <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm dark:shadow-none hover:shadow-md transition-shadow duration-500 relative group overflow-hidden">
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div>
                                <h3 className="text-xl font-bold tracking-tight text-[#2D4A9D]">Reports Analytics</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">System Categorization Feed</p>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">Operational_System</span>
                        </div>
                        <div className="h-[320px] w-full relative z-10">
                            <ChartComponent
                                type="bar"
                                data={charts.threatTypes}
                                dataKey="value"
                                colors={['#2D4A9D']}
                            />
                        </div>
                    </div>

                    {/* Regional Distribution - Matching Admin structure exactly */}
                    <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm dark:shadow-none hover:shadow-md transition-shadow duration-500 relative group overflow-hidden">
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div>
                                <h3 className="text-xl font-bold tracking-tight text-[#2D4A9D]">Regional Distribution</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Geographic Activity Heatmap</p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Live_Operational_Link
                            </div>
                        </div>
                        <div className="h-[320px] w-full relative z-10">
                            <ChartComponent
                                type="area"
                                data={charts.zones}
                                dataKey="value"
                                colors={['#4f46e5']}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-12 grid grid-cols-1 xl:grid-cols-3 gap-10 pb-10">
                    <div className="xl:col-span-2 bg-[#2D4A9D] p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 opacity-60" />
                        
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold flex items-center gap-3 text-white">
                                    <div className="p-2.5 bg-white/10 text-white rounded-xl shadow-inner border border-white/20 backdrop-blur-md"><Bell size={22} /></div> Security Updates
                                </h3>
                                <p className="text-[10px] text-white font-bold uppercase tracking-[0.2em] ml-12">Intelligent Feed</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            {(notifications || []).length > 0 ? (notifications || []).slice(0, 4).map((notif) => (
                                <div key={notif._id} className="p-6 bg-white/5 rounded-[2rem] border border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group/notif">
                                    <div className="flex gap-5 items-start">
                                        <div className={`p-4 rounded-2xl shadow-inner transition-transform group-hover/notif:scale-110 ${notif.type === 'warning' ? 'bg-amber-50/10 text-amber-400' : 'bg-blue-50/10 text-blue-400'}`}>
                                            <Bell size={20} />
                                        </div>
                                        <div className="space-y-3 min-w-0 flex-1">
                                            <p className="text-sm font-bold text-white leading-snug line-clamp-2 italic">{notif.message || 'Secure operational data received from tactical center'}</p>
                                            <div className="flex items-center justify-between pt-1">
                                                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">{notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : 'Just Now'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <>
                                    <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 shadow-sm opacity-80">
                                        <div className="flex gap-5 items-start">
                                            <div className="p-4 rounded-2xl bg-amber-50/10 text-amber-400 shadow-inner">
                                                <Bell size={20} />
                                            </div>
                                            <div className="space-y-3 min-w-0 flex-1">
                                                <p className="text-sm font-bold text-white leading-snug italic">Potential Phishing Campaign detected in Zone-Alpha. Exercise caution.</p>
                                                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">Automated Alert</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 shadow-sm opacity-80">
                                        <div className="flex gap-5 items-start">
                                            <div className="p-4 rounded-2xl bg-blue-50/10 text-blue-400 shadow-inner">
                                                <Bell size={20} />
                                            </div>
                                            <div className="space-y-3 min-w-0 flex-1">
                                                <p className="text-sm font-bold text-white leading-snug italic">System-wide encryption protocols updated to AES-256 (Revision 4).</p>
                                                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">System Update</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-[#2D4A9D] p-10 rounded-[3rem] text-white overflow-hidden relative group shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full" />
                        <h4 className="text-lg font-bold mb-8 relative z-10">Quick Support</h4>
                        <div className="space-y-6 relative z-10">
                             <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group/item">
                                 <h5 className="text-xs font-bold uppercase tracking-widest mb-1 text-white opacity-80">Technical Support</h5>
                                 <p className="text-sm font-semibold text-white group-hover/item:text-blue-400 transition-colors">Help Center & FAQs</p>
                             </div>
                             <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group/item">
                                 <h5 className="text-xs font-bold uppercase tracking-widest mb-1 text-white opacity-80">Direct Assistance</h5>
                                 <p className="text-sm font-semibold text-white group-hover/item:text-blue-400 transition-colors">Chat with Supervisor</p>
                             </div>
                             <div className="mt-10 pt-10 border-t border-white/5">
                                 <p className="text-[10px] text-white font-bold uppercase tracking-[0.2em] mb-4">Encryption Status</p>
                                 <div className="flex items-center gap-3 text-emerald-400">
                                     <Shield size={16} />
                                     <span className="text-[11px] font-bold uppercase tracking-widest text-white">AES-256 Operational</span>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
