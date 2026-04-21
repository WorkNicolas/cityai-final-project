/** frontend/analytics-mfe/src/components/TrendChart.tsx
 * @file TrendChart.tsx
 * @description Visualizes AI-detected civic issue trends using the analytics-service.
 * Displays a bar chart of issue volume by category.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - GraphQL
 *   - GET_TRENDS
 * - Components
 *   - TrendChart
 * - Exports
 */

import React from 'react';
import { useQuery, gql } from '@apollo/client';

/**
 * GET_TRENDS
 * @description Query to fetch AI-detected issue trends.
 */
const GET_TRENDS = gql`
  query GetTrends {
    trends {
      category
      count
      summary
    }
  }
`;

/**
 * TrendChart
 * @description Renders a CSS/SVG bar chart showing issue volume by category.
 * @returns The rendered trend chart.
 */
export function TrendChart() {
  const { loading, error, data } = useQuery(GET_TRENDS);

  if (loading) return <div className="loading-trends">Analyzing trends...</div>;
  if (error) return <div className="error-trends">Failed to load trends.</div>;

  const trends = data?.trends || [];
  const maxCount = Math.max(...trends.map((t: any) => t.count), 1);

  return (
    <div className="trend-chart-card">
      <header className="card-header">
        <h4>Volume by Category</h4>
        <span className="window-label">Last 7 Days</span>
      </header>

      <div className="bar-list">
        {trends.map((t: any) => (
          <div key={t.category} className="bar-item">
            <div className="bar-info">
              <span className="category-name">{t.category.replace('-', ' ')}</span>
              <span className="category-count">{t.count}</span>
            </div>
            <div className="bar-track">
              <div 
                className="bar-fill" 
                style={{ width: `${(t.count / maxCount) * 100}%` }}
              ></div>
            </div>
            <p className="ai-insight">✨ {t.summary}</p>
          </div>
        ))}
      </div>

      <style>{`
        .trend-chart-card { background: var(--color-surface); border: 1px solid var(--color-divider); border-radius: 0.5rem; padding: 1.5rem; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .card-header h4 { margin: 0; color: var(--color-text-primary); }
        .window-label { font-size: 0.75rem; color: var(--color-text-disabled); }
        .bar-list { display: flex; flex-direction: column; gap: 1.25rem; }
        .bar-info { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem; }
        .category-name { text-transform: capitalize; font-weight: 500; color: var(--color-text-primary); }
        .category-count { color: var(--color-primary); font-weight: 600; }
        .bar-track { height: 8px; background: var(--color-surface-alt); border-radius: 4px; overflow: hidden; }
        .bar-fill { height: 100%; background: var(--color-primary); border-radius: 4px; transition: width 1s ease-out; }
        .ai-insight { margin: 0.5rem 0 0; font-size: 0.75rem; color: var(--color-text-secondary); font-style: italic; line-height: 1.4; }
        .loading-trends { padding: 2rem; text-align: center; color: var(--color-text-disabled); }
      `}</style>
    </div>
  );
}

export default TrendChart;
