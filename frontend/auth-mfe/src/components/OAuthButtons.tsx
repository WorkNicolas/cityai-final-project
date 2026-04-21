/** frontend/auth-mfe/src/components/OAuthButtons.tsx
 * @file OAuthButtons.tsx
 * @description Provides Google and GitHub OAuth sign-in buttons for the CivicCase platform.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Components
 *   - OAuthButtons
 * - Exports
 */

import React from 'react';

/**
 * OAuthButtons
 * @description Renders a set of social login buttons.
 * @returns The rendered OAuth button group.
 */
export function OAuthButtons() {
  const handleOAuth = (provider: 'google' | 'github') => {
    // In a real implementation, this would redirect to the backend OAuth route.
    console.log(`Redirecting to ${provider} OAuth...`);
    window.location.href = `/api/auth/oauth/${provider}`;
  };

  return (
    <div className="oauth-buttons-group">
      <div className="divider-text">
        <span>Or continue with</span>
      </div>
      
      <div className="buttons-row">
        <button 
          onClick={() => handleOAuth('google')}
          className="oauth-btn google"
          aria-label="Sign in with Google"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
          </svg>
          Google
        </button>

        <button 
          onClick={() => handleOAuth('github')}
          className="oauth-btn github"
          aria-label="Sign in with GitHub"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,2.24672C6.61359,2.24672,2.24672,6.61359,2.24672,12C2.24672,16.3125,5.03906,19.9766,8.91016,21.2656C9.39844,21.3594,9.57812,21.0547,9.57812,20.7969C9.57812,20.5625,9.57031,19.9375,9.56641,19.1094C6.85156,19.7,6.27734,17.8047,6.27734,17.8047C5.83203,16.6719,5.19531,16.375,5.19531,16.375C4.3125,15.7734,5.26172,15.7891,5.26172,15.7891C6.24219,15.8594,6.75781,16.7969,6.75781,16.7969C7.625,18.2812,9.03516,17.8516,9.59375,17.5977C9.68359,16.9688,9.93359,16.5391,10.2109,16.293C8.04297,16.0469,5.76172,15.2109,5.76172,11.4688C5.76172,10.4023,6.14062,9.52734,6.76562,8.84766C6.67188,8.5977,6.33203,7.60547,6.86719,6.26562C6.86719,6.26562,7.68359,6.00391,9.53906,7.26172C10.3125,7.04688,11.1445,6.9375,11.9766,6.93359C12.8086,6.9375,13.6406,7.04688,14.4141,7.26172C16.2695,6.00391,17.0859,6.26562,17.0859,6.26562C17.6211,7.60547,17.2812,8.5977,17.1875,8.84766C17.8125,9.52734,18.1875,10.4023,18.1875,11.4688C18.1875,15.2188,15.9023,16.043,13.7227,16.2852C14.0742,16.5859,14.3867,17.1875,14.3867,18.1172C14.3867,19.4453,14.375,20.5156,14.375,20.8398C14.375,21.1016,14.5508,21.4023,15.0469,21.3047C18.9141,20.0156,21.7031,16.3516,21.7031,12C21.7031,6.61359,17.3363,2.24672,11.95,2.24672"/>
          </svg>
          GitHub
        </button>
      </div>

      <style>{`
        .oauth-buttons-group {
          margin-top: 1.5rem;
          width: 100%;
        }
        .divider-text {
          display: flex;
          align-items: center;
          text-align: center;
          margin-bottom: 1rem;
          color: var(--color-text-disabled);
          font-size: 0.875rem;
        }
        .divider-text::before, .divider-text::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--color-divider);
        }
        .divider-text span {
          padding: 0 0.75rem;
        }
        .buttons-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .oauth-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.625rem;
          border: 1px solid var(--color-input-border);
          border-radius: 0.375rem;
          background-color: var(--color-surface);
          color: var(--color-text-primary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .oauth-btn:hover {
          background-color: var(--color-surface-alt);
        }
        .oauth-btn svg {
          color: var(--color-text-secondary);
        }
      `}</style>
    </div>
  );
}

export default OAuthButtons;
