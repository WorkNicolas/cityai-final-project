/** frontend/analytics-mfe/src/components/AdvocateIssueTable.tsx
 * @file AdvocateIssueTable.tsx
 * @description Refactored Community Advocate Dashboard issue table.
 * Features a streamlined layout with integrated voting and comment modal.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-24
 * @version 0.2.0
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

/**
 * CommentModal
 * @description Modal displaying comment history and a new comment input.
 */
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
          <button className="close-btn" onClick={onClose}>×</button>
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
        .comment-text { margin: 0; font-size: 0.9rem; line-height: 1.4; color: var(--color-text-primary); white-space: pre-wrap; }
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
            <th>Issue</th>
            <th>Category</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
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
                  <div className="issue-info">
                    <span className="issue-title">{issue.title}</span>
                    <span className="issue-date">{new Date(parseInt(issue.createdAt) || issue.createdAt).toLocaleDateString()}</span>
                  </div>
                </td>
                <td><span className="category-tag">{issue.category.replace(/[_-]/g, ' ')}</span></td>
                <td><span className="location-text">{issue.location}</span></td>
                <td>
                  <span className={`status-pill ${issue.status}`}>
                    {issue.status.replace(/[_-]/g, ' ')}
                  </span>
                </td>
                <td>
                  <div className="actions-cell">
                    <div className="vote-block">
                      <button 
                        className={`vote-icon-btn up ${hasUpvoted ? 'active' : ''}`} 
                        onClick={() => upvote({ variables: { id: issue.id } })}
                        title="Upvote"
                      >
                        <svg viewBox="0 0 24 24" fill={hasUpvoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                          <path d="M12 4L3 15h6v5h6v-5h6z" />
                        </svg>
                      </button>
                      <span className={`score-text ${score > 0 ? 'positive' : score < 0 ? 'negative' : ''}`}>{score}</span>
                      <button 
                        className={`vote-icon-btn down ${hasDownvoted ? 'active' : ''}`} 
                        onClick={() => downvote({ variables: { id: issue.id } })}
                        title="Downvote"
                      >
                        <svg viewBox="0 0 24 24" fill={hasDownvoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                          <path d="M12 20L21 9h-6V4H9v5H3z" />
                        </svg>
                      </button>
                    </div>
                    
                    <button className="comment-trigger" onClick={() => setSelectedIssue(issue)}>
                      <svg className="comment-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.38 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.38 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                      <span>{commentCount}</span>
                    </button>
                  </div>
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
        .advocate-table-container { background: var(--color-surface); border-radius: 0.5rem; border: 1px solid var(--color-divider); overflow: hidden; }
        .advocate-table { width: 100%; border-collapse: collapse; text-align: left; }
        .advocate-table th { padding: 1rem 1.5rem; font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-secondary); background: var(--color-surface-alt); border-bottom: 1px solid var(--color-divider); }
        .advocate-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--color-divider); color: var(--color-text-primary); }
        
        .issue-info { display: flex; flex-direction: column; }
        .issue-title { font-weight: 600; font-size: 0.9375rem; }
        .issue-date { font-size: 0.75rem; color: var(--color-text-disabled); }
        
        .category-tag { font-size: 0.75rem; text-transform: capitalize; color: var(--color-text-secondary); }
        .location-text { font-size: 0.875rem; }
        
        .status-pill { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
        .status-pill.open { background: rgba(0, 120, 255, 0.1); color: #0078ff; }
        .status-pill.in_progress { background: rgba(255, 165, 0, 0.1); color: #ffa500; }
        .status-pill.resolved { background: rgba(40, 167, 69, 0.1); color: #28a745; }
        
        .actions-cell { display: flex; align-items: center; gap: 1.5rem; }
        .vote-block { display: flex; align-items: center; gap: 0.5rem; background: var(--color-surface-alt); padding: 0.25rem 0.75rem; border-radius: 2rem; border: 1px solid var(--color-divider); }
        
        .vote-icon-btn { background: none; border: none; cursor: pointer; padding: 0.25rem; color: var(--color-text-disabled); display: flex; align-items: center; transition: all 0.2s; }
        .vote-icon-btn svg { width: 1.25rem; height: 1.25rem; }
        .vote-icon-btn.up:hover, .vote-icon-btn.up.active { color: #ff4500; }
        .vote-icon-btn.down:hover, .vote-icon-btn.down.active { color: #7193ff; }
        
        .score-text { font-weight: 800; font-size: 0.875rem; min-width: 1.25rem; text-align: center; }
        .score-text.positive { color: #ff4500; }
        .score-text.negative { color: #7193ff; }
        
        .comment-trigger { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: var(--color-text-secondary); font-weight: 600; padding: 0.5rem; border-radius: 0.375rem; transition: background 0.2s; }
        .comment-trigger:hover { background: var(--color-surface-alt); color: var(--color-primary); }
        .comment-svg { width: 1.25rem; height: 1.25rem; }
      `}</style>
    </div>
  );
}

export default AdvocateIssueTable;
