import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ShieldCheck,
    FileText,
    Activity,
    ShieldAlert,
    Search,
    Lock,
    Cpu,
    Target,
    Zap,
    Globe,
    UserCheck,
    Layers,
    ChevronRight,
    MousePointer2,
    MapPin,
    RefreshCcw
} from 'lucide-react';

const Home = () => {
    const [selectedZone, setSelectedZone] = useState(null);

    const getZoomStyle = () => {
        if (!selectedZone) return 'scale-100 translate-x-0 translate-y-0';
        switch (selectedZone) {
            case 'North Zone': return 'scale-[2.2] translate-x-[25%] translate-y-[25%]';
            case 'South Zone': return 'scale-[2.2] -translate-x-[25%] -translate-y-[25%]';
            case 'East Zone': return 'scale-[2.2] -translate-x-[25%] translate-y-[25%]';
            case 'West Zone': return 'scale-[2.2] translate-x-[25%] -translate-y-[25%]';
            case 'Central Zone': return 'scale-[2.2] translate-y-[30%]';
            default: return 'scale-100';
        }
    };
    return (
        <div className="min-h-screen bg-white text-slate-800 selection:bg-blue-500/30 overflow-x-hidden font-sans">
            <style>
                {`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                `}
            </style>

            <nav className="fixed top-0 left-0 w-full z-[100] py-6 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-100 italic">
                            <ShieldAlert className="text-white" size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-slate-900 tracking-tight italic uppercase leading-none">CyberGuard</span>
                            <span className="text-[8px] font-bold text-blue-600 uppercase tracking-widest mt-1">Admin Command Hub</span>
                        </div>
                    </Link>
                    <div className="flex items-center gap-8">
                        <Link to="/login">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                                Command Login
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-20 overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0F172A]">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="text-left space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-400/30">
                            <ShieldCheck size={14} className="text-blue-300" />
                            <span className="text-xs font-medium text-blue-200 uppercase tracking-widest">Protocol V4.0 Command</span>
                        </div>

                        <h1 className="text-2xl md:text-5xl font-semibold text-white leading-tight">
                            Secure Incident <br />
                            Control & Orchestration
                        </h1>

                        <p className="text-base text-blue-100 leading-relaxed max-w-xl">
                            The centralized intelligence matrix for modern security personnel. Monitor, analyze, and dispatch localized response units across all operational zones in real-time.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                            <Link to="/login">
                                <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-10 py-5 transition hover:scale-105 flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-sm shadow-xl shadow-blue-500/20 active:scale-95">
                                    Initialize Uplink <Zap size={18} />
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className="relative flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-8 duration-1000">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-72 h-72 bg-blue-500/20 blur-3xl rounded-full"></div>
                        <div className="relative animate-float">
                            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 shadow-2xl">
                                <svg width="240" height="240" viewBox="0 0 100 100" className="drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                                    <defs>
                                        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                                            <stop offset="100%" style={{ stopColor: '#1e3a8a', stopOpacity: 1 }} />
                                        </linearGradient>
                                    </defs>
                                    <path d="M50 10 L85 25 V50 C85 75 50 90 50 90 C50 90 15 75 15 50 V25 L50 10 Z" fill="url(#shieldGrad)" />
                                    <path d="M50 20 L75 30 V50 C75 70 50 80 50 80 C50 80 25 70 25 50 V30 L50 20 Z" fill="white" opacity="0.1" />
                                    <circle cx="50" cy="50" r="15" stroke="white" strokeWidth="2" fill="none" opacity="0.5" />
                                    <path d="M40 50 L47 57 L60 43" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                </svg>
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-blue-50 flex items-center gap-3 animate-float" style={{ animationDelay: '1s' }}>
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <Activity size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</p>
                                    <p className="text-xs font-bold text-slate-800">Nodes Active</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Cards Section */}
            <section className="py-24 max-w-6xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl font-bold text-slate-900">Command Capabilities</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">High-fidelity instrumentation for monitoring and managing national security infrastructures.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { title: "Active Monitoring", desc: "Live node surveillance across all detected geographical zones.", icon: Globe, img: "/images/live_tracking_viz_1772471769869.png" },
                        { title: "Rapid Response", desc: "Average threat resolution orchestrated in under 10 minutes.", icon: Activity, img: "/images/digital_investigation_viz_1772471915417.png" },
                        { title: "Encrypted Uplink", desc: "AES-256 standard encryption for all administrative command signals.", icon: Lock, img: "/images/workflow_step_1_reported_1772472348486.png" },
                        { title: "Resource Balancing", desc: "Automated workload distribution for active response units.", icon: Target, img: "/images/zone_detection_viz_3d_1772471797200.png" }
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-white rounded-3xl shadow-xl border border-blue-100 p-2 overflow-hidden transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl group flex flex-col h-full">
                            <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
                                <img src={feature.img} alt={feature.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-blue-900/40 group-hover:bg-blue-900/20 transition-all"></div>
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl text-blue-600 shadow-xl">
                                    <feature.icon size={20} />
                                </div>
                            </div>
                            <div className="px-6 pb-6 flex-grow">
                                <h3 className="text-lg font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works Section */}
            <section className="bg-blue-50 py-24">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl font-bold text-slate-900">Operational Flow</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto font-medium">Unified response protocols from signal detection to absolute resolution.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: "1", title: "Signal Detection", desc: "Ingesting high-fidelity incident reports from encrypted citizen portals.", icon: Radio },
                            { step: "2", title: "Tactical Allocation", desc: "Zone-based routing logic identifies and notifies relevant Tactical Response Units.", icon: Target },
                            { step: "3", title: "Global Sync", desc: "Real-time telemetry and status updates synchronized across the command hub.", icon: Zap }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition group relative">
                                <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mb-6 shadow-lg shadow-blue-500/30">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                                <div className="mt-8 flex items-center text-blue-600 font-bold text-xs uppercase tracking-wider group-hover:translate-x-1 transition-transform cursor-default">
                                    View Protocol <ChevronRight size={14} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100 mb-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Global Command Intelligence</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 tracking-tight">Zone-Based Monitoring Network</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed italic border-l-2 border-blue-100 pl-4 ml-auto mr-auto">"Our operational matrix provides real-time surveillance across five tactical sectors. Click a zone to investigate localized telemetry."</p>
                    </div>

                    <div className="group relative">
                        {/* Background Radial Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[120%] h-[120%] bg-blue-400/5 blur-[120px] rounded-full transition-opacity duration-1000"></div>

                        {/* Reset Zoom Control */}
                        {selectedZone && (
                            <button
                                onClick={() => setSelectedZone(null)}
                                className="absolute top-8 right-8 z-50 bg-white shadow-2xl border border-blue-100 px-6 py-3 rounded-full text-blue-600 font-bold text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-blue-50 transition-all hover:scale-105 active:scale-95"
                            >
                                <RefreshCcw size={14} className="animate-spin-slow" /> Reset Command View
                            </button>
                        )}

                        <div className="bg-gradient-to-br from-blue-50 to-white rounded-[4rem] shadow-2xl border border-blue-100 p-12 md:p-24 relative overflow-hidden min-h-[600px] flex items-center justify-center">
                            {/* Simulated Grid Lines */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#1e3a8a_2px,transparent_2px)] [background-size:60px_60px]"></div>

                            {/* Circular Network Visualization */}
                            <div className={`relative w-full h-[400px] flex items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${getZoomStyle()}`}>

                                {/* Central Hub Node */}
                                <div
                                    onClick={() => setSelectedZone('Central Zone')}
                                    className={`z-30 cursor-pointer p-8 rounded-[2rem] shadow-2xl relative transition-all duration-500 
                                        ${selectedZone === 'Central Zone' ? 'bg-blue-600 scale-125' : 'bg-slate-900 group-hover:scale-110'}`}
                                >
                                    <Globe size={40} className="text-white" />
                                    <div className="absolute -inset-6 bg-blue-500/20 rounded-full animate-ping -z-10"></div>
                                    <div className="absolute -inset-10 border border-blue-400/20 rounded-full -z-10 animate-spin-slow"></div>
                                </div>

                                {/* Floating Zone Cards */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative w-full h-full max-w-xl max-h-xl">
                                        {[
                                            { name: "North Zone", pos: "top-0 left-0", iconColor: "text-blue-600" },
                                            { name: "South Zone", pos: "bottom-0 right-0", iconColor: "text-blue-600" },
                                            { name: "East Zone", pos: "top-0 right-0", iconColor: "text-blue-600" },
                                            { name: "West Zone", pos: "bottom-0 left-0", iconColor: "text-blue-600" },
                                        ].map((zone, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => setSelectedZone(zone.name)}
                                                className={`absolute ${zone.pos} transition-all duration-700 cursor-pointer ${selectedZone === zone.name ? 'scale-150 z-50' : selectedZone ? 'opacity-20 blur-sm scale-75' : 'hover:-translate-y-4 hover:scale-110'}`}
                                            >
                                                <div className="relative group/card">
                                                    <div className={`absolute -inset-6 rounded-full animate-pulse blur-2xl transition-colors ${selectedZone === zone.name ? 'bg-blue-500/30' : 'bg-blue-400/5'}`}></div>
                                                    <div className={`relative bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(30,58,138,0.12)] px-8 py-5 text-lg font-bold border border-blue-100 flex items-center gap-4 transition-all ${selectedZone === zone.name ? 'ring-4 ring-blue-500/20 border-blue-500' : ''}`}>
                                                        <div className={`w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center ${zone.iconColor}`}>
                                                            <MapPin size={20} fill="currentColor" fillOpacity="0.2" />
                                                        </div>
                                                        <span className="text-slate-800 whitespace-nowrap">{zone.name}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* High-Tech SVG Connection Lines */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" viewBox="0 0 400 400">
                                    <circle cx="200" cy="200" r="180" stroke="#1e3a8a" strokeWidth="0.5" fill="none" strokeDasharray="10 10" />
                                    <circle cx="200" cy="200" r="100" stroke="#1e3a8a" strokeWidth="0.5" fill="none" strokeDasharray="10 10" />
                                    <line x1="200" y1="200" x2="0" y2="0" stroke="#1e3a8a" strokeWidth="1" strokeDasharray="4 4" />
                                    <line x1="200" y1="200" x2="400" y2="400" stroke="#1e3a8a" strokeWidth="1" strokeDasharray="4 4" />
                                    <line x1="200" y1="200" x2="400" y2="0" stroke="#1e3a8a" strokeWidth="1" strokeDasharray="4 4" />
                                    <line x1="200" y1="200" x2="0" y2="400" stroke="#1e3a8a" strokeWidth="1" strokeDasharray="4 4" />
                                </svg>
                            </div>

                            {/* Zone Infor Overlay (Only when selected) */}
                            {selectedZone && (
                                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-sm">
                                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-3xl text-center">
                                        <p className="text-blue-400 font-bold uppercase tracking-widest text-[10px] mb-2">Live Node Investigation</p>
                                        <h4 className="text-2xl font-bold text-white mb-2 italic">Scanning: {selectedZone}</h4>
                                        <div className="flex justify-center gap-4 mb-4">
                                            <div className="flex items-center gap-2 text-blue-200 text-[10px]">
                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span> 14 Nodes Online
                                            </div>
                                            <div className="flex items-center gap-2 text-blue-200 text-[10px]">
                                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Stable Sync
                                            </div>
                                        </div>
                                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">Download Zone Report</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW SECTION 2: THREAT INVESTIGATION WORKFLOW */}
            <section className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl font-bold text-slate-900">Threat Investigation Workflow</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed text-sm">A transparent, audited sequence for every reported incident signal from ingestion to absolute resolution.</p>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative">
                        {/* Desktop Connector Lines */}
                        <div className="hidden lg:block absolute top-[40%] left-0 w-full h-0.5 bg-blue-100 -z-0"></div>

                        {[
                            { num: "1", title: "Threat Reported", icon: MousePointer2, desc: "Incidents submitted via encrypted portal.", img: "/images/workflow_step_1_reported_1772472348486.png" },
                            { num: "2", title: "Zone Detection", icon: Target, desc: "AI logic identifies target geo-zone.", img: "/images/workflow_step_2_detected_1772472382748.png" },
                            { num: "3", title: "Officer Assigned", icon: UserCheck, desc: "Signal routed to nearest available unit.", img: "/images/secure_broadcast_viz_1772472313304.png" },
                            { num: "4", title: "In Progress", icon: Activity, desc: "Active field investigation and logging.", img: "/images/digital_investigation_viz_1772471915417.png" },
                            { num: "5", title: "Case Resolved", icon: ShieldCheck, desc: "Verified resolution and telemetry sync.", img: "/images/live_tracking_viz_1772471769869.png" }
                        ].map((step, idx) => (
                            <div key={idx} className="relative z-10 w-full lg:w-56 group mt-10">
                                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-3">
                                    <div className="h-32 w-full relative">
                                        <img src={step.img} alt={step.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
                                        <div className="absolute top-4 left-4 w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xl shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                            {step.num}
                                        </div>
                                    </div>
                                    <div className="p-6 text-center">
                                        <h3 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-tight">{step.title}</h3>
                                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                                {idx < 4 && (
                                    <div className="hidden lg:block absolute top-[45px] -right-4 translate-x-1/2 w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-400 z-20">
                                        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                )}
                                {idx < 4 && (
                                    <div className="lg:hidden w-1 h-8 bg-blue-100 mx-auto my-4"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* BOTTOM NAVY DECORATIVE SECTION */}
            <div className="relative py-24 bg-white overflow-hidden">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="relative p-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
                </div>

                {/* Navy Blue Shadow/Gradient at the absolute bottom */}
                <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-slate-900 via-blue-900/20 to-transparent pointer-events-none"></div>

                <div className="max-w-6xl mx-auto px-6 text-center mt-20">
                    <div className="inline-block p-4 rounded-3xl bg-slate-900 text-white shadow-2xl shadow-blue-900/40 transform hover:-translate-y-2 transition-all duration-500 relative z-20">
                        <div className="flex items-center gap-6 px-4">
                            <div className="flex flex-col text-left">
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em]">Operational_Status</span>
                                <span className="text-sm font-bold italic tracking-tight">GLOBAL COMMAND HUB: OPTIMAL</span>
                            </div>
                            <div className="w-10 h-10 rounded-full border-2 border-green-500/30 flex items-center justify-center">
                                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="py-12 text-center bg-white border-t border-gray-100 relative z-10">
                <p className="text-[10px] font-bold uppercase text-slate-300 tracking-[0.5em] italic">
                    &copy; 2026 CYBER_GUARD_GLOBAL_DEFS_CORP
                </p>
            </footer>
        </div >
    );
};

export default Home;

