/** frontend/issue-mfe/src/components/IssueMap.tsx
 * @file IssueMap.tsx
 * @description Provides an interactive map for selecting or displaying municipal issue locations.
 * Uses react-leaflet and OpenStreetMap.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Upgraded to real interactive map.
 * @version 0.2.0
 */

/**
 * Table of Contents
 * - Imports
 * - Types
 *   - IssueMapProps
 * - Components
 *   - LocationMarker
 *   - IssueMap
 * - Exports
 */

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * IssueMapProps
 * @description Props for the IssueMap component.
 */
interface IssueMapProps {
  /** initialCoords - Optional [lng, lat] to display. */
  initialCoords?: [number, number];
  /** readOnly - If true, the user cannot select a new location. */
  readOnly?: boolean;
  /** onLocationSelect - Callback when a location is picked on the map. */
  onLocationSelect?: (coords: [number, number], address: string) => void;
}

/**
 * LocationMarker
 * @description Inner component to handle map clicks and marker placement.
 */
function LocationMarker({ 
  position, 
  setPosition, 
  readOnly,
  onLocationSelect 
}: { 
  position: L.LatLng | null, 
  setPosition: (pos: L.LatLng) => void,
  readOnly?: boolean,
  onLocationSelect?: (coords: [number, number], address: string) => void
}) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  useMapEvents({
    async click(e) {
      if (readOnly) return;
      setPosition(e.latlng);
      
      // Real reverse geocoding using Nominatim (OpenStreetMap)
      let address = `Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`;
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=json`,
          {
            headers: {
              'User-Agent': 'CityAI-Municipal-App',
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          // Prefer a shorter address format if available, otherwise use display_name
          const addr = data.address;
          if (addr) {
            const road = addr.road || addr.pedestrian || addr.path;
            const houseNumber = addr.house_number;
            const city = addr.city || addr.town || addr.village;
            
            if (road && city) {
              address = houseNumber ? `${houseNumber} ${road}, ${city}` : `${road}, ${city}`;
            } else {
              address = data.display_name;
            }
          }
        }
      } catch (err) {
        console.warn('Reverse geocoding failed, falling back to coordinates:', err);
      }

      if (onLocationSelect) {
        onLocationSelect([e.latlng.lng, e.latlng.lat], address);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

/**
 * IssueMap
 * @description Renders an interactive map using react-leaflet.
 * @param {IssueMapProps} props - Component props.
 * @returns The rendered map component.
 */
export function IssueMap({ initialCoords, readOnly, onLocationSelect }: IssueMapProps) {
  // Convert [lng, lat] to Leaflet's [lat, lng]
  const defaultCenter = initialCoords 
    ? new L.LatLng(initialCoords[1], initialCoords[0]) 
    : new L.LatLng(43.6532, -79.3832); // Default to Toronto

  const [position, setPosition] = useState<L.LatLng | null>(
    initialCoords ? new L.LatLng(initialCoords[1], initialCoords[0]) : null
  );

  return (
    <div className={`issue-map-container ${readOnly ? 'readonly' : ''}`}>
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        scrollWheelZoom={!readOnly}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker 
          position={position} 
          setPosition={setPosition} 
          readOnly={readOnly}
          onLocationSelect={onLocationSelect} 
        />
      </MapContainer>

      <div className="map-overlay">
        {readOnly ? (
          <span>Location: {position ? `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}` : 'Not set'}</span>
        ) : (
          <span>Click on the map to set issue location</span>
        )}
      </div>

      <style>{`
        .issue-map-container {
          width: 100%;
          height: 300px;
          border-radius: 0.5rem;
          background-color: var(--color-surface-alt);
          position: relative;
          border: 1px solid var(--color-divider);
          overflow: hidden;
        }
        .issue-map-container.readonly {
          pointer-events: none; /* Disable all interactions if readonly */
        }
        .issue-map-container.readonly .leaflet-container {
          cursor: default;
        }
        .map-overlay {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          color: #333;
          text-align: center;
          border: 1px solid var(--color-divider);
          z-index: 1000; /* Above the leaflet map */
          pointer-events: none; /* Let clicks pass through to map */
        }
      `}</style>
    </div>
  );
}

export default IssueMap;
