/** backend/issue-service/src/graphql/typeDefs.ts
 * @file typeDefs.ts
 * @description GraphQL schema type definitions for the Issue Management microservice.
 * Defines Issue types, status/category enums, and all CRUD-related queries and mutations.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Types
 *   - IssueStatus (enum)
 *   - IssueCategory (enum)
 *   - Issue
 *   - PaginatedIssues
 * - Queries
 *   - issue
 *   - issues
 *   - myIssues
 * - Mutations
 *   - createIssue
 *   - updateIssueStatus
 *   - assignIssue
 *   - upvoteIssue
 *   - setAiFields
 * - Exports
 */

export const typeDefs = `

  """
  IssueStatus — lifecycle states of a municipal issue report.
  """
  enum IssueStatus {
    open
    in_progress
    resolved
    closed
  }

  """
  IssueCategory — AI-assigned categories for municipal issue classification.
  """
  enum IssueCategory {
    pothole
    streetlight
    flooding
    safety_hazard
    graffiti
    other
  }

  """
  Issue — a municipal issue report submitted by a resident.
  """
  type Issue {
    id:          ID!
    title:       String!
    description: String!
    status:      IssueStatus!
    category:    IssueCategory!
    location:    String!
    coordinates: [Float]
    photoUrl:    String
    reportedBy:  String!
    assignedTo:  String
    aiSummary:   String
    upvotes:     Int!
    createdAt:   String!
    updatedAt:   String!
  }

  """
  PaginatedIssues — paginated list of issues with total count and hasMore flag.
  """
  type PaginatedIssues {
    items:   [Issue!]!
    total:   Int!
    hasMore: Boolean!
  }

  type Query {
    """
    issue — fetch a single issue by ID. Accessible to all authenticated users.
    """
    issue(id: ID!): Issue

    """
    issues — paginated list of all issues, optionally filtered by status or category.
    Intended for the staff dashboard.
    """
    issues(
      status:   IssueStatus
      category: IssueCategory
      limit:    Int
      offset:   Int
    ): PaginatedIssues!

    """
    myIssues — returns all issues submitted by the currently authenticated resident.
    """
    myIssues: [Issue!]!
  }

  type Mutation {
    """
    createIssue — submits a new municipal issue report. Requires resident authentication.
    The AI category and summary are populated asynchronously by analytics-service.
    """
    createIssue(
      title:       String!
      description: String!
      location:    String!
      coordinates: [Float]
      photoUrl:    String
    ): Issue!

    """
    updateIssueStatus — allows staff to update the status of an issue.
    Triggers a notification to the reporting resident.
    """
    updateIssueStatus(
      id:     ID!
      status: IssueStatus!
    ): Issue!

    """
    assignIssue — allows staff to assign an issue to a staff member by user ID.
    """
    assignIssue(
      id:         ID!
      assignedTo: String!
    ): Issue!

    """
    upvoteIssue — increments the upvote count for a community issue.
    """
    upvoteIssue(id: ID!): Issue!

    """
    setAiFields — internal mutation called by analytics-service to write back
    the AI-assigned category and generated summary to an issue document.
    Requires staff role or an internal service token.
    """
    setAiFields(
      id:        ID!
      category:  IssueCategory!
      aiSummary: String!
    ): Issue!
  }
`;