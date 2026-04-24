/** backend/issue-service/src/graphql/resolvers.ts
 * @file resolvers.ts
 * @description GraphQL resolvers for the Issue Management microservice.
 * Handles issue CRUD, status updates, upvoting, and AI field write-back.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Helpers
 *   - requireAuth
 *   - requireRole
 * - Resolvers
 *   - Query
 *     - issue
 *     - issues
 *     - myIssues
 *   - Mutation
 *     - createIssue
 *     - updateIssueStatus
 *     - assignIssue
 *     - upvoteIssue
 *     - setAiFields
 * - Exports
 */

import { GraphQLError } from 'graphql';
import { Issue } from '../models/Issue';
import { Notification } from '../models/Notification';
import { pushStatusUpdateToAnalytics } from '../services/analyticsSync';

/**
 * requireAuth
 * @description Throws a GraphQL UNAUTHENTICATED error if the context carries no user.
 * @param {any} context - Apollo resolver context.
 * @returns {void}
 * @throws {GraphQLError} If context.user is null.
 */
function requireAuth(context: any): void {
  if (!context.user) {
    throw new GraphQLError('You must be logged in.', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
}

/**
 * requireRole
 * @description Throws a GraphQL FORBIDDEN error if the user does not hold the required role.
 * @param {any} context  - Apollo resolver context.
 * @param {string} role  - The required role ('staff', 'advocate', etc.).
 * @returns {void}
 * @throws {GraphQLError} If the user's role does not match.
 */
function requireRole(context: any, role: string): void {
  requireAuth(context);
  if (context.user.role !== role) {
    throw new GraphQLError(`This action requires the '${role}' role.`, {
      extensions: { code: 'FORBIDDEN' },
    });
  }
}

/**
 * requireStaffOrInternal
 * @description Staff role, or a valid analytics-service internal token (see authContext).
 */
function requireStaffOrInternal(context: any): void {
  if (context.internal) return;
  requireRole(context, 'staff');
}

function idString(parent: { _id?: unknown; id?: unknown }): string {
  const v = parent._id ?? parent.id;
  if (v && typeof (v as { toString?: () => string }).toString === 'function') {
    return String((v as { toString: () => string }).toString());
  }
  return String(v ?? '');
}

const DEFAULT_LIMIT = 20;

export const resolvers = {
  Issue: {
    id:          (parent: { _id?: unknown; id?: unknown }) => idString(parent),
    createdAt:   (parent: { createdAt?: Date | string }) =>
      typeof parent.createdAt === 'string'
        ? parent.createdAt
        : parent.createdAt?.toISOString?.() ?? '',
    updatedAt:   (parent: { updatedAt?: Date | string }) =>
      typeof parent.updatedAt === 'string'
        ? parent.updatedAt
        : parent.updatedAt?.toISOString?.() ?? '',
    status:      (parent: { status?: string }) =>
      (parent.status ?? '').replace(/-/g, '_'),
    category:    (parent: { category?: string }) =>
      (parent.category ?? '').replace(/-/g, '_'),
  },

  Notification: {
    id:        (parent: { _id?: unknown; id?: unknown }) => idString(parent),
    createdAt: (parent: { createdAt?: Date | string }) =>
      typeof parent.createdAt === 'string'
        ? parent.createdAt
        : parent.createdAt?.toISOString?.() ?? '',
  },

  Comment: {
    createdAt: (parent: { createdAt?: Date | string }) =>
      typeof parent.createdAt === 'string'
        ? parent.createdAt
        : parent.createdAt?.toISOString?.() ?? '',
  },

  Query: {
    /**
     * QUERY issue
     * @description Fetches a single issue by its MongoDB document ID.
     * @param {unknown} _ - Unused parent resolver value.
     * @param {object} args - Query arguments.
     * @param {string} args.id - The issue document ID.
     * @param {any} context - Apollo context with authenticated user.
     * @returns {Promise<IIssue | null>} The matching issue or null.
     */
    issue: async (_: unknown, { id }: { id: string }, context: any) => {
      requireAuth(context);
      return Issue.findById(id).lean();
    },

    /**
     * QUERY issues
     * @description Returns a paginated, optionally filtered list of all issues.
     * Intended for the municipal staff dashboard. Requires staff role.
     * @param {unknown} _ - Unused parent resolver value.
     * @param {object} args - Filter and pagination arguments.
     * @param {string} [args.status]   - Optional status filter.
     * @param {string} [args.category] - Optional category filter.
     * @param {number} [args.limit]    - Page size (default 20).
     * @param {number} [args.offset]   - Number of records to skip (default 0).
     * @param {any} context - Apollo context.
     * @returns {Promise<PaginatedIssues>} Paginated result object.
     */
    issues: async (_: unknown, args: any, context: any) => {
      requireAuth(context);
      if (context.user.role !== 'staff' && context.user.role !== 'advocate') {
        throw new GraphQLError("This action requires the 'staff' or 'advocate' role.", {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const { status, category, limit = DEFAULT_LIMIT, offset = 0 } = args;

      const filter: Record<string, unknown> = {};
      if (status)   filter.status   = status.replace(/_/g, '-');
      if (category) filter.category = category.replace(/_/g, '-');

      const [items, total] = await Promise.all([
        Issue.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).lean(),
        Issue.countDocuments(filter),
      ]);

      return {
        items,
        total,
        hasMore: offset + items.length < total,
      };
    },

    /**
     * QUERY myIssues
     * @description Returns all issues submitted by the currently authenticated resident.
     * @param {unknown} _ - Unused parent resolver value.
     * @param {unknown} __ - Unused arguments.
     * @param {any} context - Apollo context with the authenticated user.
     * @returns {Promise<IIssue[]>} Array of the resident's submitted issues.
     */
    myIssues: async (_: unknown, __: unknown, context: any) => {
      requireAuth(context);
      return Issue.find({ reportedBy: context.user.sub }).sort({ createdAt: -1 }).lean();
    },

    /**
     * QUERY myNotifications
     * @description Returns all notifications for the authenticated user.
     */
    myNotifications: async (_: unknown, __: unknown, context: any) => {
      requireAuth(context);
      return Notification.find({ userId: context.user.sub }).sort({ createdAt: -1 }).limit(50).lean();
    },
  },

  Mutation: {
    /**
     * MUTATION markNotificationAsRead
     * @description Marks a notification as read for the user.
     */
    markNotificationAsRead: async (_: unknown, { id }: { id: string }, context: any) => {
      requireAuth(context);
      const notification = await Notification.findOneAndUpdate(
        { _id: id, userId: context.user.sub },
        { isRead: true },
        { new: true }
      ).lean();

      if (!notification) {
        throw new GraphQLError('Notification not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return notification;
    },

    /**
     * MUTATION createIssue
     * @description Submits a new municipal issue. Requires resident authentication.
     * Category defaults to 'other' until the analytics-service classifies it.
     * @param {unknown} _ - Unused parent resolver value.
     * @param {object} args - Issue fields from the resident submission form.
     * @param {any} context - Apollo context with the authenticated resident.
     * @returns {Promise<IIssue>} The newly created issue document.
     * @throws {GraphQLError} If the user is not authenticated.
     */
    createIssue: async (_: unknown, args: any, context: any) => {
      requireAuth(context);

      const issue = await Issue.create({
        ...args,
        reportedBy: context.user.sub,
        status:     'open',
        category:   'other',
        upvotes:    0,
        downvotes:  0,
      });

      return issue;
    },

    /**
     * MUTATION updateIssueStatus
     * @description Updates the status of an existing issue. Requires staff role.
     * @param {unknown} _ - Unused parent resolver value.
     * @param {object} args - Mutation arguments.
     * @param {string} args.id     - The issue document ID.
     * @param {string} args.status - The new status value.
     * @param {any} context - Apollo context with the authenticated staff member.
     * @returns {Promise<IIssue>} The updated issue document.
     * @throws {GraphQLError} If the issue is not found or the user lacks the staff role.
     */
    updateIssueStatus: async (_: unknown, { id, status }: any, context: any) => {
      requireRole(context, 'staff');

      const normalizedStatus = status.replace(/_/g, '-');
      const updateFields: any = { status: normalizedStatus };
      
      if (normalizedStatus === 'resolved') {
        updateFields.resolvedAt = new Date();
      }

      const issue = await Issue.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true }
      ).lean();

      if (!issue) {
        throw new GraphQLError('Issue not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Async sync with analytics-service
      pushStatusUpdateToAnalytics(id, normalizedStatus).catch(err => 
        console.error('pushStatusUpdateToAnalytics failed:', err)
      );

      // Create a notification for the resident
      Notification.create({
        userId:  issue.reportedBy,
        type:    'status_change',
        message: `Your report "${issue.title}" has been updated to ${normalizedStatus.replace(/-/g, ' ').toUpperCase()}.`,
      }).catch(err => console.error('Failed to create notification:', err));

      return issue;
    },

    /**
     * MUTATION assignIssue
     * @description Assigns an issue to a staff member by user ID. Requires staff role.
     * @param {unknown} _ - Unused parent resolver value.
     * @param {object} args - Mutation arguments.
     * @param {string} args.id         - The issue document ID.
     * @param {string} args.assignedTo - The user ID of the staff member.
     * @param {any} context - Apollo context.
     * @returns {Promise<IIssue>} The updated issue document.
     * @throws {GraphQLError} If the issue is not found.
     */
    assignIssue: async (_: unknown, { id, assignedTo }: any, context: any) => {
      requireRole(context, 'staff');

      const issue = await Issue.findByIdAndUpdate(
        id,
        { assignedTo },
        { new: true }
      ).lean();

      if (!issue) {
        throw new GraphQLError('Issue not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return issue;
    },

    /**
     * MUTATION upvoteIssue
     * @description Increments the upvote count for an issue. Requires authentication.
     * Enforces one-vote-per-user rule.
     */
    upvoteIssue: async (_: unknown, { id }: any, context: any) => {
      requireAuth(context);
      const userId = context.user.sub;

      const existing = await Issue.findById(id);
      if (!existing) throw new GraphQLError('Issue not found.', { extensions: { code: 'NOT_FOUND' } });

      // If user already upvoted, do nothing (or we could treat as toggle)
      if (existing.upvotedBy.includes(userId)) return existing;

      const update: any = {
        $addToSet: { upvotedBy: userId },
        $inc: { upvotes: 1 }
      };

      // If they had downvoted before, remove it
      if (existing.downvotedBy.includes(userId)) {
        update.$pull = { downvotedBy: userId };
        update.$inc.downvotes = -1;
      }

      return Issue.findByIdAndUpdate(id, update, { new: true }).lean();
    },

    /**
     * MUTATION downvoteIssue
     * @description Increments the downvote count for an issue. Requires authentication.
     * Enforces one-vote-per-user rule.
     */
    downvoteIssue: async (_: unknown, { id }: any, context: any) => {
      requireAuth(context);
      const userId = context.user.sub;

      const existing = await Issue.findById(id);
      if (!existing) throw new GraphQLError('Issue not found.', { extensions: { code: 'NOT_FOUND' } });

      // If user already downvoted, do nothing
      if (existing.downvotedBy.includes(userId)) return existing;

      const update: any = {
        $addToSet: { downvotedBy: userId },
        $inc: { downvotes: 1 }
      };

      // If they had upvoted before, remove it
      if (existing.upvotedBy.includes(userId)) {
        update.$pull = { upvotedBy: userId };
        update.$inc.upvotes = -1;
      }

      return Issue.findByIdAndUpdate(id, update, { new: true }).lean();
    },

    /**
     * MUTATION addComment
     * @description Adds a new comment to an issue thread.
     */
    addComment: async (_: unknown, { issueId, text, userName }: any, context: any) => {
      requireAuth(context);

      const comment = {
        userId:    context.user.sub,
        userName,
        text,
        createdAt: new Date(),
      };

      const issue = await Issue.findByIdAndUpdate(
        issueId,
        { $push: { comments: comment } },
        { new: true }
      ).lean();

      if (!issue) {
        throw new GraphQLError('Issue not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return {
        ...comment,
        createdAt: comment.createdAt.toISOString(),
      };
    },

    /**
     * MUTATION setAiFields
     * @description Writes AI-generated category and summary back to an issue document.
     * Called internally by the analytics-service after Gemini classification completes.
     * Requires staff role as a basic guard — in production this would use a service token.
     * @param {unknown} _ - Unused parent resolver value.
     * @param {object} args - Mutation arguments.
     * @param {string} args.id        - The issue document ID.
     * @param {string} args.category  - AI-assigned category.
     * @param {string} args.aiSummary - Gemini-generated summary text.
     * @param {any} context - Apollo context.
     * @returns {Promise<IIssue>} The updated issue document.
     * @throws {GraphQLError} If the issue is not found.
     */
    setAiFields: async (_: unknown, { id, category, aiSummary }: any, context: any) => {
      requireStaffOrInternal(context);

      const normalizedCategory = category.replace(/_/g, '-');
      const issue = await Issue.findByIdAndUpdate(
        id,
        { category: normalizedCategory, aiSummary },
        { new: true }
      ).lean();

      if (!issue) {
        throw new GraphQLError('Issue not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return issue;
    },
  },
};