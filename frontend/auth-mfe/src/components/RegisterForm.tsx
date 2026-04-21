/** frontend/auth-mfe/src/components/RegisterForm.tsx
 * @file RegisterForm.tsx
 * @description Registration form for new CivicCase accounts.
 * Allows users to choose their role (Resident, Staff, or Advocate).
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - GraphQL
 *   - REGISTER_MUTATION
 * - Components
 *   - RegisterForm
 * - Exports
 */

import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import OAuthButtons from './OAuthButtons';

/**
 * REGISTER_MUTATION
 * @description GraphQL mutation to create a new user account.
 */
const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!, $name: String!, $role: UserRole) {
    register(email: $email, password: $password, name: $name, role: $role) {
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
 * RegisterForm
 * @description Renders the registration form and handles submission logic.
 * @returns The rendered registration component.
 */
export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'resident',
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [register, { loading }] = useMutation(REGISTER_MUTATION, {
    context: { service: 'auth' },
    onCompleted: (data) => {
      console.log('Registration successful:', data.register.user);
      window.location.href = '/';
    },
    onError: (error) => {
      setErrorMsg(error.message || 'An error occurred during registration.');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    register({ variables: formData });
  };

  return (
    <div className="auth-card">
      <h2>Create Account</h2>
      <p className="auth-subtitle">Join the CityAI community</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Jane Doe"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="jane@example.ca"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">I am a...</label>
          <select
            id="role"
            value={formData.role}
            onChange={handleChange}
            disabled={loading}
            className="auth-select"
          >
            <option value="resident">Resident</option>
            <option value="staff">Municipal Staff</option>
            <option value="advocate">Community Advocate</option>
          </select>
        </div>

        {errorMsg && <div className="error-banner">{errorMsg}</div>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <OAuthButtons />

      <div className="auth-footer">
        Already have an account? <a href="/login">Sign in</a>
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
        input, .auth-select {
          padding: 0.625rem 0.875rem;
          border-radius: 0.375rem;
          border: 1px solid var(--color-input-border);
          background-color: var(--color-input-fill);
          color: var(--color-text-primary);
          font-size: 1rem;
        }
        input:focus, .auth-select:focus {
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

export default RegisterForm;
