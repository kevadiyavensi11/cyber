import React from 'react';
import { Clock, CheckCircle, Info, Shield, Send } from 'lucide-react';
import { format, isValid } from 'date-fns';

const InvestigationTimeline = ({ report }) => {
    // Expected steps in chronological order
    const steps = [
        { key: 'submitted', label: 'Report Submitted', icon: Send, role: 'citizen' },
        { key: 'assigned', label: 'Assigned to Officer', icon: Shield, role: 'admin' },
        { key: 'investigating', label: 'Investigation Started', icon: Info, role: 'officer' },
        { key: 'resolved', label: 'Case Resolved', icon: CheckCircle, role: 'officer' }
    ];

    return (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-10 flex items-center gap-2">
                <Clock size={16} /> Resolution Pathway
            </h4>

            <div className="space-y-0 relative">
                {/* Vertical Line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-gray-50" />

                {(report?.timeline || []).map((item, idx) => {
                    if (!item) return null;
                    const isLast = idx === (report.timeline.length - 1);
                    const isCitizen = item.role === 'citizen';
                    const isOfficer = item.role === 'officer';

                    return (
                        <div key={idx} className="relative pl-12 pb-10 group last:pb-0">
                            {/* Dot */}
                            <div className={`absolute left-0 top-1 w-8 h-8 rounded-xl border-4 border-white shadow-sm flex items-center justify-center transition-all duration-500 z-10 ${isLast ? 'bg-blue-600 scale-125' : 'bg-gray-100'
                                }`}>
                                {isOfficer ? <Shield size={12} className={isLast ? 'text-white' : 'text-gray-400'} /> :
                                    isCitizen ? <Send size={12} className={isLast ? 'text-white' : 'text-gray-400'} /> :
                                        <Clock size={12} className={isLast ? 'text-white' : 'text-gray-400'} />}
                            </div>

                            <div className={`transition-all duration-500 ${isLast ? 'translate-x-2' : ''}`}>
                                <p className={`text-xs font-black uppercase tracking-widest leading-none mb-1 ${isLast ? 'text-blue-600' : 'text-gray-900'}`}>
                                    {item.title || 'Milestone Reached'}
                                </p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-2">
                                    {item.timestamp ? (
                                        isValid(new Date(item.timestamp))
                                            ? format(new Date(item.timestamp), 'MMM dd, HH:mm')
                                            : 'TIMESTAMP CORRUPT'
                                    ) : 'PENDING'}
                                </p>
                                <p className="text-xs font-medium text-gray-500 leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                                    {item.description || 'Prototypical action recorded in system logs.'}
                                </p>
                            </div>
                        </div>
                    );
                })}

                {(report?.timeline || []).length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No milestones recorded</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvestigationTimeline;
