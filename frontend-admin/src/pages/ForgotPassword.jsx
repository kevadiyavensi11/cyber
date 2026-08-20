import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, Key, AlertCircle, RefreshCw, Home, CheckCircle2, Loader2, Cpu } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await api.post('/auth/forgot-password', { identifier: email.toLowerCase() });
            toast.success(result.data.message || 'OTP sent');

            setStep(2);
            setTimer(300); // 5 minutes
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/verify-reset-otp', { email: email.toLowerCase(), otp });
            toast.success('OTP verified successfully');
            setStep(3);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error('Passwords do not match');
        }
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { email: email.toLowerCase(), otp, newPassword });
            toast.success('Password updated successfully');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password');
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
                <div className="mb-8">
                    <Link to="/login" className="inline-flex items-center gap-2 text-blue-200/60 hover:text-white transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md group-hover:border-white/30 transition-all">
                            <Home size={14} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Login</span>
                    </Link>
                </div>

                <div className="text-center mb-10 animate-in fade-in slide-in-from-top-8 duration-700">
                    <div className="inline-flex p-5 bg-white rounded-3xl border border-blue-100 mb-6 shadow-[0_15px_30px_rgba(37,99,235,0.2)] group hover:scale-110 transition-transform duration-500">
                        <Key className="text-blue-600 w-12 h-12 drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2 italic">Admin_Recovery</h1>
                    <p className="text-blue-200/60 font-black uppercase text-[10px] tracking-[0.4em] italic leading-tight">
                        {step === 1 ? 'Enter admin registry email' : step === 2 ? 'Verify root authority' : 'Set new super-user key'}
                    </p>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.5)] border border-blue-50 relative group hover:scale-[1.01] transition-all duration-500 overflow-hidden">
                    {/* Scanning Effect */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-600/50 to-transparent group-hover:animate-scan pointer-events-none"></div>

                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transition-transform group-hover:scale-110 duration-1000">
                        <Cpu size={180} className="text-blue-600" />
                    </div>

                    {step === 1 && (
                        <form onSubmit={handleSendOTP} className="space-y-8 relative z-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Admin Email</label>
                                <div className="relative group/input">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-blue-600 transition-colors w-5 h-5" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="admin@cyberguard.gov"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 pl-14 pr-6 text-gray-900 font-bold text-sm tracking-wide outline-none transition-all placeholder:text-gray-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white font-black text-xs uppercase tracking-[0.3em] py-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-30 shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-200 active:scale-[0.98] mt-4"
                            >
                                {loading ? 'SENDING PROTOCOL...' : 'REQUEST RECOVERY OTP'}
                                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="space-y-8 relative z-10">
                            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 mb-6">
                                <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 italic leading-relaxed">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    OTP has been dispatched to your root admin registry.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Root Verification Code</label>
                                <div className="relative group/input">
                                    <Shield className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-blue-600 transition-colors w-5 h-5" />
                                    <input
                                        type="text"
                                        required
                                        maxLength="6"
                                        placeholder="0 0 0 0 0 0"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 pl-14 pr-4 text-gray-900 font-bold text-sm tracking-[0.5em] text-center outline-none transition-all placeholder:text-gray-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="w-full bg-blue-600 text-white font-black text-xs uppercase tracking-[0.3em] py-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-30 shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-200 active:scale-[0.98] mt-4"
                            >
                                {loading ? 'VERIFYING...' : 'VERIFY CODE'}
                                {!loading && <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                            </button>

                            <div className="text-center pt-2">
                                {timer > 0 ? (
                                    <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] italic">
                                        Resend available in <span className="text-blue-600">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</span>
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSendOTP}
                                        className="text-blue-600 hover:text-blue-800 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto transition-colors font-bold"
                                    >
                                        <RefreshCw className="w-3 h-3" /> RESEND AUTHORIZATION OTP
                                    </button>
                                )}
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-8 relative z-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">New Super-Key</label>
                                <div className="relative group/input">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-blue-600 transition-colors w-5 h-5" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 pl-14 pr-4 text-gray-900 font-bold text-sm tracking-widest outline-none transition-all placeholder:text-gray-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Verify Super-Key</label>
                                <div className="relative group/input">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-blue-600 transition-colors w-5 h-5" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 pl-14 pr-4 text-gray-900 font-bold text-sm tracking-widest outline-none transition-all placeholder:text-gray-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white font-black text-xs uppercase tracking-[0.3em] py-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-30 shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-200 active:scale-[0.98] mt-4"
                            >
                                {loading ? 'UPDATING KEY...' : 'INITIALIZE NEW KEY'}
                                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />}
                            </button>
                        </form>
                    )}

                    <div className="mt-12 text-center pt-8 border-t border-gray-100 relative z-10">
                        <Link to="/login" className="text-gray-400 hover:text-blue-600 text-[10px] font-black uppercase tracking-[0.25em] transition-colors italic leading-none font-bold">
                            System Return to Login
                        </Link>
                    </div>
                </div>

                {/* Footer Copy */}
                <div className="mt-10 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <p className="text-[9px] font-black uppercase text-blue-200/20 tracking-[0.5em] leading-none italic">
                        &copy; 2026 CYBER_GUARD_ADMIN | SECURITY_OVERRIDE
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
