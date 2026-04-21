/** frontend/host/src/context/ThemeContext.tsx
 * @file ThemeContext.tsx
 * @description React context that manages the active theme mode and applies
 * the data-theme attribute to the root HTML element.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Types
 *   - ThemeMode
 *   - ThemeContextValue
 * - Context
 *   - ThemeContext
 * - Components
 *   - ThemeProvider
 * - Hooks
 *   - useTheme
 * - Exports
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * ThemeMode
 * @description The three supported theme modes.
 */
type ThemeMode = 'system' | 'light' | 'dark';

/**
 * ThemeContextValue
 */
interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * ThemeProvider
 * @description Wraps the application and manages the active data-theme attribute.
 */
export function ThemeProvider({ children }: React.PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('theme-mode') as ThemeMode) || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('theme-mode', mode);

    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', mode);
    }
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
