import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { reportService } from '../services/api';
import toast from 'react-hot-toast';
import {
    LayoutDashboard,
    Users,
    FileText,
    Activity,
    Radio,
    Settings,
    Shield,
    Map as MapIcon,
    ArrowLeft,
    Clock,
    AlertTriangle
} from 'lucide-react';

const UpdateReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editForm, setEditForm] = useState({
        threatTitle: '',
        threatType: '',
        severity: '',
        description: ''
    });
    const [slaForm, setSlaForm] = useState({
        additionalHours: 24,
        reason: ''
    });
    const [extending, setExtending] = useState(false);
    const [currentSla, setCurrentSla] = useState(null);

    const adminLinks = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'User Registry', path: '/citizens', icon: Users },
        { label: 'All Reports', path: '/reports', icon: FileText },
        { label: 'Zone Wise Map', path: '/admin/zone-map', icon: MapIcon },
        { label: 'Broadcasts', path: '/broadcast', icon: Radio },
        { label: 'System Logs', path: '/logs', icon: Activity },
        { label: 'Settings', path: '/settings', icon: Settings },
    ];

    useEffect(() => {
        const fetchReport = async () => {
            if (!id) return;
            try {
                const { data } = await reportService.getById(id);
                setEditForm({
                    threatTitle: data.threatTitle || '',
                    threatType: data.threatType || 'Other',
                    severity: data.severity || 'Low',
                    description: data.description || ''
                });
                if (data.slaDeadline) {
                    setCurrentSla({
                        deadline: data.slaDeadline,
                        startTime: data.slaStartTime,
                        status: data.slaStatus
                    });
                }
            } catch (error) {
                console.error('Failed to fetch report:', error);
                toast.error('Failed to load report data');
                navigate('/reports');
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [id, navigate]);

    const handleExtendSla = async (e) => {
        e.preventDefault();
        setExtending(true);
        try {
            const { data } = await reportService.extendSla(id, slaForm);
            toast.success('SLA deadline extended successfully');
            setCurrentSla({
                deadline: data.slaDeadline,
                startTime: data.slaStartTime,
                status: data.slaStatus
            });
            setSlaForm({ ...slaForm, reason: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to extend SLA');
        } finally {
            setExtending(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await reportService.edit(id, editForm);
            toast.success('Report updated successfully');
            navigate('/reports');
        } catch (error) {
            console.error('Update failed:', error);
            toast.error(error.response?.data?.message || 'Failed to update report');
        } finally {
            setSubmitting(false);
        }
    };

    if (!id) {
        return (
            <MainLayout links={adminLinks} userRole="Admin">
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                    <div className="p-6 bg-red-50 rounded-full mb-6">
                        <AlertTriangle size={48} className="text-red-500" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Invalid Identification Tag</h3>
                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-8">The requested report sequence does not exist in the mainframe.</p>
                    <button onClick={() => navigate('/reports')} className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black tracking-widest uppercase text-xs">Return to Registry</button>
                </div>
            </MainLayout>
        );
    }

    if (loading) {
        return (
            <MainLayout links={adminLinks} userRole="Admin">
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                    <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                    <p className="font-black text-[10px] uppercase tracking-widest text-blue-600">Accessing Incident Dossier...</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout links={adminLinks} userRole="Admin">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <button
                        onClick={() => navigate('/reports')}
                        className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 shadow-sm transition-all hover:-translate-x-1"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="text-right">
                        <h2 className="text-2xl font-black text-blue-900 tracking-tight">Modify Violation Report</h2>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Protocol Override: #{id.slice(-8).toUpperCase()}</p>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-blue-50 p-12 shadow-2xl shadow-blue-900/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                        <Shield size={120} className="text-blue-900" />
                    </div>

                    <form onSubmit={handleUpdate} className="relative z-10 space-y-10">
                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-2">Objective Title</label>
                                <input
                                    type="text"
                                    value={editForm.threatTitle}
                                    onChange={(e) => setEditForm({ ...editForm, threatTitle: e.target.value })}
                                    className="w-full px-8 py-5 bg-gray-50/50 border border-gray-100 focus:border-blue-400 focus:bg-white rounded-3xl outline-none text-sm font-bold text-gray-900 transition-all"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-2">Threat Vector</label>
                                    <select
                                        value={editForm.threatType}
                                        onChange={(e) => setEditForm({ ...editForm, threatType: e.target.value })}
                                        className="w-full px-8 py-5 bg-gray-50/50 border border-gray-100 focus:border-blue-400 focus:bg-white rounded-3xl outline-none text-sm font-bold text-gray-900 transition-all cursor-pointer"
                                    >
                                        <option value="Phishing">Phishing</option>
                                        <option value="Fraud">Fraud</option>
                                        <option value="Malware">Malware</option>
                                        <option value="Harassment">Harassment</option>
                                        <option value="Hacking">Hacking</option>
                                        <option value="Identity Theft">Identity Theft</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-2">Severity Level</label>
                                    <select
                                        value={editForm.severity}
                                        onChange={(e) => setEditForm({ ...editForm, severity: e.target.value })}
                                        className="w-full px-8 py-5 bg-gray-50/50 border border-gray-100 focus:border-blue-400 focus:bg-white rounded-3xl outline-none text-sm font-bold text-gray-900 transition-all cursor-pointer"
                                    >
                                        <option value="Low">Low Clearance</option>
                                        <option value="Medium">Medium Severity</option>
                                        <option value="High">High Risk</option>
                                        <option value="Critical">Critical Breach</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-2">Intelligence Summary</label>
                                <textarea
                                    rows="5"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full px-8 py-5 bg-gray-50/50 border border-gray-100 focus:border-blue-400 focus:bg-white rounded-3xl outline-none text-sm font-bold text-gray-900 transition-all resize-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* SLA Extension Section */}
                        <div className="pt-10 border-t border-blue-50">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                                <Clock size={16} className="text-blue-600" /> SLA Management Protocol
                            </h3>
                            
                            {currentSla ? (
                                <div className="space-y-6">
                                    <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex justify-between items-center">
                                        <div>
                                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Current Deadline</p>
                                            <p className="text-sm font-bold text-blue-900">{new Date(currentSla.deadline).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Status</p>
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${currentSla.status === 'BREACHED' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {currentSla.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-2">Extension Hours</label>
                                            <select
                                                value={slaForm.additionalHours}
                                                onChange={(e) => setSlaForm({ ...slaForm, additionalHours: e.target.value })}
                                                className="w-full px-8 py-4 bg-gray-50 border border-gray-100 focus:bg-white rounded-2xl outline-none text-sm font-bold text-gray-900"
                                            >
                                                <option value={6}>6 Hours</option>
                                                <option value={12}>12 Hours</option>
                                                <option value={24}>24 Hours (1 Day)</option>
                                                <option value={48}>48 Hours (2 Days)</option>
                                                <option value={72}>72 Hours (3 Days)</option>
                                            </select>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleExtendSla}
                                            disabled={extending}
                                            className="py-4 px-6 bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-black transition-all disabled:opacity-50"
                                        >
                                            {extending ? 'Authorizing...' : 'Apply Extension'}
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-2">Override Justification</label>
                                        <input
                                            type="text"
                                            value={slaForm.reason}
                                            onChange={(e) => setSlaForm({ ...slaForm, reason: e.target.value })}
                                            placeholder="Enter reason for SLA extension..."
                                            className="w-full px-8 py-4 bg-gray-50 border border-gray-100 focus:bg-white rounded-2xl outline-none text-xs font-bold text-gray-900"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs font-bold text-gray-400 italic">SLA protocol not initialized for this case.</p>
                            )}
                        </div>

                        <div className="pt-6 flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/reports')}
                                className="flex-1 py-5 bg-gray-50 border border-gray-100 text-gray-500 font-black text-xs uppercase tracking-[0.2em] rounded-3xl hover:bg-gray-100 transition-all"
                            >
                                Abort Changes
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-[2] py-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-[0.2em] rounded-3xl shadow-xl shadow-blue-900/10 transition-all flex items-center justify-center gap-3"
                            >
                                {submitting ? (
                                    <>
                                        <Clock size={16} className="animate-spin" />
                                        Syncing Mainframe...
                                    </>
                                ) : (
                                    'Update Incident Data'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
};

export default UpdateReport;
