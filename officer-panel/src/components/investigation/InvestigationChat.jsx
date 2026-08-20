import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { reportService } from '../../services/api';
import { Send, Shield, Clock, Paperclip, FileText, Image as ImageIcon, Download, Check, CheckCheck, Loader2 } from 'lucide-react';
import { format, isValid } from 'date-fns';
import toast from 'react-hot-toast';

const InvestigationChat = ({ reportId, currentUser, isClosed }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [socket, setSocket] = useState(null);
    const [uploading, setUploading] = useState(false);
    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Initialize socket
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        // Join room
        newSocket.emit('joinReportRoom', reportId);

        // Fetch history
        const fetchHistory = async () => {
            try {
                const { data } = await reportService.getMessages(reportId);
                setMessages(data);
                // Mark as seen on load
                await reportService.markChatMessagesSeen(reportId);
            } catch (error) {
                console.error('Chat history failure:', error);
            }
        };
        fetchHistory();

        // Listen for messages
        newSocket.on('newMessage', (message) => {
            setMessages((prev) => [...prev, message]);
            // If message is from someone else and I am in the room, mark as seen
            if (message.senderId !== (currentUser?._id || currentUser?.id)) {
                newSocket.emit('markSeen', { reportId, userId: (currentUser?._id || currentUser?.id) });
            }
        });

        newSocket.on('messagesSeen', ({ readerId }) => {
            if (readerId !== (currentUser?._id || currentUser?.id)) {
                setMessages((prev) => 
                    prev.map(m => m.senderId === (currentUser?._id || currentUser?.id) ? { ...m, status: 'seen' } : m)
                );
            }
        });

        return () => newSocket.close();
    }, [reportId, currentUser]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        const userId = currentUser?._id || currentUser?.id;
        const trimmedMessage = input.trim();
        if (!trimmedMessage || isClosed || !userId) return;

        const messageData = {
            reportId,
            senderId: userId,
            senderRole: currentUser?.role === 'citizen' ? 'citizen' : 'officer',
            message: trimmedMessage,
            messageType: 'text',
            createdAt: new Date().toISOString()
        };

        socket.emit('sendMessage', messageData);
        setInput('');
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        const userId = currentUser?._id || currentUser?.id;
        if (!file || isClosed || !userId) return;

        // Validation
        if (file.size > 10 * 1024 * 1024) return toast.error('File size exceeds 10MB limit');
        
        const isImage = file.type.startsWith('image/');
        const isAllowedDoc = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type);
        
        if (!isImage && !isAllowedDoc) return toast.error('Invalid file type. Only Images, PDFs and DOCs allowed.');

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('reportId', reportId);

        try {
            const { data } = await reportService.uploadChatMessageFile(formData);
            
            const messageData = {
                reportId,
                senderId: userId,
                senderRole: currentUser.role === 'citizen' ? 'citizen' : 'officer',
                message: '',
                messageType: isImage ? 'image' : 'file',
                fileUrl: data.fileUrl,
                fileName: data.fileName,
                createdAt: new Date().toISOString()
            };

            socket.emit('sendMessage', messageData);
            toast.success('Dossier Attachment Transmitted');
        } catch (error) {
            toast.error('Encryption or upload failure');
            console.error(error);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const safeMessageTime = (dateInput) => {
        if (!dateInput) return '';
        const date = new Date(dateInput);
        return isValid(date) ? format(date, 'hh:mm a') : '';
    };

    return (
        <div className="flex flex-col h-[500px] md:h-[600px] bg-[#ece5dd] rounded-xl shadow-2xl overflow-hidden font-inter border border-slate-200">
            {/* WhatsApp Style Header */}
            <div className="px-6 py-4 bg-[#075e54] text-white flex items-center justify-between shadow-md z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Shield size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold tracking-wide">Investigation Chat</h3>
                        <p className="text-[10px] text-emerald-100 font-medium uppercase tracking-widest opacity-80">Secure Messaging</p>
                    </div>
                </div>
                {isClosed && (
                    <span className="text-[9px] font-black bg-white/20 text-white px-3 py-1 rounded-full uppercase tracking-tighter backdrop-blur-sm">
                        Archive Mode
                    </span>
                )}
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {messages.map((msg, idx) => {
                    if (!msg) return null;
                    const isSystem = msg.senderRole === 'system';
                    const isSentByMe = msg.senderId === (currentUser?._id || currentUser?.id);

                    if (isSystem) {
                        return (
                            <div key={idx} className="flex justify-center my-4">
                                <div className="bg-[#fff3c7] text-[#714f1e] text-[10px] font-bold px-4 py-1.5 rounded-lg uppercase tracking-wider shadow-sm border border-[#e8d5a7] text-center max-w-[90%]">
                                    {msg.message || 'Transmission Received'}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={idx} className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] md:max-w-[60%] relative px-3 py-2 rounded-xl shadow-sm border ${isSentByMe
                                ? 'bg-[#dcf8c6] text-slate-800 rounded-tr-none border-[#c7e9af]'
                                : 'bg-white text-slate-800 rounded-tl-none border-slate-100'
                                }`}>
                                
                                {/* Message Content */}
                                {msg.messageType === 'image' ? (
                                    <div className="mb-1">
                                        <img 
                                            src={msg.fileUrl} 
                                            alt="Intelligence" 
                                            className="rounded-lg max-h-60 w-full object-cover border border-black/5 cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => window.open(msg.fileUrl, '_blank')}
                                        />
                                    </div>
                                ) : msg.messageType === 'file' ? (
                                    <div className={`flex items-center gap-3 p-3 rounded-lg mb-1 border ${isSentByMe ? 'bg-black/5 border-black/5' : 'bg-slate-50 border-slate-100'}`}>
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                                            <FileText size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-bold text-gray-900 truncate uppercase mt-1">{msg.fileName || 'Secure-Protocol.pdf'}</p>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Encrypted Document</p>
                                        </div>
                                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-black/10 rounded-full transition-colors text-blue-600">
                                            <Download size={18} />
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-sm font-medium leading-relaxed mb-1 break-words">{msg.message || ''}</p>
                                )}

                                <div className="flex items-center justify-end gap-1 px-1 opacity-50">
                                    <span className="text-[9px] font-bold uppercase tracking-tighter">
                                        {msg.createdAt ? safeMessageTime(msg.createdAt) : '--:--'}
                                    </span>
                                    {isSentByMe && (
                                        <div className="flex">
                                            {msg.status === 'seen' ? (
                                                <CheckCheck size={14} className="text-blue-500 -ml-0.5" />
                                            ) : (
                                                <Check size={14} className="text-gray-400" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* Status Banner */}
            {isClosed && (
                <div className="px-6 py-2 bg-[#fff3c7] border-t border-[#e8d5a7] flex items-center justify-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <p className="text-[9px] font-black text-[#714f1e] uppercase tracking-widest text-center">
                        Case Resolved – Chat Disabled
                    </p>
                </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSend} className="px-4 py-3 bg-[#f0f0f0] flex items-center gap-2 border-t border-slate-200">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload}
                />
                
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isClosed || uploading}
                    className="p-3 text-slate-500 hover:text-[#075e54] hover:bg-slate-200 rounded-full transition-all disabled:opacity-50"
                    title="Attach Secure Dossier"
                >
                    {uploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
                </button>

                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isClosed}
                        placeholder={isClosed ? "Tactical channel closed." : "Transmit secure message..."}
                        className="w-full bg-white border border-slate-200 rounded-full px-5 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#075e54]/20 transition-all disabled:bg-slate-100 placeholder:text-slate-400 text-slate-800"
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={!input.trim() || isClosed || uploading}
                    className="bg-[#25d366] hover:bg-[#1ebe57] text-white p-3 rounded-full shadow-lg transition-all active:scale-90 disabled:bg-slate-300 disabled:shadow-none flex-shrink-0"
                >
                    <Send size={18} />
                </button>
            </form>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
            `}} />
        </div>
    );
};

export default InvestigationChat;
