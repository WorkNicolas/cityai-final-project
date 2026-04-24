/** frontend/analytics-mfe/src/components/InsightsDashboard.tsx
 * @file InsightsDashboard.tsx
 * @description Provides a high-level summary of AI-generated CityAI insights.
 * @author Carl Nicolas Mendoza
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
import { useQuery, gql } from '@apollo/client';

/**
 * GET_URGENT_BACKLOG_COUNT
 * @description Fetches the total count of open safety hazards.
 */
const GET_URGENT_BACKLOG_COUNT = gql`
  query GetUrgentBacklogCount {
    issues(status: open, category: safety_hazard, limit: 1) {
      total
    }
  }
`;

/**
 * GET_GLOBAL_ANALYTICS
 * @description Fetches AI-driven insights from the analytics-service.
 */
const GET_GLOBAL_ANALYTICS = gql`
  query GetGlobalAnalytics {
    insights {
      resolutionEfficiency
      resolutionDetail
      publicSentiment
      sentimentDetail
    }
  }
`;

/**
 * InsightsDashboard
 * @description Renders a collection of AI-driven metric cards.
 * @returns The rendered insights panel.
 */
export function InsightsDashboard() {
  const { data: issueData, loading: issueLoading } = useQuery(GET_URGENT_BACKLOG_COUNT, {
    context: { service: 'issues' },
  });

  const { data: analyticsData, loading: analyticsLoading } = useQuery(GET_GLOBAL_ANALYTICS, {
    context: { service: 'analytics' },
  });

  const urgentCount = issueData?.issues?.total ?? 0;
  const insightsRes = analyticsData?.insights;

  const insights = [
    { 
      title: 'Resolution Efficiency', 
      value: analyticsLoading ? '...' : (insightsRes?.resolutionEfficiency || 'N/A'), 
      detail: insightsRes?.resolutionDetail || 'Real-time efficiency tracking enabled.', 
      trend: 'up' 
    },
    { 
      title: 'Public Sentiment', 
      value: analyticsLoading ? '...' : (insightsRes?.publicSentiment || 'Neutral'), 
      detail: insightsRes?.sentimentDetail || 'Community mood is being analyzed by Gemini...', 
      trend: 'up' 
    },
    { 
      title: 'Urgent Backlog', 
      value: issueLoading ? '...' : `${urgentCount} Issues`, 
      detail: 'Critical safety hazards requiring staff attention.', 
      trend: urgentCount > 10 ? 'up' : 'down' 
    },
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
