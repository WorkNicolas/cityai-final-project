/** frontend/host/vite.config.ts
 * @file vite.config.ts
 * @description Vite configuration for the host shell.
 * Includes Module Federation remotes and API proxy settings.
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
      name: 'host',
      remotes: {
        auth:      'http://localhost:3001/assets/remoteEntry.js',
        issue:     'http://localhost:3002/assets/remoteEntry.js',
        analytics: 'http://localhost:3003/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom', '@apollo/client'],
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api/auth': {
        target: 'http://localhost:4001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, '/graphql'),
      },
      '/api/issues': {
        target: 'http://localhost:4002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/issues/, '/graphql'),
      },
      '/api/analytics': {
        target: 'http://localhost:4003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/analytics/, '/graphql'),
      },
    },
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});
