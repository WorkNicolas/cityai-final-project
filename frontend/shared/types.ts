/** frontend/shared/types.ts
 * @file types.ts
 * @description Shared TypeScript interfaces and enums used across all MFEs.
 * Import from this file instead of redefining types in individual MFEs.
 * @author Carl Nicolas Mendoza
 * @since 2026-01-20
 * @updated 2026-04-20 - Initial type definitions.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Enums
 *   - UserRole
 *   - IssueStatus
 *   - IssueCategory
 * - Interfaces
 *   - User
 *   - Issue
 *   - IssueComment
 *   - Notification
 *   - ChatMessage
 *   - TrendInsight
 *   - PaginatedResult
 */

/* ─────────────────────────────────────────────
   ENUMS
   ───────────────────────────────────────────── */

/**
 * UserRole
 * @description The three supported user roles in CityAI.
 * - resident: Can submit and track issues.
 * - staff: Can manage and update issues.
 * - advocate: Can monitor trends and support residents (optional role).
 */
export enum UserRole {
    resident  = 'resident',
    staff     = 'staff',
    advocate  = 'advocate',
  }
  
  /**
   * IssueStatus
   * @description Lifecycle states of a municipal issue report.
   * - open: Newly submitted, not yet reviewed.
   * - inProgress: Assigned to municipal staff and being actioned.
   * - resolved: Issue has been fixed and confirmed.
   * - closed: Closed without resolution (duplicate or invalid).
   */
  export enum IssueStatus {
    open       = 'open',
    inProgress = 'in-progress',
    resolved   = 'resolved',
    closed     = 'closed',
  }
  
  /**
   * IssueCategory
   * @description AI-assigned categories for municipal issue classification.
   * Used by the Gemini classification service in analytics-service.
   */
  export enum IssueCategory {
    pothole      = 'pothole',
    streetlight  = 'streetlight',
    flooding     = 'flooding',
    safetyHazard = 'safety-hazard',
    graffiti     = 'graffiti',
    other        = 'other',
  }
  
  /* ─────────────────────────────────────────────
     INTERFACES
     ───────────────────────────────────────────── */
  
  /**
   * User
   * @description Represents an authenticated CityAI user.
   * Returned by auth-service resolvers and stored in Apollo cache.
   */
  export interface User {
    /**
     * id
     * @description MongoDB document ID.
     */
    id: string;
  
    /**
     * email
     * @description User's email address. Used as the unique login identifier.
     */
    email: string;
  
    /**
     * name
     * @description User's display name.
     */
    name: string;
  
    /**
     * role
     * @description Assigned role controlling feature access.
     */
    role: UserRole;
  
    /**
     * createdAt
     * @description ISO 8601 timestamp of account creation.
     */
    createdAt: string;
  }
  
  /**
   * Issue
   * @description Represents a municipal issue report submitted by a resident.
   */
  export interface Issue {
    /**
     * id
     * @description MongoDB document ID.
     */
    id: string;
  
    /**
     * title
     * @description Short summary of the reported issue.
     */
    title: string;
  
    /**
     * description
     * @description Full description of the issue provided by the resident.
     */
    description: string;
  
    /**
     * status
     * @description Current lifecycle status of the issue.
     */
    status: IssueStatus;
  
    /**
     * category
     * @description AI-assigned category label from the Gemini classification service.
     */
    category: IssueCategory;
  
    /**
     * location
     * @description Human-readable address or geotag string.
     */
    location: string;
  
    /**
     * coordinates
     * @description Optional [latitude, longitude] pair for map display.
     */
    coordinates?: [number, number];
  
    /**
     * photoUrl
     * @description Optional URL to the uploaded photo of the issue.
     */
    photoUrl?: string;
  
    /**
     * reportedBy
     * @description ID of the resident who submitted the issue.
     */
    reportedBy: string;
  
    /**
     * assignedTo
     * @description ID of the staff member assigned to this issue. Null if unassigned.
     */
    assignedTo?: string;
  
    /**
     * aiSummary
     * @description Auto-generated summary produced by the Gemini summarization service.
     */
    aiSummary?: string;
  
    /**
     * upvotes
     * @description Number of community upvotes on this issue.
     */
    upvotes: number;
  
    /**
     * createdAt
     * @description ISO 8601 timestamp of initial submission.
     */
    createdAt: string;
  
    /**
     * updatedAt
     * @description ISO 8601 timestamp of the last status or field update.
     */
    updatedAt: string;
  }
  
  /**
   * IssueComment
   * @description A comment left by a resident, staff member, or advocate on an issue thread.
   */
  export interface IssueComment {
    /**
     * id
     * @description MongoDB document ID.
     */
    id: string;
  
    /**
     * issueId
     * @description ID of the parent issue this comment belongs to.
     */
    issueId: string;
  
    /**
     * authorId
     * @description ID of the user who wrote this comment.
     */
    authorId: string;
  
    /**
     * authorName
     * @description Display name of the comment author.
     */
    authorName: string;
  
    /**
     * body
     * @description The text content of the comment.
     */
    body: string;
  
    /**
     * createdAt
     * @description ISO 8601 timestamp of comment creation.
     */
    createdAt: string;
  }
  
  /**
   * Notification
   * @description A real-time alert sent to a resident when their issue status changes.
   */
  export interface Notification {
    /**
     * id
     * @description MongoDB document ID.
     */
    id: string;
  
    /**
     * userId
     * @description ID of the user this notification targets.
     */
    userId: string;
  
    /**
     * issueId
     * @description ID of the issue that triggered this notification.
     */
    issueId: string;
  
    /**
     * message
     * @description Human-readable notification body.
     */
    message: string;
  
    /**
     * read
     * @description Whether the user has seen this notification.
     */
    read: boolean;
  
    /**
     * createdAt
     * @description ISO 8601 timestamp of notification creation.
     */
    createdAt: string;
  }
  
  /**
   * ChatMessage
   * @description A single message in the agentic chatbot conversation.
   */
  export interface ChatMessage {
    /**
     * role
     * @description Sender of the message.
     * - user: The resident or staff member.
     * - assistant: The LangGraph + Gemini agent.
     */
    role: 'user' | 'assistant';
  
    /**
     * content
     * @description The text content of the message.
     */
    content: string;
  
    /**
     * timestamp
     * @description ISO 8601 timestamp of when the message was sent.
     */
    timestamp: string;
  }
  
  /**
   * TrendInsight
   * @description An AI-detected trend or cluster of related issues.
   */
  export interface TrendInsight {
    /**
     * category
     * @description The issue category this trend relates to.
     */
    category: IssueCategory;
  
    /**
     * count
     * @description Number of issues in this cluster over the detection window.
     */
    count: number;
  
    /**
     * summary
     * @description AI-generated plain-language description of the trend.
     */
    summary: string;
  
    /**
     * detectedAt
     * @description ISO 8601 timestamp of when this trend was detected.
     */
    detectedAt: string;
  }
  
  /**
   * PaginatedResult
   * @description Generic wrapper for paginated GraphQL list responses.
   */
  export interface PaginatedResult<T> {
    /**
     * items
     * @description The array of results for the current page.
     */
    items: T[];
  
    /**
     * total
     * @description Total number of matching records across all pages.
     */
    total: number;
  
    /**
     * hasMore
     * @description Whether additional pages exist beyond the current one.
     */
    hasMore: boolean;
  }