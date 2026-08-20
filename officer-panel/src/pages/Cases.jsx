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
    Shield,
    CheckCircle,
    Loader,
    Radio,
    Zap,
    AlertTriangle,
    Eye,
    MessageSquare,
    X,
    Send,
    Clock,
    User as UserIcon,
    Upload,
    PlusCircle,
    Image as ImageIcon,
    Target,
    Activity,
    Globe,
    ChevronRight,
    Search,
    Lock,
    Terminal
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, isValid } from 'date-fns';
import { useSearch } from '../context/SearchContext';

const Cases = () => {
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const { searchTerm, setSearchTerm } = useSearch();
    const [loading, setLoading] = useState(true);

    const authorityLinks = [
        { label: 'Dashboard', path: '/officer/dashboard', icon: LayoutDashboard },
        { label: 'Assigned Reports', path: '/cases', icon: FolderOpen },
        { label: 'All Reports', path: '/reports', icon: FileText },
        { label: 'Broadcasts', path: '/broadcast', icon: Radio },
        { label: 'Profile', path: '/profile', icon: User },
        { label: 'Settings', path: '/settings', icon: Settings },
    ];

    const fetchCases = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const officerId = user?._id || user?.id;

            if (!officerId) {
                toast.error('Session expired. Please login again.');
                return;
            }

            const { data } = await reportService.getOfficerReports(officerId);
            setCases(data || []);
        } catch (error) {
            console.error('Failed to fetch cases:', error);
            const msg = error.response?.data?.message || 'Failed to sync case files';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCases();
    }, []);

    const handleOpenManage = (reportId) => {
        navigate(`/officer/investigation/${reportId}`);
    };

    const columns = [
        {
            header: 'Case ID',
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
            render: (row) => (
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-xl bg-gray-50/50 border border-gray-100 group/zone hover:border-blue-200 transition-all">
                    <Globe size={11} className="text-blue-500 group-hover/zone:scale-110 transition-transform" />
                    <span className="text-[10px] font-semibold uppercase text-gray-600 tracking-widest italic">
                        {row.zone?.name || row.zone || 'General'}
                    </span>
                </div>
            )
        },
        {
            header: 'Impact Rating',
            accessor: 'severity',
            render: (row) => (
                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-semibold uppercase tracking-[0.2em] italic border ${row.severity === 'Critical' ? 'bg-red-50 border-red-100 text-red-600 shadow-sm' :
                    row.severity === 'High' ? 'bg-orange-50 border-orange-100 text-orange-600 shadow-sm' :
                        'bg-blue-50 border-blue-100 text-blue-600 shadow-sm'
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
            header: 'Last Update',
            accessor: 'updatedAt',
            render: (row) => (
                <div className="flex items-center gap-2.5 text-gray-400 group/time">
                    <Clock size={12} className="group-hover/time:text-blue-500 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">
                        {row.updatedAt && isValid(new Date(row.updatedAt)) ? format(new Date(row.updatedAt), 'MMM dd | HH:mm') : 'N/A'}
                    </span>
                </div>
            )
        },
        {
            header: 'Log Access',
            render: (row) => (
                <button
                    onClick={() => handleOpenManage(row._id)}
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
            <MainLayout links={authorityLinks} userRole="Officer">
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                    <p className="font-semibold text-xs uppercase tracking-widest text-blue-600">Loading assigned cases...</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout links={authorityLinks} userRole="Officer">
            <div className="max-w-7xl mx-auto px-6 py-8 font-inter">
                {/* Page Header */}
                <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#2D4A9D] tracking-tight">Assigned Reports</h1>
                        <p className="text-slate-500 mt-2 font-medium text-sm">
                            Managing and resolving traffic violation reports assigned to your jurisdiction.
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

                {/* Cases List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-50 shadow-sm">
                            <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Accessing Sector Data...</p>
                        </div>
                    ) : cases && cases.length > 0 ? (
                        cases
                            .filter(c =>
                                (c.threatTitle || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                                String(c._id || '').toLowerCase().includes((searchTerm || '').toLowerCase())
                            )
                            .map((caseItem) => (
                                <div
                                    key={caseItem._id}
                                    className="grid grid-cols-7 gap-4 items-center bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300 group border border-transparent hover:border-slate-50"
                                >
                                    {/* REFERENCE */}
                                    <div className="font-bold text-slate-900 text-sm">
                                        #INC-{String(caseItem._id).slice(-6).toUpperCase()}
                                    </div>

                                    {/* TITLE */}
                                    <div className="text-sm text-slate-600 font-semibold truncate pr-4">
                                        {caseItem.threatTitle || 'Untitled Case'}
                                    </div>

                                    {/* JURISDICTION */}
                                    <div>
                                        <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50/80 px-3 py-1 rounded-lg">
                                            {caseItem.zone?.name || (typeof caseItem.zone === 'string' ? caseItem.zone : 'General')}
                                        </span>
                                    </div>

                                    {/* CATEGORY */}
                                    <div className="text-sm text-slate-500 font-bold">
                                        {caseItem.threatType || 'General'}
                                    </div>

                                    {/* DATE & SLA */}
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400 font-bold">
                                            {caseItem.createdAt ? format(new Date(caseItem.createdAt), 'M/d/yy') : 'TBD'}
                                        </span>
                                        {caseItem.slaDeadline && caseItem.status !== 'Case Closed' && caseItem.status !== 'Rejected' && (
                                            <span className={`text-[8px] font-black uppercase tracking-tight mt-1 ${new Date() > new Date(caseItem.slaDeadline) ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                                                SLA: {format(new Date(caseItem.slaDeadline), 'MMM dd HH:mm')}
                                            </span>
                                        )}
                                    </div>

                                    {/* STATUS */}
                                    <div>
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            caseItem.status === 'Case Closed' ? 'bg-emerald-500 text-white shadow-sm' :
                                            caseItem.status === 'Reopened' ? 'bg-amber-600 text-white shadow-sm animate-pulse' :
                                            (caseItem.status === 'Pending' || caseItem.status === 'Assigned' || caseItem.status === 'Investigating') ? 'bg-amber-50 text-amber-600' :
                                            caseItem.status === 'Rejected' ? 'bg-rose-50 text-rose-600' :
                                            'bg-slate-100 text-slate-500'
                                        }`}>
                                            {caseItem.status || 'Pending'}
                                        </span>
                                    </div>

                                    {/* ACTION */}
                                    <div className="text-right">
                                        <button
                                            onClick={() => handleOpenManage(caseItem._id)}
                                            className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#2563EB] hover:text-blue-800 transition-colors"
                                        >
                                            <Eye size={16} />
                                            INVESTIGATION
                                        </button>
                                    </div>
                                </div>
                            ))
                    ) : (
                        <div className="bg-white rounded-[2rem] p-20 text-center border border-dashed border-slate-100 shadow-sm">
                            <p className="text-slate-300 font-bold text-sm uppercase tracking-widest leading-none">No active sector assignments</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default Cases;
