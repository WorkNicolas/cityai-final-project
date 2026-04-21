/** frontend/issue-mfe/src/components/IssueList.tsx
 * @file IssueList.tsx
 * @description Renders a list of civic issues for the current user.
 * Includes status badges and community upvoting interaction.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - GraphQL
 *   - GET_MY_ISSUES
 *   - UPVOTE_ISSUE
 * - Components
 *   - IssueList
 * - Exports
 */

import React from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import IssueStatusBadge, { IssueStatus } from './IssueStatusBadge';

/**
 * GET_MY_ISSUES
 * @description Query to fetch issues reported by the authenticated resident.
 */
const GET_MY_ISSUES = gql`
  query GetMyIssues {
    myIssues {
      id
      title
      description
      status
      category
      location
      upvotes
      createdAt
    }
  }
`;

/**
 * UPVOTE_ISSUE
 * @description Mutation to increment the upvote count of an issue.
 */
const UPVOTE_ISSUE = gql`
  mutation UpvoteIssue($id: ID!) {
    upvoteIssue(id: $id) {
      id
      upvotes
    }
  }
`;

/**
 * IssueList
 * @description Displays a list of issues in a card-based layout.
 * @returns The rendered issue list.
 */
export function IssueList() {
  const { loading, error, data } = useQuery(GET_MY_ISSUES);
  const [upvote] = useMutation(UPVOTE_ISSUE);

  if (loading) return <div className="loading-state">Loading your reports...</div>;
  if (error) return <div className="error-state">Error: {error.message}</div>;

  const issues = data?.myIssues || [];

  if (issues.length === 0) {
    return (
      <div className="empty-state">
        <p>You haven't reported any issues yet.</p>
      </div>
    );
  }

  return (
    <div className="issue-list">
      {issues.map((issue: any) => (
        <div key={issue.id} className="issue-card">
          <div className="card-header">
            <IssueStatusBadge status={issue.status as IssueStatus} />
            <span className="issue-category">{issue.category}</span>
          </div>
          
          <h3 className="issue-title">{issue.title}</h3>
          <p className="issue-location">📍 {issue.location}</p>
          
          <div className="card-footer">
            <span className="issue-date">
              {new Date(parseInt(issue.createdAt)).toLocaleDateString()}
            </span>
            
            <button 
              className="upvote-btn" 
              onClick={() => upvote({ variables: { id: issue.id } })}
              title="Upvote this issue"
            >
              ▲ {issue.upvotes}
            </button>
          </div>
        </div>
      ))}

      <style>{`
        .issue-list { display: flex; flex-direction: column; gap: 1rem; }
        .issue-card {
          background: var(--color-surface);
          border: 1px solid var(--color-divider);
          border-radius: 0.5rem;
          padding: 1.25rem;
          transition: transform 0.2s;
        }
        .issue-card:hover { transform: translateY(-2px); border-color: var(--color-primary); }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .issue-category { font-size: 0.75rem; color: var(--color-text-secondary); background: var(--color-surface-alt); padding: 0.25rem 0.5rem; border-radius: 0.25rem; text-transform: capitalize; }
        .issue-title { margin: 0 0 0.5rem; font-size: 1.125rem; color: var(--color-text-primary); }
        .issue-location { font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 1rem; }
        .card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-divider); padding-top: 0.75rem; }
        .issue-date { font-size: 0.75rem; color: var(--color-text-disabled); }
        .upvote-btn { background: var(--color-surface-alt); border: none; border-radius: 0.25rem; color: var(--color-primary); padding: 0.25rem 0.75rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .upvote-btn:hover { background: var(--color-primary); color: white; }
        .loading-state, .error-state, .empty-state { padding: 2rem; text-align: center; color: var(--color-text-secondary); }
      `}</style>
    </div>
  );
}

export default IssueList;
