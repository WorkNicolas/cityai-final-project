/** frontend/issue-mfe/src/components/IssueStatusBadge.tsx
 * @file IssueStatusBadge.tsx
 * @description Reusable badge component that displays the lifecycle status of a municipal issue.
 * Maps status strings to theme-aware color tokens.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Types
 *   - IssueStatus
 *   - IssueStatusBadgeProps
 * - Components
 *   - IssueStatusBadge
 * - Exports
 */

import React from 'react';

/**
 * IssueStatus
 * @description Valid status values for a municipal issue.
 */
export type IssueStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

/**
 * IssueStatusBadgeProps
 * @description Props for the IssueStatusBadge component.
 */
interface IssueStatusBadgeProps {
  /** status - The current status of the issue. */
  status: IssueStatus;
}

/**
 * IssueStatusBadge
 * @description Renders a themed badge for an issue status.
 * @param {IssueStatusBadgeProps} props - Component props.
 * @returns The rendered status badge.
 */
export function IssueStatusBadge({ status }: IssueStatusBadgeProps) {
  const labelMap: Record<IssueStatus, string> = {
    'open':        'Open',
    'in-progress': 'In Progress',
    'resolved':    'Resolved',
    'closed':      'Closed',
  };

  const colorMap: Record<IssueStatus, string> = {
    'open':        'var(--color-badge-open)',
    'in-progress': 'var(--color-badge-progress)',
    'resolved':    'var(--color-badge-resolved)',
    'closed':      'var(--color-badge-closed)',
  };

  return (
    <span 
      className="status-badge"
      style={{ 
        backgroundColor: colorMap[status] || 'var(--color-surface-alt)',
        color: '#FFFFFF', // High contrast text for badges
      }}
    >
      {labelMap[status] || status}
      <style>{`
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          white-space: nowrap;
        }
      `}</style>
    </span>
  );
}

export default IssueStatusBadge;
