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
 *   - requireRole
 * - Resolvers
 *   - Query
 *     - trends
 *   - Mutation
 *     - chat
 *     - classifyAndSummarize
 * - Exports
 */

import { GraphQLError } from 'graphql';
import { runCivicChat } from '../agents/civicChatAgent';
import { detectTrends } from '../services/trendService';
import { classifyIssue, summarizeIssue } from '../services/geminiService';

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
 * requireRole
 * @description Throws a GraphQL FORBIDDEN error if the user does not hold the required role.
 */
function requireRole(context: any, role: string): void {
  requireAuth(context);
  if (context.user.role !== role) {
    throw new GraphQLError(`This action requires the '${role}' role.`, {
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
  },

  Mutation: {
    /**
     * MUTATION chat
     * @description Invokes the LangGraph + Gemini civic chatbot.
     */
    chat: async (_: unknown, { message }: { message: string }, context: any) => {
      requireAuth(context);
      return runCivicChat(message);
    },

    /**
     * MUTATION classifyAndSummarize
     * @description Runs the Gemini classification and summarization pipeline.
     */
    classifyAndSummarize: async (
      _: unknown,
      { title, description, location }: any,
      context: any
    ) => {
      requireAuth(context);
      
      const [category, aiSummary] = await Promise.all([
        classifyIssue(title, description),
        summarizeIssue(title, description, location),
      ]);

      return { category, aiSummary };
    },
  },
};
