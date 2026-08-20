import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0F172A] flex items-center justify-center p-6 font-sans overflow-hidden relative">
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

            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-500/10 blur-[120px] rounded-full animate-float-slow opacity-20"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full animate-float-delayed opacity-20"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full backdrop-blur-lg pointer-events-none"></div>

            <div className="w-full max-w-lg z-10 text-center animate-in fade-in zoom-in duration-700">
                <div className="inline-flex p-8 bg-white rounded-[3rem] shadow-[0_20px_40px_rgba(239,68,68,0.2)] mb-10 border border-red-50 relative group hover:scale-110 transition-transform duration-500">
                    <div className="absolute inset-0 bg-red-500/5 rounded-[3rem] animate-pulse"></div>
                    <ShieldAlert className="text-red-500 w-20 h-20 relative z-10 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
                </div>

                <h1 className="text-4xl font-semibold text-white tracking-tight mb-4">Access_Denied</h1>
                <p className="text-red-200/60 font-semibold uppercase text-[10px] tracking-[0.4em] mb-10">Unauthorized Clearance Level</p>

                <div className="bg-white p-12 rounded-[3rem] border border-red-50 shadow-[0_40px_80px_rgba(0,0,0,0.5)] mb-10 group hover:scale-[1.01] transition-all duration-500">
                    <p className="text-gray-600 leading-relaxed font-semibold text-sm">
                        "Your current authentication token does not provide sufficient privileges for this security node.
                        If you believe your clearance should be escalated, please contact the System Administrator."
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link
                        to="/login"
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs uppercase tracking-[0.3em] px-12 py-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 group shadow-xl shadow-blue-100 hover:scale-[1.05] active:scale-[0.98]"
                    >
                        <Home size={18} className="group-hover:-translate-y-1 transition-transform" />
                        Return to Hub
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto bg-white border border-gray-100 text-gray-400 font-semibold text-xs uppercase tracking-[0.3em] px-12 py-6 rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3 hover:text-blue-600"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                </div>

                <p className="mt-16 text-[9px] font-semibold uppercase text-blue-200/20 tracking-[0.5em]">
                    &copy; 2026 CYBER_GUARD_GLOBAL | SECURITY_TERMINAL
                </p>
            </div>
        </div>
    );
};

export default Unauthorized;
