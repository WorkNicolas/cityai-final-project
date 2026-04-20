/** frontend/analytics-mfe/src/components/IssueDashboard.tsx
 * @file IssueDashboard.tsx
 * @description The primary command center for municipal staff.
 * Combines heatmap, trend charts, AI insights, and the backlog tracker.
 * @author Your Name
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Components
 *   - IssueDashboard
 * - Exports
 */

import React from 'react';
import InsightsDashboard from './InsightsDashboard';
import Heatmap from './Heatmap';
import TrendChart from './TrendChart';
import BacklogTracker from './BacklogTracker';
import ThemeToggle from './ThemeToggle';

/**
 * IssueDashboard
 * @description Renders the comprehensive municipal staff dashboard.
 * @returns {JSX.Element} The rendered dashboard shell.
 */
export function IssueDashboard(): JSX.Element {
  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div className="header-text">
          <h2>Municipal Operations</h2>
          <p>Real-time civic issue analytics and management</p>
        </div>
        <ThemeToggle />
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

        {/* Bottom Row: Management Table */}
        <div className="table-row">
          <BacklogTracker />
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
        .table-row { width: 100%; }
      `}</style>
    </div>
  );
}

export default IssueDashboard;
