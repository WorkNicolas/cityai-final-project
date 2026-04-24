/** docs/password_hashing.md
 * @file password_hashing.md
 * @description Documentation of the bcrypt-based password hashing implementation for CityAI.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-24
 * @updated 2026-04-24 - Initial documentation.
 * @version 0.1.0
 */

# Password Hashing Strategy

CityAI uses a secure, industry-standard password hashing strategy to protect user credentials. Plaintext passwords are never stored in the database.

---

## Table of Contents
- [Algorithm](#algorithm)
- [Implementation Details](#implementation-details)
  - [Mongoose Pre-Save Hook](#mongoose-pre-save-hook)
  - [Verification Method](#verification-method)
- [Registration Flow](#registration-flow)
- [Security Considerations](#security-considerations)

---

## Algorithm

We use **bcryptjs** for password hashing.
- **Salt Rounds**: 12 (Cost Factor)
- **Hashing Function**: `bcrypt.hash()`
- **Salting Function**: `bcrypt.genSalt()`

Bcrypt is specifically designed to be slow and computationally expensive, which provides strong protection against brute-force and rainbow table attacks.

---

## Implementation Details

The hashing logic is encapsulated within the `User` model in the `auth-service`.

### Mongoose Pre-Save Hook

Located in `backend/auth-service/src/models/User.ts`, this hook automatically hashes the `passwordHash` field before any `save` operation if the field has been modified.

```typescript
UserSchema.pre('save', async function (next) {
  // Only re-hash if the passwordHash field was modified and exists.
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();

  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});
```

### Verification Method

The `User` model provides an instance method to securely compare a plaintext candidate password against the stored hash.

```typescript
UserSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  if (!this.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.passwordHash);
};
```

---

## Registration Flow

1. **Resident Submission**: The resident provides a plaintext password via the `RegisterForm` in `auth-mfe`.
2. **GraphQL Mutation**: The `register` mutation in `auth-service` receives the plaintext password.
3. **Model Creation**: The mutation calls `User.create({ ..., passwordHash: password })`.
4. **Automatic Hashing**: The Mongoose `pre('save')` hook triggers, generates a salt, hashes the password, and replaces the plaintext value with the hash.
5. **Persistence**: The hashed password and salt are stored in the MongoDB `users` collection.

---

## Security Considerations

- **No Plaintext Storage**: Even during registration, the plaintext password exists only in memory briefly before being hashed.
- **Unique Salts**: Bcrypt generates a unique salt for every password, ensuring that two users with the same password will have different hashes.
- **Work Factor**: A cost factor of 12 balances security and server performance, taking approximately 250-500ms per hash on modern hardware.
