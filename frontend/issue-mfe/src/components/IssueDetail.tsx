/** frontend/issue-mfe/src/components/IssueDetail.tsx
 * @file IssueDetail.tsx
 * @description Provides a detailed view of a single civic issue.
 * Displays title, AI summary, full description, photo, and status.
 * @author Your Name
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - GraphQL
 *   - GET_ISSUE_DETAIL
 * - Components
 *   - IssueDetail
 * - Exports
 */

import React from 'react';
import { useQuery, gql } from '@apollo/client';
import IssueStatusBadge, { IssueStatus } from './IssueStatusBadge';
import IssueMap from './IssueMap';

/**
 * GET_ISSUE_DETAIL
 * @description Query to fetch full details of a single issue.
 */
const GET_ISSUE_DETAIL = gql`
  query GetIssueDetail($id: ID!) {
    issue(id: $id) {
      id
      title
      description
      status
      category
      location
      coordinates
      photoUrl
      aiSummary
      upvotes
      createdAt
      reportedBy
    }
  }
`;

/**
 * IssueDetailProps
 */
interface IssueDetailProps {
  /** id - The MongoDB ID of the issue to display. */
  id: string;
}

/**
 * IssueDetail
 * @description Renders a full detail view of an issue report.
 * @param {IssueDetailProps} props - Component props.
 * @returns {JSX.Element} The rendered detail component.
 */
export function IssueDetail({ id }: IssueDetailProps): JSX.Element {
  const { loading, error, data } = useQuery(GET_ISSUE_DETAIL, {
    variables: { id },
  });

  if (loading) return <div className="loading">Loading details...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  const issue = data?.issue;
  if (!issue) return <div className="not-found">Issue not found.</div>;

  return (
    <div className="issue-detail">
      <div className="detail-header">
        <IssueStatusBadge status={issue.status as IssueStatus} />
        <span className="category-label">{issue.category}</span>
      </div>

      <h2 className="detail-title">{issue.title}</h2>
      
      {issue.aiSummary && (
        <div className="ai-summary-box">
          <strong>AI Summary:</strong>
          <p>{issue.aiSummary}</p>
        </div>
      )}

      <div className="detail-main">
        <section className="description-section">
          <h4>Description</h4>
          <p className="description-text">{issue.description}</p>
        </section>

        {issue.photoUrl && (
          <div className="photo-section">
            <h4>Evidence</h4>
            <img src={issue.photoUrl} alt="Issue evidence" className="detail-photo" />
          </div>
        )}
      </div>

      <section className="location-section">
        <h4>Location</h4>
        <p>📍 {issue.location}</p>
        {issue.coordinates && (
          <div className="map-wrapper">
            <IssueMap 
              initialCoords={[issue.coordinates[0], issue.coordinates[1]]} 
              readOnly 
            />
          </div>
        )}
      </section>

      <footer className="detail-footer">
        <span>Reported on: {new Date(parseInt(issue.createdAt)).toLocaleDateString()}</span>
        <span>ID: {issue.id}</span>
      </footer>

      <style>{`
        .issue-detail { background: var(--color-surface); border-radius: 0.5rem; padding: 2rem; border: 1px solid var(--color-divider); }
        .detail-header { display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem; }
        .category-label { background: var(--color-surface-alt); font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 0.25rem; }
        .detail-title { margin: 0 0 1.5rem; color: var(--color-text-primary); }
        .ai-summary-box { background: rgba(var(--color-primary), 0.05); border-left: 4px solid var(--color-primary); padding: 1rem; margin-bottom: 2rem; border-radius: 0 0.25rem 0.25rem 0; }
        .ai-summary-box strong { font-size: 0.875rem; color: var(--color-primary); }
        .ai-summary-box p { margin: 0.5rem 0 0; color: var(--color-text-primary); font-size: 0.9375rem; font-style: italic; }
        .detail-main { display: grid; grid-template-columns: 1fr auto; gap: 2rem; margin-bottom: 2rem; }
        .description-text { white-space: pre-wrap; color: var(--color-text-primary); line-height: 1.6; }
        .detail-photo { max-width: 300px; border-radius: 0.5rem; border: 1px solid var(--color-divider); }
        .location-section h4 { margin-bottom: 0.5rem; }
        .map-wrapper { margin-top: 1rem; }
        .detail-footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--color-divider); display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--color-text-disabled); }
        @media (max-width: 768px) { .detail-main { grid-template-columns: 1fr; } .detail-photo { max-width: 100%; } }
      `}</style>
    </div>
  );
}

export default IssueDetail;
