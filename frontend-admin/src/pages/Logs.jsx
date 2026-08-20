import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import DataTable from '../components/reusable/DataTable';
import Modal from '../components/reusable/Modal';
import { systemLogService } from '../services/api';
import {
    LayoutDashboard,
    Users,
    FileText,
    Activity,
    Shield,
    Radio,
    Settings,
    Map as MapIcon,
    RefreshCcw,
    Terminal,
    User as UserIcon,
    Info,
    Calendar,
    Clock as ClockIcon,
    Hash
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useSearch } from '../context/SearchContext';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const { searchTerm } = useSearch();
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data } = await systemLogService.getLogs();
            setLogs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
            toast.error('Failed to sync system logs');
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleViewDetails = (log) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    const columns = [
        {
            header: 'Timestamp',
            accessor: 'createdAt',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">
                        {row?.createdAt && !isNaN(new Date(row.createdAt)) ? format(new Date(row.createdAt), 'yyyy-MM-dd') : 'N/A'}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {row?.createdAt && !isNaN(new Date(row.createdAt)) ? format(new Date(row.createdAt), 'HH:mm:ss') : 'N/A'}
                    </span>
                </div>
            )
        },
        {
            header: 'Level',
            accessor: 'level',
            render: (row) => (
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${row.level === 'warn' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    row.level === 'error' ? 'bg-red-50 text-red-600 border-red-100' :
                        row.level === 'critical' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                            'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                    {row.level}
                </span>
            )
        },
        {
            header: 'Category',
            accessor: 'category',
            render: (row) => <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">{row.category}</span>
        },
        {
            header: 'Log Message',
            accessor: 'message',
            render: (row) => <span className="text-xs font-medium text-gray-600 max-w-md inline-block truncate" title={row.message}>{row.message}</span>
        },
        {
            header: 'Performed By',
            accessor: 'userId',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs shadow-sm">
                        {String(row?.userId?.name || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-900 leading-none">{row?.userId?.name || 'System Auto'}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">{row?.userId?.role || 'Automation'}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Details',
            render: (row) => (
                <button
                    onClick={() => handleViewDetails(row)}
                    title="View Log Context"
                    className="p-2.5 bg-gray-50 border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-100 rounded-xl transition-all shadow-sm active:scale-95"
                >
                    <Terminal size={14} />
                </button>
            )
        }
    ];

    return (
        <MainLayout links={adminLinks} userRole="Admin">
            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">System Logs</h2>
                    <p className="text-gray-500 mt-2 font-bold">Audit trail of system interactions, automated protocols, and security events.</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                >
                    <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                    Refresh Logs
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 overflow-visible">
                <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
                    <Shield className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform duration-700" size={120} />
                    <div className="relative z-10">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">Total Activity</h4>
                        <p className="text-4xl font-bold tracking-tighter">{logs.length}</p>
                        <div className="text-[10px] font-bold mt-4 flex items-center gap-2 text-white/80">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Monitoring Sync Active
                        </div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Critical Warnings</h4>
                    <p className="text-4xl font-bold tracking-tighter text-amber-600">{logs.filter(l => l.level === 'warn').length}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-wider">Potential System Issues</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Auth Exceptions</h4>
                    <p className="text-4xl font-bold tracking-tighter text-rose-600">{logs.filter(l => l.category === 'AUTH').length}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-wider">Login Protocol Violations</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Case Operations</h4>
                    <p className="text-4xl font-bold tracking-tighter text-indigo-600">{logs.filter(l => l.category === 'ASSIGNMENT').length}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-wider">Resource Allocation Shifts</p>
                </div>
            </div>

            {/* Table Section */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <DataTable
                    columns={columns}
                    data={logs.filter(l =>
                        (l.message || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                        (l.level || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                        (l.category || '').toLowerCase().includes((searchTerm || '').toLowerCase())
                    )}
                    loading={loading}
                    emptyMessage="No system events recorded in the current slice."
                />
            </div>

            {/* Details Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="System Event Context"
            >
                {selectedLog && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                            <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
                                <Info size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none mb-1">Log Level</p>
                                <p className="text-sm font-black text-gray-900 uppercase tracking-tighter">{selectedLog.level || 'INFO'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-2 flex items-center gap-2">
                                    <Calendar size={10} /> Captured Date
                                </p>
                                <p className="text-xs font-bold text-gray-900 font-mono">
                                    {selectedLog.createdAt ? format(new Date(selectedLog.createdAt), 'yyyy-MM-dd') : 'N/A'}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-2 flex items-center gap-2">
                                    <ClockIcon size={10} /> Precision Time
                                </p>
                                <p className="text-xs font-bold text-gray-900 font-mono">
                                    {selectedLog.createdAt ? format(new Date(selectedLog.createdAt), 'HH:mm:ss.SSS') : 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-3">Transmission Message</p>
                            <p className="text-xs font-bold text-gray-700 leading-relaxed italic">
                                "{selectedLog.message}"
                            </p>
                        </div>

                        {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest pl-2">Extended Metadata Assets</p>
                                <div className="p-5 bg-gray-900 rounded-2xl border border-gray-800 shadow-inner overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 text-white italic text-[40px] font-black group-hover:scale-110 transition-transform">JSON</div>
                                    <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed relative z-10 custom-scrollbar">
                                        {JSON.stringify(selectedLog.metadata, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between p-4 border-t border-gray-50 pt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                    <Hash size={14} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Internal Registry ID</p>
                                    <p className="text-[10px] font-mono font-bold text-gray-600">{selectedLog._id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
                            >
                                Close Uplink
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}} />
        </MainLayout>
    );
};

export default Logs;
