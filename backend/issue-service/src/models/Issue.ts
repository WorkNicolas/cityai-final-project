/** backend/issue-service/src/models/Issue.ts
 * @file Issue.ts
 * @description Mongoose schema and model for civic issue reports.
 * Stores all resident-submitted issues including geolocation, photo URL,
 * AI-assigned category, and lifecycle status.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Interfaces
 *   - IIssue
 * - Schema
 *   - IssueSchema
 * - Exports
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * IIssue
 * @description TypeScript interface representing an Issue document in MongoDB.
 */
export interface IIssue extends Document {
  /**
   * title
   * @description Short summary of the reported issue provided by the resident.
   */
  title: string;

  /**
   * description
   * @description Full description of the issue.
   */
  description: string;

  /**
   * status
   * @description Current lifecycle state of the issue.
   * One of: 'open', 'in-progress', 'resolved', 'closed'.
   */
  status: 'open' | 'in-progress' | 'resolved' | 'closed';

  /**
   * category
   * @description AI-assigned category from the Gemini classification service.
   * One of: 'pothole', 'streetlight', 'flooding', 'safety-hazard', 'graffiti', 'other'.
   */
  category: string;

  /**
   * location
   * @description Human-readable address or neighbourhood string provided by the resident.
   */
  location: string;

  /**
   * coordinates
   * @description Optional [longitude, latitude] pair for map display and spatial queries.
   * Stored as GeoJSON Point format (longitude first per GeoJSON spec).
   */
  coordinates?: [number, number];

  /**
   * photoUrl
   * @description Optional URL pointing to the uploaded photo of the issue.
   */
  photoUrl?: string;

  /**
   * reportedBy
   * @description MongoDB user ID of the resident who submitted this issue.
   * References a User document in auth-service — not a foreign key join.
   */
  reportedBy: string;

  /**
   * assignedTo
   * @description MongoDB user ID of the staff member assigned to resolve this issue.
   * Null if the issue has not yet been assigned.
   */
  assignedTo?: string;

  /**
   * aiSummary
   * @description Auto-generated plain-language summary from the Gemini summarization service.
   * Populated asynchronously after submission.
   */
  aiSummary?: string;

  /**
   * upvotes
   * @description Community upvote count. Incremented via the upvoteIssue mutation.
   */
  upvotes: number;

  /**
   * createdAt
   * @description Timestamp of initial submission. Managed by Mongoose timestamps.
   */
  createdAt: Date;

  /**
   * updatedAt
   * @description Timestamp of last update. Managed by Mongoose timestamps.
   */
  updatedAt: Date;
}

/**
 * IssueSchema
 * @description Mongoose schema definition for the Issue collection.
 */
const IssueSchema = new Schema<IIssue>(
  {
    /**
     * title
     * @description Required short summary of the reported issue.
     */
    title: {
      type:     String,
      required: [true, 'Title is required'],
      trim:     true,
      maxlength: [120, 'Title must be 120 characters or fewer'],
    },

    /**
     * description
     * @description Required detailed description from the resident.
     */
    description: {
      type:     String,
      required: [true, 'Description is required'],
      trim:     true,
    },

    /**
     * status
     * @description Lifecycle status with 'open' as the default for new submissions.
     */
    status: {
      type:    String,
      enum:    ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open',
    },

    /**
     * category
     * @description AI-assigned category. Defaults to 'other' until the AI service responds.
     */
    category: {
      type:    String,
      enum:    ['pothole', 'streetlight', 'flooding', 'safety-hazard', 'graffiti', 'other'],
      default: 'other',
    },

    /**
     * location
     * @description Human-readable address string.
     */
    location: {
      type:     String,
      required: [true, 'Location is required'],
      trim:     true,
    },

    /**
     * coordinates
     * @description Optional [longitude, latitude] for map rendering.
     */
    coordinates: {
      type: [Number],
    },

    /**
     * photoUrl
     * @description URL of the uploaded issue photo, if provided.
     */
    photoUrl: {
      type: String,
    },

    /**
     * reportedBy
     * @description User ID of the submitting resident (from auth-service JWT payload).
     */
    reportedBy: {
      type:     String,
      required: [true, 'Reporter ID is required'],
    },

    /**
     * assignedTo
     * @description User ID of the assigned staff member, set via updateIssueStatus mutation.
     */
    assignedTo: {
      type: String,
    },

    /**
     * aiSummary
     * @description Gemini-generated summary, written by the analytics-service.
     */
    aiSummary: {
      type: String,
    },

    /**
     * upvotes
     * @description Running count of community upvotes.
     */
    upvotes: {
      type:    Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index on status and category for efficient dashboard and analytics queries.
IssueSchema.index({ status: 1 });
IssueSchema.index({ category: 1 });
IssueSchema.index({ reportedBy: 1 });

export const Issue = mongoose.model<IIssue>('Issue', IssueSchema);