/** backend/auth-service/src/models/User.ts
 * @file User.ts
 * @description Mongoose schema and model for CivicCase user accounts.
 * Handles password hashing via a pre-save hook and stores the user role.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Interfaces
 *   - IUser
 * - Schema
 *   - UserSchema
 * - Hooks
 *   - pre('save') — password hashing
 * - Methods
 *   - comparePassword
 * - Exports
 */

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * IUser
 * @description TypeScript interface representing a User document in MongoDB.
 * Extends Mongoose Document to include document-level methods.
 */
export interface IUser extends Document {
  /**
   * email
   * @description User's email address. Must be unique across all accounts.
   */
  email: string;

  /**
   * name
   * @description User's display name shown throughout the application.
   */
  name: string;

  /**
   * passwordHash
   * @description Bcrypt hash of the user's password. Never store or return plaintext.
   */
  passwordHash: string;

  /**
   * role
   * @description Access control role. Determines which features the user can access.
   * One of: 'resident', 'staff', 'advocate'.
   */
  role: 'resident' | 'staff' | 'advocate';

  /**
   * createdAt
   * @description Timestamp of account creation. Managed automatically by Mongoose timestamps.
   */
  createdAt: Date;

  /**
   * updatedAt
   * @description Timestamp of last document update. Managed automatically by Mongoose timestamps.
   */
  updatedAt: Date;

  /**
   * comparePassword
   * @description Compares a plaintext password candidate against the stored bcrypt hash.
   * @param {string} candidate - The plaintext password to verify.
   * @returns {Promise<boolean>} True if the password matches, false otherwise.
   */
  comparePassword(candidate: string): Promise<boolean>;
}

/**
 * UserSchema
 * @description Mongoose schema definition for the User collection.
 * Enforces required fields, uniqueness constraints, and role validation.
 */
const UserSchema = new Schema<IUser>(
  {
    /**
     * email
     * @description Unique, lowercase email used as the login identifier.
     */
    email: {
      type:     String,
      required: [true, 'Email is required'],
      unique:   true,
      lowercase: true,
      trim:     true,
    },

    /**
     * name
     * @description Display name for the user account.
     */
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
    },

    /**
     * passwordHash
     * @description Bcrypt hash stored in place of the plaintext password.
     */
    passwordHash: {
      type:     String,
      required: [true, 'Password is required'],
    },

    /**
     * role
     * @description Role-based access control. Defaults to 'resident' on registration.
     */
    role: {
      type:    String,
      enum:    ['resident', 'staff', 'advocate'],
      default: 'resident',
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields.
    timestamps: true,
  }
);

/**
 * pre('save') hook
 * @description Hashes the passwordHash field before saving if it has been modified.
 * This ensures the raw password is never persisted to the database.
 */
UserSchema.pre('save', async function (next) {
  // Only re-hash if the passwordHash field was modified (e.g., on registration or password change).
  if (!this.isModified('passwordHash')) return next();

  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

/**
 * comparePassword
 * @description Instance method to verify a plaintext password against the stored hash.
 * @param {string} candidate - The plaintext password provided by the user on login.
 * @returns {Promise<boolean>} True if the password is correct.
 */
UserSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);