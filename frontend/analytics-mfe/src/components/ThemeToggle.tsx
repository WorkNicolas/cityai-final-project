/** frontend/analytics-mfe/src/components/ThemeToggle.tsx
 * @file ThemeToggle.tsx
 * @description Segmented control for switching between Light, Dark, and System theme modes.
 * Consumes the useTheme hook from the host shell.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Components
 *   - ThemeToggle
 * - Exports
 */

import React from 'react';
// @ts-ignore - useTheme is provided by the host at runtime
import { useTheme } from 'host/ThemeContext';

/**
 * ThemeToggle
 * @description Renders a themed segmented control to toggle theme modes.
 * @returns The rendered theme selector.
 */
export function ThemeToggle() {
  const { mode, setMode } = useTheme();

  const options = [
    { value: 'system', icon: '💻', label: 'System' },
    { value: 'light',  icon: '☀️', label: 'Light' },
    { value: 'dark',   icon: '🌙', label: 'Dark' },
  ] as const;

  return (
    <div className="theme-toggle-container">
      <div className="toggle-track">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setMode(opt.value)}
            className={`toggle-btn ${mode === opt.value ? 'active' : ''}`}
            aria-label={`Switch to ${opt.label} mode`}
            title={opt.label}
          >
            <span className="icon">{opt.icon}</span>
            <span className="label">{opt.label}</span>
          </button>
        ))}
      </div>

      <style>{`
        .theme-toggle-container {
          display: inline-block;
          background: var(--color-surface-alt);
          padding: 0.25rem;
          border-radius: 0.5rem;
          border: 1px solid var(--color-divider);
        }
        .toggle-track {
          display: flex;
          gap: 0.25rem;
        }
        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
          border: none;
          background: transparent;
          color: var(--color-text-secondary);
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .toggle-btn:hover {
          color: var(--color-text-primary);
        }
        .toggle-btn.active {
          background: var(--color-surface);
          color: var(--color-primary);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .toggle-btn .icon {
          font-size: 1rem;
        }
        @media (max-width: 600px) {
          .toggle-btn .label { display: none; }
          .toggle-btn { padding: 0.5rem; }
        }
      `}</style>
    </div>
  );
}

export default ThemeToggle;
