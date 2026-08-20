import React, { useState, Suspense, useRef, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { reportService } from '../services/api';
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    User as UserIcon,
    Settings,
    Send,
    MapPin,
    AlertCircle,
    CheckCircle,
    Image as ImageIcon,
    Loader,
    ShieldAlert,
    HelpCircle,
    Link as LinkIcon,
    Upload
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Import Native SafeMap for maximum stability
import SafeMap from '../components/reusable/SafeMap';
import AIVerificationResult from '../components/reports/AIVerificationResult';
import AIScanningPanel from '../components/reports/AIScanningPanel';

const SubmitReport = () => {
    const navigate = useNavigate();
    const citizenLinks = [
        { label: 'Dashboard', path: '/citizen/dashboard', icon: LayoutDashboard },
        { label: 'My Reports', path: '/my-reports', icon: FileText },
        { label: 'Submit Report', path: '/submit-report', icon: PlusCircle },
        { label: 'Profile', path: '/profile', icon: UserIcon },
        { label: 'Settings', path: '/settings', icon: Settings },
    ];

    const [formData, setFormData] = useState({
        threatTitle: '',
        threatType: '',
        urlOrPhone: '',
        severity: 'Low',
        description: '',
        address: '',
        zone: '',
    });
    const [location, setLocation] = useState(null);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const [aiResult, setAiResult] = useState(null);
    const [showAIModal, setShowAIModal] = useState(false);

    // AI Pre-scan states
    const [isScanning, setIsScanning] = useState(false);
    const [isValidAI, setIsValidAI] = useState(null);
    const [aiConfidence, setAiConfidence] = useState(0);
    const [aiError, setAiError] = useState('');

    const analyzeFile = async (file, type) => {
        if (!file || !type) return;

        setIsScanning(true);
        setIsValidAI(null);
        setAiError('');

        try {
            const scanData = new FormData();
            scanData.append('evidence', file);
            scanData.append('threatType', type);

            const response = await reportService.analyzeEvidence(scanData);
            const data = response.data;
            
            setIsValidAI(data.isValid);
            setAiConfidence(data.confidence);
            setAiError(data.summary || '');
            
            if (data.isValid === true) {
                toast.success('AI Forensic Verification Success');
            } else if (data.isValid === false) {
                toast.error('AI Evidence Protocol Rejection');
            } 
        } catch (err) {
            console.error("AI Scan Error:", err);
            const msg = err.response?.data?.message || 'Verification service busy.';
            toast.error(msg, { icon: '⚠️', style: { background: '#FFF3CD', color: '#856404' } });
            setAiError(msg);
        } finally {
            setIsScanning(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size must be under 10MB");
                return;
            }
            setSelectedFile(file);
            toast.success(`Evidence Captured: ${file.name}`);
            
            if (formData.threatType) {
                analyzeFile(file, formData.threatType);
            } else {
                toast.error("Select a Threat Category for AI analysis");
            }
        }
    };

    // Re-scan if threat type changes while file is selected
    useEffect(() => {
        if (selectedFile && formData.threatType) {
            analyzeFile(selectedFile, formData.threatType);
        }
    }, [formData.threatType]);

    useEffect(() => {
        const savedLocation = localStorage.getItem('incident_location');
        if (savedLocation) {
            try {
                const parsed = JSON.parse(savedLocation);
                if (parsed.latitude && parsed.longitude) {
                    setLocation({ latitude: parsed.latitude, longitude: parsed.longitude });
                    setFormData(prev => ({
                        ...prev,
                        zone: parsed.zone,
                        address: `Pre-selected location from Tactical Map`
                    }));
                    setShowMap(true);
                    localStorage.removeItem('incident_location');
                }
            } catch (err) {
                console.error("Failed to parse saved location", err);
            }
        }
    }, []);

    const CITY_CENTER_LAT = 21.15;
    const CITY_CENTER_LNG = 72.85;

    const getDirectionalZone = (lat, lng) => {
        const tolerance = 0.02;
        const isLatCenter = Math.abs(lat - CITY_CENTER_LAT) <= tolerance;
        const isLngCenter = Math.abs(lng - CITY_CENTER_LNG) <= tolerance;

        if (isLatCenter && isLngCenter) return "Central";
        if (lat > CITY_CENTER_LAT && isLngCenter) return "North";
        if (lat < CITY_CENTER_LAT && isLngCenter) return "South";
        if (isLatCenter && lng > CITY_CENTER_LNG) return "East";
        if (isLatCenter && lng < CITY_CENTER_LNG) return "West";

        if (lat > CITY_CENTER_LAT && lng > CITY_CENTER_LNG) return "North-East";
        if (lat > CITY_CENTER_LAT && lng < CITY_CENTER_LNG) return "North-West";
        if (lat < CITY_CENTER_LAT && lng > CITY_CENTER_LNG) return "South-East";
        if (lat < CITY_CENTER_LAT && lng < CITY_CENTER_LNG) return "South-West";

        return "Central"; // Default
    };

    const handleGetLocation = (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setGettingLocation(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;

                    if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
                        setLocation({ latitude, longitude });
                        setShowMap(true);

                        const zone = getDirectionalZone(latitude, longitude);
                        setFormData(prev => ({ ...prev, zone }));
                    } else {
                        throw new Error("Invalid GPS data");
                    }

                    // Reverse Geocoding with Address Details and Zoom for high precision
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`, {
                            headers: { 'Accept-Language': 'en' }
                        });
                        const data = await response.json();

                        if (data && data.address) {
                            const { address } = data;

                            const getAddrPart = (keys) => {
                                for (let k of keys) {
                                    if (address[k] && address[k].toString().trim()) {
                                        return address[k].toString().trim();
                                    }
                                }
                                return "";
                            };

                            // Expanded road/building detection (Priority 1)
                            const roadPart = getAddrPart(['road', 'street', 'building', 'house_name', 'residential', 'industrial', 'pedestrian', 'path', 'amenity', 'shop', 'office']);

                            // High-accuracy local area detection (Priority 2)
                            // We include 'suburb', 'neighbourhood', 'village', 'place', 'hamlet'
                            // AND also check if our 'display_name' has a more specific leading part that manual keys missed
                            const localName = getAddrPart(['neighbourhood', 'suburb', 'village', 'hamlet', 'locality', 'quarter', 'allotments', 'place', 'subdistrict', 'city_district']);

                            // Get the FIRST part of display_name as a fallback for the most local name
                            const displayNameParts = data.display_name ? data.display_name.split(',').map(s => s.trim()) : [];
                            const firstLocalFallback = displayNameParts[0] || "";

                            // If localName is "Adajan Taluka" but firstLocalFallback is something specific like "Hirabag", we prioritize that
                            const areaPart = (localName && localName !== "Adajan Taluka") ? localName : firstLocalFallback;

                            const cityPart = getAddrPart(['city', 'town', 'municipality', 'state_district']);
                            const statePart = address.state || "Gujarat";
                            const countryPart = "India";
                            const pinPart = address.postcode || "";

                            // Construct address with unique parts in the requested order: Road, Area, State, India, Pincode
                            const addrSequence = [roadPart, areaPart, cityPart, statePart, countryPart, pinPart];
                            const finalAddress = addrSequence
                                .filter(val => val && val.length > 0)
                                .filter((val, idx, self) => self.indexOf(val) === idx)
                                .join(', ');

                            setFormData(prev => ({ ...prev, address: finalAddress || data.display_name || `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}` }));
                        } else {
                            setFormData(prev => ({ ...prev, address: data.display_name || `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}` }));
                        }

                        toast.success("GPS Location & Zone Locked");
                    } catch (geoErr) {
                        setFormData(prev => ({ ...prev, address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}` }));
                        toast.success("GPS Position Secured");
                    }
                } catch (err) {
                    toast.error("Failed to process location data");
                } finally {
                    setGettingLocation(false);
                }
            },
            (error) => {
                setGettingLocation(false);
                toast.error("GPS Signal Failed: " + error.message);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleSubmit = async (e) => {


        // Final validation: Ensure zone is present
        if (!formData.zone) {
            toast.error("Please lock your location (Capture GPS) before submitting.");
            return;
        }

        setLoading(true);
        try {
            const uploadData = new FormData();

            // Text fields
            uploadData.append('threatTitle', formData.threatTitle);
            uploadData.append('description', formData.description);
            uploadData.append('threatType', formData.threatType);
            uploadData.append('severity', formData.severity);
            uploadData.append('urlOrPhone', formData.urlOrPhone || '');
            uploadData.append('address', formData.address || '');
            uploadData.append('zone', formData.zone);

            if (location) {
                uploadData.append('latitude', location.latitude.toString());
                uploadData.append('longitude', location.longitude.toString());
            }

            if (selectedFile) {
                uploadData.append('evidence', selectedFile);
            }

            const response = await reportService.create(uploadData);
            const reportData = response.data;

            // If AI analysis is completed synchronously, show the visual result
            if (reportData.aiMetadata && reportData.aiMetadata.aiStatus !== 'PENDING') {
                setAiResult(reportData.aiMetadata);
                setShowAIModal(true);
                toast.success('AI Diagnostics Complete');
            } else {
                toast.success('Report Submitted Successfully');
                navigate('/my-reports');
            }
        } catch (error) {
            console.error("Submission Error:", error);
            const msg = error.response?.data?.message || 'Transmission failed';
            const status = error.response?.status;
            
            if (status === 400 && msg.includes('relevant')) {
                toast(msg, { icon: '⚠️', style: { background: '#FFF3CD', color: '#856404' } });
            } else if (status === 503) {
                toast(msg, { icon: '⚠️', style: { background: '#FFF3CD', color: '#856404' } });
            } else {
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout links={citizenLinks} userRole="Citizen">
            {/* AI Result Modal Overlay */}
            {showAIModal && aiResult && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500">
                    <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-2xl" />
                    <div className="relative w-full max-w-xl z-10">
                        <AIVerificationResult
                            isValid={aiResult.isValid}
                            confidence={aiResult.confidence}
                            message={aiResult.summary}
                            detectedType={aiResult.detectedThreat}
                        />
                        <div className="mt-10 flex justify-center">
                            <button
                                onClick={() => navigate('/my-reports')}
                                className="px-12 py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                            >
                                Continue to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-[#2D4A9D] tracking-tight leading-tight">Report Cyber Threat Incident</h2>
                        <p className="text-[#2D4A9D] opacity-70 mt-2 font-black text-lg">Submit verified information regarding cybersecurity threats, fraud, or suspicious digital activity.</p>
                    </div>

                    <div className="bg-white p-6 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/10 blur-[130px] rounded-full -mr-48 -mt-48 pointer-events-none" />
                        <form onSubmit={handleSubmit} className="space-y-10">
                            {/* Threat Title */}
                            <div className="space-y-3 relative z-10">
                                <label className="text-xs font-black uppercase text-blue-600 tracking-wider ml-1">Threat Title</label>
                                <input
                                    type="text"
                                    className="w-full p-5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-50/50 transition-all font-bold text-sm text-gray-900 outline-none placeholder-gray-300 shadow-inner"
                                    placeholder="Brief title of the incident"
                                    required
                                    value={formData.threatTitle}
                                    onChange={(e) => setFormData({ ...formData, threatTitle: e.target.value })}
                                />
                            </div>

                            {/* Threat Type & URL */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase text-blue-600 tracking-wider ml-1">Threat Category</label>
                                    <div className="relative group">
                                        <select
                                            className="w-full p-5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-50/50 transition-all font-bold text-sm text-gray-900 outline-none appearance-none cursor-pointer shadow-inner"
                                            required
                                            value={formData.threatType}
                                            onChange={(e) => setFormData({ ...formData, threatType: e.target.value })}
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Phishing Attack">Phishing Attack</option>
                                            <option value="Malware Infection">Malware Infection</option>
                                            <option value="Ransomware">Ransomware</option>
                                            <option value="Data Breach">Data Breach</option>
                                            <option value="Social Engineering">Social Engineering</option>
                                            <option value="Identity Theft">Identity Theft</option>
                                            <option value="Financial Fraud">Financial Fraud</option>
                                            <option value="Unauthorized Access">Unauthorized Access</option>
                                            <option value="Suspicious Email / Link">Suspicious Email / Link</option>
                                            <option value="Other Cyber Threat">Other Cyber Threat</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-blue-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase text-blue-600 tracking-wider ml-1">Affected Surface / URL (Optional)</label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-4 text-gray-400">
                                            <Send size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full pl-12 pr-4 py-5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-50/50 transition-all font-bold text-sm text-gray-900 outline-none placeholder-gray-300 shadow-inner"
                                            placeholder="Affected system or account"
                                            value={formData.urlOrPhone}
                                            onChange={(e) => setFormData({ ...formData, urlOrPhone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Threat Severity Buttons */}
                            <div className="space-y-4 relative z-10">
                                <label className="text-xs font-black uppercase text-blue-600 tracking-wider ml-1">Priority Level</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {['Low', 'Medium', 'High', 'Critical'].map((level) => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, severity: level })}
                                            className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${formData.severity === level
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                                                : 'bg-white text-gray-400 border-gray-100 hover:border-blue-100 hover:text-blue-600'
                                                }`}
                                        >
                                            {level.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Incident Description */}
                            <div className="space-y-3 relative z-10">
                                <label className="text-xs font-black uppercase text-blue-600 tracking-wider ml-1">Incident Details</label>
                                <textarea
                                    className="w-full p-6 bg-gray-50 border-transparent rounded-[2.5rem] focus:bg-white focus:ring-4 focus:ring-blue-50/50 transition-all font-bold text-sm text-gray-900 outline-none min-h-[160px] placeholder-gray-300 shadow-inner resize-none"
                                    placeholder="Describe the cyber incident in detail including affected system, attack type, timeline, and evidence."
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            {/* GPS / Location Area */}
                            <div className="space-y-4 relative z-10">
                                <label className="text-xs font-black uppercase text-blue-600 tracking-wider ml-1">Location Locking</label>
                                <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${location ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-gray-50 border-gray-100 shadow-inner'}`}>
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className={`p-5 rounded-2xl ${location ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-gray-400 border border-gray-100'}`}>
                                                {location ? <CheckCircle size={28} /> : <MapPin size={28} />}
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-black ${location ? 'text-emerald-900' : 'text-gray-400'}`}>
                                                    {location ? 'POSITION SECURED' : 'GEOLOCATION REQUIRED'}
                                                </h4>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                                    {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Lock GPS for mandatory zone assignment'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleGetLocation}
                                            disabled={gettingLocation}
                                            className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${location ? 'bg-white text-emerald-600 border border-emerald-200 shadow-sm' : 'bg-blue-600 text-white shadow-xl shadow-blue-200 hover:scale-105'}`}
                                        >
                                            {gettingLocation ? 'Locking...' : location ? 'Relock GPS' : 'Lock Location'}
                                        </button>
                                    </div>

                                    {showMap && location && (
                                        <div className="mt-8 animate-in fade-in zoom-in-95 duration-500 space-y-6">
                                            <div className="rounded-[2.5rem] overflow-hidden border border-gray-200 shadow-2xl">
                                                <SafeMap coords={location} />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-emerald-600 tracking-widest ml-1">Assigned Jurisdiction</label>
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        className="w-full p-4 bg-white border border-emerald-100 rounded-2xl font-bold text-xs text-emerald-900 outline-none cursor-default"
                                                        value={formData.zone || 'Detecting...'}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-emerald-600 tracking-widest ml-1">GPS Coordinates</label>
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        className="w-full p-4 bg-white border border-emerald-100 rounded-2xl font-bold text-xs text-emerald-900 shadow-sm outline-none cursor-default"
                                                        value={`${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-emerald-600 tracking-widest ml-1">Detected Address</label>
                                                <textarea
                                                    readOnly
                                                    rows={2}
                                                    className="w-full p-4 bg-white border border-emerald-100 rounded-2xl font-bold text-xs text-gray-600 leading-relaxed outline-none cursor-default resize-none opacity-80"
                                                    value={formData.address || 'Fetching address...'}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Evidence Upload */}
                            <div className="space-y-6 relative z-10">
                                <label className="text-xs font-black uppercase text-blue-600 tracking-wider ml-1">Evidence Capture</label>
                                
                                <div
                                    onClick={() => !isScanning && fileInputRef.current?.click()}
                                    className={`p-14 border-2 border-dashed rounded-[3rem] transition-all cursor-pointer group shadow-inner flex flex-col items-center justify-center text-center ${
                                        selectedFile 
                                        ? 'bg-emerald-50/20 border-emerald-100' 
                                        : 'bg-gray-50 border-gray-100 hover:bg-gray-100/50'
                                    } ${isScanning ? 'opacity-50 cursor-wait' : ''}`}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        accept=".png,.jpg,.jpeg"
                                        disabled={isScanning}
                                    />
                                    
                                    {!selectedFile ? (
                                        <>
                                            <div className="p-5 bg-white rounded-2xl text-gray-300 group-hover:text-blue-500 group-hover:scale-110 shadow-sm transition-all mb-5 border border-gray-100">
                                                <Upload size={32} />
                                            </div>
                                            <h4 className="text-sm font-black text-gray-900 tracking-tight uppercase">Upload Intelligence Media</h4>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">PNG, JPG or JPEG up to 10MB</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="p-5 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200 mb-5">
                                                <ImageIcon size={32} />
                                            </div>
                                            <h4 className="text-sm font-black text-emerald-900 tracking-tight uppercase">{selectedFile.name}</h4>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedFile(null);
                                                    setIsValidAI(null);
                                                }}
                                                className="mt-6 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
                                            >
                                                Purge Evidence
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Real-time AI Diagnostic Panel */}
                                {(isScanning || isValidAI !== null) && (
                                    <div className="animate-in slide-in-from-top-4 duration-500">
                                        <AIScanningPanel 
                                            file={selectedFile}
                                            isScanning={isScanning}
                                            isValid={isValidAI}
                                            confidence={aiConfidence}
                                            errorMessage={aiError}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="flex flex-col sm:flex-row items-center gap-6 pt-10">
                                <button
                                    type="submit"
                                    disabled={loading || isScanning}
                                    className={`w-full sm:flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all flex items-center justify-center gap-4 group ${
                                        (loading || isScanning)
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                        : 'bg-blue-600 text-white shadow-blue-500/40 hover:bg-blue-500 hover:shadow-blue-400 active:scale-[0.98]'
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="animate-spin" size={20} />
                                            <span>Verifying image...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Transmit Report</span>
                                            <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/citizen/dashboard')}
                                    className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    Cancel Transmission
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="lg:w-96 space-y-8">
                    <div className="bg-[#2D4A9D] text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group border border-white/10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full" />
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20">
                                <AlertCircle size={32} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-black mb-8 tracking-tight uppercase">Cyber Safety Guidelines</h3>
                            <ul className="space-y-6">
                                {[
                                    'Never share OTPs or confidential credentials.',
                                    'Verify suspicious links before clicking.',
                                    'Enable Multi-Factor Authentication (MFA).',
                                    'Regularly update systems and security patches.',
                                    'Report phishing emails immediately.'
                                ].map((step, idx) => (
                                    <li key={idx} className="flex gap-4 items-start">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
                                        <p className="text-xs font-bold text-white opacity-90 leading-relaxed">{step}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-[#2D4A9D] p-10 rounded-[3.5rem] border border-white/10 shadow-2xl transition-all relative overflow-hidden">
                        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-600/10 blur-[60px] rounded-full" />
                        <div className="flex items-center gap-4 mb-10 relative z-10">
                            <div className="p-3 bg-white/10 rounded-xl text-white backdrop-blur-md border border-white/10">
                                <HelpCircle size={24} />
                            </div>
                            <h4 className="font-black text-white uppercase tracking-widest text-[10px]">Process Information</h4>
                        </div>

                        <div className="space-y-10 relative z-10">
                            <div className="group">
                                <h5 className="text-[10px] font-black uppercase text-blue-300 tracking-widest mb-3">Investigation Process</h5>
                                <p className="text-xs font-bold text-white opacity-80 leading-relaxed">
                                    Your reported cyber threat will be reviewed by our cybersecurity response team for validation and appropriate action.
                                </p>
                            </div>
                            <div className="group">
                                <h5 className="text-[10px] font-black uppercase text-blue-300 tracking-widest mb-3">Response Time</h5>
                                <p className="text-xs font-bold text-white opacity-80 leading-relaxed">
                                    Official reviews are typically conducted within 24-48 hours.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default SubmitReport;
