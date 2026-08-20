import React, { useState } from 'react';
import { Send, X, ShieldAlert, BadgeAlert, Info, MessageCircle } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import toast from 'react-hot-toast';

const SendNotificationModal = ({ isOpen, onClose, receiverId, receiverName, receiverRole }) => {
    const { sendNotification } = useNotifications();
    const [message, setMessage] = useState('');
    const [type, setType] = useState('system-alert');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) {
            toast.error('Please enter a message');
            return;
        }

        setLoading(true);
        try {
            await sendNotification({
                message,
                receiverId,
                receiverRole: receiverRole || 'citizen',
                type,
            });
            toast.success('Notification sent successfully');
            setMessage('');
            onClose();
        } catch (error) {
            toast.error('Failed to send notification');
        } finally {
            setLoading(false);
        }
    };

    const types = [
        { id: 'system-alert', label: 'System Alert', icon: <Info size={16} />, color: 'bg-blue-50 text-blue-600 border-blue-100' },
        { id: 'warning', label: 'Warning', icon: <ShieldAlert size={16} />, color: 'bg-red-50 text-red-600 border-red-100' },
        { id: 'assignment', label: 'Assignment', icon: <BadgeAlert size={16} />, color: 'bg-purple-50 text-purple-600 border-purple-100' },
        { id: 'report-update', label: 'Update', icon: <MessageCircle size={16} />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    ];

    return (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl border border-blue-50 relative animate-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                    <X size={20} />
                </button>

                <div className="mb-8">
                    <h3 className="text-2xl font-black text-blue-900 tracking-tight uppercase">Broadcast Alert</h3>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-2 flex items-center gap-2">
                        Target: <span className="text-blue-600">{receiverName || 'System User'}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Alert Category</label>
                        <div className="grid grid-cols-2 gap-3">
                            {types.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setType(t.id)}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${type === t.id
                                            ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-100/50'
                                            : 'border-gray-50 bg-gray-50/50'
                                        }`}
                                >
                                    <div className={`p-2 rounded-xl border ${t.color}`}>
                                        {t.icon}
                                    </div>
                                    <span className={`text-[11px] font-black uppercase tracking-wider ${type === t.id ? 'text-blue-700' : 'text-gray-500'}`}>
                                        {t.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Alert Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter the alert content..."
                            className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-3xl outline-none focus:bg-white focus:border-blue-200 transition-all font-bold text-sm text-gray-700 min-h-[140px] resize-none"
                        />
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? 'Transmitting...' : <><Send size={16} /> Transmit Alert</>}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] text-gray-400 hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SendNotificationModal;
