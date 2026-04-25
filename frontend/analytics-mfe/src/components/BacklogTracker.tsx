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

const GET_USERS = gql`
  query GetUsers($roles: [UserRole!]) {
    users(roles: $roles) {
      id
      name
      role
    }
  }
`;

const ASSIGN_ISSUE = gql`
  mutation AssignIssue($id: ID!, $assignedTo: String) {
    assignIssue(id: $id, assignedTo: $assignedTo) {
      id
      assignedTo
    }
  }
`;

function AssignModal({ issue, onClose, onAssign }: any) {
  const { data, loading, error } = useQuery(GET_USERS, {
    variables: { roles: ['staff', 'advocate'] },
    context: { service: 'auth' }
  });

  if (loading) return <div className="modal-overlay"><div className="modal-content" style={{padding: '2rem'}}>Loading users...</div></div>;
  if (error) return <div className="modal-overlay"><div className="modal-content" style={{padding: '2rem'}}>Error loading users.</div></div>;

  const users = data?.users || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3>Assign: {issue.title}</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>
        <div className="modal-body">
          <ul className="user-list">
            {users.map((u: any) => {
              const isAssigned = issue.assignedTo === u.id;
              return (
                <li key={u.id} className={`user-list-item ${isAssigned ? 'assigned' : ''}`}>
                  <div className="user-info">
                    <strong>{u.name}</strong>
                    <span className="user-role badge">{u.role}</span>
                  </div>
                  <button 
                    className={`btn-assign ${isAssigned ? 'btn-unassign' : ''}`} 
                    onClick={() => onAssign(issue.id, isAssigned ? "" : u.id)}
                  >
                    {isAssigned ? 'Unassign' : 'Assign'}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <style>{`
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 2000; }
        .modal-content { background: var(--color-surface); width: 90%; max-width: 500px; max-height: 80vh; border-radius: 0.75rem; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.3); border: 1px solid var(--color-divider); }
        .modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--color-divider); display: flex; align-items: center; justify-content: space-between; background: var(--color-surface-alt); }
        .modal-header h3 { margin: 0; font-size: 1.1rem; color: var(--color-text-primary); }
        .close-btn { background: none; border: none; font-size: 1.75rem; cursor: pointer; color: var(--color-text-secondary); line-height: 1; }
        .modal-body { flex: 1; overflow-y: auto; padding: 1.5rem; }
        .user-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
        .user-list-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border: 1px solid var(--color-divider); border-radius: 0.5rem; }
        .user-info { display: flex; flex-direction: column; gap: 0.25rem; }
        .user-info strong { font-size: 0.95rem; color: var(--color-text-primary); }
        .user-role.badge { align-self: flex-start; font-size: 0.7rem; text-transform: uppercase; padding: 0.2rem 0.4rem; background: var(--color-surface-alt); border-radius: 0.25rem; border: 1px solid var(--color-divider); color: var(--color-text-secondary); }
        .btn-assign { padding: 0.4rem 0.8rem; background: var(--color-primary); color: white; border: none; border-radius: 0.375rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
        .btn-assign:hover { opacity: 0.9; }
        .user-list-item.assigned { background-color: #f8fafc; border-color: #cbd5e1; }
        .btn-assign.btn-unassign { background: var(--color-surface-alt); color: var(--color-text-secondary); border: 1px solid var(--color-divider); }
        .btn-assign.btn-unassign:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }
      `}</style>
    </div>
  );
}

/**
 * BacklogTracker
 * @description Renders the staff issue management table.
 * @returns The rendered backlog component.
 */
export function BacklogTracker() {
  const [filter, setFilter] = useState({ status: undefined, category: undefined });
  const [assigningIssue, setAssigningIssue] = useState<any>(null);

  const { loading, error, data, refetch } = useQuery(GET_ALL_ISSUES, { variables: filter });
  const [updateStatus] = useMutation(UPDATE_STATUS, { onCompleted: () => refetch() });
  const [assignIssue] = useMutation(ASSIGN_ISSUE, { 
    context: { service: 'issues' },
    onCompleted: () => {
      setAssigningIssue(null);
      refetch();
    }
  });

  const handleAssign = (issueId: string, userId: string) => {
    assignIssue({ variables: { id: issueId, assignedTo: userId } });
  };

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
              <th>ISSUE</th>
              <th>CATEGORY</th>
              <th>LOCATION</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue: any) => {
              const isResolved = issue.status === 'resolved';
              return (
                <tr key={issue.id}>
                  <td>
                    <div className="issue-info-expanded">
                      <span className="issue-title-large">{issue.title}</span>
                      <span className="issue-date-sub">{new Date(parseInt(issue.createdAt)).toLocaleDateString()}</span>
                      
                      <div className="engagement-row">
                        <button 
                          className="action-btn assign" 
                          onClick={() => setAssigningIssue(issue)}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <line x1="20" y1="8" x2="20" y2="14"></line>
                            <line x1="23" y1="11" x2="17" y2="11"></line>
                          </svg>
                          Assign
                        </button>

                        <button 
                          className={`action-btn resolve ${isResolved ? 'active' : ''}`}
                          onClick={() => updateStatus({ variables: { id: issue.id, status: isResolved ? 'in_progress' : 'resolved' } })}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          {isResolved ? 'Resolved' : 'Mark Resolved'}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td><span className="category-text-plain">{issue.category.replace('_', ' ')}</span></td>
                  <td><span className="location-text-plain">{issue.location}</span></td>
                  <td>
                    <span className={`status-badge-flat ${issue.status}`}>
                      {issue.status.replace('-', ' ')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {assigningIssue && (
        <AssignModal 
          issue={assigningIssue} 
          onClose={() => setAssigningIssue(null)}
          onAssign={handleAssign}
        />
      )}

      <style>{`
        .backlog-container { background: var(--color-surface); border-radius: 0.5rem; border: 1px solid var(--color-divider); overflow: hidden; margin-top: 1rem; }
        .backlog-header { padding: 1.5rem; border-bottom: 1px solid var(--color-divider); display: flex; justify-content: space-between; align-items: center; }
        .backlog-header h3 { margin: 0; color: var(--color-text-primary); font-size: 1.1rem; }
        .filter-row select { padding: 0.5rem; border-radius: 0.375rem; border: 1px solid var(--color-input-border); background: var(--color-input-fill); color: var(--color-text-primary); }
        .table-wrapper { overflow-x: auto; }
        .backlog-table { width: 100%; border-collapse: collapse; text-align: left; table-layout: fixed; }
        .backlog-table th { padding: 1.25rem 2rem; font-size: 0.85rem; font-weight: 700; color: #5a6b82; background: #f8fafc; border-bottom: 1px solid var(--color-divider); letter-spacing: 0.025em; }
        .backlog-table td { padding: 1.5rem 2rem; border-bottom: 1px solid #edf2f7; vertical-align: top; }
        
        .issue-info-expanded { display: flex; flex-direction: column; gap: 0.4rem; }
        .issue-title-large { font-weight: 700; font-size: 1.05rem; color: #1a202c; }
        .issue-date-sub { font-size: 0.85rem; color: #a0aec0; margin-bottom: 0.5rem; }
        
        .category-text-plain { color: #4a5568; font-size: 0.95rem; text-transform: capitalize; }
        .location-text-plain { color: #4a5568; font-size: 0.95rem; }
        
        .status-badge-flat { padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; background: #ebf8ff; color: #2b6cb0; display: inline-block; }
        .status-badge-flat.resolved { background: #f0fff4; color: #2f855a; }
        .status-badge-flat.in_progress { background: #fffaf0; color: #9c4221; }

        .engagement-row { display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem; }
        .action-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.375rem 0.85rem; border-radius: 2rem; border: 1px solid var(--color-divider); background: var(--color-surface-alt); color: var(--color-text-secondary); font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .action-btn:hover { background: #e2e8f0; color: #1a202c; }
        .action-btn.resolve.active { background: #f0fff4; border-color: #9ae6b4; color: #2f855a; }
        .action-btn.resolve.active:hover { background: #c6f6d5; }

        @media (max-width: 768px) {
          .backlog-table th:nth-child(3), .backlog-table td:nth-child(3) { display: none; }
        }
      `}</style>
    </div>
  );
}

export default BacklogTracker;
