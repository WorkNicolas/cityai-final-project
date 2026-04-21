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

import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';
import { buildAuthContext } from './middleware/authContext';

const PORT      = process.env.PORT      ?? 4001;
const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/cityai-auth';

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

  app.use(
    '/graphql',
    cors<cors.CorsRequest>({ origin: true, credentials: true }),
    expressMiddleware(server, {
      context: async ({ req, res }) => buildAuthContext({ req, res }),
    })
  );

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Auth Service: Connected to MongoDB');
  } catch (err) {
    console.error('❌ Auth Service: MongoDB connection error:', err);
  }

  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Auth Service ready at http://localhost:${PORT}/graphql`);
}

startServer();
