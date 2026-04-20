/** backend/auth-service/src/graphql/typeDefs.ts
 * @file typeDefs.ts
 * @description GraphQL schema type definitions for the User Authentication microservice.
 * Defines the User type, AuthPayload, and all authentication-related queries and mutations.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Types
 *   - UserRole (enum)
 *   - User
 *   - AuthPayload
 * - Queries
 *   - me
 * - Mutations
 *   - register
 *   - login
 *   - logout
 * - Exports
 */

import { gql } from 'graphql-tag';

/**
 * typeDefs
 * @description Apollo Server GraphQL schema for the auth-service.
 * The JWT is set as an HTTP-only cookie by the login/register resolvers
 * and is never returned in the GraphQL response body.
 */
export const typeDefs = gql`

  """
  UserRole — the three supported access levels in CivicCase.
  """
  enum UserRole {
    resident
    staff
    advocate
  }

  """
  User — a registered CivicCase account.
  The passwordHash field is never exposed via GraphQL.
  """
  type User {
    id:        ID!
    email:     String!
    name:      String!
    role:      UserRole!
    createdAt: String!
  }

  """
  AuthPayload — returned after a successful login or registration.
  The JWT itself is set as an HTTP-only cookie, not returned here.
  """
  type AuthPayload {
    user: User!
  }

  type Query {
    """
    me — returns the currently authenticated user based on the JWT cookie.
    Returns null if the request is unauthenticated.
    """
    me: User
  }

  type Mutation {
    """
    register — creates a new user account and sets the JWT cookie.
    Role defaults to 'resident' unless explicitly provided.
    """
    register(
      email:    String!
      password: String!
      name:     String!
      role:     UserRole
    ): AuthPayload!

    """
    login — authenticates an existing user and sets the JWT cookie.
    """
    login(
      email:    String!
      password: String!
    ): AuthPayload!

    """
    logout — clears the JWT cookie from the client.
    """
    logout: Boolean!
  }
`;