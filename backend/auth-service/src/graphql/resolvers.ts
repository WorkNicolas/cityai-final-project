/** backend/auth-service/src/graphql/resolvers.ts
 * @file resolvers.ts
 * @description GraphQL resolvers for the User Authentication microservice.
 * Handles user registration, login, logout, and the authenticated 'me' query.
 * JWTs are issued here and set as HTTP-only cookies — never returned in response body.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Helpers
 *   - signToken
 *   - setCookieOnResponse
 * - Resolvers
 *   - Query
 *     - me
 *   - Mutation
 *     - register
 *     - login
 *     - logout
 * - Exports
 */

import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { User } from '../models/User';

/** JWT secret loaded from environment. Shared across all services. */
const JWT_SECRET =
  process.env.JWT_SECRET && process.env.JWT_SECRET.length > 0
    ? process.env.JWT_SECRET
    : 'dev-jwt-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';
const COOKIE_SECURE  = process.env.COOKIE_SECURE  === 'true';

/**
 * signToken
 * @description Creates a signed JWT containing the user's id and role.
 * @param {string} userId - The MongoDB document ID of the user.
 * @param {string} role   - The user's assigned role.
 * @returns {string} A signed JWT string.
 */
export function signToken(userId: string, role: string): string {
  return jwt.sign({ sub: userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

/**
 * setCookieOnResponse
 * @description Writes the JWT as an HTTP-only cookie on the Express response.
 * Using HTTP-only prevents client-side JavaScript from reading the token.
 * @param {any} res   - The Express response object from Apollo context.
 * @param {string} token - The signed JWT to store.
 * @returns {void}
 */
export function setCookieOnResponse(res: any, token: string): void {
  res.cookie('token', token, {
    httpOnly: true,
    secure:   COOKIE_SECURE,
    sameSite: 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });
}

function idString(parent: { _id?: unknown; id?: unknown }): string {
  const v = parent._id ?? parent.id;
  if (v && typeof (v as { toString?: () => string }).toString === 'function') {
    return String((v as { toString: () => string }).toString());
  }
  return String(v ?? '');
}

export const resolvers = {
  User: {
    id:        (parent: { _id?: unknown; id?: unknown }) => idString(parent),
    createdAt: (parent: { createdAt?: Date | string }) =>
      typeof parent.createdAt === 'string'
        ? parent.createdAt
        : parent.createdAt?.toISOString?.() ?? '',
  },

  Query: {
    /**
     * QUERY me
     * @description Returns the currently authenticated user from the JWT cookie context.
     * Returns null if the request carries no valid token (unauthenticated browsing is allowed).
     * @param {unknown} _ - Unused parent resolver value.
     * @param {unknown} __ - Unused arguments.
     * @param {object} context - Apollo context containing the authenticated user or null.
     * @returns {Promise<User | null>} The authenticated user document or null.
     */
    me: async (_: unknown, __: unknown, context: any) => {
      if (!context.user) return null;
      return User.findById(context.user.sub).lean();
    },

    /**
     * QUERY users
     * @description Returns all users, optionally filtered by role.
     */
    users: async (_: unknown, args: any, context: any) => {
      if (!context.user || (context.user.role !== 'staff' && context.user.role !== 'advocate')) {
        throw new GraphQLError("This action requires 'staff' or 'advocate' role.", {
          extensions: { code: 'FORBIDDEN' },
        });
      }
      const filter: any = {};
      if (args.roles && args.roles.length > 0) {
        filter.role = { $in: args.roles };
      }
      return User.find(filter).lean();
    },
  },

  Mutation: {
    /**
     * MUTATION register
     * @description Creates a new user account, signs a JWT, and sets the token cookie.
     * The raw password is passed as passwordHash to the model; the pre-save hook hashes it.
     * @param {unknown} _ - Unused parent resolver value.
     * @param {object} args - Mutation input fields.
     * @param {string} args.email    - The user's email address.
     * @param {string} args.password - The plaintext password (hashed by model pre-save hook).
     * @param {string} args.name     - The user's display name.
     * @param {string} [args.role]   - Optional role (defaults to 'resident').
     * @param {object} context       - Apollo context containing the Express response.
     * @returns {Promise<{ user: IUser }>} The created user wrapped in AuthPayload.
     * @throws {GraphQLError} If the email is already registered.
     */
    register: async (_: unknown, args: any, context: any) => {
      const { email, password, name, role } = args;

      const existing = await User.findOne({ email });
      if (existing) {
        throw new GraphQLError('An account with this email already exists.', {
          extensions: { code: 'EMAIL_TAKEN' },
        });
      }

      // passwordHash field is intentionally set to plaintext here;
      // the pre-save hook hashes it before persisting.
      const user = await User.create({
        email,
        name,
        passwordHash: password,
        role: role ?? 'resident',
      });

      const token = signToken(String(user._id), user.role);
      setCookieOnResponse(context.res, token);

      return { user };
    },

    /**
     * MUTATION login
     * @description Authenticates an existing user and sets the JWT cookie on success.
     * @param {unknown} _ - Unused parent resolver value.
     * @param {object} args - Mutation input fields.
     * @param {string} args.email    - The user's email address.
     * @param {string} args.password - The plaintext password to verify.
     * @param {object} context       - Apollo context containing the Express response.
     * @returns {Promise<{ user: IUser }>} The authenticated user wrapped in AuthPayload.
     * @throws {GraphQLError} If credentials are invalid.
     */
    login: async (_: unknown, args: any, context: any) => {
      const { email, password } = args;

      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        throw new GraphQLError('Invalid email or password.', {
          extensions: { code: 'INVALID_CREDENTIALS' },
        });
      }

      const token = signToken(String(user._id), user.role);
      setCookieOnResponse(context.res, token);

      return { user };
    },

    /**
     * MUTATION logout
     * @description Clears the JWT cookie from the client browser.
     * @param {unknown} _ - Unused parent resolver value.
     * @param {unknown} __ - Unused arguments.
     * @param {object} context - Apollo context containing the Express response.
     * @returns {boolean} Always returns true on success.
     */
    logout: (_: unknown, __: unknown, context: any): boolean => {
      context.res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
      return true;
    },
  },
};