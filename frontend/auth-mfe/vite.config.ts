/** frontend/auth-mfe/vite.config.ts
 * @file vite.config.ts
 * @description Vite configuration for the Authentication microfrontend.
 * Exposes login and registration components via Module Federation.
 * @author Your Name
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'auth',
      filename: 'remoteEntry.js',
      exposes: {
        './LoginForm':    './src/components/LoginForm.tsx',
        './RegisterForm': './src/components/RegisterForm.tsx',
      },
      shared: ['react', 'react-dom', '@apollo/client'],
    }),
  ],
  server: {
    port: 3001,
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});
