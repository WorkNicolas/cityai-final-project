/** frontend/analytics-mfe/vite.config.ts
 * @file vite.config.ts
 * @description Vite configuration for the Analytics & AI microfrontend.
 * Exposes the chatbot and staff dashboard components via Module Federation.
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
      name: 'analytics',
      filename: 'remoteEntry.js',
      remotes: {
        host: 'http://localhost:3000/assets/remoteEntry.js',
      },
      exposes: {
        './IssueDashboard':    './src/components/IssueDashboard.tsx',
        './AdvocateDashboard': './src/components/AdvocateDashboard.tsx',
        './AdvocateIssueTable':'./src/components/AdvocateIssueTable.tsx',
        './Chatbot':           './src/components/Chatbot.tsx',
        './ThemeToggle':       './src/components/ThemeToggle.tsx',
        './Heatmap':           './src/components/Heatmap.tsx',
        './TrendChart':        './src/components/TrendChart.tsx',
        './InsightsDashboard': './src/components/InsightsDashboard.tsx',
        './BacklogTracker':    './src/components/BacklogTracker.tsx',
      },
      shared: ['react', 'react-dom', '@apollo/client'],
    }),
  ],
  server: {
    port: 3003,
    proxy: {
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
