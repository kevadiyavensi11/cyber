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
    Radio,
    Map as MapIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = ({ role = 'citizen' }) => {
    const [notifications, setNotifications] = useState('active');
    const [region, setRegion] = useState('Global (IST)');
    const [auditTrail, setAuditTrail] = useState(true);
    const [isEnrolling, setIsEnrolling] = useState(false);

    const handleSave = () => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 800)),
            {
                loading: 'Synchronizing encryption protocols...',
                success: 'System preferences updated successfully',
                error: 'Failed to update configuration',
            }
        );
    };

    const handleEnroll = () => {
        setIsEnrolling(true);
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1500)),
            {
                loading: 'Generating cryptographic keys...',
                success: '2FA Hardware Enrollment complete',
                error: 'Enrollment failed',
            }
        ).finally(() => setIsEnrolling(false));
    };

    const adminLinks = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'User Registry', path: '/citizens', icon: Users },
        { label: 'All Reports', path: '/reports', icon: FileText },
        { label: 'Zone Wise Map', path: '/admin/zone-map', icon: MapIcon },
        { label: 'Broadcasts', path: '/broadcast', icon: Radio },
        { label: 'System Logs', path: '/logs', icon: Activity },
        { label: 'Profile', path: '/profile', icon: UserIcon },
        { label: 'Settings', path: '/settings', icon: SettingsIcon },
    ];

    const authorityLinks = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Case Handling', path: '/cases', icon: FileText },
        { label: 'Profile', path: '/profile', icon: UserIcon },
        { label: 'Settings', path: '/settings', icon: SettingsIcon },
    ];

    const citizenLinks = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'My Reports', path: '/my-reports', icon: FileText },
        { label: 'Submit Report', path: '/submit-report', icon: PlusCircle },
        { label: 'Profile', path: '/profile', icon: UserIcon },
        { label: 'Settings', path: '/settings', icon: SettingsIcon },
    ];

    const links = role === 'admin' ? adminLinks : role === 'authority' ? authorityLinks : citizenLinks;

    const SettingItem = ({ title, description, icon: Icon, children }) => (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 hover:bg-gray-50/50 transition-all group">
            <div className="flex items-center gap-6 mb-4 sm:mb-0 text-left">
                <div className="p-4 bg-white rounded-2xl border border-gray-100 text-blue-600 shadow-sm group-hover:scale-110 transition-transform duration-500">
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                    <h4 className="text-base font-black text-gray-900 tracking-tight">{title}</h4>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">{description}</p>
                </div>
            </div>
            <div className="w-full sm:w-auto flex justify-start sm:justify-end">{children}</div>
        </div>
    );

    return (
        <MainLayout links={links} userRole={role.toUpperCase()}>
            <div className="mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">System Preferences</h2>
                <p className="text-gray-500 mt-2 font-medium">Manage your {role} security environment and localized interface.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100 animate-in slide-in-from-bottom-4 duration-700">
                <SettingItem
                    title="Real-time Alerts"
                    description="Immediate notifications for high-severity threat reports."
                    icon={Bell}
                >
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                        <button
                            onClick={() => setNotifications('active')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${notifications === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setNotifications('silent')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${notifications === 'silent' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Silent
                        </button>
                    </div>
                </SettingItem>

                <SettingItem
                    title="Hardware Security Keys"
                    description="Configure physical YubiKey or biometric authentication."
                    icon={Lock}
                >
                    <button
                        onClick={handleEnroll}
                        disabled={isEnrolling}
                        className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isEnrolling ? 'Processing...' : 'Enroll Device'}
                    </button>
                </SettingItem>

                <SettingItem
                    title="Regional Standards"
                    description="Align interface with local compliance requirements."
                    icon={Globe}
                >
                    <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-700 outline-none focus:ring-4 focus:ring-blue-50 transition-all cursor-pointer"
                    >
                        <option>Global (IST)</option>
                        <option>EMEA Protocol</option>
                        <option>APAC Standard</option>
                        <option>North America</option>
                    </select>
                </SettingItem>

                <SettingItem
                    title="Audit Logging"
                    description="Retain detailed interaction logs for security audits."
                    icon={Shield}
                >
                    <div
                        onClick={() => setAuditTrail(!auditTrail)}
                        className={`w-14 h-8 rounded-full flex items-center px-1.5 cursor-pointer transition-all shadow-lg ${auditTrail ? 'bg-blue-600 shadow-blue-100' : 'bg-gray-200 shadow-transparent'}`}
                    >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm flex items-center justify-center ${auditTrail ? 'translate-x-6' : 'translate-x-0'}`}>
                            {auditTrail && <Check size={12} className="text-blue-600" />}
                        </div>
                    </div>
                </SettingItem>
            </div>

            <div className="mt-10 flex justify-end">
                <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-[0_20px_40px_-15px_rgba(37,99,235,0.3)] active:scale-95"
                >
                    Commit Configuration
                </button>
            </div>
        </MainLayout>
    );
};

export default Settings;
