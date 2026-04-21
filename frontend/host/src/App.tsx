/** frontend/host/src/App.tsx
 * @file App.tsx
 * @description The shell application for CityAI. Orchestrates lazy-loaded
 * microfrontends and provides the global Apollo and Theme contexts.
 * @author Carl Nicolas Mendoza
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
const RegisterForm = lazy(() => import('auth/RegisterForm'));
// @ts-ignore
const IssueForm = lazy(() => import('issue/IssueForm'));
// @ts-ignore
const Chatbot  = lazy(() => import('analytics/Chatbot'));
// @ts-ignore
const IssueDashboard = lazy(() => import('analytics/IssueDashboard'));

/**
 * App
 * @description The root shell component.
 */
function App() {
  const path = window.location.pathname;

  const renderContent = () => {
    if (path === '/login') {
      return (
        <section className="centered-section">
          <LoginForm />
        </section>
      );
    }
    if (path === '/register') {
      return (
        <section className="centered-section">
          <RegisterForm />
        </section>
      );
    }
    if (path === '/dashboard') {
      return <IssueDashboard />;
    }
    if (path === '/report') {
      return (
        <section className="centered-section">
          <h2>Report an Issue</h2>
          <IssueForm />
        </section>
      );
    }
    // Default Home
    return (
      <div className="view-container">
        <section className="welcome-section">
          <h2>Welcome to CityAI</h2>
          <p>Your AI-powered municipal assistant.</p>
          <div className="home-actions">
            <a href="/report" className="btn btn-primary">Report an Issue</a>
            <a href="/dashboard" className="btn btn-secondary">Staff Dashboard</a>
          </div>
        </section>
      </div>
    );
  };

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
              <a href="/login">Sign In</a>
            </nav>
          </header>

          <main className="app-content">
            <Suspense fallback={<div className="loading">Loading module...</div>}>
              {renderContent()}
              <aside className="chat-sidebar">
                <Chatbot />
              </aside>
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
