/** backend/analytics-service/src/graphql/resolvers.ts
 * @file resolvers.ts
 * @description GraphQL resolvers for the Analytics & AI microservice.
 * Handles AI chatbot interactions, trend detection, and issue classification.
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
 * - Resolvers
 *   - Query
 *     - trends
 *   - Mutation
 *     - chat
 *     - classifyAndSummarize
 * - Exports
 */

import mongoose from 'mongoose';
import { GraphQLError } from 'graphql';
import { runCityAiChat } from '../agents/cityAiChatAgent';
import { detectTrends, getGlobalInsights } from '../services/trendService';
import { classifyIssue, summarizeIssue } from '../services/geminiService';
import { pushAiFieldsToIssueService } from '../services/issueWriteback';

/**
 * requireAuth
 * @description Throws a GraphQL UNAUTHENTICATED error if the context carries no user.
 */
function requireAuth(context: any): void {
  if (!context.user) {
    throw new GraphQLError('You must be logged in.', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
}

/**
 * requireStaffOrInternal
 * @description Staff role, or a valid service-to-service internal token.
 */
function requireStaffOrInternal(context: any): void {
  if (context.internal) return;
  requireAuth(context);
  if (context.user.role !== 'staff') {
    throw new GraphQLError('Unauthorized access.', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
}

export const resolvers = {
  Query: {
    /**
     * QUERY trends
     * @description Returns AI-detected issue clusters from the past 7 days.
     * Requires staff or advocate role.
     */
    trends: async (_: unknown, __: unknown, context: any) => {
      requireAuth(context);
      if (context.user.role !== 'staff' && context.user.role !== 'advocate') {
        throw new GraphQLError('Unauthorized access to trends.', {
          extensions: { code: 'FORBIDDEN' },
        });
      }
      return detectTrends();
    },

    /**
     * QUERY insights
     * @description Returns live global dashboard metrics.
     */
    insights: async (_: unknown, __: unknown, context: any) => {
      requireAuth(context);
      return getGlobalInsights();
    },
  },

  Mutation: {
    /**
     * MUTATION updateSnapshotStatus
     * @description Updates the status of an issue in the local analytics snapshot.
     */
    updateSnapshotStatus: async (
      _: unknown,
      { issueId, status }: { issueId: string; status: string },
      context: any
    ) => {
      requireStaffOrInternal(context);

      if (!mongoose.Types.ObjectId.isValid(issueId)) {
        throw new GraphQLError('Invalid issue ID.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      try {
        if (mongoose.connection.readyState === 1) {
          const snapshots = mongoose.connection.collection('issuesnapshots');
          const normalizedStatus = status.replace(/_/g, '-');
          
          const updateData: any = { status: normalizedStatus };
          if (normalizedStatus === 'resolved') {
            updateData.resolvedAt = new Date();
          }

          const result = await snapshots.updateOne(
            { issueId: new mongoose.Types.ObjectId(issueId) },
            { $set: updateData }
          );

          return result.modifiedCount > 0 || result.upsertedCount > 0;
        }
        return false;
      } catch (err) {
        console.error('updateSnapshotStatus error:', err);
        return false;
      }
    },

    /**
     * MUTATION chat
     * @description Invokes the LangGraph + Gemini CityAI chatbot.
     */
    chat: async (_: unknown, { message }: { message: string }, context: any) => {
      requireAuth(context);
      return runCityAiChat(message);
    },

    /**
     * MUTATION classifyAndSummarize
     * @description Runs the Gemini classification and summarization pipeline.
     */
    classifyAndSummarize: async (
      _: unknown,
      { issueId, title, description, location }: { issueId?: string; title: string; description: string; location: string },
      context: any
    ) => {
      requireAuth(context);

      const [category, aiSummary] = await Promise.all([
        classifyIssue(title, description),
        summarizeIssue(title, description, location),
      ]);

      if (issueId && mongoose.Types.ObjectId.isValid(issueId)) {
        try {
          await pushAiFieldsToIssueService({ issueId, category, aiSummary });
          if (mongoose.connection.readyState === 1) {
            const snapshots = mongoose.connection.collection('issuesnapshots');
            await snapshots.replaceOne(
              { issueId: new mongoose.Types.ObjectId(issueId) },
              {
                issueId:   new mongoose.Types.ObjectId(issueId),
                title,
                description,
                location,
                category,
                status:    'open',
                createdAt: new Date(),
              },
              { upsert: true }
            );
          }
        } catch (err) {
          console.error('classifyAndSummarize write-back:', err);
        }
      }

      return { category, aiSummary };
    },
  },
};
