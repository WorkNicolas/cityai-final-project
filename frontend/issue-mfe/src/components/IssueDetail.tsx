/** frontend/issue-mfe/src/components/IssueDetail.tsx
 * @file IssueDetail.tsx
 * @description Provides a detailed view of a single municipal issue.
 * Displays title, AI summary, full description, photo, and status.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-24 - Added comments and voting.
 * @version 0.2.0
 */

import React from 'react';
import { useQuery, gql } from '@apollo/client';
import IssueStatusBadge, { IssueStatus } from './IssueStatusBadge';
import IssueMap from './IssueMap';
import CommentThread from './CommentThread';

const ME_QUERY = gql`
  query Me {
    me {
      id
      name
    }
  }
`;

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
      downvotes
      createdAt
      reportedBy
      comments {
        userId
        userName
        text
        createdAt
      }
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
 * @returns The rendered detail component.
 */
export function IssueDetail({ id }: IssueDetailProps) {
  const { loading, error, data, refetch } = useQuery(GET_ISSUE_DETAIL, {
    variables: { id },
  });

  const { data: userData } = useQuery(ME_QUERY, {
    context: { service: 'auth' }
  });

  if (loading) return <div className="loading">Loading details...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  const issue = data?.issue;
  if (!issue) return <div className="not-found">Issue not found.</div>;

  const score = (issue.upvotes || 0) - (issue.downvotes || 0);

  return (
    <div className="issue-detail">
      <div className="detail-header">
        <IssueStatusBadge status={issue.status as IssueStatus} />
        <span className="category-label">{issue.category}</span>
        <div className="score-display">
          <span className={`score-value ${score > 0 ? 'pos' : score < 0 ? 'neg' : ''}`}>
            {score > 0 ? `+${score}` : score}
          </span>
        </div>
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

      <CommentThread 
        issueId={issue.id} 
        comments={issue.comments || []} 
        currentUserName={userData?.me?.name || 'Anonymous User'}
        onCommentAdded={() => refetch()}
      />

      <footer className="detail-footer">
        <span>Reported on: {new Date(parseInt(issue.createdAt) || issue.createdAt).toLocaleDateString()}</span>
        <span>ID: {issue.id}</span>
      </footer>

      <style>{`
        .issue-detail { background: var(--color-surface); border-radius: 0.5rem; padding: 2rem; border: 1px solid var(--color-divider); }
        .detail-header { display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem; }
        .category-label { background: var(--color-surface-alt); font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 0.25rem; }
        .score-display { margin-left: auto; background: var(--color-surface-alt); padding: 0.25rem 0.75rem; border-radius: 1rem; border: 1px solid var(--color-divider); }
        .score-value { font-weight: 800; font-size: 0.875rem; color: var(--color-text-secondary); }
        .score-value.pos { color: #ff4500; }
        .score-value.neg { color: #7193ff; }
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
