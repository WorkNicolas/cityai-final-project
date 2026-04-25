/** backend/issue-service/src/graphql/typeDefs.ts
 * @file typeDefs.ts
 * @description GraphQL schema type definitions for the Issue Management microservice.
 * Defines Issue types, status/category enums, and all CRUD-related queries and mutations.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-24 - Added Comment support.
 * @version 0.2.0
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
  NotificationType — categories of user alerts.
  """
  enum NotificationType {
    status_change
    urgent_alert
    community_update
  }

  """
  Notification — an alert or update for a user.
  """
  type Notification {
    id:        ID!
    userId:    String!
    type:      NotificationType!
    message:   String!
    isRead:    Boolean!
    createdAt: String!
  }

  """
  Comment — a resident or staff response on an issue report.
  """
  type Comment {
    userId:    String!
    userName:  String!
    text:      String!
    createdAt: String!
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
    upvotedBy:   [String!]!
    downvotes:   Int!
    downvotedBy: [String!]!
    comments:    [Comment!]!
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

    """
    myNotifications — returns all notifications for the currently authenticated user.
    """
    myNotifications: [Notification!]!
  }

  type Mutation {
    """
    markNotificationAsRead — marks a single notification as read.
    """
    markNotificationAsRead(id: ID!): Notification!

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
      assignedTo: String
    ): Issue!

    """
    upvoteIssue — increments the upvote count for a community issue.
    """
    upvoteIssue(id: ID!): Issue!

    """
    downvoteIssue — increments the downvote count for a community issue.
    """
    downvoteIssue(id: ID!): Issue!

    """
    addComment — adds a new comment to an issue thread.
    """
    addComment(
      issueId:  ID!
      text:     String!
      userName: String!
    ): Comment!

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
