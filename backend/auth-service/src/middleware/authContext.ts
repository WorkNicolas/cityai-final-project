/** backend/auth-service/src/middleware/authContext.ts
 * @file authContext.ts
 * @description Apollo Server context function for the auth-service.
 * Reads the JWT from the HTTP-only cookie, verifies it, and attaches the
 * decoded payload to the GraphQL context. Unauthenticated requests are
 * allowed — resolvers decide individually whether auth is required.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Interfaces
 *   - JwtPayload
 *   - AuthContext
 * - Functions
 *   - buildAuthContext
 * - Exports
 */

import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

const JWT_SECRET =
  process.env.JWT_SECRET && process.env.JWT_SECRET.length > 0
    ? process.env.JWT_SECRET
    : 'dev-jwt-secret-change-me';

/**
 * JwtPayload
 * @description Shape of the decoded JWT issued by auth-service.
 */
interface JwtPayload {
  /**
   * sub
   * @description MongoDB user ID embedded in the token subject claim.
   */
  sub: string;

  /**
   * role
   * @description User role embedded at token issuance time.
   */
  role: 'resident' | 'staff' | 'advocate';
}

/**
 * AuthContext
 * @description The object attached to every Apollo resolver's context argument.
 */
export interface AuthContext {
  /**
   * req
   * @description The raw Express request object.
   */
  req: Request;

  /**
   * res
   * @description The raw Express response object. Used by resolvers to set/clear cookies.
   */
  res: Response;

  /**
   * user
   * @description Decoded JWT payload if a valid token cookie was present; null otherwise.
   */
  user: JwtPayload | null;
}

/**
 * buildAuthContext
 * @description Apollo Server context function. Attempts to verify the 'token' cookie
 * and attach the decoded payload as context.user. Does not throw on failure —
 * unauthenticated context is valid for public queries (e.g., me returns null).
 * @param {object} params - Apollo context params containing the Express request and response.
 * @param {Request}  params.req - Express request, populated by cookie-parser middleware.
 * @param {Response} params.res - Express response used by mutation resolvers for cookies.
 * @returns {AuthContext} The populated context object for this request.
 */
export function buildAuthContext({ req, res }: { req: Request; res: Response }): AuthContext {
  let user: JwtPayload | null = null;

  const token: string | undefined = req.cookies?.token;

  if (token) {
    try {
      user = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      // Token is expired or tampered — treat request as unauthenticated.
      user = null;
    }
  }

  return { req, res, user };
}