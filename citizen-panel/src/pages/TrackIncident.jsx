import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { reportService, collaborationService } from '../services/api';
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    User,
    Settings,
    Shield,
    AlertTriangle,
    Clock,
    CheckCircle,
    Info,
    Mail,
    User as UserIcon,
    Camera,
    Link as LinkIcon,
    File,
    ChevronRight,
    Loader,
    Radio,
    Zap,
    Send,
    MessageSquare,
    Paperclip,
    Download,
    ExternalLink,
    MapPin,
    RefreshCw,
    HelpCircle,
    ShieldAlert,
    CreditCard,
    X
} from 'lucide-react';
import Modal from '../components/reusable/Modal';

import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { format, isValid } from 'date-fns';
import InvestigationChat from '../components/investigation/InvestigationChat';

const TrackIncident = () => {
    const { referenceId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [isAgreed, setIsAgreed] = useState(false);
    const [activePolicy, setActivePolicy] = useState(null); // 'privacy', 'terms', 'refund'
    const [downloadingPDF, setDownloadingPDF] = useState(false);
    const [showReopenModal, setShowReopenModal] = useState(false);
    const [reopenReason, setReopenReason] = useState('');
    const [submittingReopen, setSubmittingReopen] = useState(false);
    const [socket, setSocket] = useState(null);
    const user = JSON.parse(localStorage.getItem('user'));

    const citizenLinks = [
        { label: 'Dashboard', path: '/citizen/dashboard', icon: LayoutDashboard },
        { label: 'My Reports', path: '/my-reports', icon: FileText },
        { label: 'Submit Report', path: '/submit-report', icon: PlusCircle },
        { label: 'Profile', path: '/profile', icon: User },
        { label: 'Settings', path: '/settings', icon: Settings },
    ];

    const fetchReportDetails = useCallback(async () => {
        try {
            const { data } = await reportService.getById(referenceId);
            setReport(data);
        } catch (error) {
            console.error('Failed to fetch report details:', error);
            toast.error('Could not synchronize with incident database');
        } finally {
            setLoading(false);
        }
    }, [referenceId]);

    useEffect(() => {
        if (referenceId) {
            fetchReportDetails();

            const newSocket = io('http://localhost:5000');
            setSocket(newSocket);
            newSocket.emit('joinReportRoom', referenceId);

            newSocket.on('reportUpdated', (updatedReport) => {
                setReport(updatedReport);
            });
            return () => newSocket.close();
        }
    }, [referenceId, fetchReportDetails]);

    const handleReopen = () => {
        // Validation check for UI feedback
        const closedAt = report.closedAt ? new Date(report.closedAt) : null;
        const now = new Date();
        const hrsSinceClose = closedAt ? (now - closedAt) / (1000 * 60 * 60) : 0;

        if (hrsSinceClose > 48) {
            toast.error('Reopen Protocol Expired (48h Limit)', {
                style: { background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 'bold' }
            });
            return;
        }

        if ((report.reopenAttempts || 0) >= 2) {
            toast.error('Max Reopen Attempts Reached (Limit: 2)', {
                style: { background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 'bold' }
            });
            return;
        }

        setShowReopenModal(true);
    };

    const handleReopenConfirm = async () => {
        if (!reopenReason || reopenReason.trim().length < 10) {
            toast.error('Reason must be at least 10 characters');
            return;
        }

        setSubmittingReopen(true);
        try {
            await reportService.reopen(referenceId, { reason: reopenReason });
            toast.success('Case Reopened Successfully', {
                icon: '🔄',
                style: {
                    borderRadius: '20px',
                    background: '#1e3a8a',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '12px',
                    textTransform: 'uppercase'
                }
            });
            setShowReopenModal(false);
            setReopenReason('');
            fetchReportDetails();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Reopen request failed');
        } finally {
            setSubmittingReopen(false);
        }
    };

    const handlePayment = async () => {
        if (!isAgreed) {
            toast.error('Please accept the terms before proceeding', {
                style: {
                    borderRadius: '10px',
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }
            });
            return;
        }

        const amount = report.paymentAmount != null ? report.paymentAmount : report.fineAmount;
        if (!window.confirm(`Proceed to pay required amount of ₹${amount}?`)) return;

        setProcessingPayment(true);
        toast.loading('Initializing Secure Gateway...', { id: 'payment' });

        try {
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            await reportService.pay(referenceId, { isAgreed });

            toast.success('Payment Successful!', { id: 'payment' });
            fetchReportDetails();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Payment processing failed', { id: 'payment' });
        } finally {
            setProcessingPayment(false);
        }
    };

    const handleDownloadReport = async () => {
        setDownloadingPDF(true);
        const toastId = toast.loading('Generating Tactical Dossier...', {
            style: {
                borderRadius: '15px',
                background: '#0f172a',
                color: '#fff',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase'
            }
        });

        try {
            const response = await reportService.downloadReportPDF(referenceId);
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Cyber_Report_${incidentRef}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success('Dossier Transmitted Successfully', { id: toastId });
        } catch (error) {
            console.error('PDF Download Error:', error);
            toast.error('Failed to generate intelligence PDF', { id: toastId });
        } finally {
            setDownloadingPDF(false);
        }
    };

    const safeFormat = (dateInput, formatStr) => {
        if (!dateInput) return 'TBD';
        try {
            const date = new Date(dateInput);
            return isValid(date) ? format(date, formatStr) : 'TBD';
        } catch (e) {
            return 'TBD';
        }
    };

    if (loading) {
        return (
            <MainLayout links={citizenLinks} userRole="Citizen">
                <div className="flex flex-col items-center justify-center py-40">
                    <Loader className="animate-spin text-blue-600 mb-4" size={40} />
                    <p className="font-semibold text-xs uppercase tracking-wider text-gray-400">Loading Incident Details...</p>
                </div>
            </MainLayout>
        );
    }

    if (!report) {
        return (
            <MainLayout links={citizenLinks} userRole="Citizen">
                <div className="flex flex-col items-center justify-center py-40">
                    <AlertTriangle className="text-amber-500 mb-6" size={64} />
                    <h2 className="text-2xl font-semibold text-[#2D4A9D] tracking-tight mb-2">Record Not Found</h2>
                    <p className="text-gray-500 font-medium">The requested incident record could not be found in our database.</p>
                    <button
                        onClick={() => navigate('/my-reports')}
                        className="mt-8 flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-2xl font-semibold text-xs uppercase tracking-wider hover:bg-black transition-all"
                    >
                        Return to My Reports
                    </button>
                </div>
            </MainLayout>
        );
    }
    const hasOfficer = !!report.assignedTo;
    const status = report.status || 'Pending';

    const stages = [
        { label: 'Pending', trigger: 'Pending', icon: PlusCircle },
        { label: 'Investigating', trigger: ['Under Investigation', 'Investigating'], icon: Radio },
        { label: 'Awaiting Decision', trigger: ['Investigation Completed'], icon: Zap },
        { label: 'Payment Required', trigger: ['Payment Pending', 'Payment Completed'], icon: CreditCard },
        { label: status === 'Rejected' ? 'Rejected' : 'Resolved', trigger: ['Case Closed', 'Rejected'], icon: CheckCircle }
    ];
    let currentStageIndex = 0;
    if (status === 'Case Closed' || status === 'Rejected' || status === 'Closed') currentStageIndex = 4;
    else if (status === 'Payment Pending' || status === 'Payment Completed' || status === 'Paid') currentStageIndex = 3;
    else if (status === 'Investigation Completed') currentStageIndex = 2;
    else if (status === 'Under Investigation' || status === 'Investigating' || status === 'Reopened' || status === 'Awaiting Citizen Response' || status === 'Assigned' || status === 'Verified') currentStageIndex = 1;
    else currentStageIndex = 0;

    const incidentRef = String(report._id || 'UNKNOWN').slice(-6).toUpperCase();

    const policyContent = {
        privacy: {
            title: 'Privacy Policy',
            content: `
                <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                    <p className="font-bold text-blue-900 uppercase tracking-wider text-[10px]">Sentinel Protocol: 1.0.4</p>
                    <p>We take your digital sovereignty seriously. Any data processed during the payment phase is encrypted via end-to-end TLS 1.3 protocols. We do not store your full CVV or card PINs on our tactical servers.</p>
                    <h5 className="font-bold text-gray-900">1. Data Minimalization</h5>
                    <p>Only essential metadata required by the central bank and our secure gateway is transmitted. This includes reference IDs, amounts, and your agreement timestamp.</p>
                    <h5 className="font-bold text-gray-900">2. Incident Correlation</h5>
                    <p>Payment data is linked to your #INC reference strictly for investigation closure and administrative auditing.</p>
                </div>
            `
        },
        terms: {
            title: 'Terms & Conditions',
            content: `
                <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                    <p className="font-bold text-blue-900 uppercase tracking-wider text-[10px]">Operational Directive: T-77</p>
                    <p>By proceeding with this payment, you acknowledge that you are the authorized holder of the payment method or have explicit permission to use it.</p>
                    <h5 className="font-bold text-gray-900">1. Authorization</h5>
                    <p>You authorize the Cyber Command to process a one-time transaction for the specified amount. This does not grant us permanent access to your financial accounts.</p>
                    <h5 className="font-bold text-gray-900">2. Compliance</h5>
                    <p>Misuse of the payment portal for money laundering or fraudulent claims will result in immediate escalation to the local law enforcement agencies.</p>
                </div>
            `
        },
        refund: {
            title: 'Refund Policy',
            content: `
                <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                    <p className="font-bold text-rose-600 uppercase tracking-wider text-[10px]">Critical Enforcement: Non-Refundable</p>
                    <p>Payments made for cyber threat investigations, fine settlements, or resolution protocols are processed as final administrative actions.</p>
                    <h5 className="font-bold text-gray-900">1. Operational Costs</h5>
                    <p>The processing amount covers secure gateway maintenance, officer investigation man-hours, and high-performance server allocation for evidence analysis.</p>
                    <h5 className="font-bold text-gray-900">2. No Discretion</h5>
                    <p>Once the payment signal is confirmed by the gateway, the funds are automatically allocated to the regional treasury. No refunds will be issued under any circumstances.</p>
                </div>
            `
        }
    };
    const renderSLA = () => {
        if (!report?.slaDeadline || report?.isClosed) return null;

        const now = new Date();
        const start = new Date(report.slaStartTime);
        const deadline = new Date(report.slaDeadline);
        const isCritical = report.severity === 'Critical';

        // 1. Pending Start
        if (now < start) {
            return (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-bold shadow-sm uppercase tracking-tight">
                    <Clock size={12} className="animate-pulse" /> 
                    Starts: {safeFormat(start, 'MMM dd, hh:mm a')}
                </span>
            );
        }

        // 2. Breached
        if (now > deadline || report.slaStatus === 'BREACHED') {
            return (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-md text-[10px] font-bold animate-pulse shadow-sm uppercase tracking-tight">
                    <AlertTriangle size={12}/> 
                    Breached: {safeFormat(deadline, 'MMM dd, hh:mm a')}
                </span>
            );
        }

        // 3. Paused (Non-working hours)
        const isWorkingHour = (d) => {
            const day = d.getDay();
            const hour = d.getHours();
            return (day >= 1 && day <= 5) && (hour >= 9 && hour < 18);
        };

        if (!isCritical && !isWorkingHour(now)) {
            return (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[10px] font-semibold shadow-sm uppercase tracking-tight">
                    <Clock size={12}/> 
                    Paused (Resumes {safeFormat(start, 'hh:mm a')})
                </span>
            );
        }

        // 4. Time Remaining
        const diffMs = deadline - now;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        let colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
        if (diffHrs < 4) colorClass = "bg-red-50 text-red-700 border-red-200";
        else if (diffHrs < 12) colorClass = "bg-amber-50 text-amber-700 border-amber-200";

        return (
            <div className="flex flex-col sm:flex-row gap-2">
                <span className={`flex items-center gap-1.5 px-3 py-1 border rounded-md text-[10px] font-bold shadow-sm uppercase tracking-tight ${colorClass}`}>
                    <Clock size={12}/> {diffHrs}h {diffMins}m Left
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white text-slate-500 border border-slate-200 rounded-md text-[10px] font-bold shadow-sm uppercase tracking-tight">
                    Deadline: {safeFormat(deadline, 'MMM dd, hh:mm a')}
                </span>
            </div>
        );
    };

    return (
        <MainLayout links={citizenLinks} userRole="Citizen">
            {/* Header section */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm gap-6 font-sans">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-500">
                        <button
                            onClick={() => navigate('/my-reports')}
                            className="hover:text-blue-700 transition-colors"
                        >
                            My Reports
                        </button>
                        <ChevronRight size={14} />
                        <span className="text-blue-700 font-semibold">Ref: #{incidentRef}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Case Overview</h2>
                        <span className={`px-3 py-1 rounded-md text-xs font-semibold shadow-sm border ${
                            status === 'Case Closed' ? 'bg-green-50 text-green-700 border-green-200' :
                            status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                            {status}
                        </span>
                        {renderSLA()}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {status === 'Case Closed' && (
                        <button
                            onClick={handleReopen}
                            className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors rounded-xl font-medium text-sm group"
                        >
                            <RefreshCw size={16} className="text-amber-500 group-hover:rotate-180 transition-transform duration-500" />
                            Reopen Case
                        </button>
                    )}
                    <button
                        onClick={handleDownloadReport}
                        disabled={downloadingPDF}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-medium text-sm transition-all shadow-sm shadow-blue-900/20 disabled:opacity-60 disabled:cursor-not-allowed group"
                    >
                        {downloadingPDF ? (
                            <Loader className="animate-spin text-white/70" size={16} />
                        ) : (
                            <Send className="text-white/80 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" size={16} />
                        )}
                        <span>{downloadingPDF ? 'Processing...' : 'Transmit Report'}</span>
                    </button>
                </div>
            </div>

            {/* AI Status Banners */}
            {report.aiMetadata?.aiStatus === 'PENDING' ? (
                <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-600 rounded-xl flex flex-col md:flex-row items-center gap-6 font-sans">
                    <div className="p-3 bg-blue-100 rounded-lg text-blue-700">
                        <Loader size={24} className="animate-spin" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-900 mb-1">AI Analysis Pending</h4>
                        <p className="text-sm font-medium text-slate-600">
                            Our Sentinel AI system is preparing to analyze your report. Please check back shortly.
                        </p>
                    </div>
                </div>
            ) : report.aiMetadata?.aiStatus === 'VERIFIED' || report.aiMetadata?.isValid ? (
                <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-600 rounded-xl flex flex-col md:flex-row items-center gap-6 font-sans">
                    <div className="p-3 bg-blue-100 rounded-lg text-blue-700">
                        <Zap size={24} className="animate-pulse" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-900 mb-1">AI Evidence Validation Success</h4>
                        <p className="text-sm font-medium text-slate-600">
                            Our Sentinel AI diagnostics confirmed the threat patterns within your evidence. Your dossier is prioritized and auto-verified for technical enforcement.
                        </p>
                    </div>
                    <div className="px-4 py-2 bg-white rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-sm">
                        <Shield size={14} className="text-blue-600" /> Confidence: {Math.round(report.aiMetadata.confidence * 100)}%
                    </div>
                </div>
            ) : report.aiMetadata?.aiStatus === 'ANOMALY' || (report.aiMetadata && !report.aiMetadata.isValid) ? (
                <div className="mb-8 p-6 bg-rose-50 border-l-4 border-rose-600 rounded-xl flex flex-col md:flex-row items-center gap-6 font-sans">
                    <div className="p-3 bg-rose-100 rounded-lg text-rose-700">
                        <AlertTriangle size={24} className="animate-pulse" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-900 mb-1">AI Pattern Anomaly</h4>
                        <p className="text-sm font-medium text-slate-600">
                            Automated diagnostics detected a mismatch. A human officer is prioritized to manually verify your claim.
                        </p>
                    </div>
                    <div className="px-4 py-2 bg-white rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-sm">
                        <Radio size={14} className="text-rose-600" /> Pending Review
                    </div>
                </div>
            ) : null}

            {/* Grid Layout Start */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans antialiased text-slate-900">
                {/* Main Content Column */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Status Progress Bar */}
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <h3 className="text-lg font-semibold text-slate-900 mb-10 border-b border-slate-100 pb-4">Resolution Pipeline</h3>
                        <div className="flex justify-between relative px-2 mb-4">
                            <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 rounded-full" />
                            <div className="absolute top-5 left-0 h-1 bg-blue-600 rounded-full transition-all duration-700" style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }} />
                            {stages.map((stage, idx) => (
                                <div key={idx} className="flex flex-col items-center z-10 w-24 gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-4 border-white ${
                                        idx <= currentStageIndex
                                            ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-50/50'
                                            : 'bg-slate-100 text-slate-400'
                                    }`}>
                                        <stage.icon size={18} />
                                    </div>
                                    <span className={`text-xs font-semibold text-center ${idx <= currentStageIndex ? 'text-slate-800' : 'text-slate-400'}`}>
                                        {stage.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline section */}
                    <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-8 border-b border-slate-100 pb-4 flex items-center gap-2">
                            <Clock size={18} className="text-slate-400" /> Operational Timeline
                        </h3>
                        <div className="space-y-8 ml-4 border-l-2 border-slate-100 pl-8 relative">
                            {(report.timeline || []).length > 0 ? report.timeline.map((item, idx) => (
                                <div key={idx} className="relative group transition-all">
                                    <div className={`absolute -left-[41px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm transition-all ${
                                        idx === report.timeline.length - 1 ? 'bg-blue-600 ring-2 ring-blue-100' : 'bg-slate-300'
                                    }`} />
                                    <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h5 className="font-semibold text-slate-900">{item.title}</h5>
                                            <span className="text-xs font-medium text-slate-500">{safeFormat(item.timestamp, 'MMM dd, HH:mm')}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed mb-3">{item.description}</p>
                                        <span className="inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded bg-white border border-slate-200 text-slate-500 shadow-sm">
                                            Source: <span className="capitalize">{item.role}</span>
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm font-medium text-slate-400">No timeline activity logged yet.</p>
                            )}
                        </div>
                    </section>

                    {/* Dummy Payment Section */}
                    {report.status === 'Payment Pending' && (
                        <section className="bg-white border border-amber-200 shadow-sm rounded-xl overflow-hidden font-sans relative">
                            <div className="p-6 border-b border-amber-100 flex items-center gap-3 bg-amber-50">
                                <div className="p-2 bg-amber-500 text-white rounded-lg"><CreditCard size={18} /></div>
                                <h3 className="text-lg font-semibold text-amber-900">Pending Fine / Processing Fee</h3>
                            </div>
                            <div className="p-8">
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Amount Due</p>
                                        <p className="text-3xl font-bold text-slate-900">₹{report.paymentAmount != null ? report.paymentAmount : report.fineAmount}</p>
                                    </div>
                                </div>
                                <div className="mb-8 p-5 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="flex items-start gap-4">
                                        <input 
                                            type="checkbox" 
                                            id="policy-agree"
                                            checked={isAgreed}
                                            onChange={(e) => setIsAgreed(e.target.checked)}
                                            className="mt-1 w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                        <label htmlFor="policy-agree" className="text-sm font-medium text-slate-700 cursor-pointer -mt-0.5 leading-relaxed">
                                            I agree to the 
                                            <button onClick={() => setActivePolicy('privacy')} className="text-blue-700 hover:underline hover:text-blue-900 font-semibold mx-1">Privacy Policy</button>, 
                                            <button onClick={() => setActivePolicy('terms')} className="text-blue-700 hover:underline hover:text-blue-900 font-semibold mx-1">Terms & Conditions</button>, and 
                                            <button onClick={() => setActivePolicy('refund')} className="text-blue-700 hover:underline hover:text-blue-900 font-semibold mx-1">Refund Policy</button>.
                                            <p className="mt-1.5 text-[11px] text-amber-700 font-semibold bg-amber-100/50 inline-block px-2 py-1 rounded">* Payment is non-refundable</p>
                                        </label>
                                    </div>
                                </div>
                                <button
                                    onClick={handlePayment}
                                    disabled={processingPayment || !isAgreed}
                                    className={`w-full py-4 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${
                                        !isAgreed 
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                                        : 'bg-amber-500 hover:bg-amber-600 text-white disabled:bg-amber-300 shadow-md shadow-amber-500/20'
                                    }`}
                                >
                                    {processingPayment ? <Loader className="animate-spin" size={18} /> : <CreditCard size={18} />}
                                    {processingPayment ? 'Processing Securely...' : 'Pay Securely Now'}
                                </button>
                            </div>
                        </section>
                    )}

                    {(report.paymentStatus === 'Completed' || report.paymentStatus === 'Paid') && (
                        <section className="bg-white border border-green-200 shadow-sm rounded-xl overflow-hidden font-sans">
                            <div className="p-6 border-b border-green-100 flex items-center gap-3 bg-green-50">
                                <div className="p-2 bg-green-600 text-white rounded-lg"><CheckCircle size={18} /></div>
                                <h3 className="text-lg font-semibold text-green-900">Payment Processed Successfully</h3>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="flex justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-sm font-medium text-slate-500">Amount Paid</span>
                                    <span className="text-sm font-bold text-green-700">₹{report.paymentAmount != null ? report.paymentAmount : report.fineAmount}</span>
                                </div>
                                <div className="flex justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-sm font-medium text-slate-500">Transaction ID</span>
                                    <span className="text-sm font-semibold text-slate-900 font-mono tracking-wider">{report.transactionId}</span>
                                </div>
                                <div className="flex justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-sm font-medium text-slate-500">Date</span>
                                    <span className="text-sm font-semibold text-slate-900">
                                        {report.paymentDate ? format(new Date(report.paymentDate), 'MMM dd, yyyy | HH:mm') : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Final Resolution Panel */}
                    {(status === 'Case Closed' || status === 'Rejected') && report.resolution && (
                        <section className={`rounded-xl shadow-sm border p-8 ${status === 'Case Closed' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-2 rounded-lg text-white shadow-sm ${status === 'Case Closed' ? 'bg-green-600' : 'bg-red-600'}`}>
                                    {status === 'Case Closed' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">{status === 'Case Closed' ? 'Resolution Summary' : 'Case Rejected'}</h3>
                            </div>
                            <div className="space-y-4">
                                <p className="text-sm text-slate-800 font-medium leading-relaxed bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                                    {report.resolution.summary || 'No summary provided.'}
                                </p>
                                <div className="flex justify-between items-center text-xs font-semibold text-slate-500 px-1 pt-2">
                                    <span>Closed by: <span className="text-slate-800">{report.resolution.officerName || 'Authority'}</span></span>
                                    <span>{safeFormat(report.resolution.date, 'MMM dd, yyyy')}</span>
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Assigned Officer Card */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 border-b border-slate-100 pb-3">Assigned Personnel</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center font-bold text-lg border border-blue-100">
                                {report.assignedTo?.name ? report.assignedTo.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{report.assignedTo?.name || 'Pending Assignment'}</p>
                                <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1"><MapPin size={12}/> {report.zone || 'Global'} Zone</p>
                            </div>
                            {report.assignedTo?.email && (
                                <a href={`mailto:${report.assignedTo.email}`} className="ml-auto p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors">
                                    <Mail size={16} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Evidence Panel */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 border-b border-slate-100 pb-3">Evidence Assets</h3>
                        <div className="space-y-4">
                            {/* Incident Resource Link */}
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
                                <LinkIcon size={16} className="text-blue-600 mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Target Resource</p>
                                    <p className="text-sm font-semibold text-slate-900 truncate">{report.urlOrPhone || 'N/A'}</p>
                                </div>
                            </div>
                            
                            {/* GPS Location */}
                            {typeof report.latitude === 'number' && typeof report.longitude === 'number' && (
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
                                    <MapPin size={16} className="text-green-600 mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">GPS Coordinates</p>
                                        <p className="text-sm font-semibold text-slate-900 font-mono">
                                            {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                                        </p>
                                    </div>
                                    <a href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`} target="_blank" rel="noopener noreferrer" className="ml-auto text-slate-400 hover:text-blue-600 p-1">
                                        <ExternalLink size={16}/>
                                    </a>
                                </div>
                            )}

                            {/* Attachments */}
                            {(report.evidence || []).map((ev, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
                                    <div className="text-slate-400 mt-0.5 shrink-0">
                                        {ev.type === 'image' ? <Camera size={16} /> : (ev.type === 'link' ? <LinkIcon size={16} /> : <File size={16} />)}
                                    </div>
                                    <div className="min-w-0 w-full">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{ev.type} Attachment</p>
                                        {ev.type === 'image' ? (
                                            <a href={ev.url} target="_blank" rel="noopener noreferrer" className="block w-full h-24 bg-slate-200 rounded-md overflow-hidden mt-2 relative group border border-slate-300">
                                                <img src={ev.url} alt="Evidence" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <ExternalLink size={16} className="text-white"/>
                                                </div>
                                            </a>
                                        ) : (
                                            <p className="text-sm font-semibold text-slate-900 truncate">{ev.content || 'Attached File'}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Official Remarks */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 border-b border-slate-100 pb-3">Investigator Notes</h3>
                        <div className="space-y-4">
                            {(report.investigationNotes || []).length > 0 ? report.investigationNotes.map((note, idx) => (
                                <div key={idx} className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-amber-900 flex items-center gap-1"><UserIcon size={12}/> {note.addedBy?.name || 'Officer'}</span>
                                        <span className="text-[10px] font-medium text-amber-700">{safeFormat(note.createdAt, 'MMM dd, HH:mm')}</span>
                                    </div>
                                    <p className="text-sm text-amber-800 font-medium leading-relaxed bg-white/50 p-2 rounded">{note.note}</p>
                                </div>
                            )) : (
                                <p className="text-sm font-medium text-slate-400 italic text-center py-4 border-2 border-dashed border-slate-100 rounded-lg">No notes added.</p>
                            )}
                        </div>
                    </div>

                    {/* Investigation Chat */}
                    <div className="space-y-6">
                        <InvestigationChat
                            reportId={referenceId}
                            currentUser={user}
                            isClosed={status === 'Case Closed' || status === 'Rejected' || status === 'Closed'}
                        />
                    </div>
                </div>
            </div>
            {/* Policy Modals */}
            <Modal 
                isOpen={!!activePolicy} 
                onClose={() => setActivePolicy(null)}
                title={activePolicy ? policyContent[activePolicy].title : ''}
                footer={
                    <button 
                        onClick={() => setActivePolicy(null)} 
                        className="w-full py-3 bg-gray-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all"
                    >
                        Acknowledged
                    </button>
                }
            >
                {activePolicy && (
                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                        {activePolicy === 'privacy' && (
                            <>
                                <p className="font-bold text-blue-900 uppercase tracking-wider text-[10px]">Sentinel Protocol: 1.0.4</p>
                                <p>We take your digital sovereignty seriously. Any data processed during the payment phase is encrypted via end-to-end TLS 1.3 protocols. We do not store your full CVV or card PINs on our tactical servers.</p>
                                <h5 className="font-bold text-gray-900">1. Data Minimalization</h5>
                                <p>Only essential metadata required by the central bank and our secure gateway is transmitted. This includes reference IDs, amounts, and your agreement timestamp.</p>
                                <h5 className="font-bold text-gray-900">2. Incident Correlation</h5>
                                <p>Payment data is linked to your #INC reference strictly for investigation closure and administrative auditing.</p>
                            </>
                        )}
                        {activePolicy === 'terms' && (
                            <>
                                <p className="font-bold text-blue-900 uppercase tracking-wider text-[10px]">Operational Directive: T-77</p>
                                <p>By proceeding with this payment, you acknowledge that you are the authorized holder of the payment method or have explicit permission to use it.</p>
                                <h5 className="font-bold text-gray-900">1. Authorization</h5>
                                <p>You authorize the Cyber Command to process a one-time transaction for the specified amount. This does not grant us permanent access to your financial accounts.</p>
                                <h5 className="font-bold text-gray-900">2. Compliance</h5>
                                <p>Misuse of the payment portal for money laundering or fraudulent claims will result in immediate escalation to the local law enforcement agencies.</p>
                            </>
                        )}
                        {activePolicy === 'refund' && (
                            <>
                                <p className="font-bold text-rose-600 uppercase tracking-wider text-[10px]">Critical Enforcement: Non-Refundable</p>
                                <p>Payments made for cyber threat investigations, fine settlements, or resolution protocols are processed as final administrative actions.</p>
                                <h5 className="font-bold text-gray-900">1. Operational Costs</h5>
                                <p>The processing amount covers secure gateway maintenance, officer investigation man-hours, and high-performance server allocation for evidence analysis.</p>
                                <h5 className="font-bold text-gray-900">2. No Discretion</h5>
                                <p>Once the payment signal is confirmed by the gateway, the funds are automatically allocated to the regional treasury. No refunds will be issued under any circumstances.</p>
                            </>
                        )}
                    </div>
                )}
            </Modal>

            {/* Reopen Case Modal */}
            <Modal
                isOpen={showReopenModal}
                onClose={() => !submittingReopen && setShowReopenModal(false)}
                title="Tactical Case Reopen Request"
                footer={
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowReopenModal(false)}
                            disabled={submittingReopen}
                            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleReopenConfirm}
                            disabled={submittingReopen || reopenReason.trim().length < 10}
                            className="flex-1 py-3 bg-[#2D4A9D] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submittingReopen ? <Loader className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                            Confirm Reopen
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-amber-600 shrink-0" size={18} />
                            <div>
                                <p className="text-xs font-bold text-amber-900 uppercase tracking-tight mb-1">Operational Warning</p>
                                <p className="text-[10px] text-amber-700 leading-relaxed">
                                    Reopening a case triggers an immediate tactical alert to the assigned officer. You must provide a valid reason for this request. 
                                    <br/><span className="font-bold">Protocol Limit:</span> Max 2 attempts per incident. 
                                    <br/><span className="font-bold">Time Limit:</span> Must be within 48h of closure.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                            Reason for Reopen <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            value={reopenReason}
                            onChange={(e) => setReopenReason(e.target.value)}
                            placeholder="Describe why this case needs immediate re-investigation..."
                            className="w-full min-h-[120px] p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none resize-none"
                        />
                        <div className="mt-2 flex justify-between items-center px-1">
                            <span className={`text-[10px] font-bold ${reopenReason.trim().length >= 10 ? 'text-emerald-600' : 'text-gray-400'}`}>
                                {reopenReason.trim().length < 10 ? `Minimum 10 chars required (${reopenReason.trim().length}/10)` : 'Character Requirement Met'}
                            </span>
                        </div>
                    </div>
                </div>
            </Modal>
        </MainLayout>
    );
};

export default TrackIncident;
