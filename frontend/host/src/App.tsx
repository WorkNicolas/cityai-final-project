/** frontend/host/src/App.tsx
 * @file App.tsx
 * @description The shell application for CityAI. Orchestrates lazy-loaded
 * microfrontends and provides the global Apollo and Theme contexts.
 * @author Your Name
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Components
 *   - App
 * - Exports
 */

import React, { Suspense, lazy } from 'react';
import { ApolloProvider } from '@apollo/client';
import { client } from './apollo/client';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

/**
 * Lazy-loaded Microfrontends
 */
// @ts-ignore
const LoginForm = lazy(() => import('auth/LoginForm'));
// @ts-ignore
const IssueForm = lazy(() => import('issue/IssueForm'));
// @ts-ignore
const Chatbot  = lazy(() => import('analytics/Chatbot'));

/**
 * App
 * @description The root shell component.
 */
function App() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider>
        <div className="app-shell">
          <header className="app-header">
            <h1>CityAI (CivicCase)</h1>
            <nav>
              <a href="/">Home</a>
              <a href="/report">Report Issue</a>
              <a href="/dashboard">Staff Dashboard</a>
            </nav>
          </header>

          <main className="app-content">
            <Suspense fallback={<div className="loading">Loading module...</div>}>
              {/* This is a placeholder for routing logic — for now we show components based on state or simple hash */}
              <div className="view-container">
                <section>
                  <h2>Report an Issue</h2>
                  <IssueForm />
                </section>
                
                <aside className="chat-sidebar">
                  <Chatbot />
                </aside>
              </div>
            </Suspense>
          </main>

          <footer className="app-footer">
            <p>&copy; 2026 Canadian Municipality CivicCase Project</p>
          </footer>
        </div>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
