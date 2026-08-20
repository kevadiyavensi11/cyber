import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Send,
    Loader2,
    CheckCircle2,
    MessageCircle,
    ShieldCheck,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    ShieldAlert,
    Target,
    Activity,
    Search,
    UserCheck,
    Zap,
    Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
    const [status, setStatus] = useState('idle');
    const [activeFaq, setActiveFaq] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('loading');
        setTimeout(() => {
            setStatus('success');
            toast.success('Internal support ticket created successfully.');
            setTimeout(() => setStatus('idle'), 3000);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-white text-slate-800 selection:bg-blue-500/30 overflow-x-hidden font-sans">
            <section className="relative pt-40 pb-20 overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0F172A]">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-400/30">
                            <Shield size={14} className="text-blue-300" />
                            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Officer Helpdesk</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                            Command & Tactical <br />
                            <span className="text-blue-400">Support Assistance</span>
                        </h1>
                        <p className="text-base text-blue-100/70 max-w-lg font-medium leading-relaxed">
                            Reach out for technical assistance, field investigation support, or internal department reporting updates.
                        </p>
                    </div>
                    <div className="flex justify-center lg:justify-end">
                        <div className="p-8 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-2xl animate-float">
                            <ShieldCheck size={180} className="text-blue-400 opacity-80" />
                        </div>
                    </div>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-6 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-4 space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Command Centers</h2>
                            <p className="text-sm text-slate-500 font-medium">Verified department communication channels.</p>
                        </div>
                        <div className="space-y-4">
                            {[
                                { icon: Mail, title: "Department Support", val: "ops@cyberguard.gov" },
                                { icon: Phone, title: "Emergency Command line", val: "1930 / +1-1800-CYBER-HQ" },
                                { icon: MapPin, title: "Field Command HQ", val: "Surat Regional Headquarters" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-lg">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                                        <item.icon size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                        <p className="text-sm font-bold text-slate-800">{item.val}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-8">
                        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-blue-50">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                            placeholder="Your email"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                        placeholder="Inquiry type"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Message</label>
                                    <textarea
                                        required
                                        rows={4}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-medium resize-none"
                                        placeholder="Detailed inquiry content..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-white transition-all shadow-xl shadow-blue-500/20 ${status === 'loading' ? 'bg-slate-300' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:-translate-y-1'
                                        }`}
                                >
                                    {status === 'loading' ? 'Transmitting...' : 'Send Message'}
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Contact;
