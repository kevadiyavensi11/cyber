import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

const SafeMap = ({ coords }) => {
    // Basic coordinate validation
    const lat = Number(coords?.latitude);
    const lng = Number(coords?.longitude);
    const hasValidCoords = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

    if (!hasValidCoords) {
        return (
            <div className="h-72 bg-gray-100 rounded-[2.5rem] flex items-center justify-center p-8 border-2 border-dashed border-gray-200">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest text-center">
                    Location not available
                </p>
            </div>
        );
    }

    return (
        <div className="h-72 w-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative z-0">
            <MapContainer
                center={[lat, lng]}
                zoom={15}
                scrollWheelZoom={false}
                zoomControl={false}
                attributionControl={false}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution="© OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]} />
            </MapContainer>
        </div>
    );
};

export default SafeMap;
