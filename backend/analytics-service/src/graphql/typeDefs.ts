/** backend/analytics-service/src/graphql/typeDefs.ts
 * @file typeDefs.ts
 * @description GraphQL schema type definitions for the Analytics & AI microservice.
 * Defines chatbot, trend, and classification-related queries and mutations.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Types
 *   - TrendInsight
 *   - ClassifyResult
 * - Queries
 *   - trends
 * - Mutations
 *   - chat
 *   - classifyAndSummarize
 * - Exports
 */

export const typeDefs = `

  """
  TrendInsight — an AI-detected cluster of related municipal issues.
  """
  type TrendInsight {
    category:   String!
    count:      Int!
    summary:    String!
    detectedAt: String!
  }

  """
  ClassifyResult — the output of the Gemini classification and summarization pipeline.
  """
  type ClassifyResult {
    category:  String!
    aiSummary: String!
  }

  """
  GlobalInsights — top-level metrics for the municipal dashboard.
  """
  type GlobalInsights {
    resolutionEfficiency: String!
    resolutionDetail:     String!
    publicSentiment:      String!
    sentimentDetail:      String!
  }

  type Query {
    """
    trends — returns AI-detected issue clusters from the past 7 days.
    Requires staff or advocate role.
    """
    trends: [TrendInsight!]!

    """
    insights — returns live, AI-analyzed global metrics for the municipality.
    Calculates resolution speed and community sentiment.
    """
    insights: GlobalInsights!
  }

  type Mutation {
    """
    updateSnapshotStatus — updates the status of an issue in the local analytics snapshot.
    Called by issue-service when a staff member changes an issue status.
    """
    updateSnapshotStatus(issueId: ID!, status: String!): Boolean!

    """
    chat — sends a message to the LangGraph + Gemini CityAI chatbot and returns
    the agent's response. Available to all authenticated users.
    """
    chat(message: String!): String!

    """
    classifyAndSummarize — runs the Gemini classification and summarization
    pipeline on an issue and returns the category and aiSummary.
    Intended to be called immediately after createIssue.
    """
    classifyAndSummarize(
      issueId:     ID!
      title:       String!
      description: String!
      location:    String!
    ): ClassifyResult!
  }
`;