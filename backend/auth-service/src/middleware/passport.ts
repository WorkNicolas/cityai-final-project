/** backend/auth-service/src/middleware/passport.ts
 * @file passport.ts
 * @description Passport configuration for OAuth providers (Google, GitHub).
 * @author Your Name
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Passport Config
 *   - Google Strategy
 *   - GitHub Strategy
 * - Exports
 */

import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from 'passport-github2';
import { User, IUser } from '../models/User';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? 'mock-google-client-id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? 'mock-google-client-secret';
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID ?? 'mock-github-client-id';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET ?? 'mock-github-client-secret';

/**
 * PUBLIC_BASE_URL
 * @description Public origin where the user accesses the host (Vite) app.
 * Used to build absolute OAuth callback URLs so cookies are set on the host origin.
 *
 * Important: With Vite proxy `changeOrigin: true`, auth-service sees Host=localhost:4001.
 * If Passport callbackURL is relative, the provider will redirect to :4001, and the JWT
 * cookie will be set for the wrong origin (breaking calls to other services via the host).
 */
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL ?? process.env.FRONTEND_URL ?? 'http://localhost:3000';

/**
 * handleOAuthCallback
 * @description Common handler for finding or creating a user from an OAuth provider.
 * @param {string} provider - The identity provider (e.g., 'google', 'github').
 * @param {any} profile - The user profile returned from the provider.
 * @returns {Promise<IUser>} The matching or newly created user document.
 */
async function handleOAuthCallback(provider: string, profile: any): Promise<IUser> {
  let email = '';
  if (profile.emails && profile.emails.length > 0) {
    email = profile.emails[0].value;
  } else {
    // Fallback if email is hidden or missing
    email = `${profile.id}@${provider}.example.com`;
  }

  // 1. Try to find the user by provider ID
  let user = await User.findOne({ provider, providerId: profile.id });
  
  if (!user) {
    // 2. Fallback: try to find by email if they previously registered normally
    user = await User.findOne({ email });
    
    if (user) {
      // Link the account
      user.provider = provider;
      user.providerId = profile.id;
      await user.save();
    } else {
      // 3. Create a new user
      user = await User.create({
        email,
        name: profile.displayName || profile.username || 'OAuth User',
        provider,
        providerId: profile.id,
        role: 'resident',
      });
    }
  }

  return user;
}

// Ensure passport doesn't require session serialization
// We use JWTs, not Express sessions
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${PUBLIC_BASE_URL}/api/auth/oauth/google/callback`,
      // In production, use true if behind a proxy
      passReqToCallback: false,
    },
    async (accessToken: string, refreshToken: string, profile: GoogleProfile, done: any) => {
      try {
        const user = await handleOAuthCallback('google', profile);
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: `${PUBLIC_BASE_URL}/api/auth/oauth/github/callback`,
    },
    async (accessToken: string, refreshToken: string, profile: GitHubProfile, done: any) => {
      try {
        const user = await handleOAuthCallback('github', profile);
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

export default passport;
