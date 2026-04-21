/** frontend/host/src/apollo/client.ts
 * @file client.ts
 * @description Apollo Client configuration for the CityAI host shell.
 * Connects to multiple microservices via the host's Vite proxy.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Apollo Client Configuration
 * - Exports
 */

import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';

/**
 * httpLinkAuth — Connection to the auth-service via Vite proxy.
 */
const httpLinkAuth = createHttpLink({
  uri: '/api/auth',
  credentials: 'include',
});

/**
 * httpLinkIssues — Connection to the issue-service via Vite proxy.
 */
const httpLinkIssues = createHttpLink({
  uri: '/api/issues',
  credentials: 'include',
});

/**
 * httpLinkAnalytics — Connection to the analytics-service via Vite proxy.
 */
const httpLinkAnalytics = createHttpLink({
  uri: '/api/analytics',
  credentials: 'include',
});

/**
 * directionalLink
 * @description Routes requests to the correct microservice based on context.
 */
const analyticsSplit = ApolloLink.split(
  (operation) => operation.getContext().service === 'analytics',
  httpLinkAnalytics,
  httpLinkIssues
);

const directionalLink = ApolloLink.split(
  (operation) => operation.getContext().service === 'auth',
  httpLinkAuth,
  analyticsSplit
);

/**
 * client
 * @description The unified Apollo Client instance for the host shell.
 * Uses direction-based routing or multiple clients if necessary.
 * For simplicity, we create three specific clients or a multi-link client.
 * Here we'll export the primary client and helper for specific services.
 */
export const client = new ApolloClient({
  link: directionalLink,
  cache: new InMemoryCache(),
});

/**
 * authClient
 * @description Specialized Apollo Client for authentication operations.
 */
export const authClient = new ApolloClient({
  link: httpLinkAuth,
  cache: new InMemoryCache(),
});

/**
 * analyticsClient
 * @description Specialized Apollo Client for analytics and AI chatbot.
 */
export const analyticsClient = new ApolloClient({
  link: httpLinkAnalytics,
  cache: new InMemoryCache(),
});
