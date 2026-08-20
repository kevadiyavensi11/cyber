import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, Key, Smartphone, AlertCircle, CheckCircle, Home } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validateEmail = (email) => {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    };

    useEffect(() => {
        // Redirect if already logged in as admin
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                localStorage.clear(); // Clear invalid role session for this panel
            }
        }
    }, [navigate]);

    useEffect(() => {
        setIsEmailValid(validateEmail(email));
        if (email && !validateEmail(email)) {
            setError('Invalid Admin Email format.');
        } else {
            setError('');
        }
    }, [email]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!isEmailValid) {
            setError('Please provide a valid administrative email.');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });

            localStorage.setItem('user', JSON.stringify({
                token: data.token,
                _id: data._id,
                role: data.role,
                name: data.name
            }));

            toast.success(`Welcome back, ${data.name}! Synchronizing systems...`);

            // Redirect strictly to admin dashboard
            if (data.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                toast.error('This is the Administration Control Center. Unauthorized access.');
                localStorage.clear();
                setError('Unauthorized role for this secure node.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication Error');
            toast.error(err.response?.data?.message || 'Login Failed');
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
                    animation: scan 3s linear infinite;
                }
                `}
            </style>

            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full animate-float-slow opacity-20"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 blur-[120px] rounded-full animate-float-delayed opacity-20"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full backdrop-blur-lg pointer-events-none"></div>

            <div className="w-full max-w-md z-10">
                {/* Back to Home Button */}
                <Link to="/" className="inline-flex items-center gap-2 text-blue-200/60 hover:text-white transition-colors mb-12 group">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md group-hover:border-white/30 transition-all">
                        <Home size={14} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Home</span>
                </Link>

                <div className="text-center mb-10">
                    <div className="inline-flex p-5 bg-white rounded-[2rem] border border-blue-100 mb-6 shadow-[0_15px_30px_rgba(37,99,235,0.2)] group hover:scale-110 transition-transform duration-500">
                        <Shield className="text-blue-600 w-12 h-12 relative z-10 drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2 italic">Admin_Control</h1>
                    <p className="text-blue-200/40 font-black uppercase text-[10px] tracking-[0.4em] italic leading-none">
                        Secured Infrastructure Management Hub
                    </p>
                </div>

                <div className="bg-white rounded-[3rem] p-10 md:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.5)] border border-blue-50 relative group hover:scale-[1.01] transition-all duration-500 overflow-hidden">
                    {/* Scanning Effect */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-600/50 to-transparent group-hover:animate-scan pointer-events-none"></div>

                    {error && (
                        <div className="mb-6 p-5 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-red-100 animate-in slide-in-from-top-2 relative z-10">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span className="italic">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-8 relative z-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Admin Protocol (Email)</label>
                            <div className="relative group/input">
                                <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors w-5 h-5 ${isEmailValid ? 'text-emerald-500' : 'text-gray-300 group-focus-within/input:text-blue-600'}`} />
                                <input
                                    type="email"
                                    required
                                    placeholder="admin@cyberguard.gov"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 pl-14 pr-12 text-gray-900 font-bold text-sm tracking-wide outline-none transition-all placeholder:text-gray-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />
                                {isEmailValid && (
                                    <CheckCircle className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5 animate-in zoom-in" />
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Master Clearance (Password)</label>
                                <Link to="/forgot-password" size="sm" className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 tracking-widest transition-all italic font-bold">
                                    Recover Pin?
                                </Link>
                            </div>
                            <div className="relative group/input">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-blue-600 transition-colors w-5 h-5" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 pl-14 pr-6 text-gray-900 font-bold text-sm tracking-widest outline-none transition-all placeholder:text-gray-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !isEmailValid}
                            className="w-full bg-blue-600 text-white font-black text-xs uppercase tracking-[0.3em] py-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-30 shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-200 active:scale-[0.98] mt-6"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Synchronizing...
                                </>
                            ) : (
                                <>
                                    Authorize Access
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-12 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <p className="text-[9px] font-black uppercase text-blue-200/20 tracking-[0.5em] leading-none italic">
                        &copy; 2026 Admin Control Console | Secure Infrastructure v4.3.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
