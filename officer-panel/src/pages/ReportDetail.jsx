import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { reportService, collaborationService } from '../services/api';
import {
    Shield,
    Clock,
    FileText,
    User,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Loader,
    ChevronLeft,
    Send,
    Check,
    CreditCard,
    Plus,
    Paperclip,
    Database,
    Zap,
    MapPin,
    Calendar,
    Phone,
    Globe,
    ExternalLink,
    MessageSquare,
    Download,
    HelpCircle,
    Activity,
    Target,
    Terminal,
    Radio,
    Maximize2,
    Lock,
    ShieldAlert,
    ChevronRight,
    Mail,
    Camera,
    File,
    Link as LinkIcon,
    Settings,
    RefreshCw,
    Eye,
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import toast from 'react-hot-toast';
import { format, isValid, formatDistanceToNow } from 'date-fns';
import { io } from 'socket.io-client';
import InvestigationTimeline from '../components/investigation/InvestigationTimeline';
import EvidenceViewer from '../components/investigation/EvidenceViewer';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import InvestigationChat from '../components/investigation/InvestigationChat';



const ReportDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isReadOnly = location.state?.readOnly || false;

    // STEP 3: VERIFY COMPONENT PARAM
    if (!id) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 uppercase font-black text-[10px] tracking-widest text-red-500">
                Invalid Investigation ID: Resource Unspecified
            </div>
        );
    }
    const [investigation, setInvestigation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [socket, setSocket] = useState(null);
    const fileInputRef = useRef(null);

    let user = {};
    try {
        const storedUser = localStorage.getItem('user');
        user = storedUser ? JSON.parse(storedUser) : {};
    } catch (e) {
        user = {};
    }
    const userId = user?._id || user?.id;

    const officerLinks = [
        { label: 'Dashboard', path: '/officer/dashboard', icon: Database },
        { label: 'Assigned Reports', path: '/cases', icon: Shield },
        { label: 'Reports', path: '/reports', icon: FileText },
        { label: 'Profile', path: '/profile', icon: User },
        { label: 'Settings', path: '/settings', icon: Settings },
    ];

    // STEP 3: SAFE API CALL
    const fetchInvestigation = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const { data } = await reportService.getById(id);
            setInvestigation(data || null);
        } catch (err) {
            console.error('Investigation fetch error:', err);
            setError('Failed to load investigation intelligence. Logic uplink severed.');
            toast.error('Failed to sync intelligence dossier');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchInvestigation();

            const newSocket = io('http://localhost:5000');
            setSocket(newSocket);
            newSocket.emit('joinReportRoom', id);

            newSocket.on('reportUpdated', (updated) => {
                if (updated && updated._id === id) {
                    setInvestigation(prev => ({ ...prev, ...updated }));
                }
            });

            return () => {
                newSocket.close();
                setSocket(null);
            };
        }
    }, [id]);

    const handleUpdateStatus = async (status, paymentAmount = undefined) => {
        setSubmitting(true);
        try {
            // Provide default summary for system message logic if resolving
            const resolutionSummary = (status === 'Case Closed' || status === 'Rejected' || status === 'Resolved with Fine')
                ? `Official authority finalized the dossier as ${status}.`
                : undefined;

            const payload = { status, resolutionSummary };
            if (paymentAmount !== undefined) {
                payload.paymentAmount = paymentAmount;
            }

            await reportService.updateStatus(id, payload);
            toast.success(`Milestone: Case transitioned to ${status}`);

            // Broadcast status change immediately to chat
            if (socket && userId) {
                socket.emit('sendMessage', {
                    reportId: id,
                    senderId: userId,
                    senderRole: 'system',
                    message: `CRITICAL UPDATE: Status shifted to [${status.toUpperCase()}]. Protocol initiated.`
                });
            }

            fetchInvestigation();
        } catch (error) {
            const msg = error.response?.data?.message || 'Mission update protocol failed';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!note.trim()) return;
        setSubmitting(true);
        try {
            await reportService.addOfficerNote(id, { note });

            // Sync with Chat via existing socket
            if (socket && userId) {
                socket.emit('sendMessage', {
                    reportId: id,
                    senderId: userId,
                    senderRole: 'system',
                    message: `OFFICIAL REMARK: ${note}`
                });
            }

            toast.success('Log entry secured and synced to chat');
            setNote('');
            fetchInvestigation();
        } catch (error) {
            toast.error('Log entry failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRequestInfo = async () => {
        const content = prompt("Enter specific requirements for the citizen:");
        if (!content) return;

        setSubmitting(true);
        try {
            await collaborationService.requestInfo({
                reportId: id,
                content
            });
            toast.success('Direct request dispatched to subject');
            fetchInvestigation();
        } catch (error) {
            toast.error('Protocol failure');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEscalateReport = async () => {
        const reason = prompt("TACTICAL ESCALATION: Specify reason for protocol escalation:");
        if (!reason) return;
        
        setSubmitting(true);
        try {
            await reportService.escalate(id, { reason });
            toast.success("Case Escalated to Command Structure");
            fetchInvestigation();
        } catch (error) {
            toast.error(error.response?.data?.message || "Escalation failed");
        } finally {
            setSubmitting(false);
        }
    };


    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setSubmitting(true);
        try {
            await reportService.addReportEvidence(id, formData);
            toast.success('Evidence secured in vault');
            fetchInvestigation();
        } catch (error) {
            toast.error('Evidence transmission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const safeFormat = (dateInput, formatStr) => {
        if (!dateInput) return 'TBD';
        const date = new Date(dateInput);
        return isValid(date) ? format(date, formatStr) : 'OFFLINE';
    };

    const getSlaDisplayData = () => {
        if (!investigation?.slaDeadline || investigation?.isClosed) return null;

        const now = new Date();
        const start = new Date(investigation.slaStartTime);
        const deadline = new Date(investigation.slaDeadline);
        const isCritical = investigation.severity === 'Critical';

        // 1. Check if SLA has started
        if (now < start) {
            return {
                label: "SLA Pending",
                value: `Starts: ${format(start, 'MMM dd, hh:mm a')}`,
                status: "PENDING",
                color: "text-blue-500",
                bg: "bg-blue-50",
                message: "Awaiting next working period to initiate protocol."
            };
        }

        // 2. Check if breached
        if (now > deadline || investigation.slaStatus === 'BREACHED') {
            return {
                label: "SLA Breached",
                value: "OVERDUE",
                status: "BREACHED",
                color: "text-red-600",
                bg: "bg-red-50",
                message: "Service Level Agreement protocol violated. Escalation required."
            };
        }

        // 3. Check if paused (Non-working hours)
        const isWorkingHour = (d) => {
            const day = d.getDay();
            const hour = d.getHours();
            return (day >= 1 && day <= 5) && (hour >= 9 && hour < 18);
        };

        if (!isCritical && !isWorkingHour(now)) {
            return {
                label: "SLA Paused",
                value: "Non-working Hours",
                status: "PAUSED",
                color: "text-amber-600",
                bg: "bg-amber-50",
                message: "Timer paused. Resumes next business day at 09:00."
            };
        }

        // 4. Time Remaining Calculation (Simplified for display)
        const diffMs = deadline - now;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        let color = "text-emerald-600";
        let bg = "bg-emerald-50";
        if (diffHrs < 4) {
            color = "text-red-500";
            bg = "bg-red-50";
        } else if (diffHrs < 12) {
            color = "text-amber-500";
            bg = "bg-amber-50";
        }

        return {
            label: "SLA Clock Active",
            value: `${diffHrs}h ${diffMins}m remaining`,
            status: "ACTIVE",
            color,
            bg,
            message: "Tactical handling required within specified timeframe."
        };
    };

    const slaData = getSlaDisplayData();
    const isSlaBreached = slaData?.status === 'BREACHED';
    const canResolve = !isSlaBreached || user?.role === 'admin';

    // STEP 4: SAFE RENDER GUARDS
    if (loading) {
        return (
            <MainLayout links={officerLinks} userRole="Officer">
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                    <Loader className="animate-spin text-blue-600" size={40} />
                    <p className="font-bold text-xs uppercase tracking-widest text-blue-600 animate-pulse">Loading Intelligence...</p>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout links={officerLinks} userRole="Officer">
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                    <AlertTriangle className="text-amber-500 mb-2" size={64} />
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight uppercase">Protocol Fault</h2>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-center text-[10px]">{error}</p>
                    <button onClick={fetchInvestigation} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 transition-all hover:scale-105 active:scale-95">
                        Retry Uplink
                    </button>
                </div>
            </MainLayout>
        );
    }

    if (!investigation) {
        return (
            <MainLayout links={officerLinks} userRole="Officer">
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                    <XCircle className="text-red-500 mb-2" size={64} />
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight uppercase">No Investigation Data Found</h2>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-center text-[10px]">Requested dossier non-existent in sector repositories.</p>
                </div>
            </MainLayout>
        );
    }

    const isClosed = investigation?.status === 'Case Closed' || investigation?.status === 'Rejected' || investigation?.status === 'Closed' || investigation?.status === 'Payment Pending';
    const incidentRef = String(investigation?._id || 'UNKNOWN').slice(-6).toUpperCase();

    const STATUS_STEPS = [
        { id: 'Investigating', label: 'Investigating' },
        { id: 'Reopened', label: 'Reopened' },
        { id: 'Investigation Completed', label: 'Completed' },
        { id: 'Payment Pending', label: 'Payment Pending' },
        { id: 'Payment Completed', label: 'Payment Completed' },
        { id: 'Case Closed', label: 'Case Closed' }
    ];

    const getCurrentStepIndex = (status) => {
        if (!status || status === 'Pending' || status === 'Assigned' || status === 'Verified') return -1;
        if (status === 'Reopened') return 1;
        if (status === 'Rejected') return STATUS_STEPS.length;
        const idx = STATUS_STEPS.findIndex(s => s.id === status);
        return idx !== -1 ? idx : -1;
    };

    return (
        <MainLayout links={officerLinks} userRole="Officer">
            <div className="investigation-container">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,application/pdf" />

                {/* Officer Header styled like Citizen Track page */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <button onClick={() => navigate('/reports')} className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1">
                                Officer Panel <ChevronRight size={14} />
                            </button>
                            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Ref: #ENC-{incidentRef}</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                            <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-xl text-base">INC-{incidentRef}</span>
                            <span className={`text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold shadow-sm ${
                                investigation?.status === 'Case Closed' ? 'bg-emerald-500 text-white' :
                                investigation?.status === 'Rejected' ? 'bg-rose-500 text-white' : 
                                investigation?.status === 'Reopened' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                                }`}>
                                {investigation?.status || 'Active'}
                            </span>
                            {investigation?.status === 'Reopened' && (
                                <span className="flex items-center gap-2 px-4 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm animate-pulse">
                                    <AlertTriangle size={12} /> REOPENED DOSSIER ({investigation?.reopenAttempts || 1}/2)
                                </span>
                            )}
                            {isReadOnly && (
                                <span className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm">
                                    <Eye size={12} /> INSPECTION MODE : READ ONLY
                                </span>
                            )}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        {!isReadOnly && !isClosed && investigation?.status !== 'Rejected' && (
                            <div className="flex items-center gap-2 bg-white/50 p-1.5 rounded-2xl border border-gray-100 backdrop-blur-md">
                                {['Investigating', 'Reopened', 'Pending', 'Assigned', 'Verified'].includes(investigation?.status || 'Active') && (
                                    <button
                                        onClick={() => handleUpdateStatus('Investigation Completed')}
                                        disabled={submitting || !canResolve}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                                            !canResolve ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50' : 'hover:bg-indigo-600 hover:text-white border border-indigo-200 text-indigo-600'
                                        }`}
                                    >
                                        Mark Investigation Complete
                                    </button>
                                )}

                                {investigation?.status === 'Investigation Completed' && (
                                    <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
                                        <button
                                            onClick={() => handleUpdateStatus('Case Closed', 0)}
                                            disabled={submitting || !canResolve}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${
                                                !canResolve ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50' : 'hover:bg-emerald-600 hover:text-white border border-emerald-200 text-emerald-600'
                                            }`}
                                        >
                                            Valid: Close (No Penalty)
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!canResolve) return;
                                                // Dynamic Fine Calculation System
                                                let baseFine = 0;
                                                const severity = investigation?.severity;
                                                if (severity === 'Critical') baseFine = 5000;
                                                else if (severity === 'High') baseFine = 2500;
                                                else if (severity === 'Medium') baseFine = 1000;
                                                else baseFine = 500;
                                                
                                                const threatMultiplier = (investigation?.threatType === 'Ransomware' || investigation?.threatType === 'Financial Fraud') ? 1.5 : 1;
                                                const authConfidence = investigation?.aiMetadata?.confidence || 0.8;
                                                
                                                const generatedFine = Math.floor(baseFine * threatMultiplier * authConfidence);

                                                const amountStr = window.prompt(
                                                    `SYSTEM: Dynamic Penalty Generation
------------------------------------
Severity: ${severity || 'Normal'}
Category: ${investigation?.threatType || 'Standard'}
Authenticity Match: ${(authConfidence * 100).toFixed(0)}%

Generated Fine: ₹${generatedFine}
Enter final payment amount:`, 
                                                    generatedFine
                                                );
                                                if (amountStr !== null) {
                                                    const amount = parseFloat(amountStr);
                                                    if (!isNaN(amount) && amount > 0) {
                                                        handleUpdateStatus('Payment Pending', amount);
                                                    } else {
                                                        toast.error("Penalty must be strictly greater than 0.");
                                                    }
                                                }
                                            }}
                                            disabled={submitting || !canResolve}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${
                                                !canResolve ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50' : 'hover:bg-amber-500 hover:text-white border border-amber-200 text-amber-600'
                                            }`}
                                        >
                                            Generate Penalty Fine
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus('Rejected')}
                                            disabled={submitting || !canResolve}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${
                                                !canResolve ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50' : 'hover:bg-rose-600 hover:text-white border border-rose-200 text-rose-600'
                                            }`}
                                        >
                                            Invalid: Reject Dossier
                                        </button>
                                    </div>
                                )}

                                {investigation?.status === 'Payment Completed' && (
                                     <button
                                         onClick={() => handleUpdateStatus('Case Closed')}
                                         disabled={submitting || !canResolve}
                                         className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
                                             !canResolve ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50' : 'bg-emerald-600 text-white animate-pulse'
                                         }`}
                                     >
                                         Finalize Case Closure
                                     </button>
                                )}

                                {isSlaBreached && user?.role !== 'admin' && (
                                    <button
                                        onClick={handleEscalateReport}
                                        disabled={submitting}
                                        className="px-6 py-2.5 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg flex items-center gap-2 border-2 border-rose-400/30 font-black"
                                    >
                                        <ShieldAlert size={16} /> Escalate Case to Command
                                    </button>
                                )}

                                {isSlaBreached && user?.role === 'admin' && (
                                    <div className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg flex items-center gap-2">
                                        <Zap size={14} /> Admin Override Active
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {isSlaBreached && (
                    <div className="mb-10 p-5 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-center justify-between shadow-inner">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-rose-100 text-rose-600 rounded-xl shadow-sm">
                                <AlertTriangle size={20} className="animate-bounce" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest m-0 leading-none mb-1">SLA Violation Active</h4>
                                <p className="text-[10px] font-bold text-rose-800 m-0 opacity-80 italic">The Tactical Clock has expired. Standard resolution protocol restricted.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[8px] font-black text-rose-400 uppercase tracking-widest pr-4">
                            Status : Restricted
                        </div>
                    </div>
                )}

                {/* Premium Tactical Progress Stepper */}
                <div className="mb-12 bg-white/40 backdrop-blur-xl p-10 rounded-[3.5rem] border border-gray-100/50 shadow-xl shadow-blue-600/5 hidden md:block overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/20 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
                    
                    <div className="flex items-center justify-between relative w-full px-12">
                        {/* Background Path */}
                        <div className="absolute left-16 right-16 top-9 h-[2px] bg-gray-100 z-0"></div>
                        
                        {/* Active Progress Glow Path */}
                        <div 
                            className="absolute left-16 top-9 h-[2.5px] bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-600 z-0 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                            style={{ width: `${Math.max(0, (getCurrentStepIndex(investigation?.status) / (STATUS_STEPS.length - 1)) * 82)}%` }}
                        ></div>
                        
                        {STATUS_STEPS.map((step, index) => {
                            const currentIndex = getCurrentStepIndex(investigation?.status);
                            const isCompleted = index < currentIndex;
                            const isActive = index === currentIndex;
                            const isRejected = investigation?.status === 'Rejected';
                            
                            // Visual Config for Steps
                            const getStepConfig = (stepId) => {
                                switch(stepId) {
                                    case 'Investigating': return { icon: <Activity size={20} />, activeColor: 'text-blue-600', activeBg: 'bg-blue-600', glow: 'shadow-blue-500/40' };
                                    case 'Reopened': return { icon: <RefreshCw size={20} />, activeColor: 'text-amber-600', activeBg: 'bg-amber-600', glow: 'shadow-amber-500/40' };
                                    case 'Investigation Completed': return { icon: <Shield size={20} />, activeColor: 'text-indigo-600', activeBg: 'bg-indigo-600', glow: 'shadow-indigo-500/40' };
                                    case 'Payment Pending': return { icon: <CreditCard size={20} />, activeColor: 'text-amber-600', activeBg: 'bg-amber-500', glow: 'shadow-amber-500/40' };
                                    case 'Payment Completed': return { icon: <CheckCircle size={20} />, activeColor: 'text-emerald-600', activeBg: 'bg-emerald-500', glow: 'shadow-emerald-500/40' };
                                    case 'Case Closed': return { icon: <CheckCircle size={20} />, activeColor: 'text-emerald-600', activeBg: 'bg-emerald-600', glow: 'shadow-emerald-500/40' };
                                    default: return { icon: <Activity size={20} />, activeColor: 'text-blue-600', activeBg: 'bg-blue-600' };
                                }
                            };

                            const config = getStepConfig(step.id);
                            
                            return (
                                <div key={step.id} className="relative z-10 flex flex-col items-center group/step">
                                    {/* Icon Container */}
                                    <div className={`
                                        w-18 h-18 rounded-[1.2rem] flex flex-col justify-center items-center transition-all duration-500
                                        ${isCompleted ? 'bg-emerald-500 text-white scale-90' : 
                                          isActive ? `${config.activeBg} text-white shadow-2xl ${config.glow} -translate-y-2 scale-110 ring-8 ring-white` : 
                                          isRejected ? 'bg-rose-50 text-rose-300' : 'bg-white text-gray-300 border-2 border-gray-100'}
                                    `} style={{ width: '4.5rem', height: '4.5rem' }}>
                                        {isCompleted ? <Check size={24} className="animate-in zoom-in-50" /> : config.icon}
                                        
                                        {isActive && (
                                            <div className="absolute -bottom-1 flex gap-1">
                                                <span className="w-1 h-1 bg-white rounded-full animate-ping" />
                                                <span className="w-1 h-1 bg-white rounded-full animate-ping [animation-delay:200ms]" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Label */}
                                    <div className="absolute top-20 flex flex-col items-center w-32 text-center pointer-events-none">
                                        <span className={`
                                            text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300
                                            ${isActive ? config.activeColor : isCompleted ? 'text-emerald-600 opacity-60' : 'text-gray-400'}
                                        `}>
                                            {step.label}
                                        </span>
                                        {isActive && (
                                            <span className="mt-1 px-3 py-0.5 bg-gray-900 text-[8px] font-black text-white rounded-full uppercase tracking-tighter animate-pulse">
                                                Protocol Active
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Details & Timeline */}
                    <div className="lg:col-span-2 space-y-10">
                        <section className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-blue-600/5 relative overflow-hidden">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                                {[
                                    { label: 'Category', value: investigation?.threatType || 'Uncategorized', icon: Shield },
                                    { label: 'Severity', value: investigation?.severity || 'Standard', color: investigation?.severity === 'Critical' ? 'text-rose-600' : 'text-blue-600', icon: Zap },
                                    { label: 'Captured', value: safeFormat(investigation?.createdAt, 'MMM dd, HH:mm'), icon: Clock },
                                    { label: 'Sector', value: investigation?.zone?.name || 'CENTRAL', icon: Target }
                                ].map((item, i) => (
                                    <div key={i} className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 shadow-inner">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{item.label}</p>
                                        <p className={`text-[11px] font-black uppercase tracking-widest truncate ${item.color || 'text-gray-900'}`}>{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-4 mb-4 italic">Operational Description</h4>
                                    <div className="p-8 bg-gray-50 border border-gray-100 rounded-[2.5rem] text-gray-700 font-bold italic shadow-inner">
                                        "{investigation?.description || 'No description provided in dossier.'}"
                                    </div>
                                </div>

                                {/* NEW: Gemini AI Diagnostic Intel */}
                                {investigation?.aiMetadata && (
                                    <div className="mt-12 p-10 bg-gradient-to-br from-slate-900 to-blue-950 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group/ai">
                                        {/* Decorative AI Background Elements */}
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -mr-20 -mt-20 animate-pulse" />
                                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 blur-[80px] rounded-full -ml-20 -mb-20" />
                                        
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/20 backdrop-blur-md">
                                                        <Activity size={24} className="animate-pulse" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-white tracking-tight uppercase">AI Synthetic Diagnostic</h4>
                                                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] font-mono">Gemini-1.5-Flash Core Active</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 px-5 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                                                    <div className={`w-2 h-2 rounded-full ${investigation.aiMetadata.isValid ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'} shadow-[0_0_10px_rgba(52,211,153,0.5)]`} />
                                                    <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none">
                                                        {investigation.aiMetadata.isValid ? 'Threat Authenticated' : 'Anomaly Detected'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                                                <div className="md:col-span-1 space-y-3">
                                                    <div className="flex justify-between items-end">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Confidence Rating</p>
                                                        <p className="text-xl font-black text-white tracking-tight leading-none">{Math.round((investigation.aiMetadata.confidence || 0) * 100)}%</p>
                                                    </div>
                                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-1000 ${(investigation.aiMetadata.confidence || 0) > 0.8 ? 'bg-emerald-400' : (investigation.aiMetadata.confidence || 0) > 0.5 ? 'bg-amber-400' : 'bg-rose-400'}`} 
                                                            style={{ width: `${(investigation.aiMetadata.confidence || 0) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-3">AI Classification</p>
                                                    <p className="text-sm font-bold text-white uppercase tracking-wider">{investigation.aiMetadata.detectedThreat || 'Indeterminate Pattern'}</p>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-sm mb-8">
                                                <div className="flex gap-4">
                                                    <Terminal size={16} className="text-blue-400 mt-1 shrink-0" />
                                                    <p className="text-xs font-bold text-gray-400 leading-relaxed italic">"{investigation.aiMetadata.summary || 'Engine diagnostic complete. No verbal summary generated.'}"</p>
                                                </div>
                                            </div>

                                            {investigation.aiMetadata.extractedText && (
                                                <div className="pt-6 border-t border-white/10 flex flex-wrap gap-3">
                                                    {String(investigation.aiMetadata.extractedText).split(',').map((lead, idx) => (
                                                        <div key={idx} className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] font-black text-blue-300 uppercase tracking-widest flex items-center gap-2">
                                                            <Target size={12} /> {lead.trim()}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {investigation?.urlOrPhone && (
                                        <div className="p-6 bg-white border border-gray-100 rounded-[2rem] flex items-center gap-4">
                                            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                                                {String(investigation.urlOrPhone).includes('http') ? <Globe size={20} /> : <Phone size={20} />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Vector Entity</p>
                                                <p className="font-black text-gray-900 truncate uppercase text-[11px]">{investigation?.urlOrPhone || "N/A"}</p>
                                            </div>
                                        </div>
                                    )}
                                    {investigation?.ipAddress && (
                                        <div className="p-6 bg-white border border-gray-100 rounded-[2rem] flex items-center gap-4">
                                            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                                                <Activity size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">IP Source</p>
                                                <p className="font-mono text-gray-900 text-[11px] font-black">{investigation?.ipAddress || "0.0.0.0"}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="bg-white p-10 rounded-[3rem] border border-gray-100 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-3">
                                    <MapPin size={14} /> Geo-Spatial Intel
                                </h3>
                            </div>
                            <div className="h-[400px] rounded-[3rem] overflow-hidden border border-gray-100 shadow-inner">
                                {(() => {
                                    const lat = Number(investigation?.latitude);
                                    const lng = Number(investigation?.longitude);

                                    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
                                        return (
                                            <div className="h-full bg-gray-50 flex items-center justify-center text-gray-300">
                                                <div className="text-center">
                                                    <MapPin size={48} className="opacity-10 mx-auto mb-4" />
                                                    <p className="text-[10px] uppercase font-black tracking-widest">Location not available</p>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <MapContainer
                                            center={[lat, lng]}
                                            zoom={13}
                                            style={{ height: "400px" }}
                                            scrollWheelZoom={false}
                                            className="z-0"
                                        >
                                            <TileLayer
                                                attribution="© OpenStreetMap contributors"
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <Marker position={[lat, lng]} />
                                        </MapContainer>
                                    );
                                })()}
                            </div>
                        </section>

                        <EvidenceViewer
                            report={investigation}
                            onAddEvidence={() => fileInputRef.current?.click()}
                        />
                        <InvestigationTimeline report={investigation} />
                    </div>

                    {/* Right Column: Chat, Identity, Notes */}
                    <div className="space-y-10 lg:col-span-1">
                        {/* SLA MONITOR CARD */}
                        {slaData && (
                            <section className={`p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-600/5 relative overflow-hidden overflow-hidden ${slaData.bg} border-${slaData.color.split('-')[1]}-200/50`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 blur-[50px] rounded-full -mr-16 -mt-16" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-3 ${slaData.color}`}>
                                            <Clock size={16} /> SLA Monitor
                                        </h4>
                                        <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${slaData.bg} ${slaData.color} border border-current opacity-70`}>
                                            {slaData.status}
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <p className="text-2xl font-black tracking-tight text-gray-900 leading-none mb-2">
                                            {slaData.value}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide leading-relaxed">
                                            {slaData.message}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 pt-4 border-t border-gray-900/5 mt-2">
                                        <Calendar size={12} className="text-gray-400" />
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                            Deadline: {safeFormat(investigation.slaDeadline, 'MMM dd | HH:mm')}
                                        </span>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* WhatsApp style Chat on the right */}
                        {investigation?._id && (
                            <InvestigationChat reportId={investigation._id} currentUser={user} isClosed={isClosed || isReadOnly} />
                        )}

                        {/* CASE FINALIZATION DETAILS */}
                        {(investigation?.status === 'Case Closed' || investigation?.status === 'Rejected' || investigation?.status === 'Resolved with Fine' || investigation?.status === 'Payment Pending' || investigation?.paymentStatus === 'Completed') && (
                            <section className={`p-8 rounded-[3rem] text-white shadow-xl animate-in zoom-in-95 duration-500 ${(investigation?.status === 'Case Closed' || investigation?.paymentStatus === 'Completed')
                                ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-emerald-600/20'
                                : (investigation?.status === 'Resolved with Fine' || investigation?.status === 'Payment Pending' ? 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-600/20' : 'bg-gradient-to-br from-rose-600 to-rose-700 shadow-rose-600/20')
                                }`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white">
                                        {(investigation?.status === 'Case Closed' || investigation?.paymentStatus === 'Completed') ? <CheckCircle size={20} /> : (investigation?.status === 'Resolved with Fine' || investigation?.status === 'Payment Pending' ? <CreditCard size={20} /> : <AlertTriangle size={20} />)}
                                    </div>
                                    <h4 className="text-sm font-black uppercase tracking-widest">{investigation?.status === 'Payment Pending' ? 'Awaiting Payment' : 'Protocol Finalization'}</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Authorization Note</p>
                                        <p className="text-xs font-bold leading-relaxed italic">"{investigation?.resolution?.summary || (investigation?.status === 'Payment Pending' ? 'Investigation completed. Awaiting payment from citizen to close the case.' : 'Dossier finalized by sector command.')}"</p>
                                    </div>

                                    {(investigation?.fineAmount > 0 || investigation?.paymentAmount > 0) && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Penalty / Fee</p>
                                                <p className="text-lg font-black tracking-tight">₹{investigation.paymentAmount || investigation.fineAmount}</p>
                                            </div>
                                            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Fee Status</p>
                                                <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${investigation.paymentStatus === 'Completed' || investigation.paymentStatus === 'Paid' ? 'bg-emerald-300' : 'bg-amber-300 animate-pulse'}`} />
                                                    {investigation.paymentStatus}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {investigation?.transactionId && (
                                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Transaction Link</p>
                                            <p className="text-[10px] font-mono font-black break-all">{investigation.transactionId}</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-600/5 overflow-hidden group">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-8 flex items-center gap-3">
                                <Maximize2 size={12} /> Origin_Identity
                            </h4>
                            <div className="flex items-center gap-6 mb-8 relative z-10">
                                <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-2xl font-black text-blue-600 shadow-inner">
                                    {String(investigation?.createdBy?.name || 'C').charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xl font-semibold text-gray-900 truncate tracking-tight uppercase leading-none mb-1">{investigation?.createdBy?.name || 'ANONYMOUS'}</p>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none italic">Verified Reporter</p>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-gray-50 flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-gray-400">Node ID</span>
                                <span className="text-gray-700 font-mono">#{investigation?.createdBy?._id?.slice(-8).toUpperCase() || 'VOID'}</span>
                            </div>
                        </div>

                        {/* Official Remarks (Notes) at the bottom of the right column */}
                        <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-600/5 relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-3">
                                    <Activity size={14} /> Mission Log
                                </h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-mono italic">Recording</span>
                                </div>
                            </div>

                            <div className="space-y-6 mb-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {Array.isArray(investigation?.investigationNotes) && investigation.investigationNotes.length > 0 ? investigation.investigationNotes.map((n, idx) => (
                                    <div key={idx} className="p-6 bg-gray-50/50 border border-gray-100 rounded-[2rem] relative shadow-inner">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black">
                                                {String(n?.addedBy?.name || 'O').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-900 uppercase tracking-widest italic leading-none mb-1">{n?.addedBy?.name || 'Officer'}</p>
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">{safeFormat(n?.createdAt, 'MMM dd | HH:mm')}</p>
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-gray-700 font-bold leading-relaxed italic pr-2">"{n?.note || 'Log entry corrupted'}"</p>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 bg-gray-50 border border-gray-100 rounded-[2rem]">
                                        <p className="text-gray-300 font-black text-[9px] uppercase tracking-widest italic">No log entries</p>
                                    </div>
                                )}
                            </div>

                            {!isClosed && !isReadOnly && (
                                <form onSubmit={handleAddNote} className="relative mt-8 group">
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Add tactical log entry..."
                                        className="w-full px-6 py-6 bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-200 rounded-[1.5rem] outline-none text-[10px] font-bold text-gray-700 uppercase tracking-widest transition-all shadow-inner resize-none min-h-[120px] placeholder:text-gray-200"
                                    />
                                    <button
                                        type="submit"
                                        disabled={submitting || !note.trim()}
                                        className="absolute bottom-4 right-4 p-3 bg-blue-600 text-white rounded-[1rem] hover:bg-blue-700 transition-all shadow-lg"
                                    >
                                        <Send size={16} />
                                    </button>
                                </form>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
            `}} />
        </MainLayout>
    );
};

export default ReportDetail;
