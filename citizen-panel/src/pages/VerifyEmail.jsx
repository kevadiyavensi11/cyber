import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Mail, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const email = new URLSearchParams(location.search).get('email');

    const [resendLoading, setResendLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');

        if (otp.length !== 6) {
            setError('Enter the 6-digit verification code.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/verify-email', { email, otp });
            toast.success('Identity Verified Successfully!');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Try again.');
            toast.error('Invalid Verification Code');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        setError('');
        try {
            await api.post('/auth/resend-otp', { email });
            toast.success('A new verification code has been dispatched.');
        } catch (err) {
            setError(err.response?.data?.message || 'Could not resend code.');
        } finally {
            setResendLoading(false);
        }
    };

    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0F172A] flex items-center justify-center p-6 relative overflow-hidden font-sans">
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
                <div className="text-center mb-10 animate-in fade-in slide-in-from-top-8 duration-700">
                    <div className="inline-flex p-5 bg-white rounded-3xl border border-blue-100 mb-6 shadow-[0_15px_30px_rgba(37,99,235,0.2)] group hover:scale-110 transition-transform duration-500">
                        <Mail className="text-blue-600 w-12 h-12 drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
                    </div>
                    <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">Verify_Identity</h1>
                    <p className="text-blue-200/60 font-semibold uppercase text-[10px] tracking-[0.4em] leading-none">
                        Secure Account Verification
                    </p>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.5)] border border-blue-50 relative group hover:scale-[1.01] transition-all duration-500 overflow-hidden">
                    {/* Scanning Line Animation */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-600/50 to-transparent group-hover:animate-scan pointer-events-none"></div>

                    {error && (
                        <div className="mb-8 p-5 bg-red-50 text-red-600 rounded-2xl text-xs font-semibold uppercase tracking-widest flex items-center gap-3 border border-red-100">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mb-8 text-center">
                        <p className="text-[10px] font-semibold text-blue-800 leading-relaxed uppercase tracking-widest">
                            Verification code sent to your registered<br />
                            <span className="text-blue-600 font-semibold tracking-normal text-xs">{email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-semibold uppercase text-gray-400 tracking-[0.4em] ml-1 text-center block">Root Verification Code</label>
                            <input
                                type="text"
                                maxLength="6"
                                required
                                autoFocus
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-6 text-center text-3xl font-semibold text-gray-900 tracking-[0.5em] focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-200"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length < 6}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs uppercase tracking-[0.3em] py-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-30 shadow-xl shadow-blue-100 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? 'VERIFYING PROTOCOL...' : 'COMPLETE VERIFICATION'}
                            {!loading && <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                        </button>

                        <div className="flex flex-col items-center gap-6 pt-4">
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resendLoading}
                                className="text-[10px] font-semibold uppercase text-blue-600 hover:text-blue-800 transition-colors tracking-[0.2em] disabled:opacity-50 border-b-2 border-blue-100 hover:border-blue-600"
                            >
                                {resendLoading ? 'TRANSMITTING...' : 'RESEND VERIFICATION CODE'}
                            </button>

                            <Link to="/login" className="text-[10px] font-semibold uppercase text-gray-400 hover:text-blue-600 transition-colors tracking-[0.2em]">
                                Return to Portal Access
                            </Link>
                        </div>
                    </form>
                </div>

                <p className="text-center mt-12 text-[9px] font-semibold uppercase text-blue-200/20 tracking-[0.5em]">
                    &copy; 2026 CYBER_GUARD_GLOBAL | IDENTITY_AUTHORITY
                </p>
            </div>
        </div>
    );
};

export default VerifyEmail;
