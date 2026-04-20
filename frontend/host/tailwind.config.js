/** frontend/host/tailwind.config.js
 * @file tailwind.config.js
 * @description Tailwind CSS configuration for the host shell.
 * Extends the default theme with CSS custom property references so all
 * utility classes pull from design-tokens.css rather than hardcoded values.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial configuration.
 * @version 0.1.0
 */

/** @type {import('tailwindcss').Config} */
export default {
    content: [
      './index.html',
      './src/**/*.{ts,tsx}',
    ],
    theme: {
      extend: {
        colors: {
          bg:             'var(--color-bg)',
          surface:        'var(--color-surface)',
          'surface-alt':  'var(--color-surface-alt)',
          primary:        'var(--color-primary)',
          'primary-text': 'var(--color-primary-text)',
          danger:         'var(--color-danger)',
          success:        'var(--color-success)',
          warning:        'var(--color-warning)',
          'text-primary':   'var(--color-text-primary)',
          'text-secondary': 'var(--color-text-secondary)',
          'text-disabled':  'var(--color-text-disabled)',
          'input-fill':     'var(--color-input-fill)',
          'input-border':   'var(--color-input-border)',
          divider:          'var(--color-divider)',
          'nav-bg':         'var(--color-nav-bg)',
          'badge-open':     'var(--color-badge-open)',
          'badge-progress': 'var(--color-badge-progress)',
          'badge-resolved': 'var(--color-badge-resolved)',
          'badge-closed':   'var(--color-badge-closed)',
        },
        fontFamily: {
          sans: 'var(--font-sans)',
          mono: 'var(--font-mono)',
        },
        borderRadius: {
          sm:   'var(--radius-sm)',
          md:   'var(--radius-md)',
          lg:   'var(--radius-lg)',
          xl:   'var(--radius-xl)',
          full: 'var(--radius-full)',
        },
        boxShadow: {
          sm: 'var(--shadow-sm)',
          md: 'var(--shadow-md)',
          lg: 'var(--shadow-lg)',
        },
        transitionDuration: {
          fast:   '150ms',
          normal: '250ms',
          slow:   '400ms',
        },
      },
    },
    plugins: [],
  };