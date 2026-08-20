import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import {
    Shield,
    Activity,
    Target,
    Zap,
    Search,
    Lock,
    Cpu,
    Target as TargetIcon,
    Layers,
    UserCheck,
    ShieldCheck,
    ChevronRight,
    MousePointer2,
    ShieldAlert,
    Clock,
    Globe,
    AlertCircle
} from 'lucide-react';

const About = () => {
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

            <PublicNavbar />

            {/* 1. HERO SECTION */}
            <section className="relative pt-48 pb-20 overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0F172A]">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="text-left space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-400/30">
                            <ShieldCheck size={14} className="text-blue-300" />
                            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-[0.2em]">Operational Guide</span>
                        </div>

                        <h1 className="text-2xl md:text-4xl font-semibold text-white leading-tight">
                            About Cyber Threat <br />
                            Reporting & Monitoring
                        </h1>

                        <p className="text-base text-blue-100/80 leading-relaxed max-w-xl font-medium">
                            A highly-resilient digital infrastructure designed to bridge the gap between citizen vigilance and rapid tactical response. We are defining the future of decentralized cyber-security monitoring.
                        </p>
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
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. PROBLEM & OBJECTIVE */}
            <section className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="bg-blue-50/50 rounded-[2rem] p-10 border border-blue-100 shadow-sm space-y-6">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                                <AlertCircle size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Problem Statement</h2>
                            <p className="text-slate-600 text-base leading-relaxed font-medium">
                                Traditional threat reporting mechanisms suffer from high latency, regional silos, and manual routing inefficiencies. This delay often results in critical resolution windows being missed, leaving vulnerabilities exposed across jurisdictional boundaries.
                            </p>
                        </div>
                        <div className="bg-blue-50/50 rounded-[2rem] p-10 border border-blue-100 shadow-sm space-y-6">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                                <Shield size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">System Objective</h2>
                            <p className="text-slate-600 text-base leading-relaxed font-medium">
                                Our platform centralizes threat intelligence through an autonomous, zone-based routing engine. By geolocating incident signals in real-time and balancing workloads across authorized officer nodes, we ensure every signal is triaged and resolved with absolute transparency.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. CORE FEATURES */}
            <section className="py-24 bg-slate-50/50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl font-bold text-slate-900">Core Capabilities</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">Integrated tools for multi-zone surveillance and localized threat mitigation.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: "Live Tracking", desc: "Real-time surveillance of threat incident signals with precise telemetry.", icon: Activity, img: "/images/live_tracking_viz_1772471769869.png" },
                            { title: "Zone Assignment", desc: "Autonomous allocation of reports to relevant departmental zones based on GPS.", icon: Layers, img: "/images/zone_detection_viz_3d_1772471797200.png" },
                            { title: "Investigation", desc: "Comprehensive tools for security officials to process and resolve threats.", icon: Search, img: "/images/digital_investigation_viz_1772471915417.png" },
                            { title: "Broadcast Notification", desc: "Immediate dissemination of security alerts to authorized personnel via secure channels.", icon: Zap, img: "/images/secure_broadcast_viz_1772472313304.png" }
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-white rounded-3xl shadow-xl border border-blue-100 p-2 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group flex flex-col h-full">
                                <div className="relative h-40 rounded-2xl overflow-hidden mb-6">
                                    <img src={feature.img} alt={feature.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-blue-900/40 group-hover:bg-blue-900/20 transition-all"></div>
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl text-blue-600 shadow-xl">
                                        <feature.icon size={18} />
                                    </div>
                                </div>
                                <div className="px-6 pb-6 flex-grow">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed font-bold">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. SYSTEM WORKFLOW VISUAL */}
            <section className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-16">How the System Works</h2>

                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative">
                        <div className="hidden lg:block absolute top-[45px] left-0 w-full h-0.5 bg-blue-100 -z-0"></div>

                        {[
                            { num: "1", title: "Citizen Reports Threat", desc: "Incidents submitted via encrypted portals.", icon: MousePointer2 },
                            { num: "2", title: "System Detects Zone", icon: TargetIcon, desc: "AI logic identifies target geo-zone." },
                            { num: "3", title: "Officer Assigned", icon: UserCheck, desc: "Signal routed to nearest available unit." },
                            { num: "4", title: "Investigation Process", icon: Activity, desc: "Active field investigation and logging." },
                            { num: "5", title: "Case Resolution", icon: ShieldCheck, desc: "Verified resolution and telemetry sync." }
                        ].map((step, idx) => (
                            <div key={idx} className="relative z-10 w-full lg:w-48 group">
                                <div className="bg-blue-50/50 rounded-3xl p-8 text-center border border-blue-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:bg-white">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold mb-6 mx-auto shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                        {step.num}
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-tight">{step.title}</h3>
                                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{step.desc}</p>
                                </div>
                                {idx < 4 && (
                                    <div className="lg:hidden w-1 h-8 bg-blue-100 mx-auto my-4"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* 6. SECURITY & TRANSPARENCY */}
            <section className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold text-slate-900 leading-tight">Security & Operational Transparency</h2>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                We maintain a zero-trust architecture to protect sensitive incident data and personal citizen information. Every investigative step is cryptographically audited and logged.
                            </p>
                            <div className="space-y-6">
                                {[
                                    { title: "AES-256 Encryption", desc: "Military-grade encryption for all incident signal telemetry.", icon: Lock },
                                    { title: "Real-time Auditing", desc: "Live dashboard tracking of officer response nodes.", icon: Clock }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-4 p-6 bg-slate-50 border border-slate-100 rounded-3xl transition-all hover:border-blue-200">
                                        <div className="shrink-0 w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600">
                                            <item.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                                            <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-blue-600/5 rounded-[3rem] -rotate-3 group-hover:rotate-0 transition-transform duration-700"></div>
                            <div className="relative bg-white p-12 rounded-[3.5rem] border border-blue-50 shadow-2xl space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-slate-900">Protocol Compliance</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Active Security Node</p>
                                    </div>
                                    <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl shadow-sm border border-emerald-100">
                                        <ShieldCheck size={28} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: "Data Integrity", status: "VERIFIED", color: "emerald" },
                                        { label: "Audit Trail", status: "100% TRACEABLE", color: "emerald" },
                                        { label: "Uplink Status", status: "STABLE", color: "blue" }
                                    ].map((stat, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">{stat.label}</span>
                                            <span className={`text-[10px] font-black text-${stat.color}-600 tracking-widest`}>{stat.status}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 w-4/5 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
};

export default About;
