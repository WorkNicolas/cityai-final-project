/** frontend/analytics-mfe/src/components/Heatmap.tsx
 * @file Heatmap.tsx
 * @description Geographic visualization of civic issue density.
 * Renders an abstract heatmap view for the municipal staff dashboard.
 * @author Your Name
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Components
 *   - Heatmap
 * - Exports
 */

import React from 'react';

/**
 * Heatmap
 * @description Renders a geographic heatmap visualization using CSS/SVG patterns.
 * @returns {JSX.Element} The rendered heatmap component.
 */
export function Heatmap(): JSX.Element {
  // Abstract "hotspots" to simulate geographic data
  const hotspots = [
    { top: '30%', left: '40%', size: '60px', intensity: 0.8 },
    { top: '60%', left: '70%', size: '100px', intensity: 1.0 },
    { top: '50%', left: '20%', size: '50px', intensity: 0.5 },
    { top: '20%', left: '80%', size: '70px', intensity: 0.7 },
  ];

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
        <div className="grid-overlay"></div>
        {hotspots.map((spot, i) => (
          <div 
            key={i} 
            className="hotspot" 
            style={{ 
              top: spot.top, 
              left: spot.left, 
              width: spot.size, 
              height: spot.size,
              opacity: spot.intensity * 0.6
            }}
          ></div>
        ))}
        
        <div className="map-labels">
          <span className="label n">North District</span>
          <span className="label s">South Harbour</span>
          <span className="label e">East Heights</span>
          <span className="label w">West Village</span>
        </div>
      </div>

      <style>{`
        .heatmap-card { background: var(--color-surface); border: 1px solid var(--color-divider); border-radius: 0.5rem; padding: 1.5rem; height: 100%; display: flex; flex-direction: column; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .card-header h4 { margin: 0; font-size: 1rem; color: var(--color-text-primary); }
        .legend { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--color-text-secondary); }
        .gradient-bar { width: 80px; height: 8px; border-radius: 4px; background: linear-gradient(to right, rgba(var(--color-primary), 0.1), var(--color-danger)); }
        .map-base { flex: 1; background: var(--color-surface-alt); border-radius: 0.375rem; position: relative; min-height: 250px; overflow: hidden; border: 1px solid var(--color-divider); }
        .grid-overlay { position: absolute; inset: 0; background-image: radial-gradient(var(--color-divider) 1px, transparent 1px); background-size: 20px 20px; }
        .hotspot { position: absolute; border-radius: 50%; background: radial-gradient(circle, var(--color-danger) 0%, transparent 70%); transform: translate(-50%, -50%); animation: pulse 3s infinite ease-in-out; }
        @keyframes pulse { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.1); } }
        .map-labels { position: absolute; inset: 0; pointer-events: none; }
        .label { position: absolute; font-size: 0.625rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-disabled); opacity: 0.5; }
        .label.n { top: 10%; left: 50%; transform: translateX(-50%); }
        .label.s { bottom: 10%; left: 50%; transform: translateX(-50%); }
        .label.e { right: 10%; top: 50%; transform: translateY(-50%) rotate(90deg); }
        .label.w { left: 10%; top: 50%; transform: translateY(-50%) rotate(-90deg); }
      `}</style>
    </div>
  );
}

export default Heatmap;
