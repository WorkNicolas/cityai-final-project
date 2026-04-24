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

export function AdvocateDashboard(): JSX.Element {
  return (
    <div className="advocate-dashboard">
      <header className="dashboard-header">
        <div className="header-text">
          <h2>Advocate Portal</h2>
          <p>Monitor community engagement and neighborhood patterns.</p>
        </div>
      </header>

      <div className="split-layout">
        {/* Left Column: Trends WIP */}
        <aside className="trends-wip">
          <div className="wip-container">
            <h3>Community Trends</h3>
            <div className="wip-placeholder">
              <span className="wip-badge">WORK IN PROGRESS</span>
              <p>Neighborhood trend analysis and AI forecasting tools are being calibrated.</p>
              <div className="skeleton-line short"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line medium"></div>
            </div>
          </div>
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
        
        .trends-wip { background: var(--color-surface); border: 1px solid var(--color-divider); border-radius: 0.75rem; padding: 1.5rem; position: sticky; top: 2rem; }
        .trends-wip h3 { margin: 0 0 1.5rem; font-size: 1.1rem; color: var(--color-text-primary); }
        
        .wip-placeholder { display: flex; flex-direction: column; gap: 1rem; color: var(--color-text-disabled); }
        .wip-badge { align-self: flex-start; background: var(--color-surface-alt); color: var(--color-text-secondary); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.65rem; font-weight: 800; border: 1px solid var(--color-divider); }
        .wip-placeholder p { font-size: 0.875rem; line-height: 1.5; margin: 0; }
        
        .skeleton-line { height: 8px; background: var(--color-divider); border-radius: 4px; width: 100%; opacity: 0.5; }
        .skeleton-line.short { width: 40%; }
        .skeleton-line.medium { width: 70%; }
        
        .issues-view { display: flex; flex-direction: column; gap: 1.5rem; }
        .view-header h3 { margin: 0; font-size: 1.25rem; color: var(--color-text-primary); }
        
        @media (max-width: 1024px) {
          .split-layout { grid-template-columns: 1fr; }
          .trends-wip { position: static; }
        }
      `}</style>
    </div>
  );
}

export default AdvocateDashboard;
