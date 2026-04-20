/** frontend/issue-mfe/src/components/NotificationFeed.tsx
 * @file NotificationFeed.tsx
 * @description Renders a live feed of neighborhood alerts and issue status updates.
 * Provides real-time engagement for residents.
 * @author Your Name
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

import React, { useState } from 'react';

/**
 * Notification
 */
interface Notification {
  id: string;
  type: 'status_change' | 'urgent_alert' | 'community_update';
  message: string;
  timestamp: string;
  isRead: boolean;
}

/**
 * NotificationFeed
 * @description Displays a scrollable feed of recent notifications.
 * @returns {JSX.Element} The rendered notification component.
 */
export function NotificationFeed(): JSX.Element {
  // Mock data for demonstration - in production, this would use GraphQL Subscriptions
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'status_change',
      message: 'Your report "Pothole on Queen St" has been updated to IN PROGRESS.',
      timestamp: new Date().toISOString(),
      isRead: false,
    },
    {
      id: '2',
      type: 'urgent_alert',
      message: 'URGENT: Flooding reported on Main St. Please use alternate routes.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isRead: false,
    },
    {
      id: '3',
      type: 'community_update',
      message: '5 new issues reported in your neighborhood this morning.',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      isRead: true,
    }
  ]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <div className="notification-feed">
      <div className="feed-header">
        <h4>Recent Updates</h4>
        <button className="clear-link">Mark all as read</button>
      </div>

      <div className="feed-list">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className={`notification-item ${n.type} ${n.isRead ? 'read' : 'unread'}`}
            onClick={() => markAsRead(n.id)}
          >
            <div className="item-icon">
              {n.type === 'urgent_alert' ? '⚠️' : n.type === 'status_change' ? '📝' : '🏘️'}
            </div>
            <div className="item-content">
              <p className="item-message">{n.message}</p>
              <span className="item-time">
                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {!n.isRead && <div className="unread-dot"></div>}
          </div>
        ))}
      </div>

      <style>{`
        .notification-feed { background: var(--color-surface); border: 1px solid var(--color-divider); border-radius: 0.5rem; overflow: hidden; height: 100%; display: flex; flex-direction: column; }
        .feed-header { padding: 1rem; border-bottom: 1px solid var(--color-divider); display: flex; justify-content: space-between; align-items: center; }
        .feed-header h4 { margin: 0; font-size: 0.9375rem; color: var(--color-text-primary); }
        .clear-link { font-size: 0.75rem; color: var(--color-primary); background: none; border: none; cursor: pointer; padding: 0; }
        .feed-list { overflow-y: auto; flex: 1; }
        .notification-item { padding: 1rem; display: flex; gap: 1rem; border-bottom: 1px solid var(--color-divider); cursor: pointer; position: relative; transition: background 0.2s; }
        .notification-item:hover { background: var(--color-surface-alt); }
        .notification-item.unread { background: rgba(var(--color-primary), 0.03); }
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
