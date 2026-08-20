import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Menu, X, ArrowRight } from 'lucide-react';
import Button from '../reusable/Button';

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
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${isScrolled ? 'py-4 bg-white/80 backdrop-blur-xl shadow-sm' : 'py-6 bg-transparent'}`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-4 group">
                    <div className="bg-blue-600 p-3 rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] rotate-3 group-hover:rotate-0 transition-all duration-500 relative">
                        <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                        <ShieldAlert className="text-white relative z-10" size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-2xl font-black tracking-tighter uppercase leading-none transition-colors duration-500 ${isScrolled ? 'text-gray-900' : 'text-white'}`}>CyberGuard</span>
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 leading-none transition-colors duration-500 ${isScrolled ? 'text-blue-600' : 'text-blue-400'}`}>Officer Command</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-10">
                    <div className="flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-bold transition-all duration-500 ${isScrolled
                                    ? (location.pathname === link.path ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900')
                                    : (location.pathname === link.path ? 'text-primary-400' : 'text-white/70 hover:text-white')
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                    <div className={`flex items-center gap-4 border-l transition-all duration-500 pl-8 ${isScrolled ? 'border-gray-200' : 'border-white/10'}`}>
                        <Link to="/login" className={`text-sm font-bold transition-all duration-500 ${isScrolled ? 'text-gray-600 hover:text-primary-600' : 'text-white/70 hover:text-white'}`}>Sign In</Link>
                        <Link to="/register">
                            <Button className="px-6 py-2.5 flex items-center gap-2 group">
                                Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`fixed inset-0 bg-white z-[90] md:hidden transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col items-center justify-center h-full gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-3xl font-black text-gray-900 hover:text-primary-600 transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="flex flex-col items-center gap-4 mt-8 w-full px-10">
                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                            <Button variant="secondary" className="w-full py-4">Sign In</Button>
                        </Link>
                        <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                            <Button className="w-full py-4 shadow-xl shadow-primary-100">Create Account</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default PublicNavbar;
