/** frontend/analytics-mfe/src/components/Heatmap.tsx
 * @file Heatmap.tsx
 * @description Geographic visualization of municipal issue density.
 * Uses react-leaflet and leaflet.heat to render real issue clusters.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-22 - Implemented real data-driven heatmap.
 * @version 0.2.0
 */

/**
 * Table of Contents
 * - Imports
 * - GraphQL
 *   - GET_HEATMAP_DATA
 * - Components
 *   - HeatLayer (Helper)
 *   - Heatmap
 * - Exports
 */

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useQuery, gql } from '@apollo/client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

/**
 * GET_HEATMAP_DATA
 * @description Fetches coordinates of all issues to build the heatmap.
 */
const GET_HEATMAP_DATA = gql`
  query GetHeatmapData {
    issues {
      items {
        id
        coordinates
      }
    }
  }
`;

/**
 * HeatLayer
 * @description Helper component that uses the useMap hook to inject
 * the leaflet.heat layer into the MapContainer.
 * @param {object} props - Component props.
 * @param {Array}  props.points - Array of [lat, lng, intensity] points.
 */
function HeatLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();

  useEffect(() => {
    // @ts-ignore - L.heatLayer is added by leaflet.heat plugin
    const heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

/**
 * Heatmap
 * @description Renders a real geographic heatmap using live issue data.
 * @returns The rendered heatmap component.
 */
export function Heatmap() {
  const { loading, error, data } = useQuery(GET_HEATMAP_DATA, {
    // Analytics dashboard should show all issues for density analysis
    variables: { limit: 1000 },
    context: { service: 'issues' }
  });

  // Prepare points for the heatmap [lat, lng, intensity]
  const points: [number, number, number][] = data?.issues?.items
    ?.filter((item: any) => item.coordinates && item.coordinates.length === 2)
    ?.map((item: any) => [
      item.coordinates[1], // Latitude
      item.coordinates[0], // Longitude
      1.0                  // Intensity (default to 1)
    ]) || [];

  const defaultCenter: [number, number] = [43.6532, -79.3832]; // Toronto center

  return (
    <div className="heatmap-card">
      <header className="card-header">
        <h4>Incident Heatmap</h4>
        <div className="legend">
          <span>Low</span>
          <div className="gradient-bar"></div>
          <span>High</span>
        </div>
      </header>

      <div className="map-base">
        {loading ? (
          <div className="map-loading-overlay">Loading map data...</div>
        ) : error ? (
          <div className="map-error-overlay">Failed to load geographic data.</div>
        ) : (
          <MapContainer 
            center={defaultCenter} 
            zoom={12} 
            style={{ height: '100%', width: '100%', zIndex: 1 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {points.length > 0 && <HeatLayer points={points} />}
          </MapContainer>
        )}
      </div>

      <style>{`
        .heatmap-card { 
          background: var(--color-surface); 
          border: 1px solid var(--color-divider); 
          border-radius: 0.5rem; 
          padding: 1.5rem; 
          height: 100%; 
          display: flex; 
          flex-direction: column; 
          min-height: 400px;
        }
        .card-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 1rem; 
        }
        .card-header h4 { 
          margin: 0; 
          font-size: 1rem; 
          color: var(--color-text-primary); 
        }
        .legend { 
          display: flex; 
          align-items: center; 
          gap: 0.5rem; 
          font-size: 0.75rem; 
          color: var(--color-text-secondary); 
        }
        .gradient-bar { 
          width: 80px; 
          height: 8px; 
          border-radius: 4px; 
          background: linear-gradient(to right, blue, lime, red); 
        }
        .map-base { 
          flex: 1; 
          background: var(--color-surface-alt); 
          border-radius: 0.375rem; 
          position: relative; 
          overflow: hidden; 
          border: 1px solid var(--color-divider); 
        }
        .map-loading-overlay, .map-error-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          z-index: 10;
          background: var(--color-surface-alt);
        }
        .map-error-overlay { color: var(--color-danger); }
      `}</style>
    </div>
  );
}

export default Heatmap;
