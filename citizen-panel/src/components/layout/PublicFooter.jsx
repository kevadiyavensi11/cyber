import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Phone, MapPin, Globe, Twitter, Github, Linkedin, ShieldAlert } from 'lucide-react';

const PublicFooter = () => {
    return (
        <footer className="relative bg-[#0F172A] pt-24 pb-12 overflow-hidden text-white">
            {/* Ambient Background Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[150px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    {/* Brand Column */}
                    <div className="space-y-8">
                        <Link to="/" className="flex items-center gap-4 group">
                            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500 relative">
                                <ShieldAlert className="text-white relative z-10" size={24} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-semibold text-white tracking-tighter uppercase leading-none">Citizen Safety</span>
                                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider mt-1 leading-none">Official Portal</span>
                            </div>
                        </Link>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                            A modern digital infrastructure designed for efficient traffic monitoring and administrative transparency across Gujarat.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Github, Linkedin].map((Icon, idx) => (
                                <a key={idx} href="#" className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all group">
                                    <Icon size={18} className="group-hover:scale-110 transition-transform" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-10 border-l-2 border-blue-600 pl-4 leading-none">Quick Links</h4>
                        <ul className="space-y-5">
                            {[
                                { name: 'Home', path: '/' },
                                { name: 'About Us', path: '/about' },
                                { name: 'Support', path: '/contact' },
                                { name: 'Login', path: '/login' },
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link to={link.path} className="text-xs font-semibold text-slate-400 hover:text-white transition-all uppercase tracking-wider flex items-center gap-3 group">
                                        <div className="w-1.5 h-1.5 bg-white/10 rounded-full group-hover:bg-blue-600 transition-colors" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-10 border-l-2 border-indigo-500 pl-4 leading-none">Contact Us</h4>
                        <ul className="space-y-6">
                            {[
                                { icon: Mail, text: 'support@cyberguard.gov', sub: 'TECHNICAL SUPPORT' },
                                { icon: Phone, text: '+1 (800) 292-374', sub: 'HELPLINE ASSISTANCE' },
                                { icon: MapPin, text: 'Gandhinagar HQ', sub: 'GUJARAT, INDIA' },
                            ].map((item, idx) => (
                                <li key={idx} className="flex gap-4 group">
                                    <div className="shrink-0 w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:bg-white/10 transition-all shadow-sm">
                                        <item.icon size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-sm font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors leading-none mb-1.5">{item.text}</p>
                                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider leading-none">{item.sub}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* System Status Overlay */}
                    <div>
                        <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-10 border-l-2 border-emerald-500 pl-4 leading-none">System Status</h4>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-6 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-1000 text-blue-400">
                                <Globe size={80} />
                            </div>
                            <div className="flex items-center justify-between relative z-10">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Infrastructure</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                    <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Active</span>
                                </div>
                            </div>
                            <div className="space-y-3 relative z-10">
                                <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                    <span>Signal Strength</span>
                                    <span className="text-blue-400 font-semibold">98%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
                                    <div className="h-full bg-blue-500 rounded-full w-[98%] shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-none">
                        &copy; 2026 Smart Traffic Gujarat. All Rights Reserved.
                    </p>
                    <div className="flex gap-8">
                        <a href="#" className="text-xs font-semibold text-slate-500 hover:text-white transition-all uppercase tracking-wider leading-none">Privacy Policy</a>
                        <a href="#" className="text-xs font-semibold text-slate-500 hover:text-white transition-all uppercase tracking-wider leading-none">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;
