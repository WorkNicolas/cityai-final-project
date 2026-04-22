# DARK_MODE.md
# CityAI — Dark Mode Implementation

> **Security Note:** Do not use the `cors` npm package in any microservice.
> Use `helmet` for HTTP security headers on all Express servers. Cross-origin
> requests are handled by the **Vite proxy** in the host — not by `cors` middleware.

## Overview

CityAI implements dark mode using CSS custom properties (design tokens) defined in
`frontend/shared/design-tokens.css` and toggled via a React context. The app supports
three modes: **System**, **Light**, and **Dark**, applied at the root `<html>` element
using a `data-theme` attribute.

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                frontend/host/src/App.tsx             │
│  ┌────────────────────────────────────────────────┐  │
│  │ ThemeProvider (React Context)                  │  │
│  │  - Reads saved preference from state           │  │
│  │  - Applies data-theme="light|dark" to <html>   │  │
│  │  - Exposes useTheme() hook to all MFEs         │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────┐
│         frontend/shared/design-tokens.css            │
│  ┌────────────────────────────────────────────────┐  │
│  │ :root[data-theme="light"] { --color-bg: ... }  │  │
│  │ :root[data-theme="dark"]  { --color-bg: ... }  │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────┐
│              All MFE Components                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ Use var(--color-bg), var(--color-text-primary) │  │
│  │ via Tailwind CSS arbitrary values or raw CSS   │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## Implementation Details

### 1. Design Tokens (`frontend/shared/design-tokens.css`)

All colors are defined as CSS custom properties paired per theme mode:

```css
/* frontend/shared/design-tokens.css */

:root[data-theme="light"] {
  /* Backgrounds */
  --color-bg:               #F5F7FA;
  --color-surface:          #FFFFFF;
  --color-surface-alt:      #EEF2F7;

  /* Text */
  --color-text-primary:     #1A202C;
  --color-text-secondary:   #4A5568;
  --color-text-disabled:    #A0AEC0;

  /* Brand / Action */
  --color-primary:          #2B6CB0;
  --color-primary-text:     #FFFFFF;
  --color-danger:           #C53030;
  --color-success:          #276749;
  --color-warning:          #B7791F;

  /* Input */
  --color-input-fill:       #EDF2F7;
  --color-input-border:     #CBD5E0;

  /* Dividers & Nav */
  --color-divider:          #E2E8F0;
  --color-nav-bg:           #FFFFFF;
  --color-nav-icon-active:  #2B6CB0;
  --color-nav-icon-inactive:#A0AEC0;

  /* Status badges */
  --color-badge-open:       #3182CE;
  --color-badge-progress:   #D69E2E;
  --color-badge-resolved:   #38A169;
  --color-badge-closed:     #718096;
}

:root[data-theme="dark"] {
  /* Backgrounds */
  --color-bg:               #0D1117;
  --color-surface:          #161B22;
  --color-surface-alt:      #1C2128;

  /* Text */
  --color-text-primary:     #E6EDF3;
  --color-text-secondary:   #8B949E;
  --color-text-disabled:    #484F58;

  /* Brand / Action */
  --color-primary:          #58A6FF;
  --color-primary-text:     #0D1117;
  --color-danger:           #FF7B72;
  --color-success:          #3FB950;
  --color-warning:          #D29922;

  /* Input */
  --color-input-fill:       #1C2128;
  --color-input-border:     #30363D;

  /* Dividers & Nav */
  --color-divider:          #21262D;
  --color-nav-bg:           #161B22;
  --color-nav-icon-active:  #58A6FF;
  --color-nav-icon-inactive:#484F58;

  /* Status badges */
  --color-badge-open:       #1F6FEB;
  --color-badge-progress:   #9E6A03;
  --color-badge-resolved:   #238636;
  --color-badge-closed:     #30363D;
}
```

#### Token Reference

| Token                    | Light Value  | Dark Value   | Usage                        |
|--------------------------|--------------|--------------|------------------------------|
| `--color-bg`             | `#F5F7FA`    | `#0D1117`    | Page background              |
| `--color-surface`        | `#FFFFFF`    | `#161B22`    | Cards, panels                |
| `--color-text-primary`   | `#1A202C`    | `#E6EDF3`    | Body text                    |
| `--color-text-secondary` | `#4A5568`    | `#8B949E`    | Subtitles, metadata          |
| `--color-primary`        | `#2B6CB0`    | `#58A6FF`    | Buttons, links, highlights   |
| `--color-danger`         | `#C53030`    | `#FF7B72`    | Error states, destructive    |
| `--color-success`        | `#276749`    | `#3FB950`    | Resolved status, success     |
| `--color-input-fill`     | `#EDF2F7`    | `#1C2128`    | Text field backgrounds       |
| `--color-input-border`   | `#CBD5E0`    | `#30363D`    | Input borders                |
| `--color-divider`        | `#E2E8F0`    | `#21262D`    | Horizontal rules, separators |
| `--color-badge-open`     | `#3182CE`    | `#1F6FEB`    | "Open" issue status badge    |
| `--color-badge-resolved` | `#38A169`    | `#238636`    | "Resolved" issue badge       |

---

### 2. Theme Provider (`frontend/host/src/context/ThemeContext.tsx`)

```tsx
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
 * - system: Follows the OS/browser preference via prefers-color-scheme.
 * - light: Always applies the light token set.
 * - dark: Always applies the dark token set.
 */
type ThemeMode = 'system' | 'light' | 'dark';

/**
 * ThemeContextValue
 * @description Shape of the value provided by ThemeContext.
 */
interface ThemeContextValue {
  /** mode - The currently selected ThemeMode. */
  mode: ThemeMode;
  /** setMode - Setter to change the active theme mode. */
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * ThemeProvider
 * @description Wraps the application and manages the active data-theme attribute
 * on the root <html> element based on the selected ThemeMode.
 * @param {React.PropsWithChildren} props - Children to render inside the provider.
 * @returns {JSX.Element} The provider wrapper.
 */
export function ThemeProvider({ children }: React.PropsWithChildren): JSX.Element {
  const [mode, setMode] = useState<ThemeMode>('system');

  useEffect(() => {
    const root = document.documentElement;

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
 * @description Custom hook for consuming the ThemeContext.
 * Must be used inside a ThemeProvider.
 * @returns {ThemeContextValue} The current theme mode and setter.
 * @throws {Error} If used outside of a ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
```

---

### 3. ThemeMode Selector UI

Place the theme selector in the staff dashboard or a settings panel within `analytics-mfe`:

```tsx
/** frontend/analytics-mfe/src/components/ThemeToggle.tsx
 * @file ThemeToggle.tsx
 * @description Segmented control allowing users to select System, Light, or Dark mode.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

import { useTheme } from 'host/ThemeContext';

/**
 * ThemeToggle
 * @description Renders a three-option toggle (System / Light / Dark) that updates
 * the global theme mode via the useTheme hook.
 * @returns {JSX.Element} The rendered theme selector.
 */
function ThemeToggle(): JSX.Element {
  const { mode, setMode } = useTheme();

  return (
    <div className="theme-toggle" role="group" aria-label="Theme mode">
      {(['system', 'light', 'dark'] as const).map((m) => (
        <button
          key={m}
          className={mode === m ? 'active' : ''}
          onClick={() => setMode(m)}
          aria-pressed={mode === m}
        >
          {m.charAt(0).toUpperCase() + m.slice(1)}
        </button>
      ))}
    </div>
  );
}

export default ThemeToggle;
```

---

## Usage in Components

### Correct: Using Design Tokens

```tsx
// ✅ GOOD: References a CSS custom property token
<div style={{ backgroundColor: 'var(--color-surface)' }}>
  <p style={{ color: 'var(--color-text-primary)' }}>Issue title</p>
</div>

// ✅ GOOD: Tailwind arbitrary value referencing a token
<div className="bg-[var(--color-surface)] text-[var(--color-text-primary)]">
  Issue title
</div>
```

### Incorrect: Hardcoded Colors

```tsx
// ❌ BAD: Hardcoded color — will not adapt to dark mode
<div style={{ backgroundColor: '#FFFFFF' }}>
  <p style={{ color: '#000000' }}>Issue title</p>
</div>

// ❌ BAD: Tailwind color class — not token-driven
<div className="bg-white text-black">
  Issue title
</div>
```

---

## Design Principles

### 1. Token-Based Design

All colors flow through tokens:

```
Component → var(--color-*) → design-tokens.css → data-theme attribute → Final Color
```

### 2. Semantic Naming

Tokens are named by **purpose**, not by appearance:

- `--color-text-primary` (not `--black`)
- `--color-surface` (not `--white-bg`)
- `--color-danger` (not `--red`)

### 3. Accessibility

- Contrast ratios meet WCAG 2.1 AA standards across both modes.
- Status badge tokens are distinct and never rely on color alone (pair with text labels).

### 4. Issue status colors

Issue status badges use dedicated tokens to remain clearly distinguishable in both modes:

| Status      | Light Badge Color | Dark Badge Color |
|-------------|-------------------|-----------------|
| Open        | `#3182CE` (blue)  | `#1F6FEB`       |
| In Progress | `#D69E2E` (amber) | `#9E6A03`       |
| Resolved    | `#38A169` (green) | `#238636`       |
| Closed      | `#718096` (gray)  | `#30363D`       |

---

## Adding New Tokens

### Step 1: Add to `design-tokens.css`

```css
:root[data-theme="light"] {
  --color-chatbot-bubble: #EBF8FF;
}
:root[data-theme="dark"] {
  --color-chatbot-bubble: #1A365D;
}
```

### Step 2: Use in the Component

```tsx
<div style={{ backgroundColor: 'var(--color-chatbot-bubble)' }}>
  AI response text
</div>
```

No theme configuration file needs to be changed — the token is picked up automatically.

---

## Related Files

| File                                              | Purpose                              |
|---------------------------------------------------|--------------------------------------|
| `frontend/shared/design-tokens.css`               | All CSS custom property definitions  |
| `frontend/host/src/context/ThemeContext.tsx`       | Theme state and `data-theme` toggle  |
| `frontend/analytics-mfe/src/components/ThemeToggle.tsx` | UI control for mode selection  |
| `frontend/host/src/App.tsx`                       | Wraps app in `<ThemeProvider>`       |
