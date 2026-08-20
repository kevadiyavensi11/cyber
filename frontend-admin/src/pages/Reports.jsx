import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import MainLayout from '../layouts/MainLayout';
import DataTable from '../components/reusable/DataTable';
import StatusBadge from '../components/reusable/StatusBadge';
import api, { reportService } from '../services/api';
import toast from 'react-hot-toast';
import {
    LayoutDashboard,
    Users,
    FileText,
    Activity,
    Edit2,
    Trash2,
    Settings,
    Radio,
    Map as MapIcon,
    UserCheck,
    Check,
    Globe,
    AlertTriangle,
    Crosshair,
    User as UserIcon
} from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import { useNotifications } from '../context/NotificationContext';

const Reports = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const { searchTerm } = useSearch();
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedOfficer, setSelectedOfficer] = useState('');
    const { socket } = useNotifications();

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

    const fetchReports = async () => {
        setLoading(true);
        try {
            const { data } = await reportService.getAllReports();
            setReports(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            toast.error('Failed to sync reports');
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchOfficers = async () => {
        try {
            const { data } = await api.get('/admin/citizens');
            const officerList = Array.isArray(data) ? data.filter(u => u.role === 'officer') : [];
            setOfficers(officerList);
        } catch (error) {
            console.error('Failed to fetch officers:', error);
            setOfficers([]);
        }
    };

    useEffect(() => {
        fetchReports();
        fetchOfficers();

        if (socket) {
            socket.on('newReportCreated', (newReport) => {
                console.log('Real-time: New report detected!', newReport);
                fetchReports(); // Refresh the list
            });

            return () => {
                socket.off('newReportCreated');
            };
        }
    }, [socket]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
            try {
                await reportService.delete(id);
                toast.success('Report deleted successfully');
                fetchReports();
            } catch (error) {
                toast.error('Failed to delete report');
            }
        }
    };

    const handleEditClick = (report) => {
        if (!report?._id) return;
        navigate(`/reports/update/${report._id}`);
    };

    const handleAssignClick = (report) => {
        if (!report) return;
        setSelectedReport(report);
        setSelectedOfficer(report?.assignedTo?._id || '');
        setShowAssignModal(true);
    };

    const handleAssignUpdate = async (e) => {
        e.preventDefault();
        if (!selectedOfficer) {
            toast.error('Please select an officer');
            return;
        }

        try {
            await reportService.updateStatus(selectedReport._id, {
                assignedTo: selectedOfficer,
                assignment_type: 'manual'
            });
            toast.success('Officer assigned successfully');
            setShowAssignModal(false);
            fetchReports();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to assign officer';
            toast.error(message);
            console.error('Assignment error:', error);
        }
    };

    const getFilteredReports = () => {
        return (reports || []).filter(r => {
            if (!r) return false;
            const s = (searchTerm || '').toLowerCase();
            return (
                (r.threatTitle || '').toLowerCase().includes(s) ||
                (r.threatType || '').toLowerCase().includes(s) ||
                (r.description || '').toLowerCase().includes(s) ||
                String(r._id || '').toLowerCase().includes(s) ||
                (r.zone || '').toLowerCase().includes(s)
            );
        });
    };

    const handleExport = () => {
        const filteredData = getFilteredReports();

        if (filteredData.length === 0) {
            toast.error('No reports available to export.');
            return;
        }

        // Map data for Excel
        const exportData = filteredData.map(r => ({
            'Reference ID': String(r?._id || 'UNKNOWN').slice(-8).toUpperCase(),
            'Subject': r?.threatTitle || 'Untitled Report',
            'Incident Type': r?.threatType || 'Unknown Category',
            'Zone': r?.zone || 'General',
            'Severity': r?.severity || 'N/A',
            'Status': r?.status || 'Pending',
            'Assigned Officer': r?.assignedTo?.name || 'Unassigned',
            'Created Date': r?.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'
        }));

        // Create workbook and worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Violation Reports');

        // Generate filename
        const now = new Date();
        const dateString = now.getFullYear() + '_' +
            String(now.getMonth() + 1).padStart(2, '0') + '_' +
            String(now.getDate()).padStart(2, '0');
        const filename = `violation_reports_export_${dateString}.xlsx`;

        // Trigger download
        XLSX.writeFile(wb, filename);
    };

    const columns = [
        {
            header: 'Reference ID',
            accessor: '_id',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-blue-600 font-mono">
                        #{String(row?._id || 'UNKNOWN').slice(-8).toUpperCase()}
                    </span>
                </div>
            )
        },
        {
            header: 'Subject & Type',
            accessor: 'threatTitle',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 text-sm">
                        {row?.threatTitle || 'Untitled Report'}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {row?.threatType || 'Unknown Category'}
                    </span>
                </div>
            )
        },
        {
            header: 'Zone',
            accessor: 'zone',
            render: (row) => (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/50 border border-blue-100/50 shadow-sm">
                    <Globe size={11} className="text-[#2D4A9D]" />
                    <span className="text-[10px] font-black uppercase text-[#2D4A9D] tracking-widest">
                        {row?.zone || 'General'}
                    </span>
                </div>
            )
        },
        {
            header: 'Severity',
            accessor: 'severity',
            render: (row) => (
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border transition-all ${row?.severity === 'Critical' ? 'text-red-700 bg-red-50 border-red-100 shadow-red-100/50' :
                    row?.severity === 'High' ? 'text-orange-700 bg-orange-50 border-orange-100 shadow-orange-100/50' :
                        row?.severity === 'Medium' ? 'text-blue-700 bg-blue-50 border-blue-100 shadow-blue-100/50' :
                            'text-emerald-700 bg-emerald-50 border-emerald-100 shadow-emerald-100/50'
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${row?.severity === 'Critical' ? 'bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]' :
                        row?.severity === 'High' ? 'bg-orange-600' :
                            row?.severity === 'Medium' ? 'bg-blue-600' : 'bg-emerald-600'
                        }`} />
                    {row?.severity || 'N/A'}
                </span>
            )
        },
        {
            header: 'SLA Tracking',
            accessor: 'slaDeadline',
            render: (row) => {
                if (!row.slaDeadline || row.status === 'Case Closed' || row.status === 'Rejected') return <span className="text-[10px] text-gray-300 font-bold uppercase italic">Finalized</span>;
                const deadline = new Date(row.slaDeadline);
                const isOverdue = new Date() > deadline;
                return (
                    <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg w-max border ${isOverdue ? 'bg-rose-50 text-rose-600 border-rose-100 shadow-sm shadow-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-100'}`}>
                            {isOverdue ? 'Breached' : 'Active'}
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
            render: (row) => <StatusBadge status={row?.status || 'Pending'} />
        },
        {
            header: 'Assigned Officer',
            accessor: 'assignedTo',
            render: (row) => (
                <div className="flex items-center gap-3">
                    {row?.assignedTo ? (
                        <>
                            <div className="w-8 h-8 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg flex items-center justify-center text-xs font-bold">
                                {String(row?.assignedTo?.name || 'U').charAt(0)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-900">{row?.assignedTo?.name}</span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Field Unit</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 text-gray-300">
                            <Crosshair size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Unassigned</span>
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleAssignClick(row)}
                        title="Assign Officer"
                        className="p-2.5 bg-white border border-gray-100 hover:border-blue-200 hover:text-blue-600 text-gray-400 rounded-xl transition-all shadow-sm hover:translate-y-[-1px] active:translate-y-0"
                    >
                        <UserCheck size={16} />
                    </button>
                    <button
                        onClick={() => handleEditClick(row)}
                        title="Edit Report"
                        className="p-2.5 bg-white border border-gray-100 hover:border-blue-200 hover:text-blue-600 text-gray-400 rounded-xl transition-all shadow-sm hover:translate-y-[-1px] active:translate-y-0"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => handleDelete(row._id)}
                        title="Delete Report"
                        className="p-2.5 bg-white border border-gray-100 hover:border-red-200 hover:text-red-600 text-gray-400 rounded-xl transition-all shadow-sm hover:translate-y-[-1px] active:translate-y-0"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    if (loading) {
        return (
            <MainLayout links={adminLinks} userRole="Admin">
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                    <p className="font-semibold text-xs uppercase tracking-widest text-blue-600">Syncing report database...</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout links={adminLinks} userRole="Admin">
            {/* Page Header */}
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
                <div>
                    <h2 className="text-3xl font-bold text-[#2D4A9D] tracking-tight">Violation Reports</h2>
                    <p className="text-gray-500 mt-2 font-bold">Manage and monitor all traffic violation reports and incident dossiers.</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex flex-col items-end px-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Reports</span>
                        <span className="text-xl font-bold text-gray-900 leading-none">{reports.length}</span>
                    </div>
                    <div className="w-px h-8 bg-gray-100" />
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-lg shadow-blue-100"
                    >
                        <FileText size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Export List</span>
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <DataTable
                    columns={columns}
                    data={getFilteredReports()}
                    emptyMessage="No violation reports found in the database."
                />
            </div>

            {/* Assignment Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-gray-100 p-10 relative">
                        <button
                            onClick={() => setShowAssignModal(false)}
                            className="absolute top-8 right-8 p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-all"
                        >
                            <UserCheck size={20} />
                        </button>

                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-14 h-14 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center shadow-sm">
                                <UserCheck className="text-amber-600" size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Assign Officer</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Select an officer for this case</p>
                            </div>
                        </div>

                        <form onSubmit={handleAssignUpdate} className="space-y-8">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 ml-1">Available Officers</label>
                                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {(officers || []).length > 0 ? (
                                        (officers || []).map((officer) => (
                                            <button
                                                key={officer._id}
                                                type="button"
                                                onClick={() => setSelectedOfficer(officer._id)}
                                                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${selectedOfficer === officer._id
                                                    ? 'border-blue-600 bg-blue-50'
                                                    : 'border-gray-50 bg-gray-50 hover:border-gray-100'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${selectedOfficer === officer._id ? 'bg-blue-600 text-white' : 'bg-white text-gray-400 border border-gray-200'}`}>
                                                        {String(officer.name || 'U').charAt(0)}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className={`text-sm font-bold ${selectedOfficer === officer._id ? 'text-gray-900' : 'text-gray-600'}`}>{officer.name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{officer.email}</span>
                                                            <span className="w-1 h-1 rounded-full bg-gray-200" />
                                                            <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">{officer.zone || 'No Zone'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {selectedOfficer === officer._id && (
                                                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center animate-in zoom-in duration-300">
                                                        <Check size={14} className="text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                            <AlertTriangle className="mx-auto text-amber-500 mb-2" size={24} />
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">No officers found in the database</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!selectedOfficer}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
                            >
                                Assign to Officer
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default Reports;
