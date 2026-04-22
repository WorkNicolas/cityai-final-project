/** frontend/analytics-mfe/src/components/BacklogTracker.tsx
 * @file BacklogTracker.tsx
 * @description Admin-facing table for municipal staff to track and manage the issue backlog.
 * Includes filters for status and category.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - GraphQL
 *   - GET_ALL_ISSUES
 *   - UPDATE_STATUS
 * - Components
 *   - BacklogTracker
 * - Exports
 */

import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

/**
 * GET_ALL_ISSUES
 * @description Query to fetch paginated issues for staff.
 */
const GET_ALL_ISSUES = gql`
  query GetIssues($status: IssueStatus, $category: IssueCategory) {
    issues(status: $status, category: $category) {
      items {
        id
        title
        status
        category
        location
        createdAt
        assignedTo
      }
    }
  }
`;

/**
 * UPDATE_STATUS
 */
const UPDATE_STATUS = gql`
  mutation UpdateStatus($id: ID!, $status: IssueStatus!) {
    updateIssueStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

/**
 * BacklogTracker
 * @description Renders the staff issue management table.
 * @returns The rendered backlog component.
 */
export function BacklogTracker() {
  const [filter, setFilter] = useState({ status: undefined, category: undefined });
  const { loading, error, data, refetch } = useQuery(GET_ALL_ISSUES, { variables: filter });
  const [updateStatus] = useMutation(UPDATE_STATUS, { onCompleted: () => refetch() });

  if (loading) return <div className="loading">Loading backlog...</div>;
  if (error) return <div className="error">Error loading issues.</div>;

  const issues = data?.issues?.items || [];

  return (
    <div className="backlog-container">
      <div className="backlog-header">
        <h3>CityAI Issue Backlog</h3>
        <div className="filter-row">
          <select onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}>
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="backlog-table">
          <thead>
            <tr>
              <th>Issue</th>
              <th>Category</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue: any) => (
              <tr key={issue.id}>
                <td>
                  <div className="issue-info">
                    <span className="issue-title">{issue.title}</span>
                    <span className="issue-date">{new Date(parseInt(issue.createdAt)).toLocaleDateString()}</span>
                  </div>
                </td>
                <td><span className="category-tag">{issue.category.replace('_', ' ')}</span></td>
                <td><span className="location-text">{issue.location}</span></td>
                <td>
                  <span className={`status-pill ${issue.status}`}>
                    {issue.status.replace('-', ' ')}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    {issue.status === 'open' && (
                      <button onClick={() => updateStatus({ variables: { id: issue.id, status: 'in_progress' } })}>
                        Assign
                      </button>
                    )}
                    {issue.status === 'in_progress' && (
                      <button onClick={() => updateStatus({ variables: { id: issue.id, status: 'resolved' } })}>
                        Resolve
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .backlog-container { background: var(--color-surface); border: 1px solid var(--color-divider); border-radius: 0.5rem; overflow: hidden; }
        .backlog-header { padding: 1.5rem; border-bottom: 1px solid var(--color-divider); display: flex; justify-content: space-between; align-items: center; }
        .backlog-header h3 { margin: 0; color: var(--color-text-primary); }
        .filter-row select { padding: 0.5rem; border-radius: 0.375rem; border: 1px solid var(--color-input-border); background: var(--color-input-fill); color: var(--color-text-primary); }
        .table-wrapper { overflow-x: auto; }
        .backlog-table { width: 100%; border-collapse: collapse; text-align: left; }
        .backlog-table th { padding: 1rem 1.5rem; font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-secondary); background: var(--color-surface-alt); border-bottom: 1px solid var(--color-divider); }
        .backlog-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--color-divider); color: var(--color-text-primary); }
        .issue-info { display: flex; flex-direction: column; }
        .issue-title { font-weight: 600; font-size: 0.9375rem; }
        .issue-date { font-size: 0.75rem; color: var(--color-text-disabled); }
        .category-tag { font-size: 0.75rem; text-transform: capitalize; color: var(--color-text-secondary); }
        .location-text { font-size: 0.875rem; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
        .status-pill { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
        .status-pill.open { background: rgba(var(--color-badge-open), 0.1); color: var(--color-badge-open); }
        .status-pill.in-progress { background: rgba(var(--color-badge-progress), 0.1); color: var(--color-badge-progress); }
        .status-pill.resolved { background: rgba(var(--color-badge-resolved), 0.1); color: var(--color-badge-resolved); }
        .action-btns button { padding: 0.375rem 0.75rem; border-radius: 0.25rem; border: 1px solid var(--color-primary); background: transparent; color: var(--color-primary); font-size: 0.75rem; font-weight: 600; cursor: pointer; }
        .action-btns button:hover { background: var(--color-primary); color: white; }
      `}</style>
    </div>
  );
}

export default BacklogTracker;
