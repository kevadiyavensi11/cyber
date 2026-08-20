import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Menu, X, ArrowRight, Shield } from 'lucide-react';

const PublicNavbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Support', path: '/contact' },
    ];

    return (
        <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${isScrolled ? 'py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200' : 'py-8 bg-transparent'}`}>
            <div className="max-w-7xl mx-auto px-10 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-4 group">
                    <div className="bg-blue-600 p-3 rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] rotate-3 group-hover:rotate-0 transition-all duration-500 relative">
                        <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                        <ShieldAlert className="text-white relative z-10" size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-2xl font-semibold tracking-tighter uppercase leading-none transition-colors duration-500 ${isScrolled ? 'text-gray-900' : 'text-white'}`}>Citizen Safety</span>
                        <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] mt-1 leading-none transition-colors duration-500 ${isScrolled ? 'text-blue-600' : 'text-blue-400'}`}>Official Portal</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-12">
                    <div className="flex items-center gap-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-xs font-semibold uppercase tracking-wider transition-all duration-500 ${isScrolled
                                    ? (location.pathname === link.path ? 'text-blue-600' : 'text-slate-400 hover:text-slate-900')
                                    : (location.pathname === link.path ? 'text-blue-400' : 'text-blue-100/70 hover:text-white')
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                    <div className={`flex items-center gap-8 pl-8 border-l transition-colors duration-500 ${isScrolled ? 'border-slate-200' : 'border-white/10'}`}>
                        <Link to="/login" className={`text-xs font-semibold uppercase tracking-wider transition-all duration-500 ${isScrolled ? 'text-slate-400 hover:text-slate-900' : 'text-blue-100/70 hover:text-white'}`}>Sign In</Link>
                        <Link to="/register">
                            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold uppercase tracking-wider text-xs transition-all duration-500 active:scale-95 shadow-lg shadow-blue-500/20">
                                Get Started
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden p-3 bg-white/5 rounded-xl border border-white/5 text-slate-400" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`fixed inset-0 bg-white/95 backdrop-blur-3xl z-[90] md:hidden transition-all duration-500 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Decorative Blur */}
                <div className="absolute top-[20%] right-[-10%] w-[80%] h-[50%] bg-blue-100/50 blur-[150px] rounded-full animate-pulse-slow" />

                <div className="flex flex-col items-center justify-center h-full gap-8 relative z-10">
                    <div className="absolute top-10 flex flex-col items-center">
                        <div className="bg-blue-600 p-3 rounded-2xl mb-4 shadow-xl shadow-blue-500/20">
                            <Shield className="text-white" size={32} />
                        </div>
                        <span className="text-2xl font-semibold text-[#0F172A] uppercase tracking-tighter">Citizen Safety</span>
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-1">Official Portal</span>
                    </div>

                    {navLinks.map((link, idx) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-4xl font-semibold text-[#0F172A] hover:text-blue-600 transition-all uppercase tracking-tighter animate-in fade-in slide-in-from-bottom-4"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="flex flex-col items-center gap-6 mt-12 w-full px-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                            <button className="w-full py-6 bg-slate-50 border border-slate-200 rounded-3xl text-slate-900 font-semibold uppercase tracking-widest text-xs">Sign In</button>
                        </Link>
                        <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                            <button className="w-full py-6 bg-blue-600 rounded-3xl text-white font-semibold uppercase tracking-widest text-xs shadow-2xl shadow-blue-500/30">Get Started</button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default PublicNavbar;
