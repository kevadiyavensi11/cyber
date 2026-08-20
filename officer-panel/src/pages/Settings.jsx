import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import {
    LayoutDashboard,
    Users,
    FileText,
    Activity,
    Bell,
    Lock,
    Globe,
    Shield,
    User as UserIcon,
    Settings as SettingsIcon,
    PlusCircle,
    Check,
    Cpu,
    Zap,
    Key,
    ShieldCheck,
    Navigation,
    Laptop,
    Fingerprint
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = ({ role = 'officer' }) => {
    const [notifications, setNotifications] = useState('active');
    const [region, setRegion] = useState('Global (IST)');
    const [auditTrail, setAuditTrail] = useState(true);
    const [isEnrolling, setIsEnrolling] = useState(false);

    const handleSave = () => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 800)),
            {
                loading: 'Synchronizing protocols...',
                success: 'System preferences updated',
                error: 'Update failed',
            },
            {
                style: {
                    borderRadius: '1.5rem',
                    background: '#fff',
                    color: '#111827',
                    border: '1px solid #f1f5f9',
                    fontSize: '11px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }
            }
        );
    };

    const handleEnroll = () => {
        setIsEnrolling(true);
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1500)),
            {
                loading: 'Generating keys...',
                success: '2FA Enrollment complete',
                error: 'Enrollment failed',
            },
            {
                style: {
                    borderRadius: '1.5rem',
                    background: '#fff',
                    color: '#111827',
                    border: '1px solid #f1f5f9',
                    fontSize: '11px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }
            }
        ).finally(() => setIsEnrolling(false));
    };

    const officerLinks = [
        { label: 'Dashboard', path: '/officer/dashboard', icon: LayoutDashboard },
        { label: 'Assigned Reports', path: '/cases', icon: FileText },
        { label: 'Reports', path: '/reports', icon: FileText },
        { label: 'Profile', path: '/profile', icon: UserIcon },
        { label: 'Settings', path: '/settings', icon: SettingsIcon },
    ];

    const SettingItem = ({ title, description, icon: Icon, children }) => (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-10 hover:bg-gray-50/50 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none transition-transform group-hover:scale-110 duration-1000 text-blue-600">
                <Icon size={120} />
            </div>
            <div className="flex items-center gap-8 mb-6 sm:mb-0 relative z-10">
                <div className="w-16 h-16 bg-blue-50 rounded-3xl border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-all duration-500 shadow-sm">
                    <Icon size={28} />
                </div>
                <div className="text-left">
                    <h4 className="text-xl font-bold text-gray-900 tracking-tight leading-none mb-2">{title}</h4>
                    <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-widest">{description}</p>
                </div>
            </div>
            <div className="w-full sm:w-auto flex justify-start sm:justify-end relative z-10">{children}</div>
        </div>
    );

    return (
        <MainLayout links={officerLinks} userRole="Officer">
            <div className="max-w-6xl mx-auto relative z-10 p-2 md:p-6">
                {/* Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

                {/* Header Section */}
                <div className="mb-12 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-4">
                        <Cpu className="text-blue-600" size={12} />
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-600">Environment Configuration</span>
                    </div>
                    <h2 className="text-3xl font-bold text-[#2D4A9D] tracking-tight leading-none">System Preferences</h2>
                    <p className="text-gray-500 mt-2 font-medium tracking-wide text-xs">Optimize tactical interface and local encryption standards.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    {/* Settings List */}
                    <div className="lg:col-span-3 space-y-10">
                        <div className="bg-white rounded-[3rem] overflow-hidden divide-y divide-gray-50 shadow-xl shadow-blue-600/5 border border-gray-100 animate-in slide-in-from-bottom-6 duration-700">
                            <SettingItem
                                title="Neural Alerts"
                                description="Real-time pulse notifications for high-priority signals."
                                icon={Bell}
                            >
                                <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                                    <button
                                        onClick={() => setNotifications('active')}
                                        className={`px-8 py-3 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all duration-300 ${notifications === 'active'
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        Live_Signal
                                    </button>
                                    <button
                                        onClick={() => setNotifications('silent')}
                                        className={`px-8 py-3 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all duration-300 ${notifications === 'silent'
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        Silent_Mode
                                    </button>
                                </div>
                            </SettingItem>

                            <SettingItem
                                title="Bio-Metric Lock"
                                description="Provision secondary hardware encryption or finger-print ID."
                                icon={Fingerprint}
                            >
                                <button
                                    onClick={handleEnroll}
                                    disabled={isEnrolling}
                                    className="px-10 py-5 bg-white hover:bg-blue-600 text-blue-600 hover:text-white rounded-3xl text-[10px] font-semibold uppercase tracking-widest transition-all duration-500 border border-blue-100 hover:border-blue-600 active:scale-[0.98] disabled:opacity-20 flex items-center gap-4 group shadow-sm"
                                >
                                    {isEnrolling ? <Zap className="animate-spin" size={16} /> : <Fingerprint size={16} className="group-hover:rotate-12 transition-transform" />}
                                    {isEnrolling ? 'TRANSMITTING...' : 'SYNC_HARDWARE'}
                                </button>
                            </SettingItem>

                            <SettingItem
                                title="Regional Clusters"
                                description="Adjust operative compliance for localized sectors."
                                icon={Globe}
                            >
                                <div className="relative group">
                                    <select
                                        value={region}
                                        onChange={(e) => setRegion(e.target.value)}
                                        className="bg-white border border-gray-100 rounded-2xl px-10 py-5 text-[10px] font-semibold uppercase tracking-widest text-gray-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 transition-all cursor-pointer appearance-none min-w-[220px] shadow-sm"
                                    >
                                        <option>Sector-Alpha (IST)</option>
                                        <option>Sector-Beta (EMEA)</option>
                                        <option>Sector-Gamma (APAC)</option>
                                        <option>Sector-Delta (USA)</option>
                                    </select>
                                    <Navigation size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-blue-600 transition-colors pointer-events-none" />
                                </div>
                            </SettingItem>

                            <SettingItem
                                title="Tactical Audit"
                                description="Retain comprehensive session logs for mission review."
                                icon={Shield}
                            >
                                <div
                                    onClick={() => setAuditTrail(!auditTrail)}
                                    className={`w-20 h-10 rounded-full flex items-center px-2 cursor-pointer transition-all duration-500 relative border ${auditTrail
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'bg-gray-100 border-gray-200'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-lg transition-all duration-500 flex items-center justify-center relative ${auditTrail
                                        ? 'translate-x-10 bg-white rotate-0'
                                        : 'translate-x-0 bg-white rotate-45'
                                        }`}>
                                        {auditTrail ? <Check size={14} className="text-blue-600" /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                                    </div>
                                </div>
                            </SettingItem>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleSave}
                                className="px-16 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[2.5rem] font-bold text-[11px] uppercase tracking-widest transition-all duration-500 shadow-xl shadow-blue-600/20 active:scale-[0.98] group relative overflow-hidden"
                            >
                                COMMIT_ENVIRONMENT_PROTOCOL
                            </button>
                        </div>
                    </div>

                    {/* Meta Section */}
                    <div className="space-y-10 animate-in slide-in-from-right-6 duration-700">
                        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-600/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] transition-transform group-hover:scale-110 duration-1000 text-blue-600">
                                <Laptop size={80} />
                            </div>
                            <h4 className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest mb-10 flex items-center gap-3">
                                <ShieldCheck size={14} /> Node Info
                            </h4>
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kernel Version</p>
                                    <p className="text-[11px] font-semibold text-gray-900 uppercase tracking-widest font-mono">CyberGuard TAC V2.1.0</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Neural Uplink</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-widest leading-none">STABLE_CONNECTED</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Sync</p>
                                    <p className="text-[11px] font-semibold text-gray-700 uppercase tracking-widest leading-none">2026.03.02 | 09:12:44</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50/50 rounded-[3rem] p-10 border border-blue-100 relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 opacity-[0.05] group-hover:scale-110 transition-transform duration-1000 text-blue-600">
                                <Activity size={120} />
                            </div>
                            <h4 className="text-[10px] font-semibold text-blue-600 tracking-widest uppercase mb-8">System Diagnostics</h4>
                            <ul className="space-y-6">
                                {[
                                    'Encryption: X25519-AES-GCM',
                                    'Handshake: ECDHE-RSA',
                                    'Pinger: 14ms (Central)'
                                ].map((text, idx) => (
                                    <li key={idx} className="flex items-center gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">{text}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Settings;
