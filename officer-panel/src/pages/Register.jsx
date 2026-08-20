import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, User, ArrowRight, Smartphone, ShieldAlert, AlertCircle, Home, Cpu } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/register', { ...formData, role: 'officer' });
            toast.success('Officer record created. Verify email to activate node.');
            navigate(`/verify-email?email=${formData.email}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
            toast.error(err.response?.data?.message || 'Registration Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0F172A] flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-blue-500/30">
            <style>
                {`
                @keyframes float {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    50% { transform: translateY(-20px) translateX(10px); }
                }
                .animate-float-slow {
                    animation: float 8s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float 10s ease-in-out infinite;
                    animation-delay: 2s;
                }
                @keyframes scan {
                    0% { transform: translateY(-100%); opacity: 0; }
                    50% { opacity: 0.5; }
                    100% { transform: translateY(100vh); opacity: 0; }
                }
                .animate-scan {
                    animation: scan 4s linear infinite;
                }
                `}
            </style>

            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full animate-float-slow opacity-20"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-400/20 blur-[120px] rounded-full animate-float-delayed opacity-20"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full backdrop-blur-lg pointer-events-none"></div>

            <div className="w-full max-w-md z-10">
                {/* Back to Home Button */}
                <Link to="/" className="inline-flex items-center gap-2 text-blue-200/60 hover:text-white transition-colors mb-8 group">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md group-hover:border-white/30 transition-all">
                        <Home size={14} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Home</span>
                </Link>

                <div className="text-center mb-10 animate-in fade-in slide-in-from-top-8 duration-700">
                    <div className="inline-flex p-5 bg-white rounded-3xl border border-blue-100 mb-6 shadow-[0_15px_30px_rgba(37,99,235,0.2)] group hover:scale-110 transition-transform duration-500">
                        <ShieldAlert className="text-blue-600 w-12 h-12 drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2 italic">Officer_Uplink</h1>
                    <p className="text-blue-200/60 font-black uppercase text-[10px] tracking-[0.4em] italic leading-tight">
                        Secure Authority Node Initialization
                    </p>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.5)] border border-blue-50 relative group hover:scale-[1.01] transition-all duration-500 overflow-hidden">
                    {/* Scanning Effect */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-600/50 to-transparent group-hover:animate-scan pointer-events-none"></div>

                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transition-transform group-hover:scale-110 duration-1000">
                        <Cpu size={160} className="text-blue-600" />
                    </div>

                    {error && (
                        <div className="mb-8 p-5 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-4 border border-red-100 relative z-10 animate-in slide-in-from-top-1 italic">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-6 relative z-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Officer Identity (Name)</label>
                            <div className="relative group/input">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-blue-600 transition-colors w-5 h-5" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Inspector Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 pl-14 pr-4 text-gray-900 font-bold text-sm tracking-wide outline-none transition-all placeholder:text-gray-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Gov Command Email</label>
                            <div className="relative group/input">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-blue-600 transition-colors w-5 h-5" />
                                <input
                                    type="email"
                                    required
                                    placeholder="officer@cyber.gov"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 pl-14 pr-4 text-gray-900 font-bold text-sm tracking-wide outline-none transition-all placeholder:text-gray-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">MFA Terminal (Mobile)</label>
                            <div className="relative group/input">
                                <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-blue-600 transition-colors w-5 h-5" />
                                <input
                                    type="tel"
                                    required
                                    placeholder="+91 XXXXX XXXXX"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 pl-14 pr-4 text-gray-900 font-bold text-sm tracking-wide outline-none transition-all placeholder:text-gray-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Master Clearance (Password)</label>
                            <div className="relative group/input">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-blue-600 transition-colors w-5 h-5" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 pl-14 pr-4 text-gray-900 font-bold text-sm tracking-widest outline-none transition-all placeholder:text-gray-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-black text-xs uppercase tracking-[0.3em] py-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-30 shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-200 active:scale-[0.98] mt-4 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            {loading ? 'PROCESSING...' : 'AUTHORIZE OFFICER'}
                            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-12 text-center pt-8 border-t border-gray-100 relative z-10">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest italic leading-none">
                            Already assigned?{' '}
                            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-black uppercase tracking-widest ml-2 transition-colors border-b-2 border-blue-100 hover:border-blue-600">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer Copy */}
                <div className="mt-10 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <p className="text-[9px] font-black uppercase text-blue-200/20 tracking-[0.5em] leading-none italic">
                        &copy; 2026 CYBERGUARD OS | SECURE_UPLINK_PROTOCOL
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
