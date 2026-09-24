// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Radio } from 'lucide-react';

// Import CSS Leaflet
import 'leaflet/dist/leaflet.css';

// 1. Interface Props untuk komunikasi ke App.tsx
interface FleetMapProps {
  onSelectFleet?: (type: string) => void;
}

// Fix otomatis ukuran map saat di-render
function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// Custom Icon Pin Point
const createCustomIcon = (colorClass: string, isCritical: boolean) => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div class="relative flex items-center justify-center w-6 h-6">
        ${isCritical ? '<span class="absolute -inset-1 rounded-full bg-red-500/50 animate-ping"></span>' : ''}
        <div class="w-4 h-4 rounded-full border-2 border-white ${colorClass} shadow-lg flex items-center justify-center">
          <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export default function FleetMap({ onSelectFleet }: FleetMapProps) {
  const [selectedFleet, setSelectedFleet] = useState('EX-106');

  // Koordinat tambang open pit (Grasberg / Freeport Pit)
  const mapCenter: [number, number] = [-4.053, 137.116]; 

  const fleetNodes = [
    { id: 'CAT-001', label: 'CAT-001', type: 'Bulldozer', status: 'NOMINAL', lat: -4.052, lng: 137.112, color: 'bg-emerald-500' },
    { id: 'HD-223', label: 'HD-223', type: 'Dump Truck', status: 'WARNING', lat: -4.055, lng: 137.118, color: 'bg-amber-500' },
    { id: 'EX-106', label: 'EX-106', type: 'Excavator', status: 'CRITICAL', lat: -4.053, lng: 137.115, color: 'bg-red-500' },
    { id: 'LD-250', label: 'LD-250', type: 'Wheel Loader', status: 'NOMINAL', lat: -4.050, lng: 137.120, color: 'bg-emerald-500' },
  ];

  const currentSelectedUnit = fleetNodes.find(n => n.id === selectedFleet);

  // Handler saat marker diklik
  const handleSelectFleet = (node: typeof fleetNodes[0]) => {
    setSelectedFleet(node.id);
    if (onSelectFleet) {
      onSelectFleet(node.type); // Mengirim tipe ('Bulldozer' / 'Excavator') ke App.tsx
    }
  };

  return (
    <div className="relative w-full h-[260px] bg-[#090d14] rounded-lg border border-industrial-border/60 overflow-hidden select-none flex flex-col justify-between p-3">
      
      {/* Force CSS Override agar Leaflet memenuhi seluruh kotak */}
      <style>{`
        .leaflet-container {
          width: 100% !important;
          height: 100% !important;
          background: #090d14 !important;
          border-radius: 0.5rem;
        }
      `}</style>

      {/* Interactive Satellite Map Container */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <MapContainer 
          center={mapCenter} 
          zoom={14} 
          zoomControl={false} 
          style={{ width: '100%', height: '100%' }}
        >
          <MapResizeFix />

          {/* Tile Layer Citra Satelit Esri */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; Esri World Imagery"
          />

          {/* Render Pin Point Armada */}
          {fleetNodes.map((node) => (
            <Marker
              key={node.id}
              position={[node.lat, node.lng]}
              icon={createCustomIcon(node.color, node.status === 'CRITICAL')}
              eventHandlers={{
                click: () => handleSelectFleet(node),
              }}
            >
              <Popup>
                <div className="text-xs font-mono font-bold text-gray-900">
                  {node.label} - {node.type}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Dark Overlay Cyberpunk */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090d14] via-transparent to-[#090d14]/60 pointer-events-none z-10" />

      {/* Header Overlay */}
      <div className="relative z-20 flex justify-between items-center text-xs font-mono pointer-events-none">
        <div className="flex items-center gap-1.5 bg-industrial-panel/90 backdrop-blur-md px-2 py-1 rounded border border-industrial-border/60 pointer-events-auto">
          <MapPin size={13} className="text-industrial-cyan" />
          <span className="text-gray-200 font-bold">FLEET GIS MAP</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 bg-industrial-panel/90 backdrop-blur-md px-2 py-1 rounded border border-industrial-border/60 text-[10px]">
            <Navigation size={11} className="text-industrial-yellow" />
            <span className="text-gray-300">OPEN PIT MINE #4</span>
          </div>
          <div className="flex items-center gap-1 bg-industrial-panel/90 backdrop-blur-md p-1 rounded border border-industrial-border/60">
            <Radio size={12} className="text-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-20 bg-industrial-panel/90 backdrop-blur-md border border-industrial-border/80 p-2 rounded flex justify-between items-center text-[10px] font-mono pointer-events-auto">
        <div>
          <span className="text-gray-400 block text-[9px]">SELECTED FLEET</span>
          <span className="text-white font-bold">{selectedFleet}</span>
          <span className="text-gray-400 text-[9px] ml-2">
            {currentSelectedUnit?.type}
          </span>
        </div>
        <div className="text-right">
          <span className="text-gray-400 block text-[9px]">STATUS</span>
          <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${
            currentSelectedUnit?.status === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
            currentSelectedUnit?.status === 'WARNING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
          }`}>
            {currentSelectedUnit?.status}
          </span>
        </div>
      </div>

    </div>
  );
}