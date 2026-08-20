import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Loader, Scan } from 'lucide-react';

/**
 * AIEvidenceScanner - A premium, realistic AI scanning UI over an uploaded image.
 * 
 * @param {File} file - The uploaded image file
 * @param {boolean} isScanning - Loading state
 * @param {boolean|null} isValid - Approval state from AI
 * @param {number} confidence - AI Match score
 * @param {string} errorMessage - Reason for rejection
 */
const AIScanningPanel = ({ file, isScanning, isValid, confidence, errorMessage }) => {
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }
        
        // Generate a preview URL for the local file
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        // Free memory when component unmounts or file changes
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    if (!file) return null;

    return (
        <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-gray-900 border border-gray-200 mt-6 animate-in zoom-in-95 duration-500">
            {/* Embedded CSS for the realistic scan line and box pulses */}
            <style>
                {`
                    @keyframes scan-line {
                        0% { top: -10%; opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { top: 110%; opacity: 0; }
                    }
                    .animate-scan {
                        animation: scan-line 2.5s linear infinite;
                    }
                    @keyframes pulse-box {
                        0%, 100% { opacity: 0.2; transform: scale(0.95); }
                        50% { opacity: 0.8; transform: scale(1.05); }
                    }
                    .animate-pulse-box {
                        animation: pulse-box 2s ease-in-out infinite;
                    }
                `}
            </style>

            {/* Base Image Layer */}
            <img 
                src={previewUrl} 
                alt="Evidence Preview" 
                className={`w-full h-80 object-cover transition-all duration-700 ${
                    isScanning ? 'opacity-50 grayscale-[50%]' : 'opacity-100'
                }`}
            />

            {/* Scan Overlay (Active during scanning) */}
            {isScanning && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 overflow-hidden flex flex-col items-center justify-center">
                    
                    {/* The Scan Line Component */}
                    <div className="absolute left-0 w-full h-1 bg-cyan-400 animate-scan shadow-[0_0_20px_5px_rgba(34,211,238,0.7)] z-20" />
                    <div className="absolute left-0 w-full h-24 bg-gradient-to-b from-transparent to-cyan-400/20 animate-scan -translate-y-full z-10 pointer-events-none" />

                    {/* Faux Reticle / Pulse Boxes for UI feel */}
                    <div className="absolute inset-10 border border-cyan-500/30 animate-pulse-box rounded-xl pointer-events-none flex items-center justify-center">
                        <Scan size={120} className="text-cyan-500/20" strokeWidth={1} />
                    </div>

                    {/* Scanning Text */}
                    <div className="relative z-30 p-5 bg-gray-900/80 backdrop-blur-md rounded-2xl border border-cyan-500/30 flex items-center gap-4 shadow-2xl">
                        <Loader className="animate-spin text-cyan-400" size={24} />
                        <div>
                            <h4 className="text-sm font-black text-cyan-400 uppercase tracking-widest leading-none mb-1">
                                Sentinel AI Core
                            </h4>
                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">
                                Analyzing evidence...<span className="animate-pulse">_</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Result Overlay: VERIFIED */}
            {isValid === true && !isScanning && (
                <div className="absolute inset-0 bg-emerald-900/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center animate-in fade-in duration-500">
                    <div className="p-8 bg-white rounded-3xl text-center shadow-2xl max-w-sm border border-emerald-100 transform transition-transform hover:scale-105">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-50 text-emerald-600 shadow-inner">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tight mb-2">Image Verified</h3>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4">
                            Match Confidence: {Math.round(confidence * 100)}%
                        </p>
                        <ul className="text-left space-y-2 bg-emerald-50 rounded-xl p-4">
                            <li className="flex gap-2 items-center text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Threat Signatures Detected
                            </li>
                            <li className="flex gap-2 items-center text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Metadata Synchronized
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Result Overlay: REJECTED */}
            {isValid === false && !isScanning && (
                <div className="absolute inset-0 bg-rose-900/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center animate-in fade-in duration-500">
                    <div className="p-8 bg-white rounded-3xl text-center shadow-2xl max-w-sm border border-rose-100 transform transition-transform hover:scale-105">
                        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-rose-50 text-rose-600 shadow-inner">
                            <ShieldAlert size={32} />
                        </div>
                        <h3 className="text-xl font-black text-rose-900 uppercase tracking-tight mb-2">Invalid Evidence</h3>
                        <p className="text-[11px] font-bold text-rose-600 leading-relaxed mb-4 italic">
                            {errorMessage || 'Image does not match the selected threat category.'}
                        </p>
                        <div className="bg-rose-50 rounded-xl p-3 text-[10px] font-black uppercase tracking-widest text-rose-700 border border-rose-100">
                            Submission Locked
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIScanningPanel;
