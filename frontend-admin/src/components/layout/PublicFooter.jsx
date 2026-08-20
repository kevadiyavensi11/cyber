import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Twitter, Github, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const PublicFooter = () => {
    return (
        <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="bg-primary-600 p-2 rounded-xl shadow-lg shadow-primary-200">
                                <ShieldAlert className="text-white" size={24} />
                            </div>
                            <span className="text-2xl font-black text-gray-900 tracking-tighter">CyberGuard</span>
                        </Link>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Securing the digital frontier through unified reporting and real-time surveillance. Join 50k+ citizens making the web safer.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all"><Twitter size={18} /></a>
                            <a href="#" className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"><Github size={18} /></a>
                            <a href="#" className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Linkedin size={18} /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-8">Quick Navigation</h4>
                        <ul className="space-y-4">
                            {['Home', 'About Platform', 'Contact Support', 'Privacy Policy', 'Terms of Service'].map(item => (
                                <li key={item}>
                                    <Link to="#" className="text-gray-500 font-bold hover:text-primary-600 transition-colors text-sm">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-8">Citizen Panels</h4>
                        <ul className="space-y-4">
                            {['Report a Threat', 'Track Incident', 'Security Advisories', 'Verify Identity', 'Emergency Hotline'].map(item => (
                                <li key={item}>
                                    <Link to="#" className="text-gray-500 font-bold hover:text-primary-600 transition-colors text-sm">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-8">Emergency Matrix</h4>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-4">
                                <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl"><Phone size={18} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Cyber Helpline</p>
                                    <p className="text-sm font-black text-gray-900">1930 (Toll Free)</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><Mail size={18} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase">General Inquiry</p>
                                    <p className="text-sm font-black text-gray-900">support@cyberguard.gov</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">© 2024 CYBERGUARD INFRASTRUCTURE. ALL RIGHTS RESERVED.</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Watchtower: Active</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;
