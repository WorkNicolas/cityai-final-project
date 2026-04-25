/** frontend/analytics-mfe/src/components/AdvocateIssueTable.tsx
 * @file AdvocateIssueTable.tsx
 * @description Reddit-style issue table for the Community Advocate Dashboard.
 * Integrates engagement actions directly into the issue info cell.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-24
 * @version 0.3.0
 */

import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const ME_QUERY = gql`
  query Me {
    me {
      id
      name
    }
  }
`;

const GET_ADVOCATE_ISSUES = gql`
  query GetAdvocateIssues {
    issues(limit: 50) {
      items {
        id
        title
        status
        category
        location
        createdAt
        upvotes
        upvotedBy
        downvotes
        downvotedBy
        comments {
          userId
          userName
          text
          createdAt
        }
      }
    }
  }
`;

const UPVOTE_ISSUE = gql`
  mutation UpvoteIssue($id: ID!) {
    upvoteIssue(id: $id) {
      id
      upvotes
      upvotedBy
      downvotes
      downvotedBy
    }
  }
`;

const DOWNVOTE_ISSUE = gql`
  mutation DownvoteIssue($id: ID!) {
    downvoteIssue(id: $id) {
      id
      upvotes
      upvotedBy
      downvotes
      downvotedBy
    }
  }
`;

const ADD_COMMENT = gql`
  mutation AddComment($issueId: ID!, $text: String!, $userName: String!) {
    addComment(issueId: $issueId, text: $text, userName: $userName) {
      userId
      userName
      text
      createdAt
    }
  }
`;

function CommentModal({ issue, onClose, onAddComment, currentUserName }: any) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddComment(issue.id, text);
    setText('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3>Comments: {issue.title}</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        <div className="modal-body">
          <form className="modal-comment-form" onSubmit={handleSubmit}>
            <textarea
              placeholder="Add professional guidance..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
            <button type="submit" className="btn-post">Post Comment</button>
          </form>

          <div className="comments-list">
            {issue.comments.length === 0 ? (
              <p className="no-comments">No comments yet.</p>
            ) : (
              [...issue.comments].reverse().map((c: any, i: number) => (
                <div key={i} className="comment-item">
                  <div className="comment-meta">
                    <span className="comment-author">{c.userName}</span>
                    <span className="comment-date">{new Date(parseInt(c.createdAt) || c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="comment-text">{c.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 2000; }
        .modal-content { background: var(--color-surface); width: 90%; max-width: 600px; max-height: 80vh; border-radius: 0.75rem; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.3); border: 1px solid var(--color-divider); }
        .modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--color-divider); display: flex; align-items: center; justify-content: space-between; background: var(--color-surface-alt); }
        .modal-header h3 { margin: 0; font-size: 1.1rem; color: var(--color-text-primary); }
        .close-btn { background: none; border: none; font-size: 1.75rem; cursor: pointer; color: var(--color-text-secondary); line-height: 1; }
        .modal-body { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .modal-comment-form { display: flex; flex-direction: column; gap: 0.75rem; }
        .modal-comment-form textarea { width: 100%; min-height: 100px; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid var(--color-divider); background: var(--color-bg); color: var(--color-text-primary); font-family: inherit; resize: vertical; }
        .btn-post { align-self: flex-end; padding: 0.5rem 1.25rem; background: var(--color-primary); color: white; border: none; border-radius: 0.375rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
        .btn-post:hover { opacity: 0.9; }
        .comment-item { padding: 1rem; background: var(--color-surface-alt); border-radius: 0.5rem; border: 1px solid var(--color-divider); }
        .comment-meta { display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.5rem; }
        .comment-author { font-weight: 700; color: var(--color-text-primary); }
        .comment-date { color: var(--color-text-disabled); }
        .comment-text { margin: 0; font-size: 0.9rem; line-height: 1.4; color: var(--color-text-primary); white-space: pre-wrap; text-align: left; }
        .no-comments { text-align: center; color: var(--color-text-disabled); font-style: italic; }
      `}</style>
    </div>
  );
}

export function AdvocateIssueTable() {
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  const { data: userData } = useQuery(ME_QUERY, { context: { service: 'auth' } });
  const { loading, error, data, refetch } = useQuery(GET_ADVOCATE_ISSUES, {
    context: { service: 'issues' }
  });

  const [upvote] = useMutation(UPVOTE_ISSUE, { 
    context: { service: 'issues' },
    onCompleted: () => refetch()
  });

  const [downvote] = useMutation(DOWNVOTE_ISSUE, { 
    context: { service: 'issues' },
    onCompleted: () => refetch()
  });

  const [addComment] = useMutation(ADD_COMMENT, {
    context: { service: 'issues' },
    onCompleted: (res) => {
      refetch();
      if (selectedIssue) {
        setSelectedIssue((prev: any) => ({
          ...prev,
          comments: [...prev.comments, res.addComment]
        }));
      }
    }
  });

  const handleAddComment = (issueId: string, text: string) => {
    addComment({
      variables: {
        issueId,
        text,
        userName: userData?.me?.name || 'Community Advocate'
      }
    });
  };

  if (loading) return <div className="loading">Loading issues...</div>;
  if (error) return <div className="error">Error loading issues.</div>;

  const issues = data?.issues?.items || [];
  const currentUserId = userData?.me?.id;

  return (
    <div className="advocate-table-container">
      <table className="advocate-table">
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
            const hasUpvoted = issue.upvotedBy?.includes(currentUserId);
            const hasDownvoted = issue.downvotedBy?.includes(currentUserId);
            const score = (issue.upvotes || 0) - (issue.downvotes || 0);
            const commentCount = issue.comments?.length || 0;
            
            return (
              <tr key={issue.id}>
                <td>
                  <div className="issue-info-expanded">
                    <span className="issue-title-large">{issue.title}</span>
                    <span className="issue-date-sub">{new Date(parseInt(issue.createdAt) || issue.createdAt).toLocaleDateString()}</span>
                    
                    <div className="engagement-row">
                      <div className="vote-pill">
                        <button 
                          className={`vote-pill-btn ${hasUpvoted ? 'active-up' : ''}`} 
                          onClick={() => upvote({ variables: { id: issue.id } })}
                        >
                          <svg viewBox="0 0 24 24" fill={hasUpvoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="3">
                            <path d="M12 4L3 15h6v5h6v-5h6z" />
                          </svg>
                        </button>
                        <span className="vote-score">{score}</span>
                        <button 
                          className={`vote-pill-btn ${hasDownvoted ? 'active-down' : ''}`} 
                          onClick={() => downvote({ variables: { id: issue.id } })}
                        >
                          <svg viewBox="0 0 24 24" fill={hasDownvoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="3">
                            <path d="M12 20L21 9h-6V4H9v5H3z" />
                          </svg>
                        </button>
                      </div>
                      
                      <button className="comment-btn-link" onClick={() => setSelectedIssue(issue)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.38 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.38 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                        <span>{commentCount}</span>
                      </button>
                    </div>
                  </div>
                </td>
                <td><span className="category-text-plain">{issue.category.replace(/[_-]/g, ' ')}</span></td>
                <td><span className="location-text-plain">{issue.location}</span></td>
                <td>
                  <span className={`status-badge-flat ${issue.status}`}>
                    {issue.status.replace(/[_-]/g, ' ')}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedIssue && (
        <CommentModal 
          issue={selectedIssue} 
          onClose={() => setSelectedIssue(null)} 
          onAddComment={handleAddComment}
          currentUserName={userData?.me?.name}
        />
      )}

      <style>{`
        .advocate-table-container { background: var(--color-surface); border-radius: 0.5rem; border: 1px solid var(--color-divider); overflow: hidden; margin-top: 1rem; }
        .advocate-table { width: 100%; border-collapse: collapse; text-align: left; table-layout: fixed; }
        .advocate-table th { padding: 1.25rem 2rem; font-size: 0.85rem; font-weight: 700; color: #5a6b82; background: #f8fafc; border-bottom: 1px solid var(--color-divider); letter-spacing: 0.025em; }
        .advocate-table td { padding: 1.5rem 2rem; border-bottom: 1px solid #edf2f7; vertical-align: top; }
        
        .issue-info-expanded { display: flex; flex-direction: column; gap: 0.4rem; }
        .issue-title-large { font-weight: 700; font-size: 1.05rem; color: #1a202c; }
        .issue-date-sub { font-size: 0.85rem; color: #a0aec0; margin-bottom: 0.5rem; }
        
        .engagement-row { display: flex; align-items: center; gap: 1.5rem; margin-top: 0.25rem; }
        
        .vote-pill { display: flex; align-items: center; gap: 0.75rem; background: #f1f5f9; padding: 0.375rem 1rem; border-radius: 2rem; border: 1px solid #e2e8f0; }
        .vote-pill-btn { background: none; border: none; cursor: pointer; padding: 0; display: flex; align-items: center; color: #94a3b8; transition: color 0.15s; }
        .vote-pill-btn svg { width: 1.15rem; height: 1.15rem; }
        .vote-pill-btn.active-up { color: #ff4500; }
        .vote-pill-btn.active-down { color: #7193ff; }
        .vote-pill-btn:hover { color: #475569; }
        
        .vote-score { font-weight: 700; font-size: 0.95rem; color: #ff4500; min-width: 1rem; text-align: center; }
        
        .comment-btn-link { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: #4a5568; font-weight: 600; font-size: 0.95rem; padding: 0.25rem; }
        .comment-btn-link svg { width: 1.25rem; height: 1.25rem; }
        .comment-btn-link:hover { color: var(--color-primary); }
        
        .category-text-plain { color: #4a5568; font-size: 0.95rem; text-transform: capitalize; }
        .location-text-plain { color: #4a5568; font-size: 0.95rem; }
        
        .status-badge-flat { padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; background: #ebf8ff; color: #2b6cb0; display: inline-block; }
        .status-badge-flat.resolved { background: #f0fff4; color: #2f855a; }
        .status-badge-flat.in_progress { background: #fffaf0; color: #9c4221; }

        @media (max-width: 768px) {
          .advocate-table th:nth-child(3), .advocate-table td:nth-child(3) { display: none; }
        }
      `}</style>
    </div>
  );
}

export default AdvocateIssueTable;
