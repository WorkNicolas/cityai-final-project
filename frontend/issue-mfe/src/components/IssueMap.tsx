/** frontend/issue-mfe/src/components/IssueMap.tsx
 * @file IssueMap.tsx
 * @description Provides an interactive map for selecting or displaying civic issue locations.
 * Uses a simplified UI for the project demonstration.
 * @author Your Name
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Types
 *   - IssueMapProps
 * - Components
 *   - IssueMap
 * - Exports
 */

import React, { useState } from 'react';

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
 * IssueMap
 * @description Renders a placeholder map interface for the civic issue tracker.
 * @param {IssueMapProps} props - Component props.
 * @returns {JSX.Element} The rendered map component.
 */
export function IssueMap({ initialCoords, readOnly, onLocationSelect }: IssueMapProps): JSX.Element {
  const [coords, setCoords] = useState<[number, number] | null>(initialCoords || null);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;

    // Simulate getting coordinates from a click
    const newCoords: [number, number] = [-79.3832, 43.6532]; // Example: Toronto
    setCoords(newCoords);
    
    if (onLocationSelect) {
      onLocationSelect(newCoords, "100 Queen St W, Toronto, ON");
    }
  };

  return (
    <div className={`issue-map-container ${readOnly ? 'readonly' : ''}`} onClick={handleMapClick}>
      <div className="map-placeholder">
        <div className="map-grid"></div>
        
        {coords && (
          <div className="map-marker">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="var(--color-danger)">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5" fill="white"/>
            </svg>
          </div>
        )}

        <div className="map-overlay">
          {readOnly ? (
            <span>Location: {coords ? `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}` : 'Not set'}</span>
          ) : (
            <span>Click on the map to set issue location</span>
          )}
        </div>
      </div>

      <style>{`
        .issue-map-container {
          width: 100%;
          height: 250px;
          border-radius: 0.5rem;
          background-color: var(--color-surface-alt);
          position: relative;
          cursor: crosshair;
          border: 1px solid var(--color-divider);
          overflow: hidden;
        }
        .issue-map-container.readonly {
          cursor: default;
        }
        .map-placeholder {
          width: 100%;
          height: 100%;
          position: relative;
          background-image: 
            linear-gradient(var(--color-divider) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-divider) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .map-marker {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -100%);
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
        }
        .map-overlay {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          right: 1rem;
          background: rgba(var(--color-surface), 0.9);
          backdrop-filter: blur(4px);
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          color: var(--color-text-primary);
          text-align: center;
          border: 1px solid var(--color-divider);
        }
      `}</style>
    </div>
  );
}

export default IssueMap;
