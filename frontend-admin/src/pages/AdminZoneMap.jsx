import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polygon } from 'react-leaflet';
import L from 'leaflet';
import MainLayout from '../layouts/MainLayout';
import { reportService, adminService } from '../services/api';
import {
    LayoutDashboard,
    Users as UsersIcon,
    FileText,
    Activity,
    Radio,
    Settings,
    Map as MapIcon,
    Filter,
    ChevronDown,
    Zap,
    Shield,
    Clock,
    Crosshair,
    User as UserIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

// Custom component to handle map centering/zooming
const MapController = ({ reports }) => {
    const map = useMap();
    useEffect(() => {
        if (reports && reports.length > 0) {
            const validCoords = reports.filter(r => 
                !isNaN(r.latitude) && !isNaN(r.longitude)
            ).map(r => [r.latitude, r.longitude]);
            
            if (validCoords.length > 0) {
                const bounds = L.latLngBounds(validCoords);
                map.fitBounds(bounds, { padding: [100, 100], maxZoom: 13 });
            }
        } else {
            map.setView([21.1702, 72.8311], 12); // Default to Surat Center
        }
    }, [reports, map]);
    return null;
};

const getZoneColorIcon = (zone) => {
    const colors = {
        'Central': 'red',
        'North': 'blue',
        'South': 'green',
        'East': 'orange',
        'West': 'violet',
        'North-East': 'yellow',
        'North-West': 'black',
        'South-East': 'grey',
        'South-West': 'gold'
    };

    const color = colors[zone] || 'blue';
    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
};

const AdminZoneMap = () => {
    const [reports, setReports] = useState([]);
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedZone, setSelectedZone] = useState('All');
    const [selectedReport, setSelectedReport] = useState(null);
    const [stats, setStats] = useState({ total: 0, critical: 0 });

    const adminLinks = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'User Registry', path: '/citizens', icon: UsersIcon },
        { label: 'All Reports', path: '/reports', icon: FileText },
        { label: 'Zone Wise Map', path: '/admin/zone-map', icon: MapIcon },
        { label: 'Broadcasts', path: '/broadcast', icon: Radio },
        { label: 'System Logs', path: '/logs', icon: Activity },
        { label: 'Profile', path: '/profile', icon: UserIcon },
        { label: 'Settings', path: '/settings', icon: Settings },
    ];

    const fetchMapData = async () => {
        setLoading(true);
        try {
            const [reportRes, zoneRes] = await Promise.all([
                reportService.getAllReports(),
                adminService.getZones()
            ]);

            const validReports = (Array.isArray(reportRes.data) ? reportRes.data : []).filter(r =>
                r.latitude !== undefined && r.longitude !== undefined &&
                r.latitude !== null && r.longitude !== null
            );
            setReports(validReports);
            setZones(Array.isArray(zoneRes.data) ? zoneRes.data : []);

            setStats({
                total: validReports.length,
                critical: validReports.filter(r => r.severity === 'Critical').length
            });
        } catch (error) {
            console.error('Failed to sync geospatial data:', error);
            toast.error('Failed to sync spatial intelligence');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMapData();
    }, []);

    const filteredReports = selectedZone === 'All'
        ? reports
        : reports.filter(r => r.zone === selectedZone);

    const zoneFilterOptions = ["Central", "North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"];

    return (
        <MainLayout links={adminLinks} userRole="Admin">
            <div className="flex flex-col gap-8">
                {/* Header section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Zone Wise Spatial Map</h2>
                        <p className="text-gray-500 mt-2 font-bold uppercase text-[10px] tracking-widest">Global incident monitoring & sector-specific coverage</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                            <div className="pl-4 pr-2 py-2 flex items-center gap-2 border-r border-gray-100">
                                <Filter size={14} className="text-blue-600" />
                                <span className="text-[10px] font-bold uppercase text-gray-400">Filter Zone</span>
                            </div>
                            <select
                                value={selectedZone}
                                onChange={(e) => setSelectedZone(e.target.value)}
                                className="bg-transparent text-xs font-bold text-gray-900 pr-8 pl-2 outline-none cursor-pointer appearance-none relative"
                                style={{ WebkitAppearance: 'none' }}
                            >
                                <option value="All">All Sectors</option>
                                {zoneFilterOptions.map(z => <option key={z} value={z}>{z} Zone</option>)}
                            </select>
                            <ChevronDown size={14} className="text-gray-400 mr-2 -ml-6 pointer-events-none" />
                        </div>

                        <button
                            onClick={() => {
                                fetchMapData();
                                setSelectedReport(null);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-95"
                        >
                            <Zap size={18} className={loading ? 'animate-pulse' : ''} />
                        </button>
                    </div>
                </div>

                {/* Tracking Stats Overlay */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-5 shadow-sm">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                            <Crosshair size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Live Triggers</p>
                            <p className="text-2xl font-bold text-gray-900 tracking-tighter">{filteredReports.length}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-5 shadow-sm">
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100">
                            <Shield size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Critical Breaches</p>
                            <p className="text-2xl font-bold text-gray-900 tracking-tighter">{filteredReports.filter(r => r.severity === 'Critical').length}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-5 shadow-sm">
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Last Updated</p>
                            <p className="text-2xl font-bold text-gray-900 tracking-tighter">Real-time</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[700px] animate-in fade-in duration-1000">
                    {/* Left Sidebar - Report Registry */}
                    <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm flex flex-col overflow-hidden h-full">
                        <div className="p-8 border-b border-gray-50">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter mb-1">Incident Registry</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Live data stream</p>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {filteredReports.length > 0 ? (
                                <div className="space-y-3">
                                    {filteredReports.map(r => (
                                        <button
                                            key={r._id}
                                            onClick={() => setSelectedReport(r)}
                                            className={`w-full text-left p-5 rounded-[2rem] border transition-all duration-300 group ${
                                                selectedReport?._id === r._id 
                                                ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-100' 
                                                : 'bg-white border-gray-100 hover:border-blue-200'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${selectedReport?._id === r._id ? 'bg-white shadow-[0_0_8px_white]' : 'bg-blue-600 animate-pulse'}`} />
                                                <span className={`text-[9px] font-black tracking-[0.2em] uppercase ${selectedReport?._id === r._id ? 'text-blue-100' : 'text-gray-400'}`}>
                                                    #{r._id.slice(-6).toUpperCase()}
                                                </span>
                                            </div>
                                            <p className={`text-[11px] font-black uppercase tracking-tight truncate mb-1 ${selectedReport?._id === r._id ? 'text-white' : 'text-gray-900'}`}>{r.threatTitle}</p>
                                            <div className="flex items-center justify-between">
                                                <span className={`text-[8px] font-black uppercase tracking-widest ${selectedReport?._id === r._id ? 'text-blue-200' : 'text-gray-400'}`}>{r.zone} Zone</span>
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded ${
                                                    r.severity === 'Critical' 
                                                    ? (selectedReport?._id === r._id ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600')
                                                    : (selectedReport?._id === r._id ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600')
                                                }`}>
                                                    {r.severity}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-6">
                                    <Shield size={40} className="mb-4 text-gray-400" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Zero Activity Clusters</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Content - Map */}
                    <div className="lg:col-span-3 rounded-[3rem] overflow-hidden border border-gray-100 shadow-2xl relative z-0">
                    {loading ? (
                        <div className="absolute inset-0 bg-gray-50/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4">
                            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">Spatial Intelligence Syncing...</p>
                        </div>
                    ) : null}

                    <MapContainer
                        center={[21.1702, 72.8311]}
                        zoom={12}
                        style={{ height: "100%", width: "100%" }}
                        zoomControl={false}
                    >
                        {/* Dark Professional Tiles */}
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />

                        {/* Zone Boundaries */}
                        {zones.map(zone => {
                            const zoneName = zone.name.replace(' Zone', '');
                            const colorMap = {
                                'Central': '#ef4444',
                                'North': '#3b82f6',
                                'South': '#10b981',
                                'East': '#f59e0b',
                                'West': '#8b5cf6',
                                'North-East': '#facc15',
                                'North-West': '#18181b',
                                'South-East': '#9ca3af',
                                'South-West': '#ca8a04'
                            };

                            const pathOptions = {
                                fillColor: colorMap[zoneName] || '#3b82f6',
                                fillOpacity: selectedZone === 'All' || selectedZone === zoneName ? 0.15 : 0.05,
                                color: colorMap[zoneName] || '#3b82f6',
                                weight: 2,
                                dashArray: '5, 10'
                            };

                            return (
                                <Polygon
                                    key={zone._id}
                                    positions={zone.polygon.map(p => [p.lat, p.lng])}
                                    pathOptions={pathOptions}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">{zone.name}</p>
                                            <p className="text-[9px] text-gray-400 mt-1">{zone.description}</p>
                                        </div>
                                    </Popup>
                                </Polygon>
                            );
                        })}

                        {/* Controller to handle map movements */}
                        <MapController reports={selectedReport ? [selectedReport] : filteredReports} />

                        {filteredReports.map((report) => (
                            <Marker
                                key={report._id}
                                position={[Number(report.latitude), Number(report.longitude)]}
                                icon={getZoneColorIcon(report.zone)}
                                eventHandlers={{
                                    click: () => setSelectedReport(report)
                                }}
                            >
                                <Popup>
                                    <div className="p-1 min-w-[150px]">
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{report.threatTitle}</p>
                                        <button 
                                            onClick={() => setSelectedReport(report)}
                                            className="mt-2 w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                                        >
                                            Detailed Analysis
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                    {/* Report detail floating overlay */}
                    {selectedReport && (
                        <div className="absolute top-10 left-10 z-[501] w-80 animate-in slide-in-from-left-8 fade-in duration-700">
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden shadow-blue-900/10">
                                <div className="bg-blue-600 p-8 text-white relative">
                                    <button 
                                        onClick={() => setSelectedReport(null)}
                                        className="absolute top-6 right-6 p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all text-white"
                                    >
                                        <ChevronDown size={14} className="rotate-90" />
                                    </button>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 italic">Uplink Active: #{selectedReport._id.slice(-8).toUpperCase()}</span>
                                    </div>
                                    <h4 className="text-lg font-black uppercase leading-tight tracking-tight mb-2 truncate">{selectedReport.threatTitle}</h4>
                                    <div className="flex gap-3 mt-4">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white/20 border border-white/20`}>
                                            {selectedReport.severity} Impact
                                        </span>
                                        <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white/20 border border-white/20">
                                            {selectedReport.zone} Sector
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Incident Summary</label>
                                        <p className="text-xs font-medium text-gray-700 leading-relaxed italic border-l-2 border-blue-50 pl-4">
                                            "{selectedReport.description}"
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Temporal Log</p>
                                            <p className="text-[10px] font-black text-gray-900 uppercase">
                                                {new Date(selectedReport.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Mission Status</p>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                                                <p className="text-[10px] font-black text-gray-900 uppercase">{selectedReport.status}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-50 flex gap-4">
                                        <button 
                                            onClick={() => window.open(`/reports/${selectedReport._id}`, '_blank')}
                                            className="flex-1 bg-gray-900 hover:bg-black text-white py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-xl shadow-gray-200"
                                        >
                                            Full Report
                                        </button>
                                        <button 
                                            onClick={() => window.open(`https://www.google.com/maps?q=${selectedReport.latitude},${selectedReport.longitude}`, '_blank')}
                                            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Sat View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Zone Legend Overlay */}
                    <div className="absolute bottom-10 right-10 z-[500] bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border border-gray-100 shadow-xl max-w-[240px]">
                        <h5 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-4">Sector Legend</h5>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            {[
                                { name: 'Central', color: 'bg-red-500' },
                                { name: 'North', color: 'bg-blue-500' },
                                { name: 'South', color: 'bg-green-500' },
                                { name: 'East', color: 'bg-orange-500' },
                                { name: 'West', color: 'bg-violet-500' },
                                { name: 'N-East', color: 'bg-yellow-400' },
                                { name: 'N-West', color: 'bg-zinc-900' },
                                { name: 'S-East', color: 'bg-gray-400' },
                                { name: 'S-West', color: 'bg-yellow-600' },
                            ].map(z => (
                                <div key={z.name} className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${z.color} shadow-sm shrink-0`} />
                                    <span className="text-[9px] font-bold text-gray-700 uppercase tracking-widest truncate">{z.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default AdminZoneMap;
