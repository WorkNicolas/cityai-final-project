/** frontend/analytics-mfe/src/components/AdvocateDashboard.tsx
 * @file AdvocateDashboard.tsx
 * @description A tailored dashboard for Community Advocates to monitor municipal trends
 * and community insights without administrative staff tools.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-23
 * @updated 2026-04-23 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Components
 *   - AdvocateDashboard
 * - Exports
 */

import React from 'react';
import InsightsDashboard from './InsightsDashboard';
import Heatmap from './Heatmap';
import TrendChart from './TrendChart';

/**
 * AdvocateDashboard
 * @description Renders the community advocate dashboard focusing on AI trends and insights.
 * @returns {JSX.Element} The rendered advocate dashboard shell.
 */
export function AdvocateDashboard(): JSX.Element {
  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div className="header-text">
          <h2>Community Insights</h2>
          <p>AI-driven municipal trends and neighborhood analysis</p>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Top Row: AI Insights */}
        <InsightsDashboard />

        {/* Middle Row: Visualizations */}
        <div className="viz-row">
          <div className="viz-col main">
            <Heatmap />
          </div>
          <div className="viz-col side">
            <TrendChart />
          </div>
        </div>

        {/* Note: BacklogTracker is excluded for the Advocate role */}
        <div className="info-row">
          <div className="info-card">
            <h4>Advocate Mission</h4>
            <p>
              As a Community Advocate, your role is to monitor emerging patterns and support 
              residents. Use these insights to identify areas requiring attention and track 
              how the city responds to local needs.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-shell { display: flex; flex-direction: column; gap: 2rem; }
        .dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .header-text h2 { margin: 0; color: var(--color-text-primary); font-size: 1.75rem; }
        .header-text p { margin: 0.25rem 0 0; color: var(--color-text-secondary); font-size: 0.9375rem; }
        .dashboard-content { display: flex; flex-direction: column; gap: 2rem; }
        .viz-row { display: grid; grid-template-columns: 1fr 400px; gap: 2rem; }
        @media (max-width: 1100px) {
          .viz-row { grid-template-columns: 1fr; }
        }
        .viz-col { display: flex; flex-direction: column; }
        .info-row { width: 100%; }
        .info-card { 
          background: var(--color-surface-alt); 
          border: 1px solid var(--color-divider); 
          border-radius: 0.5rem; 
          padding: 1.5rem; 
          border-left: 4px solid var(--color-primary);
        }
        .info-card h4 { margin: 0 0 0.5rem; color: var(--color-text-primary); }
        .info-card p { margin: 0; color: var(--color-text-secondary); font-size: 0.875rem; line-height: 1.6; }
      `}</style>
    </div>
  );
}

export default AdvocateDashboard;
