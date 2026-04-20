/** backend/analytics-service/src/middleware/authContext.ts
 * @file authContext.ts
 * @description Apollo Server context function for the analytics-service.
 * Reads and verifies the JWT from the HTTP-only cookie set by auth-service.
 * @author Your Name
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

const JWT_SECRET = process.env.JWT_SECRET ?? '';

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
}

/**
 * buildAuthContext
 * @description Reads the 'token' cookie, verifies it with the shared JWT_SECRET,
 * and returns an AuthContext.
 * @param {object} params - Apollo context params.
 * @param {Request}  params.req - Express request.
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
      user = null;
    }
  }

  return { req, res, user };
}
