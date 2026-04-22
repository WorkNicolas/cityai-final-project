/** backend/issue-service/src/middleware/authContext.ts
 * @file authContext.ts
 * @description Apollo Server context function for the issue-service.
 * Reads and verifies the JWT from the HTTP-only cookie set by auth-service.
 * This service never issues tokens — it only verifies them.
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

const INTERNAL_SERVICE_TOKEN =
  process.env.INTERNAL_SERVICE_TOKEN && process.env.INTERNAL_SERVICE_TOKEN.length > 0
    ? process.env.INTERNAL_SERVICE_TOKEN
    : 'dev-internal-service-token';

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
   * @description The raw Express response object.
   */
  res: Response;

  /**
   * user
   * @description Decoded JWT payload if a valid token cookie was present; null otherwise.
   */
  user: JwtPayload | null;

  /**
   * internal
   * @description True when a valid service-to-service token header is present.
   */
  internal: boolean;
}

/**
 * buildAuthContext
 * @description Reads the 'token' cookie, verifies it with the shared JWT_SECRET,
 * and returns an AuthContext. Does not throw on failure — resolvers enforce auth individually.
 * @param {object} params - Apollo context params.
 * @param {Request}  params.req - Express request populated by cookie-parser.
 * @param {Response} params.res - Express response.
 * @returns {AuthContext} The populated context object for this request.
 */
export function buildAuthContext({ req, res }: { req: Request; res: Response }): AuthContext {
  let user: JwtPayload | null = null;

  const token: string | undefined = req.cookies?.token;

  if (token) {
    try {
      user = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      // Expired or invalid token — treat as unauthenticated.
      user = null;
    }
  }

  const headerToken = req.headers['x-service-token'];
  const svc = Array.isArray(headerToken) ? headerToken[0] : headerToken;
  const internal = typeof svc === 'string' && svc === INTERNAL_SERVICE_TOKEN;

  return { req, res, user, internal };
}