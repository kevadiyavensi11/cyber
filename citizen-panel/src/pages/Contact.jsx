import React, { useState } from 'react';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Send,
    Loader2,
    CheckCircle2,
    MessageCircle,
    Globe,
    ShieldCheck,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    ShieldAlert,
    Target,
    Activity,
    Search,
    UserCheck,
    Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Contact = () => {
    const [status, setStatus] = useState('idle'); // idle, loading, success
    const [activeFaq, setActiveFaq] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('loading');

        // Simulating form submission - Keeping logic same
        setTimeout(() => {
            setStatus('success');
            toast.success('Your message has been sent successfully.');
            setTimeout(() => setStatus('idle'), 3000);
        }, 1500);
    };

    const faqs = [
        {
            q: "How to submit a complaint?",
            a: "Navigate to the 'Report Threat' section from your dashboard, fill in the incident details, upload any evidence, and click submit. Our system will geolocate the threat and assign it to the relevant zone automatically."
        },
        {
            q: "How to track investigation status?",
            a: "Log in to your citizen portal and visit the 'Track Incidents' page. You can see the real-time status of your report, including which officer is assigned and the current investigation stage."
        },
        {
            q: "How zone assignment works?",
            a: "Our system uses advanced geospatial intelligence to identify the origin of the threat. Based on the coordinates or region identified, the report is instantly routed to the localized Cyber Response Center (CRC) for that specific zone."
        },
        {
            q: "How notifications are received?",
            a: "You will receive real-time updates through your dashboard notifications. Additionally, for critical milestones, encrypted signals are transmitted to your registered contact channel."
        }
    ];

    const zones = [
        { name: "North Zone", officer: "DCP Rajesh Varma", contact: "+91 91234 56701", address: "Sector 12, Northern Cyber Hub, Ahmedabad 380012", x: "25%", y: "25%" },
        { name: "South Zone", officer: "ACP Neha Sharma", contact: "+91 91234 56702", address: "Tech Tower, Southern CRC, Surat 395007", x: "75%", y: "75%" },
        { name: "East Zone", officer: "DCP Amit Patel", contact: "+91 91234 56703", address: "Digital Park, Eastern Node, Vadodara 390001", x: "75%", y: "25%" },
        { name: "West Zone", officer: "ACP S. Krishnan", contact: "+91 91234 56704", address: "Coastal Security Wing, Rajkot 360001", x: "25%", y: "70%" },
        { name: "Central Zone", officer: "CP Vijay Mehta", contact: "+91 91234 56705", address: "Secretariat Main, Gandhinagar 382010", x: "50%", y: "50%" }
    ];

    return (
        <div className="min-h-screen bg-[#f0f7ff] text-slate-800 selection:bg-blue-500/30 overflow-x-hidden font-sans">
            <style>
                {`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                    50% { box-shadow: 0 0 20px 10px rgba(239, 68, 68, 0.2); }
                }
                .animate-pulse-glow {
                    animation: pulse-glow 2s infinite;
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .text-gradient {
                    background: linear-gradient(to right, #60a5fa, #2563eb);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                `}
            </style>

            <PublicNavbar />

            {/* 1. HERO SECTION */}
            <section className="relative pt-48 pb-24 overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0F172A]">
                {/* Background Decor */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/40 blur-[120px] rounded-full"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 rounded-full border border-blue-400/20 shadow-inner">
                            <ShieldCheck size={14} className="text-blue-400" />
                            <span className="text-[10px] font-semibold text-blue-300 uppercase tracking-[0.2em]">Operational Support</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-tight leading-[1.1]">
                            24/7 Cyber <br />
                            <span className="text-blue-400">Support & Assistance</span>
                        </h1>
                        <p className="text-lg text-blue-100/70 max-w-xl font-medium leading-relaxed">
                            Our dedicated cyber response team is standing by to assist with identity protection, threat analysis, and rapid incident resolution.
                        </p>
                    </div>

                    <div className="relative flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-8 duration-1000">
                        <div className="relative animate-float">
                            {/* Visual Illustration: Support Node */}
                            <div className="bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden group">
                                <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                                <svg width="280" height="280" viewBox="0 0 100 100" className="drop-shadow-[0_10px_30px_rgba(59,130,246,0.5)]">
                                    <defs>
                                        <linearGradient id="supportGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
                                            <stop offset="100%" style={{ stopColor: '#1d4ed8', stopOpacity: 1 }} />
                                        </linearGradient>
                                    </defs>
                                    <circle cx="50" cy="50" r="40" fill="white" opacity="0.05" />
                                    <circle cx="50" cy="50" r="30" stroke="url(#supportGrad)" strokeWidth="0.5" fill="none" opacity="0.5" />

                                    {/* Rotating Elements */}
                                    <g className="animate-spin-slow" style={{ transformOrigin: 'center', animation: 'spin 20s linear infinite' }}>
                                        <circle cx="80" cy="50" r="4" fill="#60a5fa" />
                                        <circle cx="20" cy="50" r="4" fill="#2563eb" />
                                    </g>

                                    {/* Central Headset/Support Icon Style */}
                                    <path d="M50 30 C35 30 25 40 25 55 V70 H35 V55 C35 48 40 45 45 45 C50 45 50 45 55 45 C60 45 65 48 65 55 V70 H75 V55 C75 40 65 30 50 30" fill="url(#supportGrad)" />
                                    <rect x="30" y="60" width="10" height="15" rx="2" fill="white" opacity="0.8" />
                                    <rect x="60" y="60" width="10" height="15" rx="2" fill="white" opacity="0.8" />
                                    <path d="M45 75 L55 75" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-500/20 blur-2xl rounded-full"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. CONTACT FORM SECTION */}
            <section className="py-24 relative overflow-hidden bg-transparent">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                        {/* 3. CONTACT INFO SIDE */}
                        <div className="lg:col-span-5 space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000 delay-200">
                            <div>
                                <h2 className="text-3xl font-semibold text-white bg-blue-600 px-6 py-3 rounded-xl inline-block mb-6 shadow-2xl">Contact Information</h2>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    Direct channels for verified communication with the Cyber Intelligence Department.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                                {[
                                    { icon: MapPin, title: "Head Office Location", value: "Secretariat Complex, Gandhinagar, Gujarat - 382010", accent: "blue" },
                                    { icon: Phone, title: "Cyber Helpline Number", value: "+1-800-CYBER-G (24/7)", accent: "emerald" },
                                    { icon: Mail, title: "Official Email", value: "ops.center@cyberguard.gov", accent: "purple" },
                                    { icon: Clock, title: "Working Hours", value: "Digital Surveillance: 24/7 | Office: 09:00 - 18:00", accent: "sky" }
                                ].map((card, i) => (
                                    <div key={i} className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-100">
                                        <div className="flex items-start gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-300">
                                                <card.icon size={22} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1.5">{card.title}</h4>
                                                <p className="text-slate-900 font-semibold leading-relaxed">{card.value}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* FORM SIDE */}
                        <div className="lg:col-span-7">
                            <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-2xl border border-blue-100 relative overflow-hidden group animate-in fade-in slide-in-from-right-8 duration-1000 delay-400">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -z-10"></div>

                                <div className="flex items-center gap-5 mb-10">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                        <MessageCircle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-semibold text-white">Direct Inquiries</h3>
                                        <p className="text-sm text-slate-400 font-semibold tracking-tight mt-1 uppercase">Encrypted Connection Established</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-slate-700 ml-1 uppercase tracking-tight">Full Name</label>
                                            <div className="relative group/input">
                                                <UserCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-base font-medium text-slate-900 placeholder:text-slate-400"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-slate-700 ml-1 uppercase tracking-tight">Email Address</label>
                                            <div className="relative group/input">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" size={18} />
                                                <input
                                                    type="email"
                                                    required
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-base font-medium text-slate-900 placeholder:text-slate-400"
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-slate-700 ml-1 uppercase tracking-tight">Subject</label>
                                        <div className="relative group/input">
                                            <Target className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" size={18} />
                                            <input
                                                type="text"
                                                required
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-base font-medium text-slate-900 placeholder:text-slate-400"
                                                placeholder="Request for investigation update"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-slate-700 ml-1 uppercase tracking-tight">Message Intelligence</label>
                                        <div className="relative group/input">
                                            <textarea
                                                required
                                                rows={5}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] px-8 py-6 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-base font-medium text-slate-900 resize-none leading-relaxed placeholder:text-slate-400"
                                                placeholder="Provide detailed description of your inquiry..."
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-base font-semibold transition-all shadow-xl group/btn ${status === 'loading'
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-blue-500/30 hover:-translate-y-1 active:scale-[0.98]'
                                            }`}
                                    >
                                        {status === 'loading' ? (
                                            <>
                                                <span>TRANSMITTING...</span>
                                                <Loader2 className="animate-spin" size={20} />
                                            </>
                                        ) : status === 'success' ? (
                                            <>
                                                <span>TRANSMISSION SUCCESS</span>
                                                <CheckCircle2 size={20} />
                                            </>
                                        ) : (
                                            <>
                                                <span className="tracking-widest capitalize">Send Message</span>
                                                <Send className="group-hover/btn:translate-x-1 transition-transform" size={20} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. ZONE LOCATION & SUPPORT UNITS SECTION */}
            {/* 4. ZONE LOCATION & SUPPORT UNITS SECTION - REPLACED MAP WITH STRUCTURED GRID */}
            <section className="py-24 bg-transparent relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16 space-y-4">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 mb-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em]">Network Topology</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-semibold text-slate-900 tracking-tight">Regional Response Centers</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                            Localized tactical command nodes providing 24/7 technical assistance and field investigation support across all operational sectors.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {zones.map((zone, i) => (
                            <div key={i} className="group bg-white rounded-[2.5rem] p-8 border border-blue-50 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-200 relative overflow-hidden">
                                {/* Decorative Gradient */}
                                <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/5 rounded-full group-hover:scale-[3] transition-transform duration-700"></div>
                                
                                <div className="flex items-start justify-between mb-8 relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-[#1e293b] text-white flex items-center justify-center shadow-lg group-hover:bg-blue-600 transition-colors">
                                        <Target size={24} />
                                    </div>
                                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[9px] font-bold uppercase tracking-widest">
                                        Active Node
                                    </div>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">{zone.name}</h3>
                                        <p className="text-[11px] text-blue-600 font-bold uppercase tracking-[0.2em] mt-1">Cyber Intelligence Div.</p>
                                    </div>

                                    <div className="pt-6 space-y-4 border-t border-slate-50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Office Address</p>
                                                <p className="text-sm font-semibold text-slate-700">{zone.address}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                                <UserCheck size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Commanding Officer</p>
                                                <p className="text-sm font-semibold text-slate-700">{zone.officer}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                                                <Phone size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] opacity-70 font-bold uppercase tracking-widest">Zone Helpline</p>
                                                <p className="text-sm font-bold tracking-tight">{zone.contact}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 bg-white/50 backdrop-blur-md rounded-[2.5rem] p-8 border border-blue-50 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <Activity size={24} className="animate-pulse" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Total Network Coverage</h4>
                                <p className="text-xs text-slate-500">100% of regional zones are under active cyber surveillance.</p>
                            </div>
                         </div>
                         <div className="h-10 w-[1px] bg-slate-200 hidden md:block"></div>
                         <div className="text-center md:text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">Last Sync Status</p>
                            <p className="text-sm font-bold text-blue-600">ALL COMMAND NODES OPERATIONAL</p>
                         </div>
                    </div>
                </div>
            </section>

            {/* 5. EMERGENCY SUPPORT SECTION - UPDATED WITH #2D4A9D */}
            <section className="py-24 relative px-6">
                <div className="max-w-6xl mx-auto rounded-[3.5rem] bg-gradient-to-br from-[#2D4A9D] via-[#3b5eb8] to-[#2D4A9D] p-12 md:p-20 relative overflow-hidden group shadow-[0_20px_60px_rgba(45,74,157,0.4)] border border-white/10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    {/* Background Decorative Elements */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -rotate-12 translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full translate-x-[-20%] translate-y-[20%]"></div>
                    
                    {/* Grid Pattern Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16 text-center lg:text-left">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/30 text-blue-400 mb-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Critical Alert Status</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-none">
                                Facing Active <br />
                                <span className="text-blue-500">Cyber Threat?</span>
                            </h2>
                            <p className="text-blue-100/60 max-w-xl text-lg font-medium leading-relaxed">
                                Immediate tactical escalation available for live attacks, phishing incidents, and system intrusions. Our response units are active 24/7.
                            </p>
                        </div>
                        
                        <div className="relative">
                            {/* Outer Glow */}
                            <div className="absolute inset-x-0 -inset-y-4 bg-blue-600/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                            
                            <Link to="/register">
                                <button className="relative px-12 py-7 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] flex flex-col items-center gap-2 text-xl font-bold tracking-widest shadow-[0_0_40px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-all hover:shadow-blue-600/60 group/btn overflow-hidden">
                                    <div className="flex items-center gap-4">
                                        REPORT EMERGENCY NOW
                                        <ShieldAlert size={28} className="group-hover/btn:rotate-12 transition-transform" />
                                    </div>
                                    <span className="text-[10px] opacity-60 font-medium tracking-[0.5em] mt-1">ELEVATED RESPONSE PROTOCOL</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. INVESTIGATION SUPPORT FLOW SECTION */}
            <section className="py-24 bg-transparent relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-3xl font-semibold text-slate-900 uppercase tracking-tighter">Investigation Support Flow</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed font-semibold lowercase opacity-70">Unified resolution protocol sequence Visualization.</p>
                    </div>

                    <div className="relative pt-12">
                        {/* Horizontal Stepper */}
                        <div className="hidden lg:block absolute top-[72px] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 relative z-10">
                            {[
                                { title: "Complaint Submitted", icon: Mail, desc: "Signal logged in secure vault.", active: true },
                                { title: "Zone Assigned", icon: Target, desc: "Autonomous geo-routing node." },
                                { title: "Officer Investigation", icon: Search, desc: "Deep forensic packet analysis." },
                                { title: "Case Progress Update", icon: Activity, desc: "Real-time telemetry heartbeat." },
                                { title: "Final Resolution", icon: ShieldCheck, desc: "Mission accomplished signal." }
                            ].map((step, i) => (
                                <div key={i} className="flex flex-col items-center text-center group">
                                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 transition-all duration-500 shadow-xl ${i === 0
                                        ? 'bg-blue-600 text-white shadow-blue-500/40 border-4 border-blue-50 scale-110'
                                        : 'bg-white text-slate-400 group-hover:text-blue-500 border border-slate-100'
                                        }`}>
                                        <step.icon size={28} />
                                    </div>
                                    <h4 className={`text-sm font-semibold uppercase tracking-tighter mb-2 ${i === 0 ? 'text-blue-600' : 'text-slate-900 opacity-80'}`}>{step.title}</h4>
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. FAQ SUPPORT SECTION */}
            <section className="py-24 bg-transparent">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Security FAQ Analysis</h2>
                        <p className="text-slate-500 font-semibold uppercase tracking-[0.2em] text-[10px]">Intelligence Repository & Procedural Data</p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${activeFaq === i ? 'border-blue-200 shadow-xl' : 'border-slate-100 shadow-sm hover:border-blue-100 hover:shadow-md'
                                    }`}
                            >
                                <button
                                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                    className="w-full px-8 py-6 flex items-center justify-between text-left group"
                                >
                                    <span className={`font-semibold transition-colors ${activeFaq === i ? 'text-blue-600' : 'text-slate-900'}`}>{faq.q}</span>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${activeFaq === i ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                                        {activeFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </button>
                                <div
                                    className={`px-8 transition-all duration-300 ease-in-out ${activeFaq === i ? 'max-h-[200px] py-6 border-t border-slate-50' : 'max-h-0 py-0'
                                        }`}
                                >
                                    <p className="text-slate-500 font-medium leading-relaxed leading-7">
                                        {faq.a}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
};

export default Contact;
