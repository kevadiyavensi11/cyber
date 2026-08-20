import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 font-sans overflow-hidden relative">
            {/* Background blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/5 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full"></div>

            <div className="w-full max-w-lg z-10 text-center animate-in fade-in zoom-in duration-700">
                <div className="inline-flex p-6 bg-white rounded-[2.5rem] shadow-2xl shadow-red-100 mb-10 border border-red-50 relative">
                    <div className="absolute inset-0 bg-red-500/10 rounded-[2.5rem] animate-pulse"></div>
                    <ShieldAlert className="text-red-500 w-16 h-16 relative z-10" />
                </div>

                <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-4">Access Denied</h1>
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mb-8">Unauthorized Clearance Level</p>

                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10">
                    <p className="text-gray-600 leading-relaxed font-medium">
                        Your current authentication token does not provide sufficient privileges for this security node.
                        If you believe your clearance should be escalated, please contact the System Administrator.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/login"
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest px-10 py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-xl shadow-blue-100"
                    >
                        <Home size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                        Return Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto bg-white border border-gray-200 text-gray-400 font-black text-xs uppercase tracking-widest px-10 py-4 rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                </div>

                <p className="mt-12 text-[10px] font-black uppercase text-gray-400 tracking-[0.4em]">
                    &copy; 2024 CyberGuard Protocols
                </p>
            </div>
        </div>
    );
};

export default Unauthorized;
