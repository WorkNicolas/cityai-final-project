/** frontend/host/src/components/ThemeToggle.tsx
 * @file ThemeToggle.tsx
 * @description Segmented control for switching between Light, Dark, and System theme modes.
 * Features SVG icons and a horizontal lightswitch design.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-23
 * @updated 2026-04-23 - Migrated to host shell and updated with icons.
 * @version 0.2.0
 */

/**
 * Table of Contents
 * - Imports
 * - Icons (SVG)
 * - Components
 *   - ThemeToggle
 * - Exports
 */

import React from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * Icons
 */
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const MonitorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
  </svg>
);

/**
 * ThemeToggle
 * @description Renders a themed segmented control to toggle theme modes.
 * @returns The rendered theme selector.
 */
export function ThemeToggle() {
  const { mode, setMode } = useTheme();

  const options = [
    { value: 'light',  icon: <SunIcon />,    label: 'Light' },
    { value: 'system', icon: <MonitorIcon />, label: 'System' },
    { value: 'dark',   icon: <MoonIcon />,   label: 'Dark' },
  ] as const;

  return (
    <div className="theme-toggle-nav">
      <div className="toggle-track">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setMode(opt.value)}
            className={`toggle-btn ${mode === opt.value ? 'active' : ''}`}
            aria-label={`Switch to ${opt.label} mode`}
            title={opt.label}
          >
            <span className="toggle-icon">{opt.icon}</span>
          </button>
        ))}
        {/* Animated slider/background indicator */}
        <div 
          className="toggle-slider" 
          style={{ 
            transform: `translateX(${options.findIndex(o => o.value === mode) * 100}%)` 
          }}
        />
      </div>

      <style>{`
        .theme-toggle-nav {
          display: flex;
          align-items: center;
          padding: 2px;
          background: var(--color-input-fill);
          border: 1px solid var(--color-divider);
          border-radius: 2rem;
          position: relative;
          height: 32px;
          width: 96px; /* 32px * 3 */
        }
        .toggle-track {
          display: flex;
          width: 100%;
          height: 100%;
          position: relative;
        }
        .toggle-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          z-index: 2;
          padding: 0;
          transition: color 0.2s ease;
          border-radius: 2rem;
        }
        .toggle-btn:hover {
          color: var(--color-text-primary);
        }
        .toggle-btn.active {
          color: var(--color-primary);
        }
        .toggle-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .toggle-slider {
          position: absolute;
          top: 0;
          left: 0;
          width: 33.33%;
          height: 100%;
          background: var(--color-surface);
          border-radius: 2rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
          border: 1px solid var(--color-divider);
        }
      `}</style>
    </div>
  );
}

export default ThemeToggle;
