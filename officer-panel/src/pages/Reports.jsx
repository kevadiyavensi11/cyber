import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DataTable from '../components/reusable/DataTable';
import StatusBadge from '../components/reusable/StatusBadge';
import { reportService } from '../services/api';
import {
    LayoutDashboard,
    FolderOpen,
    FileText,
    User,
    Settings,
    Eye,
    Loader,
    X,
    Shield,
    Clock,
    MessageSquare,
    Send,
    PlusCircle,
    Search,
    Globe,
    Target,
    Activity,
    Lock,
    AlertCircle,
    ChevronRight,
    Tag,
    MapPin,
    Calendar,
    Image as ImageIcon,
    Radio,
    Zap,
    CheckCircle
} from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import { useNotifications } from '../context/NotificationContext';
import toast from 'react-hot-toast';
import { format, isValid } from 'date-fns';

const Reports = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const { searchTerm, setSearchTerm } = useSearch();
    const [loading, setLoading] = useState(true);
    const { socket } = useNotifications();

    const officerLinks = [
        { label: 'Dashboard', path: '/officer/dashboard', icon: LayoutDashboard },
        { label: 'Assigned Reports', path: '/cases', icon: FolderOpen },
        { label: 'All Reports', path: '/reports', icon: FileText },
        { label: 'Broadcasts', path: '/broadcast', icon: Radio },
        { label: 'Profile', path: '/profile', icon: User },
        { label: 'Settings', path: '/settings', icon: Settings },
    ];

    const fetchAllReports = async () => {
        setLoading(true);
        try {
            const { data } = await reportService.getAllReports();
            setReports(data || []);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            const msg = error.response?.data?.message || 'Failed to sync reports';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllReports();

        if (socket) {
            socket.on('newReportCreated', (newReport) => {
                console.log('Real-time: New report synchronized!', newReport);
                fetchAllReports(); // Refresh the list
            });

            return () => {
                socket.off('newReportCreated');
            };
        }
    }, [socket]);

    const handleOpenCase = (reportId) => {
        navigate(`/officer/investigation/${reportId}`, { state: { readOnly: true } });
    };

    const columns = [
        {
            header: 'Reference ID',
            accessor: '_id',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                    <span className="font-mono text-[11px] font-semibold text-blue-600 leading-none tracking-widest uppercase">
                        #{String(row._id || 'UNKNOWN').slice(-8).toUpperCase()}
                    </span>
                </div>
            )
        },
        {
            header: 'Subject & Type',
            accessor: 'threatTitle',
            render: (row) => (
                <div className="max-w-[200px] py-1">
                    <p className="font-semibold text-gray-900 text-[11px] uppercase tracking-wider truncate mb-1">{row.threatTitle || 'Untitled'}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] italic border-l border-blue-100 pl-2">{row.threatType || 'General'}</p>
                </div>
            )
        },
        {
            header: 'Operational Zone',
            accessor: 'zone',
            render: (row) => {
                const zoneName = row.zone?.name || (typeof row.zone === 'string' ? row.zone : 'General');
                return (
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-xl bg-gray-50/50 border border-gray-100 group/zone hover:border-blue-200 transition-all">
                        <Globe size={11} className="text-blue-500 group-hover/zone:scale-110 transition-transform" />
                        <span className="text-[10px] font-semibold uppercase text-gray-600 tracking-widest italic">
                            {zoneName}
                        </span>
                    </div>
                );
            }
        },
        {
            header: 'Impact Rating',
            accessor: 'severity',
            render: (row) => (
                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-semibold uppercase tracking-[0.2em] italic border ${row.severity === 'Critical' ? 'bg-red-50 border-red-100 text-red-600 shadow-sm' :
                    row.severity === 'High' ? 'bg-orange-50 border-orange-100 text-orange-600 shadow-sm' :
                        row.severity === 'Medium' ? 'bg-blue-50 border-blue-100 text-blue-600 shadow-sm' :
                            'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm'
                    }`}>
                    {row.severity || 'N/A'}
                </span>
            )
        },
        {
            header: 'Mission Status',
            accessor: 'status',
            render: (row) => <StatusBadge status={row.status || 'Pending'} />
        },
        {
            header: 'Logged Date',
            accessor: 'createdAt',
            render: (row) => (
                <div className="flex items-center gap-2.5 text-gray-400 group/time">
                    <Clock size={12} className="group-hover/time:text-blue-500 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">
                        {row.createdAt && isValid(new Date(row.createdAt)) ? format(new Date(row.createdAt), 'MMM dd | HH:mm') : 'N/A'}
                    </span>
                </div>
            )
        },
        {
            header: 'Access',
            render: (row) => (
                <button
                    onClick={() => handleOpenCase(row._id)}
                    className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-[2rem] transition-all duration-300 shadow-xl shadow-blue-600/20 active:scale-[0.98] group/btn"
                >
                    <Eye size={14} className="group-hover/btn:scale-110 transition-transform" />
                    View Detail
                </button>
            )
        }
    ];

    if (loading) {
        return (
            <MainLayout links={officerLinks} userRole="Officer">
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                    <p className="font-semibold text-xs uppercase tracking-widest text-blue-600">Syncing violation database...</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout links={officerLinks} userRole="Officer">
            <div className="max-w-7xl mx-auto px-6 py-8 font-inter">
                {/* Page Header */}
                <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h2 className="text-3xl font-bold text-[#2D4A9D] tracking-tight leading-none">All Reports History</h2>
                        <p className="text-slate-500 mt-2 font-medium text-sm">
                            Tracking the resolution path of all submitted traffic violation reports.
                        </p>
                    </div>

                    <div className="flex bg-white py-3 px-5 rounded-2xl border border-slate-100 shadow-sm group/search transition-all focus-within:ring-2 focus-within:ring-blue-100">
                        <Search size={18} className="text-slate-300 group-focus-within/search:text-blue-600 mr-3" />
                        <input
                            type="text"
                            placeholder="Search records, trackers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 w-64 placeholder:text-slate-200"
                        />
                    </div>
                </div>

                {/* Table Header Row */}
                <div className="grid grid-cols-7 gap-4 px-10 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                    <div>REFERENCE</div>
                    <div>TITLE</div>
                    <div>JURISDICTION</div>
                    <div>CATEGORY</div>
                    <div>DATE</div>
                    <div>STATUS</div>
                    <div className="text-right">ACTION</div>
                </div>

                {/* Reports List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-50 shadow-sm">
                            <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Synchronizing Records...</p>
                        </div>
                    ) : reports && reports.length > 0 ? (
                        reports
                            .filter(r =>
                                (r.threatTitle || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                                (r.threatType || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                                String(r._id || '').toLowerCase().includes((searchTerm || '').toLowerCase())
                            )
                            .map((report) => (
                                <div
                                    key={report._id}
                                    className="grid grid-cols-7 gap-4 items-center bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300 group border border-transparent hover:border-slate-50"
                                >
                                    {/* REFERENCE */}
                                    <div className="flex items-center gap-3 font-bold text-slate-900 text-sm">
                                        <div className={`w-2 h-2 rounded-full ${report.slaStatus === 'BREACHED' || (report.slaDeadline && new Date() > new Date(report.slaDeadline)) ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                                        #INC-{String(report._id).slice(-6).toUpperCase()}
                                    </div>

                                    {/* TITLE */}
                                    <div className="text-sm text-slate-600 font-semibold truncate pr-4">
                                        {report.threatTitle || 'Untitled Incident'}
                                    </div>

                                    {/* JURISDICTION */}
                                    <div>
                                        <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50/80 px-3 py-1 rounded-lg">
                                            {report.zone?.name || (typeof report.zone === 'string' ? report.zone : 'Global')}
                                        </span>
                                    </div>

                                    {/* CATEGORY */}
                                    <div className="text-sm text-slate-500 font-bold">
                                        {report.threatType || 'General'}
                                    </div>

                                    {/* DATE & SLA */}
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400 font-bold">
                                            {report.createdAt ? format(new Date(report.createdAt), 'M/d/yy') : 'TBD'}
                                        </span>
                                        {report.slaDeadline && report.status !== 'Case Closed' && report.status !== 'Rejected' && (
                                            <span className={`text-[8px] font-black uppercase tracking-tight mt-1 ${new Date() > new Date(report.slaDeadline) ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                                                SLA: {format(new Date(report.slaDeadline), 'MMM dd HH:mm')}
                                            </span>
                                        )}
                                    </div>

                                    {/* STATUS */}
                                    <div>
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${report.status === 'Resolved' || report.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
                                            (report.status === 'Pending' || report.status === 'Assigned' || report.status === 'Resolved with Fine') ? 'bg-amber-50 text-amber-600' :
                                                'bg-red-50 text-red-600'
                                            }`}>
                                            {report.status === 'Resolved with Fine' ? 'Fine Pending' : (report.status || 'Pending')}
                                        </span>
                                    </div>

                                    {/* ACTION */}
                                    <div className="text-right">
                                        <button
                                            onClick={() => handleOpenCase(report._id)}
                                            className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#2563EB] hover:text-blue-800 transition-colors"
                                        >
                                            <Eye size={16} />
                                            VIEW DETAILS
                                        </button>
                                    </div>
                                </div>
                            ))
                    ) : (
                        <div className="bg-white rounded-[2rem] p-20 text-center border border-dashed border-slate-100 shadow-sm">
                            <p className="text-slate-300 font-bold text-sm uppercase tracking-widest leading-none">Record Archive Empty</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default Reports;
