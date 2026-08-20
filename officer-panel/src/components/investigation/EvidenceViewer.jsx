import React, { useState } from 'react';
import {
    Paperclip,
    Image as ImageIcon,
    Link as LinkIcon,
    FileText,
    ExternalLink,
    Plus,
    X,
    Maximize2,
    Download,
    Database
} from 'lucide-react';
import { format, isValid } from 'date-fns';

const EvidenceViewer = ({ report, onAddEvidence }) => {
    const [selectedImage, setSelectedImage] = useState(null);

    if (!report) return null;

    // Combine legacy fields and new evidence array
    const allEvidence = [
        ...(report.evidence || []),
        ...(report.evidenceURL ? [{ type: 'link', url: report.evidenceURL, content: 'Legacy Evidence URL', addedAt: report.createdAt }] : [])
    ];

    const getIcon = (type) => {
        switch (type) {
            case 'image': return <ImageIcon size={20} />;
            case 'link': return <LinkIcon size={20} />;
            case 'document': return <FileText size={20} />;
            default: return <Paperclip size={20} />;
        }
    };

    return (
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-gray-50 rounded-2xl text-blue-600">
                        <Paperclip size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Evidence Vault</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{allEvidence.length} Attachments Synchronized</p>
                    </div>
                </div>

                <button
                    onClick={onAddEvidence}
                    className="p-4 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                    title="Upload New Evidence"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allEvidence.length > 0 ? allEvidence.map((item, idx) => {
                    if (!item) return null;
                    return (
                        <div key={idx} className="group p-6 bg-gray-50 hover:bg-white border border-gray-100 rounded-[2.5rem] transition-all duration-500 hover:shadow-xl hover:shadow-gray-100/50 relative overflow-hidden">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className={`p-3 rounded-xl ${item.type === 'image' ? 'bg-emerald-50 text-emerald-600' :
                                    item.type === 'link' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    {getIcon(item.type)}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                        {item.type} • {isValid(new Date(item.addedAt || Date.now()))
                                            ? format(new Date(item.addedAt || Date.now()), 'MMM d, yyyy')
                                            : 'N/A'}
                                    </p>
                                    <p className="text-sm font-bold text-gray-900 truncate pr-4">
                                        {item.content || 'Untitled Attachment'}
                                    </p>
                                </div>
                            </div>

                            {item.type === 'image' ? (
                                <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-200 mb-4 group/img">
                                    <img
                                        src={item.url}
                                        alt="Evidence"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => setSelectedImage(item.url)}
                                            className="p-3 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/40 transition-all"
                                        >
                                            <Maximize2 size={18} />
                                        </button>
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-3 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/40 transition-all"
                                        >
                                            <Download size={18} />
                                        </a>
                                    </div>
                                </div>
                            ) : item.type === 'link' ? (
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl group/link hover:border-blue-200 transition-all"
                                >
                                    <span className="text-xs font-bold text-blue-600 truncate max-w-[80%]">{item.url}</span>
                                    <ExternalLink size={14} className="text-gray-300 group-hover/link:text-blue-400 transition-colors" />
                                </a>
                            ) : (
                                <div className="p-4 bg-white border border-gray-100 rounded-2xl">
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed italic line-clamp-2">
                                        {item.content || 'Evidence content record encrypted.'}
                                    </p>
                                </div>
                            )}

                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 -mr-16 -mt-16 rounded-full opacity-10 group-hover:bg-blue-600 transition-colors" />
                        </div>
                    );
                }) : (
                    <div className="col-span-full py-20 border-2 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mb-4">
                            <Database size={32} />
                        </div>
                        <p className="text-gray-300 font-black text-[10px] uppercase tracking-[0.3em]">Vault currently empty</p>
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] bg-gray-900/95 backdrop-blur-xl flex items-center justify-center p-10 animate-in fade-in duration-300">
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-10 right-10 p-4 bg-white/10 text-white hover:bg-white/20 rounded-2xl transition-all"
                    >
                        <X size={32} />
                    </button>
                    <img src={selectedImage} alt="Fullscreen Evidence" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
                </div>
            )}
        </div>
    );
};

export default EvidenceViewer;
