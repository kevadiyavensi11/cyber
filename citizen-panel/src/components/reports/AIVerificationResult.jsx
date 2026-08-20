import React from 'react';
import { CheckCircle, AlertCircle, Zap, ShieldCheck, ShieldAlert, ArrowRight } from 'lucide-react';

/**
 * AIVerificationResult - A premium UI component to display Gemini AI analysis results
 * 
 * @param {boolean} isValid - Whether the AI confirmed the threat matches the image
 * @param {number} confidence - Confidence score (0.0 to 1.0)
 * @param {string} message - AI summary or reason for rejection
 * @param {string} detectedType - Correct threat type if mismatch detected
 */
const AIVerificationResult = ({ isValid, confidence, message, detectedType }) => {
    const confidencePercentage = Math.round(confidence * 100);

    return (
        <div className="w-full max-w-lg mx-auto transform transition-all duration-500 animate-in fade-in zoom-in-95">
            <div className={`bg-white rounded-[2.5rem] shadow-2xl border-2 overflow-hidden ${
                isValid ? 'border-emerald-100 shadow-emerald-500/5' : 'border-rose-100 shadow-rose-500/5'
            }`}>
                
                {/* Header Section */}
                <div className={`p-10 flex flex-col items-center text-center ${
                    isValid ? 'bg-emerald-50/30' : 'bg-rose-50/30'
                }`}>
                    <div className={`mb-6 p-5 rounded-3xl shadow-inner relative ${
                        isValid ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                        {isValid ? (
                            <ShieldCheck size={48} strokeWidth={1.5} className="animate-pulse" />
                        ) : (
                            <ShieldAlert size={48} strokeWidth={1.5} className="animate-bounce" />
                        )}
                        <div className="absolute -top-1 -right-1">
                            <div className={`p-1.5 rounded-full ${isValid ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                <Zap size={12} className="text-white" fill="white" />
                            </div>
                        </div>
                    </div>

                    <h2 className={`text-2xl font-black uppercase tracking-tight mb-2 ${
                        isValid ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                        {isValid ? 'Image Verified Successfully' : 'Threat Mismatch Detected'}
                    </h2>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 font-mono">
                        Sentinel AI Diagnostic Protocol
                    </p>
                </div>

                {/* Content Section */}
                <div className="p-10 space-y-8">
                    {/* Confidence Meter */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Verification Confidence</span>
                            <span className={`text-lg font-black tracking-tighter ${
                                isValid ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                                {confidencePercentage}%
                            </span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-50">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                    isValid ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                                }`}
                                style={{ width: `${confidencePercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Summary / Message Block */}
                    <div className={`p-6 rounded-3xl border-2 italic font-bold text-xs leading-relaxed ${
                        isValid ? 'bg-emerald-50/20 border-emerald-50 text-emerald-800' : 'bg-rose-50/20 border-rose-50 text-rose-800'
                    }`}>
                        "{message || (isValid ? 'The evidence matches the reported threat signature identically.' : 'The evidence submitted does not contain indicators of the selected threat category.')}"
                    </div>

                    {/* Suggested Type (Only for Rejections) */}
                    {!isValid && detectedType && (
                        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">AI Suggestion</p>
                                <p className="text-sm font-black text-rose-600 uppercase tracking-tight">{detectedType}</p>
                            </div>
                            <div className="p-3 bg-gray-50 text-gray-300 rounded-2xl">
                                <ArrowRight size={20} />
                            </div>
                        </div>
                    )}

                    {/* Footer Milestone */}
                    <div className="pt-6 border-t border-gray-100 flex justify-center">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isValid ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">
                                {isValid ? 'Priority Submission Enabled' : 'Manual Review Escalation'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIVerificationResult;
