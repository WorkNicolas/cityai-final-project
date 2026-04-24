/** frontend/issue-mfe/src/components/CommentThread.tsx
 * @file CommentThread.tsx
 * @description Renders a list of comments and a form to add new ones.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-24
 * @version 0.1.0
 */

import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';

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

interface Comment {
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

interface CommentThreadProps {
  issueId: string;
  comments: Comment[];
  currentUserName: string;
  onCommentAdded: () => void;
}

export function CommentThread({ issueId, comments, currentUserName, onCommentAdded }: CommentThreadProps) {
  const [text, setText] = useState('');
  const [addComment, { loading }] = useMutation(ADD_COMMENT, {
    onCompleted: () => {
      setText('');
      onCommentAdded();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addComment({ variables: { issueId, text, userName: currentUserName } });
  };

  return (
    <div className="comment-thread">
      <h3>Community Discussion</h3>
      
      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">No comments yet. Be the first to respond.</p>
        ) : (
          comments.map((c, i) => (
            <div key={i} className="comment-item">
              <div className="comment-meta">
                <strong>{c.userName}</strong>
                <span>{new Date(parseInt(c.createdAt) || c.createdAt).toLocaleString()}</span>
              </div>
              <p className="comment-text">{c.text}</p>
            </div>
          ))
        )}
      </div>

      <form className="comment-form" onSubmit={handleSubmit}>
        <textarea
          placeholder="Add a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={loading || !text.trim()}>
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      <style>{`
        .comment-thread { margin-top: 3rem; border-top: 1px solid var(--color-divider); padding-top: 2rem; }
        .comments-list { margin-bottom: 2rem; display: flex; flex-direction: column; gap: 1rem; }
        .comment-item { background: var(--color-surface-alt); padding: 1rem; border-radius: 0.5rem; border: 1px solid var(--color-divider); }
        .comment-meta { display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.5rem; color: var(--color-text-secondary); }
        .comment-text { margin: 0; color: var(--color-text-primary); line-height: 1.5; font-size: 0.9375rem; }
        .no-comments { font-style: italic; color: var(--color-text-disabled); }
        
        .comment-form textarea { width: 100%; min-height: 80px; padding: 1rem; border-radius: 0.5rem; border: 1px solid var(--color-divider); background: var(--color-surface); color: var(--color-text-primary); margin-bottom: 1rem; resize: vertical; }
        .comment-form button { align-self: flex-end; }
      `}</style>
    </div>
  );
}

export default CommentThread;
