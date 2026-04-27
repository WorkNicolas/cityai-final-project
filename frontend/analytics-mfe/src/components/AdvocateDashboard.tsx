/** frontend/analytics-mfe/src/components/AdvocateDashboard.tsx
 * @file AdvocateDashboard.tsx
 * @description Redesigned dashboard for Community Advocates with a split layout.
 * Left: Trends (WIP), Right: Reddit-style Issue Table.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-24
 * @version 0.3.0
 */

import React from 'react';
import AdvocateIssueTable from './AdvocateIssueTable';
import InsightsDashboard from './InsightsDashboard';
import TrendChart from './TrendChart';

export function AdvocateDashboard() {
  return (
    <div className="advocate-dashboard">
      <header className="dashboard-header">
        <div className="header-text">
          <h2>Advocate Portal</h2>
          <p>Monitor community engagement and neighborhood patterns.</p>
        </div>
      </header>

      <div className="split-layout">
        {/* Left Column: Trends Panel */}
        <aside className="trends-panel">
          <InsightsDashboard />
          <TrendChart />
        </aside>

        {/* Right Column: Issues Table */}
        <main className="issues-view">
          <div className="view-header">
            <h3>Live Community Issues</h3>
          </div>
          <AdvocateIssueTable />
        </main>
      </div>

      <style>{`
        .advocate-dashboard { display: flex; flex-direction: column; gap: 2rem; }
        .dashboard-header h2 { margin: 0; color: var(--color-text-primary); font-size: 2rem; }
        .dashboard-header p { margin: 0.5rem 0 0; color: var(--color-text-secondary); }
        
        .split-layout { display: grid; grid-template-columns: 320px 1fr; gap: 2rem; align-items: start; }
        
        .trends-panel { display: flex; flex-direction: column; gap: 0; position: sticky; top: 2rem; }
        
        .issues-view { display: flex; flex-direction: column; gap: 1.5rem; }
        .view-header h3 { margin: 0; font-size: 1.25rem; color: var(--color-text-primary); }
        
        @media (max-width: 1024px) {
          .split-layout { grid-template-columns: 1fr; }
          .trends-panel { position: static; }
        }
      `}</style>
    </div>
  );
}

export default AdvocateDashboard;
