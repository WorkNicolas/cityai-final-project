/** frontend/analytics-mfe/src/components/InsightsDashboard.tsx
 * @file InsightsDashboard.tsx
 * @description Provides a high-level summary of AI-generated civic insights.
 * @author Your Name
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Components
 *   - InsightsDashboard
 * - Exports
 */

import React from 'react';

/**
 * InsightsDashboard
 * @description Renders a collection of AI-driven metric cards.
 * @returns {JSX.Element} The rendered insights panel.
 */
export function InsightsDashboard(): JSX.Element {
  const insights = [
    { title: 'Resolution Efficiency', value: '+14%', detail: 'AI triage reduced response time by 4 hours on average.', trend: 'up' },
    { title: 'Public Sentiment', value: 'Positive', detail: 'Residents appreciate real-time updates on flooding reports.', trend: 'up' },
    { title: 'Urgent Backlog', value: '8 Issues', detail: 'Critical safety hazards require immediate staff assignment.', trend: 'down' },
  ];

  return (
    <div className="insights-grid">
      {insights.map((ins, i) => (
        <div key={i} className="insight-card">
          <div className="insight-header">
            <span className="insight-title">{ins.title}</span>
            <span className={`trend-indicator ${ins.trend}`}>
              {ins.trend === 'up' ? '↗' : '↘'}
            </span>
          </div>
          <div className="insight-value">{ins.value}</div>
          <p className="insight-detail">{ins.detail}</p>
        </div>
      ))}

      <style>{`
        .insights-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .insight-card { background: var(--color-surface); border: 1px solid var(--color-divider); border-radius: 0.5rem; padding: 1.5rem; border-top: 4px solid var(--color-primary); }
        .insight-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .insight-title { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-secondary); letter-spacing: 0.05em; }
        .trend-indicator.up { color: var(--color-success); }
        .trend-indicator.down { color: var(--color-danger); }
        .insight-value { font-size: 2rem; font-weight: 800; color: var(--color-text-primary); margin-bottom: 0.5rem; }
        .insight-detail { font-size: 0.875rem; color: var(--color-text-secondary); line-height: 1.5; margin: 0; }
      `}</style>
    </div>
  );
}

export default InsightsDashboard;
