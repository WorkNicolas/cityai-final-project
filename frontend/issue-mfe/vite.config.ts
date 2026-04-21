/** frontend/issue-mfe/vite.config.ts
 * @file vite.config.ts
 * @description Vite configuration for the Issue Management microfrontend.
 * Exposes reporting, listing, and tracking components via Module Federation.
 * @author Carl Nicolas Mendoza
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
      name: 'issue',
      filename: 'remoteEntry.js',
      exposes: {
        './IssueForm':         './src/components/IssueForm.tsx',
        './IssueList':         './src/components/IssueList.tsx',
        './IssueDetail':       './src/components/IssueDetail.tsx',
        './IssueStatusBadge':  './src/components/IssueStatusBadge.tsx',
        './IssueMap':          './src/components/IssueMap.tsx',
        './PhotoUpload':       './src/components/PhotoUpload.tsx',
        './NotificationFeed':  './src/components/NotificationFeed.tsx',
      },
      shared: ['react', 'react-dom', '@apollo/client'],
    }),
  ],
  server: {
    port: 3002,
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});
