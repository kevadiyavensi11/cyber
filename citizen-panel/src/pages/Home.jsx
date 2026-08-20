import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import {
    ShieldCheck,
    FileText,
    Activity,
    ShieldAlert,
    Search,
    Lock,
    Cpu,
    Target,
    Zap,
    Globe,
    Compass,
    Radar,
    Crosshair,
    Navigation,
    UserCheck,
    Layers,
    ChevronRight,
    MousePointer2,
    MapPin,
    RefreshCcw,
    MousePointer,
    Mail,
    Key
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icon in Vite/React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const CITY_CENTER_LAT = 21.15;
const CITY_CENTER_LNG = 72.85;

const zoneCoordinates = {
    "North Zone": [21.22, 72.85],
    "South Zone": [21.08, 72.85],
    "East Zone": [21.15, 72.93],
    "West Zone": [21.15, 72.77],
    "Central Zone": [21.15, 72.85]
};

const detectZone = (lat, lng) => {
    // Priority based on User Request Logic
    if (lat > CITY_CENTER_LAT) return "North Zone";
    if (lat < CITY_CENTER_LAT) return "South Zone";
    if (lng > CITY_CENTER_LNG) return "East Zone";
    if (lng < CITY_CENTER_LNG) return "West Zone";
    return "Central Zone";
};

const zoneColorMap = {
    "North Zone": "emerald",
    "East Zone": "amber",
    "West Zone": "purple",
    "South Zone": "indigo",
    "Central Zone": "sky"
};

const Home = () => {
    const [selectedZone, setSelectedZone] = useState(null);
    const [markerPos, setMarkerPos] = useState(null);
    const [mapCenter, setMapCenter] = useState([CITY_CENTER_LAT, CITY_CENTER_LNG]);

    const MapUpdater = ({ center }) => {
        const map = useMapEvents({});
        React.useEffect(() => {
            if (center) {
                map.flyTo(center, 14, { duration: 1.5 });
            }
        }, [center, map]);
        return null;
    };

    const handleZoneSelect = (zoneName) => {
        const coords = zoneCoordinates[zoneName];
        if (coords) {
            setSelectedZone(zoneName);
            setMarkerPos({ lat: coords[0], lng: coords[1] });
            setMapCenter(coords);
            localStorage.setItem('incident_location', JSON.stringify({
                latitude: coords[0],
                longitude: coords[1],
                zone: zoneName
            }));
        }
    };

    React.useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setMapCenter([latitude, longitude]);
                    setMarkerPos({ lat: latitude, lng: longitude });
                    const zone = detectZone(latitude, longitude);
                    setSelectedZone(zone);
                    localStorage.setItem('incident_location', JSON.stringify({
                        latitude,
                        longitude,
                        zone
                    }));
                },
                () => {
                    // Permission denied or error, stay at default
                    setMarkerPos({ lat: CITY_CENTER_LAT, lng: CITY_CENTER_LNG });
                }
            );
        } else {
            setMarkerPos({ lat: CITY_CENTER_LAT, lng: CITY_CENTER_LNG });
        }
    }, []);

    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setMarkerPos(e.latlng);
                const zone = detectZone(lat, lng);
                setSelectedZone(zone);
                localStorage.setItem('incident_location', JSON.stringify({
                    latitude: lat,
                    longitude: lng,
                    zone
                }));
            },
        });

        return markerPos === null ? null : (
            <Marker
                position={markerPos}
                draggable={true}
                eventHandlers={{
                    dragend: (e) => {
                        const marker = e.target;
                        const position = marker.getLatLng();
                        const { lat, lng } = position;
                        setMarkerPos(position);
                        const zone = detectZone(lat, lng);
                        setSelectedZone(zone);
                        localStorage.setItem('incident_location', JSON.stringify({
                            latitude: lat,
                            longitude: lng,
                            zone
                        }));
                    },
                }}
            />
        );
    };

    const getZoomStyle = () => {
        if (!selectedZone) return 'scale-100 translate-x-0 translate-y-0';
        switch (selectedZone) {
            case 'North Zone': return 'scale-[2.2] translate-x-[25%] translate-y-[25%]';
            case 'South Zone': return 'scale-[2.2] -translate-x-[25%] -translate-y-[25%]';
            case 'East Zone': return 'scale-[2.2] -translate-x-[25%] translate-y-[25%]';
            case 'West Zone': return 'scale-[2.2] translate-x-[25%] -translate-y-[25%]';
            case 'Central Zone': return 'scale-[2.2] translate-y-[30%]';
            default: return 'scale-100';
        }
    };
    return (
        <div className="min-h-screen bg-[#f0f7ff] text-gray-900 selection:bg-blue-500/30 overflow-x-hidden font-app">
            <style>
                {`
                :root {
                    --zone-emerald-bg: #10b981;
                    --zone-emerald-border: #34d399;
                    --zone-emerald-text: #064e3b;
                    
                    --zone-amber-bg: #f59e0b;
                    --zone-amber-border: #fbbf24;
                    --zone-amber-text: #78350f;
                    
                    --zone-purple-bg: #8b5cf6;
                    --zone-purple-border: #a78bfa;
                    --zone-purple-text: #4c1d95;
                    
                    --zone-indigo-bg: #4f46e5;
                    --zone-indigo-border: #818cf8;
                    --zone-indigo-text: #312e81;
                    
                    --zone-sky-bg: #0ea5e9;
                    --zone-sky-border: #38bdf8;
                    --zone-sky-text: #0c4a6e;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes scan {
                    0% { transform: translateY(-100%); opacity: 0; }
                    50% { opacity: 0.5; }
                    100% { transform: translateY(100vh); opacity: 0; }
                }
                .animate-scan {
                    animation: scan 4s linear infinite;
                }
                .dark-map .leaflet-tile-pane {
                    filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3);
                }
                `}
            </style>

            <div className="bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0F172A] relative overflow-hidden text-white">
                <PublicNavbar />

                {/* Background Ambient Effects */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse-slow"></div>
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-scan"></div>
                </div>

                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden z-10">
                    <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="text-left space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-400/30">
                                <ShieldCheck size={14} className="text-blue-300" />
                                <span className="text-[10px] font-semibold text-blue-200 uppercase tracking-[0.2em]">Premium Intelligence System</span>
                            </div>

                            <h1 className="text-2xl md:text-5xl font-semibold text-white leading-tight tracking-tight">
                                Advanced Cyber Threat <br />
                                <span className="text-blue-400">Monitoring & Response</span>
                            </h1>

                            <p className="text-base text-blue-100 leading-relaxed max-w-xl font-medium">
                                A sophisticated ecosystem designed for real-time surveillance. Our system automatically routes signals to localized response units, ensuring every threat is addressed with precision.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                                 <Link to="/register">
                                    <button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-xl px-8 py-5 transition-all hover:scale-105 flex items-center justify-center gap-3 font-medium text-xs uppercase tracking-widest shadow-xl shadow-blue-900/50 active:scale-95">
                                        Report Threat <ShieldAlert size={18} />
                                    </button>
                                </Link>
                                <Link to="/login">
                                    <button className="w-full sm:w-auto bg-white/5 border border-blue-400/30 text-blue-200 rounded-xl px-8 py-5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 font-medium text-xs uppercase tracking-widest active:scale-95 backdrop-blur-md">
                                        Track Incidents <Search size={18} />
                                    </button>
                                </Link>
                            </div>
                        </div>

                        <div className="relative flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-8 duration-1000 font-sans tracking-tighter text-blue-400">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-72 h-72 bg-blue-500/20 blur-3xl rounded-full"></div>
                            <div className="relative animate-float">
                                <div className="bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-white/10 shadow-3xl">
                                    <svg width="240" height="240" viewBox="0 0 100 100" className="drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                                        <defs>
                                            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                                                <stop offset="100%" style={{ stopColor: '#1e3a8a', stopOpacity: 1 }} />
                                            </linearGradient>
                                        </defs>
                                        <path d="M50 10 L85 25 V50 C85 75 50 90 50 90 C50 90 15 75 15 50 V25 L50 10 Z" fill="url(#shieldGrad)" />
                                        <path d="M50 20 L75 30 V50 C75 70 50 80 50 80 C50 80 25 70 25 50 V30 L50 20 Z" fill="white" opacity="0.1" />
                                        <circle cx="50" cy="50" r="15" stroke="white" strokeWidth="2" fill="none" opacity="0.5" />
                                        <path d="M40 50 L47 57 L60 43" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                    </svg>
                                </div>

                                <div className="absolute -bottom-6 -left-6 bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl shadow-3xl border border-white/10 flex items-center gap-4 animate-float" style={{ animationDelay: '1s' }}>
                                    <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-500/20">
                                        <Activity size={24} className="text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-blue-400/60 font-semibold uppercase tracking-[0.2em] mb-1">Live Telemetry</p>
                                        <p className="text-xs font-semibold text-white">Active Node Online</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Feature Cards Section */}
            <section className="py-24 max-w-6xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">System Capabilities</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed font-semibold uppercase tracking-[0.4em] text-[10px]">Strategic Cybersecurity Infrastructure Matrix</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        {
                            title: "Live Tracking",
                            desc: "Real-time surveillance of threat incident signals with precise telemetry.",
                            icon: Activity,
                            img: "/images/digital_investigation_viz_1772471915417.png",
                            color: "blue"
                        },
                        {
                            title: "Zone Assignment",
                            desc: "Autonomous allocation of reports to relevant departmental zones based on GPS.",
                            icon: Layers,
                            img: "/images/zone_detection_viz_3d_1772471797200.png",
                            color: "indigo"
                        },
                        {
                            title: "Investigation",
                            desc: "Comprehensive tools for security officials to process and resolve threats.",
                            icon: Search,
                            img: "/images/live_tracking_viz_1772471769869.png",
                            color: "blue"
                        },
                        {
                            title: "Broadcast Notification",
                            desc: "Immediate dissemination of security alerts to authorized personnel via secure channels.",
                            icon: Zap,
                            img: "/images/secure_broadcast_viz_1772472313304.png",
                            color: "indigo"
                        }
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-3 overflow-hidden transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl hover:border-blue-200 group flex flex-col h-full relative">
                            <div className="relative h-56 rounded-[2rem] overflow-hidden mb-6">
                                <img src={feature.img} alt={feature.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl text-blue-600 border border-white/50 shadow-xl group-hover:rotate-12 transition-transform duration-500">
                                    <feature.icon size={22} strokeWidth={2.5} />
                                </div>
                            </div>
                            <div className="px-6 pb-6 flex-grow">
                                <h3 className="text-xl font-semibold text-gray-900 mb-3 tracking-tight">{feature.title}</h3>
                                <p className="text-[10px] text-gray-400 leading-relaxed font-semibold uppercase tracking-widest">{feature.desc}</p>
                                <div className="mt-6 flex items-center gap-2 text-blue-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0 duration-500">
                                    <span className="text-[9px] font-semibold uppercase tracking-widest">Explore System</span>
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works Section */}
            <section className="relative py-24 bg-[#f0f7ff] overflow-hidden z-10">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm -z-10"></div>
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Global Response Protocol</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto font-semibold uppercase tracking-[0.3em] text-[10px]">Seamless Operational Workflow Matrix</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                title: "Threat Detection",
                                desc: "Citizens detect and report cyber threats through our end-to-end encrypted portal with real-time signal validation.",
                                icon: MousePointer2,
                                color: "blue"
                            },
                            {
                                step: "02",
                                title: "Strategic Routing",
                                desc: "Our AI-driven logic assesses the threat geo-zone and routes signals to specific Tactical Response Units.",
                                icon: Target,
                                color: "indigo"
                            },
                            {
                                step: "03",
                                title: "Resolution Sync",
                                desc: "Certified field officers investigate incidents and sync telemetry until the threat is fully neutralized.",
                                icon: ShieldCheck,
                                color: "emerald"
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white rounded-[3rem] p-12 border border-blue-50/50 hover:border-blue-200 transition-all duration-500 group relative overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-4">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50/50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50" />

                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-semibold text-lg mb-10 shadow-2xl transition-all duration-500 group-hover:rotate-12 ${item.color === 'blue' ? 'bg-blue-600 text-white shadow-blue-200' :
                                    item.color === 'indigo' ? 'bg-indigo-600 text-white shadow-indigo-200' :
                                        'bg-emerald-600 text-white shadow-emerald-200'
                                    }`}>
                                    {item.step}
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">{item.title}</h3>
                                <p className="text-[11px] text-gray-500 leading-relaxed font-normal mb-6">
                                    {item.desc}
                                </p>

                                <div className="w-16 h-1 bg-gray-100 rounded-full group-hover:w-full group-hover:bg-blue-500 transition-all duration-700"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Cyber Awareness Section */}
            <section className="py-24 bg-[#f0f7ff] relative z-10 overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 relative z-20">
                    <div className="text-center mb-20 space-y-4">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 mb-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em]">Guardian Protocol</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Stay Safe Online</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                            Empowering our community with essential cyber hygiene practices to ensure a secure digital environment for everyone.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Never Share OTP",
                                desc: "One-Time Passwords are for your eyes only. Official representatives will never ask for them.",
                                icon: ShieldAlert,
                                color: "blue"
                            },
                            {
                                title: "Avoid Suspicious Links",
                                desc: "Do not click on links from unknown sources. Always verify the domain before proceeding.",
                                icon: MousePointer2,
                                color: "blue"
                            },
                            {
                                title: "Enable 2FA",
                                desc: "Add an extra layer of security to your accounts with Two-Factor Authentication.",
                                icon: Lock,
                                color: "blue"
                            },
                            {
                                title: "Verify Unknown Emails",
                                desc: "Phishing attempts often use spoofed email addresses. Check headers carefully.",
                                icon: Mail,
                                color: "blue"
                            },
                            {
                                title: "Use Strong Passwords",
                                desc: "Combine uppercase, lowercase, numbers, and symbols. Use a unique password for every site.",
                                icon: Key,
                                color: "blue"
                            },
                            {
                                title: "Secure Your Devices",
                                desc: "Keep your operating system and security software updated to protect against latest threats.",
                                icon: Cpu,
                                color: "blue"
                            }
                        ].map((tip, idx) => (
                            <div 
                                key={idx} 
                                className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col h-full"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                    <tip.icon size={28} strokeWidth={2} />
                                </div>
                                
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                    {tip.title}
                                </h3>
                                
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {tip.desc}
                                </p>
                                
                                <div className="mt-auto pt-6">
                                    <div className="w-10 h-1 bg-gray-100 rounded-full group-hover:w-full group-hover:bg-blue-500 transition-all duration-500"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Zone-Based Monitoring network */}
            <section className="py-24 relative overflow-hidden z-10 bg-[#0b1437]">
                {/* Tactical subtle gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-indigo-900/20 -z-10"></div>
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full -z-10 animate-pulse-slow"></div>
                
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-20 space-y-6">
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-blue-500/10 rounded-2xl border border-blue-400/20 mb-2 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_12px_rgba(96,165,250,0.6)]"></span>
                            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-[0.4em]">Tactical Surveillance Interface</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight drop-shadow-2xl">Zone-Based Monitoring Network</h2>
                        <p className="text-blue-100/40 max-w-2xl mx-auto leading-relaxed font-normal px-8 py-2 border-x border-blue-500/20 uppercase tracking-[0.3em] text-[11px] backdrop-blur-sm">
                            "Real-time signal triangulation across five specialized tactical sectors"
                        </p>
                    </div>

                    <div className="relative group">
                        <div className="bg-[#0b1437]/60 backdrop-blur-3xl rounded-[4rem] shadow-3xl border border-white/5 p-4 relative overflow-hidden min-h-[600px] flex flex-col lg:flex-row gap-4">

                            {/* Tactical Sidebar */}
                            <div className="lg:w-80 flex flex-col z-[100] bg-[#0b1437]/80 backdrop-blur-3xl rounded-[3.5rem] border border-white/10 p-6 shrink-0 h-auto lg:h-[600px] shadow-2xl relative overflow-hidden">
                                {/* Decorative internal glow */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                                
                                <div className="mb-8 px-2 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.4em] mb-1">Operational</p>
                                        <h4 className="text-xl font-bold text-white tracking-tight">Tactical Sectors</h4>
                                    </div>
                                    <div className="p-2 bg-white/5 rounded-xl border border-white/10 text-blue-400">
                                        <Radar size={18} className="animate-pulse" />
                                    </div>
                                </div>

                                <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto no-scrollbar pb-4 lg:pb-0 pr-1">
                                    {[
                                        { name: "North Zone", icon: Compass, desc: "Northern Border Surveillance", color: "emerald", glow: "rgba(16, 185, 129, 0.2)", status: "Active" },
                                        { name: "East Zone", icon: Activity, desc: "Eastern Hub Monitoring", color: "amber", glow: "rgba(245, 158, 11, 0.2)", status: "Monitoring" },
                                        { name: "West Zone", icon: Layers, desc: "Western Coastal Scan", color: "purple", glow: "rgba(139, 92, 246, 0.2)", status: "Secured" },
                                        { name: "South Zone", icon: Crosshair, desc: "Southern Industrial Grid", color: "rose", glow: "rgba(244, 63, 94, 0.2)", status: "Active" },
                                        { name: "Central Zone", icon: Target, desc: "Core Strategic Center", color: "sky", glow: "rgba(14, 165, 233, 0.2)", status: "Primary" }
                                    ].map((zone, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleZoneSelect(zone.name)}
                                            className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 group relative overflow-hidden shrink-0 min-h-[90px] flex items-center ${selectedZone === zone.name
                                                ? 'bg-blue-600/10 border-blue-500/40 shadow-2xl backdrop-blur-xl'
                                                : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/20 backdrop-blur-md'
                                                }`}
                                        >
                                            {/* Selection indicator line */}
                                            {selectedZone === zone.name && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[2px_0_15px_rgba(59,130,246,0.6)]"></div>
                                            )}
                                            
                                            <div className="flex items-center gap-5 relative z-10">
                                                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${selectedZone === zone.name
                                                    ? 'bg-blue-600 text-white shadow-lg'
                                                    : 'bg-white/5 text-blue-400 group-hover:text-blue-200 border border-white/10'
                                                    }`}
                                                >
                                                    <zone.icon size={22} className={selectedZone === zone.name ? '' : 'opacity-60'} />
                                                </div>
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-3 mb-1.5">
                                                        <span className={`text-[11px] font-bold uppercase tracking-[0.2em] ${selectedZone === zone.name ? 'text-white' : 'text-blue-100/70 group-hover:text-white'}`}>
                                                            {zone.name.replace(' Zone', '')}
                                                        </span>
                                                        <div className={`px-2 py-0.5 rounded-md text-[7px] font-bold uppercase tracking-tighter border transition-all ${selectedZone === zone.name 
                                                            ? 'bg-blue-500/20 border-blue-400/50 text-blue-100' 
                                                            : 'bg-white/5 border-white/10 text-white/30 group-hover:text-white/60'}`}
                                                        >
                                                            {zone.status}
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] font-medium leading-normal tracking-wide ${selectedZone === zone.name ? 'text-white/60' : 'text-blue-100/20 group-hover:text-blue-100/40'}`}>
                                                        {zone.desc}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Background glow for selected */}
                                            {selectedZone === zone.name && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent animate-pulse-slow"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto pt-8 border-t border-white/5 hidden lg:block">
                                    <div className="flex items-center justify-between px-2 mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Network_Online</span>
                                        </div>
                                        <span className="text-[9px] font-bold text-blue-100/30 tracking-tight">V.4.2.0-STABLE</span>
                                    </div>
                                    
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
                                        <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-blue-100/40">
                                            <span>Signal Security</span>
                                            <span className="text-blue-400">98%</span>
                                        </div>
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500/50 w-[98%]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Map Container Area */}
                            <div className="flex-1 relative">
                                {/* Map Labels Overlay */}
                                <div className="absolute top-6 left-6 z-[1000] pointer-events-none">
                                <div className="bg-slate-900/80 backdrop-blur-2xl px-6 py-4 rounded-3xl border border-white/10 shadow-2xl">
                                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.4em] mb-2">Tactical Signal</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: selectedZone ? `var(--zone-${zoneColorMap[selectedZone]}-bg)` : '#ef4444' }}></div>
                                        <h4 className="text-xs font-bold text-white tracking-[0.2em] transition-colors duration-500 uppercase">
                                            {selectedZone ? `LOCKED: ${selectedZone}` : 'SCANNING_OMNI_NODE'}
                                        </h4>
                                    </div>
                                </div>
                                </div>

                                {/* Map Container */}
                                <div className="w-full h-[500px] lg:h-[600px] rounded-[3.5rem] overflow-hidden relative z-0 border border-white/10 shadow-[0_0_50px_rgba(30,58,138,0.3)]">
                                    <MapContainer
                                        center={mapCenter}
                                        zoom={13}
                                        scrollWheelZoom={true}
                                        className="h-full w-full dark-map"
                                        style={{ background: '#030712' }}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <LocationMarker />
                                        <MapUpdater center={mapCenter} />
                                    </MapContainer>
                                </div>

                                {/* Call to Action Overlay */}
                                <div className="absolute bottom-6 right-6 z-[1000]">
                                    <Link to="/submit-report">
                                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-2xl transition-all hover:scale-110 active:scale-95 border border-white/20 whitespace-nowrap">
                                            Lodge Tactical Report <ShieldAlert size={16} />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Workflow Section */}
            <section className="py-24 bg-[#f0f7ff] relative z-10">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-semibold text-gray-900 tracking-tight">Investigation Workflow</h2>
                        <p className="text-gray-400 max-w-3xl mx-auto leading-relaxed font-semibold uppercase tracking-[0.3em] text-[10px]">End-to-End Cryptographically Audited operational sequence</p>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center justify-between gap-10 relative">
                        {/* Connector Line */}
                        <div className="hidden lg:block absolute top-[40%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent -z-0"></div>

                        {[
                            { num: "01", title: "Threat Reported", icon: MousePointer2, desc: "Incidents submitted via encrypted portal with biometric auth.", img: "/images/workflow_step_1_reported_1772472348486.png" },
                            { num: "02", title: "Geo-Detection", icon: Target, desc: "AI logic identifies target tactical geo-zone instantly.", img: "/images/workflow_step_2_detected_1772472382748.png" },
                            { num: "03", title: "Officer Assigned", icon: UserCheck, desc: "Signal routed to nearest available Tactical Response Unit.", img: "/images/secure_broadcast_viz_1772472313304.png" },
                            { num: "04", title: "Investigation", icon: Activity, desc: "Active field forensics and real-time telemetry logging.", img: "/images/digital_investigation_viz_1772471915417.png" },
                            { num: "05", title: "Case Resolved", icon: ShieldCheck, desc: "Verified resolution with full cryptographic audit trail.", img: "/images/live_tracking_viz_1772471769869.png" }
                        ].map((step, idx) => (
                            <div key={idx} className="relative z-10 w-full lg:w-64 group">
                                <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-6 hover:border-blue-200">
                                    <div className="h-44 w-full relative overflow-hidden">
                                        <img src={step.img} alt={step.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 shadow-inner" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                                        <div className="absolute top-6 left-6 w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-semibold text-sm shadow-2xl shadow-blue-200 group-hover:rotate-12 transition-transform">
                                            {step.num}
                                        </div>
                                    </div>
                                    <div className="p-8 text-center">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-widest">{step.title}</h3>
                                        <p className="text-[10px] text-gray-400 font-semibold leading-relaxed px-2">{step.desc}</p>
                                    </div>
                                </div>
                                {idx < 4 && (
                                    <div className="hidden lg:block absolute top-[25%] -right-5 translate-x-1/2 w-10 h-10 rounded-full bg-white border border-gray-100 shadow-lg flex items-center justify-center text-blue-600 z-20 group-hover:scale-110 transition-all">
                                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                                {idx < 4 && (
                                    <div className="lg:hidden w-[1px] h-12 bg-blue-500/10 mx-auto my-6"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
};

export default Home;
