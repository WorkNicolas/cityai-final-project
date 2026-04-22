/** frontend/auth-mfe/src/components/LoginForm.tsx
 * @file LoginForm.tsx
 * @description Authentication form for CityAI residents and staff.
 * Uses Apollo useMutation to call the auth-service login resolver.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - GraphQL
 *   - LOGIN_MUTATION
 * - Components
 *   - LoginForm
 * - Exports
 */

import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import OAuthButtons from './OAuthButtons';

/**
 * LOGIN_MUTATION
 * @description GraphQL mutation to authenticate a user.
 * The server sets an HTTP-only 'token' cookie on success.
 */
const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
        id
        email
        name
        role
      }
    }
  }
`;

/**
 * LoginForm
 * @description Renders the login form and handles submission logic.
 * @returns The rendered login component.
 */
export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const next = new URLSearchParams(window.location.search).get('next') || '/';

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    context: { service: 'auth' },
    onCompleted: (data) => {
      console.log('Login successful:', data.login.user);
      // Redirect or update global state as needed.
      window.location.href = next;
    },
    onError: (error) => {
      setErrorMsg(error.message || 'An error occurred during login.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    login({ variables: { email, password } });
  };

  return (
    <div className="auth-card">
      <h2>Welcome Back</h2>
      <p className="auth-subtitle">Sign in to your CityAI account</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="resident@example.ca"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            disabled={loading}
          />
        </div>

        {errorMsg && <div className="error-banner">{errorMsg}</div>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <OAuthButtons />

      <div className="auth-footer">
        Don't have an account? <a href="/register">Register here</a>
      </div>

      <style>{`
        .auth-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-divider);
          border-radius: 0.5rem;
          padding: 2.5rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin: 0 auto;
        }
        h2 {
          margin: 0 0 0.5rem;
          color: var(--color-text-primary);
          text-align: center;
        }
        .auth-subtitle {
          color: var(--color-text-secondary);
          text-align: center;
          margin-bottom: 2rem;
          font-size: 0.875rem;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-primary);
        }
        input {
          padding: 0.625rem 0.875rem;
          border-radius: 0.375rem;
          border: 1px solid var(--color-input-border);
          background-color: var(--color-input-fill);
          color: var(--color-text-primary);
          font-size: 1rem;
        }
        input:focus {
          outline: 2px solid var(--color-primary);
          outline-offset: -1px;
        }
        .error-banner {
          background-color: rgba(197, 48, 48, 0.1);
          color: var(--color-danger);
          padding: 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          text-align: center;
        }
        .submit-btn {
          background-color: var(--color-primary);
          color: var(--color-primary-text);
          padding: 0.75rem;
          border-radius: 0.375rem;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .submit-btn:hover {
          opacity: 0.9;
        }
        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .auth-footer {
          margin-top: 2rem;
          text-align: center;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }
        .auth-footer a {
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 500;
        }
        .auth-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

export default LoginForm;
