import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, Key, Smartphone, AlertCircle, CheckCircle2, ShieldAlert, Home } from 'lucide-react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
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
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user && user.token) {
                    if (user.role === 'citizen') {
                        navigate('/citizen/dashboard');
                    } else {
                        localStorage.clear();
                    }
                }
            }
        } catch (e) {
            console.error("Login: Error reading session", e);
            localStorage.clear();
        }
    }, [navigate]);

    useEffect(() => {
        setIsEmailValid(validateEmail(email));
        if (email && !validateEmail(email)) {
            setError('Invalid email format (e.g., name@email.com)');
        } else {
            setError('');
        }
    }, [email]);

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setError('');

        if (!isEmailValid) {
            setError('Enter a valid email address before proceeding.');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email: email.toLowerCase(), password });

            localStorage.setItem('user', JSON.stringify({
                token: data.token,
                _id: data._id,
                role: data.role,
                name: data.name
            }));

            toast.success(`Welcome back, ${data.name}!`);

            setTimeout(() => {
                if (data.role === 'citizen') {
                    navigate('/citizen/dashboard');
                } else {
                    toast.error('This is the Citizen Portal. Please use the correct gateway.');
                    localStorage.clear();
                    setError('Unauthorized role for this portal.');
                }
            }, 500);
        } catch (err) {
            setError(err.response?.data?.message || 'Access denied. Verify credentials.');
            toast.error(err.response?.data?.message || 'Login Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (response) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/google', { tokenId: response.credential });

            localStorage.setItem('user', JSON.stringify({
                token: data.token,
                _id: data._id,
                role: data.role,
                name: data.name
            }));

            toast.success(`Welcome back, ${data.name}!`);

            setTimeout(() => {
                navigate('/citizen/dashboard');
            }, 500);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Google Login Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0F172A] flex items-center justify-center p-6 relative overflow-hidden font-app selection:bg-blue-500/30">
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
                    `}
                </style>

                {/* Background Decor */}
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full animate-float-slow opacity-20"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 blur-[120px] rounded-full animate-float-delayed opacity-20"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full backdrop-blur-lg pointer-events-none"></div>

                <div className="w-full max-w-md z-10">
                    {/* Back to Home Button */}
                    <Link to="/" className="inline-flex items-center gap-2 text-blue-200/60 hover:text-white transition-colors mb-8 group">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md group-hover:border-white/30 transition-all">
                            <Home size={14} />
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Back to Home</span>
                    </Link>

                    <div className="text-center mb-8">
                        <div className="inline-flex p-5 bg-white rounded-3xl border border-blue-100 mb-6 shadow-[0_15px_30px_rgba(37,99,235,0.2)]">
                            <ShieldAlert className="text-blue-600 w-10 h-10 drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
                        </div>
                        <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">Portal_Access</h1>
                        <p className="text-blue-200/60 font-semibold uppercase text-[10px] tracking-[0.4em]">
                            Official Cyber Threat Monitoring System
                        </p>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.4)] hover:scale-[1.01] transition-all duration-500 relative overflow-hidden group">
                        {/* Internal Scan Animation Effect */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-600/50 to-transparent group-hover:animate-scan pointer-events-none"></div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-semibold uppercase tracking-widest flex items-center gap-3 border border-red-100">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-semibold uppercase text-gray-400 tracking-widest ml-1">Account Email</label>
                                <div className="relative group/input">
                                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors w-5 h-5 ${isEmailValid ? 'text-emerald-500' : 'text-gray-300 group-focus-within/input:text-blue-600'}`} />
                                    <input
                                        type="email"
                                        required
                                        placeholder="name@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 pl-12 pr-12 text-gray-900 font-semibold text-sm placeholder:text-gray-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                    />
                                    {isEmailValid && (
                                        <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5" />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[10px] font-semibold uppercase text-gray-400 tracking-widest">Access Key</label>
                                    <Link to="/forgot-password" size="sm" className="text-[10px] font-semibold uppercase text-blue-600 hover:text-blue-800 tracking-widest transition-colors font-semibold">
                                        Recover Key?
                                    </Link>
                                </div>
                                <div className="relative group/input">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-blue-600 transition-colors w-5 h-5" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 pl-12 pr-4 text-gray-900 font-semibold text-sm placeholder:text-gray-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !isEmailValid}
                                className="w-full bg-blue-600 text-white font-semibold text-[11px] uppercase tracking-[0.3em] py-5 rounded-2xl transition-all flex items-center justify-center gap-3 group disabled:opacity-50 shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-200 active:scale-95"
                            >
                                {loading ? 'DECRYPTING...' : 'INITIALIZE UPLINK'}
                                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>

                        <div className="mt-10">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-100"></div>
                                </div>
                                <div className="relative flex justify-center text-[9px] uppercase tracking-[0.4em] font-semibold">
                                    <span className="bg-white px-6 text-gray-300">Secure Node Login</span>
                                </div>
                            </div>

                            <div className="flex justify-center transition-transform hover:scale-105">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => toast.error('Google Login Failed')}
                                    theme="filled_blue"
                                    shape="pill"
                                    width="100%"
                                />
                            </div>
                        </div>

                        <div className="mt-12 text-center pt-8 border-t border-gray-100">
                            <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-widest leading-none">
                                Missing Clearance?{' '}
                                <Link to="/register" className="text-blue-600 hover:text-blue-800 font-semibold uppercase tracking-widest ml-2 transition-colors border-b-2 border-blue-100 hover:border-blue-600">
                                    Register Node
                                </Link>
                            </p>
                        </div>
                    </div>

                    <p className="mt-10 text-center text-[9px] font-semibold uppercase text-blue-200/20 tracking-[0.5em] leading-none">
                        &copy; 2026 CyberGuard Gujarat. Decentralized Infrastructure.
                    </p>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default Login;
