/** frontend/issue-mfe/src/components/NotificationFeed.tsx
 * @file NotificationFeed.tsx
 * @description Renders a live feed of neighborhood alerts and issue status updates.
 * Provides real-time engagement for residents.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Components
 *   - NotificationFeed
 * - Exports
 */

import React from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

/**
 * GraphQL Definitions
 */
const GET_MY_NOTIFICATIONS = gql`
  query GetMyNotifications {
    myNotifications {
      id
      type
      message
      isRead
      createdAt
    }
  }
`;

const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      id
      isRead
    }
  }
`;

/**
 * Notification
 */
interface Notification {
  id: string;
  type: 'status_change' | 'urgent_alert' | 'community_update';
  message: string;
  createdAt: string;
  isRead: boolean;
}

/**
 * NotificationFeed
 * @description Displays a scrollable feed of real-time notifications from the issue-service.
 * @returns The rendered notification component.
 */
export function NotificationFeed() {
  const { data, loading, error } = useQuery(GET_MY_NOTIFICATIONS, {
    context: { service: 'issues' },
    pollInterval: 10000, // Poll every 10 seconds for "real-time" feel without subscriptions
  });

  const [markRead] = useMutation(MARK_NOTIFICATION_READ, {
    context: { service: 'issues' },
    refetchQueries: [{ query: GET_MY_NOTIFICATIONS, context: { service: 'issues' } }],
  });

  const notifications: Notification[] = data?.myNotifications ?? [];

  const handleMarkAsRead = (id: string) => {
    markRead({ variables: { id } });
  };

  if (loading && !data) return <div className="feed-loading">Loading alerts...</div>;
  if (error) return <div className="feed-error">Failed to load notifications.</div>;

  return (
    <div className="notification-feed">
      <div className="feed-header">
        <h4>Recent Updates</h4>
        <span className="count-badge">{notifications.filter(n => !n.isRead).length} New</span>
      </div>

      <div className="feed-list">
        {notifications.length === 0 ? (
          <div className="empty-feed">No notifications yet.</div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id} 
              className={`notification-item ${n.type} ${n.isRead ? 'read' : 'unread'}`}
              onClick={() => !n.isRead && handleMarkAsRead(n.id)}
            >
              <div className="item-icon">
                {n.type === 'urgent_alert' ? '⚠️' : n.type === 'status_change' ? '📝' : '🏘️'}
              </div>
              <div className="item-content">
                <p className="item-message">{n.message}</p>
                <span className="item-time">
                  {new Date(parseInt(n.createdAt) || n.createdAt).toLocaleString([], { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              {!n.isRead && <div className="unread-dot"></div>}
            </div>
          ))
        )}
      </div>

      <style>{`
        .notification-feed { background: var(--color-surface); border: 1px solid var(--color-divider); border-radius: 0.5rem; overflow: hidden; height: 100%; display: flex; flex-direction: column; }
        .feed-header { padding: 1rem; border-bottom: 1px solid var(--color-divider); display: flex; justify-content: space-between; align-items: center; }
        .feed-header h4 { margin: 0; font-size: 0.9375rem; color: var(--color-text-primary); }
        .count-badge { font-size: 0.75rem; background: var(--color-primary); color: white; padding: 0.125rem 0.5rem; border-radius: 1rem; }
        .feed-list { overflow-y: auto; flex: 1; min-height: 200px; }
        .feed-loading, .feed-error, .empty-feed { padding: 2rem; text-align: center; color: var(--color-text-secondary); font-size: 0.875rem; }
        .notification-item { padding: 1rem; display: flex; gap: 1rem; border-bottom: 1px solid var(--color-divider); cursor: pointer; position: relative; transition: background 0.2s; }
        .notification-item:hover { background: var(--color-surface-alt); }
        .notification-item.read { opacity: 0.7; }
        .notification-item.unread { background: rgba(var(--color-primary), 0.05); }
        .notification-item.urgent_alert { border-left: 4px solid var(--color-danger); }
        .item-icon { font-size: 1.25rem; }
        .item-content { flex: 1; }
        .item-message { margin: 0 0 0.25rem; font-size: 0.875rem; color: var(--color-text-primary); line-height: 1.4; }
        .item-time { font-size: 0.75rem; color: var(--color-text-disabled); }
        .unread-dot { width: 8px; height: 8px; background: var(--color-primary); border-radius: 50%; position: absolute; right: 1rem; top: 1.25rem; }
      `}</style>
    </div>
  );
}


export default NotificationFeed;
