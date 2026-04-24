/** backend/auth-service/src/index.ts
 * @file index.ts
 * @description Apollo Server entry point for the User Authentication microservice.
 * Handles user identity, JWT issuance, and registration.
 * @author Your Name
 * @since 2026-04-20
 * @updated 2026-04-20 - Restored proper server setup.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Server Setup
 * - MongoDB Connection
 * - Exports
 */

import 'dotenv/config';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';
import { buildAuthContext } from './middleware/authContext';

import { signToken, setCookieOnResponse } from './graphql/resolvers';
import passport from './middleware/passport';

const PORT      = process.env.PORT      ?? 4001;
const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/cityai-auth';
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(passport.initialize());

  // Google OAuth Routes
  /**
   * GET /api/auth/oauth/google
   * @description Initiates the Google OAuth 2.0 login flow.
   * @returns {void} Redirects to the Google consent screen.
   */
  app.get(
    '/api/auth/oauth/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
  );

  /**
   * GET /api/auth/oauth/google/callback
   * @description Handles the callback from Google after successful authentication.
   * Creates or retrieves the user, signs a JWT, sets it as a cookie, and redirects to the frontend.
   * @param {Object} req - Express request object containing the authenticated user.
   * @param {Object} res - Express response object used to set the cookie and redirect.
   * @returns {void} Redirects to the frontend URL.
   */
  app.get(
    '/api/auth/oauth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req: any, res: express.Response) => {
      // Successful authentication
      const user = req.user;
      const token = signToken(String(user._id), user.role);
      setCookieOnResponse(res, token);
      res.redirect(FRONTEND_URL);
    }
  );

  // GitHub OAuth Routes
  /**
   * GET /api/auth/oauth/github
   * @description Initiates the GitHub OAuth 2.0 login flow.
   * @returns {void} Redirects to the GitHub consent screen.
   */
  app.get(
    '/api/auth/oauth/github',
    passport.authenticate('github', { scope: ['user:email'], session: false })
  );

  /**
   * GET /api/auth/oauth/github/callback
   * @description Handles the callback from GitHub after successful authentication.
   * Creates or retrieves the user, signs a JWT, sets it as a cookie, and redirects to the frontend.
   * @param {Object} req - Express request object containing the authenticated user.
   * @param {Object} res - Express response object used to set the cookie and redirect.
   * @returns {void} Redirects to the frontend URL.
   */
  app.get(
    '/api/auth/oauth/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    (req: any, res: express.Response) => {
      // Successful authentication
      const user = req.user;
      const token = signToken(String(user._id), user.role);
      setCookieOnResponse(res, token);
      res.redirect(FRONTEND_URL);
    }
  );

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req, res }) => buildAuthContext({ req, res }),
    })
  );

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Auth Service: Connected to MongoDB');
  } catch (err) {
    console.error('Auth Service: MongoDB connection error:', err);
  }

  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`Auth Service ready at http://localhost:${PORT}/graphql`);
}

startServer();
