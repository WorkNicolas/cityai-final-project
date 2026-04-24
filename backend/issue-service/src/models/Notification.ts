/** backend/issue-service/src/models/Notification.ts
 * @file Notification.ts
 * @description Mongoose schema and model for user notifications and alerts.
 * Stores status updates, urgent alerts, and community engagement notifications.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-23
 * @updated 2026-04-23 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Interfaces
 *   - INotification
 * - Schema
 *   - NotificationSchema
 * - Exports
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * INotification
 * @description TypeScript interface representing a Notification document in MongoDB.
 */
export interface INotification extends Document {
  /**
   * userId
   * @description The ID of the resident or staff member this notification is for.
   */
  userId: string;

  /**
   * type
   * @description The type of alert or update.
   * One of: 'status_change', 'urgent_alert', 'community_update'.
   */
  type: 'status_change' | 'urgent_alert' | 'community_update';

  /**
   * message
   * @description Plain-language alert message displayed to the user.
   */
  message: string;

  /**
   * isRead
   * @description Track if the user has dismissed or opened the notification.
   */
  isRead: boolean;

  /**
   * createdAt
   * @description Timestamp of notification generation.
   */
  createdAt: Date;
}

/**
 * NotificationSchema
 */
const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type:     String,
      required: [true, 'User ID is required'],
      index:    true,
    },
    type: {
      type:     String,
      enum:     ['status_change', 'urgent_alert', 'community_update'],
      required: true,
    },
    message: {
      type:     String,
      required: [true, 'Notification message is required'],
    },
    isRead: {
      type:    Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
