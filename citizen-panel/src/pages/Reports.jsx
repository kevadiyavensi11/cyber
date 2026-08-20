import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import DataTable from '../components/reusable/DataTable';
import StatusBadge from '../components/reusable/StatusBadge';
import { reportService } from '../services/api';
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    User,
    Settings,
    Eye,
    Loader,
    X,
    MapPin,
    Calendar,
    Shield,
    Info,
    CheckCircle,
    Clock,
    AlertTriangle,
    Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';

const MyReports = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const { searchTerm } = useSearch();

    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [trackingLoading, setTrackingLoading] = useState(false);

    const citizenLinks = [
        { label: 'Dashboard', path: '/citizen/dashboard', icon: LayoutDashboard },
        { label: 'My Reports', path: '/my-reports', icon: FileText },
        { label: 'Submit Report', path: '/submit-report', icon: PlusCircle },
        { label: 'Profile', path: '/profile', icon: User },
        { label: 'Settings', path: '/settings', icon: Settings },
    ];

    useEffect(() => {
        fetchReports();
        
        const user = JSON.parse(localStorage.getItem('user'));
        let newSocket = null;
        if (user) {
            import('socket.io-client').then(({ io }) => {
                newSocket = io('http://localhost:5000');
                newSocket.emit('join', user._id);
                
                newSocket.on('reportUpdated', (updatedReport) => {
                    setReports(prev => {
                        const exists = prev.find(r => r._id === updatedReport._id);
                        if (exists) {
                            return prev.map(r => r._id === updatedReport._id ? updatedReport : r);
                        } else {
                            // If it's a completely new report transitioning from Processing
                            return [updatedReport, ...prev];
                        }
                    });
                });
            });
        }
        
        return () => {
            if (newSocket) newSocket.close();
        };
    }, []);

    const fetchReports = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const { data } = await reportService.getCitizenReports(user._id);
            setReports(data);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTrack = (reportId) => {
        navigate(`/track/${reportId}`);
    };

    const columns = [
        {
            header: 'Reference',
            accessor: '_id',
            render: (row) => (
                <span className="font-semibold text-gray-900">
                    #INC-{String(row._id || 'UNKNOWN').slice(-6).toUpperCase()}
                </span>
            )
        },
        { header: 'Title', accessor: 'threatTitle', render: (row) => row.threatTitle || 'Untitled Incident' },
        {
            header: 'Jurisdiction',
            accessor: 'zone',
            render: (row) => (
                <span className="text-[10px] font-black uppercase tracking-widest text-[#2D4A9D] bg-blue-50/50 border border-blue-100/50 px-3 py-1.5 rounded-xl shadow-sm">
                    {row.zone || 'Global'}
                </span>
            )
        },
        { header: 'Category', accessor: 'threatType', render: (row) => row.threatType || 'General' },
        {
            header: 'AI Intel',
            accessor: 'aiMetadata',
            render: (row) => {
                if (!row.aiMetadata || !row.aiMetadata.aiStatus) return <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Manual</span>;
                
                const aiStatus = row.aiMetadata.aiStatus;
                let bgColor = 'bg-gray-50';
                let textColor = 'text-gray-600';
                let iconClass = '';
                let IconComponent = Zap;
                
                if (aiStatus === 'PENDING') {
                    bgColor = 'bg-blue-50';
                    textColor = 'text-blue-500';
                    iconClass = 'animate-spin';
                    IconComponent = Loader;
                } else if (aiStatus === 'VERIFIED' || row.aiMetadata.isValid) {
                    bgColor = 'bg-blue-50';
                    textColor = 'text-blue-600';
                    iconClass = 'animate-pulse';
                } else if (aiStatus === 'ANOMALY') {
                    bgColor = 'bg-rose-50';
                    textColor = 'text-rose-600';
                }
                
                return (
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-max shadow-sm border ${bgColor} ${textColor} ${bgColor === 'bg-blue-50' ? 'border-blue-100/50' : 'border-rose-100/50'}`}>
                        <IconComponent size={12} className={iconClass} />
                        {aiStatus === 'PENDING' ? 'Processing' : aiStatus || 'Processing'}
                    </div>
                );
            }
        },

        {
            header: 'Date',
            accessor: 'createdAt',
            render: (row) => (
                <span className="text-xs text-gray-400 font-semibold">
                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'TBD'}
                </span>
            )
        },
        {
            header: 'SLA Status',
            accessor: 'slaDeadline',
            render: (row) => {
                if (!row.slaDeadline || row.status === 'Case Closed' || row.status === 'Rejected') return <span className="text-[10px] text-gray-300 font-bold uppercase italic">N/A</span>;
                const deadline = new Date(row.slaDeadline);
                const isOverdue = new Date() > deadline;
                return (
                    <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md w-max ${isOverdue ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                            {isOverdue ? 'Overdue' : 'On Track'}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">
                            {new Date(row.slaDeadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                );
            }
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => <StatusBadge status={row.status || 'Pending'} />
        },
        {
            header: 'Action',
            render: (row) => (
                <button
                    onClick={() => handleTrack(row._id)}
                    className="flex items-center gap-2.5 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#2D4A9D] hover:bg-[#2D4A9D] hover:text-white hover:border-[#2D4A9D] hover:shadow-lg hover:shadow-blue-900/10 transition-all group/btn"
                >
                    <Eye size={14} className="group-hover/btn:scale-110 transition-transform" /> Track Case
                </button>
            )
        }
    ];


    return (
        <MainLayout links={citizenLinks} userRole="Citizen">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader className="animate-spin text-blue-600 mb-4" size={40} />
                    <p className="font-semibold text-xs uppercase tracking-wider text-gray-400">Fetching Reports...</p>
                </div>
            ) : (
                <>
                    <div className="mb-10 flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-bold text-[#2D4A9D] tracking-tight">My Reports History</h2>
                            <p className="text-[#2D4A9D] opacity-60 mt-2 font-bold">Tracking the resolution path of your submitted traffic violation reports.</p>
                        </div>
                        <Link to="/submit-report" className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-semibold text-xs uppercase tracking-wider hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all">
                            Lodge New Report
                        </Link>
                    </div>
                    <DataTable
                        columns={columns}
                        data={(reports || []).filter(r =>
                            (r.threatTitle || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                            (r.threatType || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                            (r.description || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                            String(r._id || '').toLowerCase().includes((searchTerm || '').toLowerCase())
                        )}
                    />
                </>
            )}

            {/* Tracking Drawer/Modal Overlay */}
            {selectedReport && (
                <div className="fixed inset-0 z-[60] flex items-center justify-end animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedReport(null)} />

                    <div className="relative w-full max-w-xl h-full bg-white shadow-2xl p-10 overflow-y-auto animate-in slide-in-from-right duration-500">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 inline-block ${selectedReport.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' :
                                    selectedReport.status === 'in-review' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    Status: {selectedReport.status}
                                </span>
                                <h3 className="text-4xl font-semibold text-gray-900 tracking-tighter leading-tight">{selectedReport.threatTitle}</h3>
                                <p className="text-gray-400 font-semibold mt-2 font-mono text-xs">Reference: #INC-{selectedReport._id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-600 transition-all hover:rotate-90"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-12">
                            <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                                <div className="flex items-center gap-3 text-blue-600 mb-2">
                                    <Shield size={18} />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Violation Type</span>
                                </div>
                                <p className="text-lg font-semibold text-gray-900">{selectedReport.threatType}</p>

                            </div>
                            <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                                <div className="flex items-center gap-3 text-red-600 mb-2">
                                    <AlertTriangle size={18} />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Severity</span>
                                </div>
                                <p className="text-lg font-semibold text-gray-900 uppercase">{selectedReport.severity}</p>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <section>
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <Info size={14} /> Description
                                </h4>
                                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 text-gray-700 leading-relaxed font-normal">
                                    {selectedReport.description}
                                </div>
                            </section>

                            <section>
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <Clock size={14} /> Resolution Timeline
                                </h4>
                                <div className="space-y-8 ml-4 border-l-2 border-gray-100 pl-8 relative">
                                    <div className="relative">
                                        <div className="absolute -left-[41px] top-0 w-[18px] h-[18px] bg-emerald-500 rounded-full border-4 border-white shadow-sm" />
                                        <p className="text-sm font-semibold text-gray-900 leading-none">Report Submitted</p>
                                        <p className="text-xs font-medium text-gray-400 mt-1 uppercase">Received at {new Date(selectedReport.createdAt).toLocaleString()}</p>
                                    </div>

                                    <div className="relative">
                                        <div className={`absolute -left-[41px] top-0 w-[18px] h-[18px] rounded-full border-4 border-white ${selectedReport.status === 'in-review' || selectedReport.status === 'resolved'
                                            ? 'bg-amber-500'
                                            : 'bg-gray-200'
                                            }`} />
                                        <p className={`text-sm font-semibold leading-none ${selectedReport.status === 'in-review' || selectedReport.status === 'resolved' ? 'text-gray-900' : 'text-gray-300'}`}>Official Review</p>
                                        <p className="text-xs font-medium text-gray-400 mt-1 uppercase">Administrative protocols active</p>
                                    </div>

                                    <div className="relative">
                                        <div className={`absolute -left-[41px] top-0 w-[18px] h-[18px] rounded-full border-4 border-white ${selectedReport.status === 'resolved'
                                            ? 'bg-emerald-500'
                                            : 'bg-gray-200'
                                            }`} />
                                        <p className={`text-sm font-semibold leading-none ${selectedReport.status === 'resolved' ? 'text-gray-900' : 'text-gray-300'}`}>Case Resolved</p>
                                        <p className="text-xs font-medium text-gray-400 mt-1 uppercase">Closure and final outcome logging</p>
                                    </div>
                                </div>
                            </section>

                            <section className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <MapPin className="text-gray-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider leading-none mb-1">Jurisdiction</p>
                                        <p className="text-sm font-semibold text-gray-900">{selectedReport.location || 'Local Node'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <Calendar className="text-gray-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider leading-none mb-1">Submission Date</p>
                                        <p className="text-sm font-semibold text-gray-900">{new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </section>

                            {selectedReport.notes && (
                                <section className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 relative overflow-hidden group">
                                    <div className="absolute -top-4 -right-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                                        <CheckCircle size={120} />
                                    </div>
                                    <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Info size={14} /> Administrative Remarks
                                    </h4>
                                    <p className="text-sm font-normal text-blue-900 leading-relaxed">
                                        "{selectedReport.notes}"
                                    </p>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default MyReports;
