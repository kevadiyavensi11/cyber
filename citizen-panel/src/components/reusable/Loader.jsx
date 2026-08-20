import React from 'react';
import { ShieldAlert } from 'lucide-react';

const Loader = ({ fullScreen = true }) => {
    const loaderContent = (
        <div className="flex flex-col items-center justify-center gap-6">
            <div className="relative">
                {/* Rotating outer ring */}
                <div className="w-24 h-24 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin" />

                {/* Fixed center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldAlert className="text-primary-600 animate-pulse" size={32} />
                </div>
            </div>
            <div className="text-center">
                <p className="text-sm font-semibold text-gray-900 uppercase tracking-[0.3em]">CyberGuard</p>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-2">Sequencing Secure Infrastructure...</p>
            </div>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-[9999] flex items-center justify-center">
                {loaderContent}
            </div>
        );
    }

    return (
        <div className="w-full py-20 flex items-center justify-center">
            {loaderContent}
        </div>
    );
};

export default Loader;
