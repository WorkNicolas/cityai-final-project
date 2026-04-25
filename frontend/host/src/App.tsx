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
import { ApolloProvider, gql, useQuery, useMutation } from '@apollo/client';
import { client } from './apollo/client';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
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
// @ts-ignore
const AdvocateDashboard = lazy(() => import('analytics/AdvocateDashboard'));

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      role
    }
  }
`;

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

function authRedirectHref(destination: string): string {
  const search = new URLSearchParams({ next: destination });
  return `/login?${search.toString()}`;
}

function AuthGateMessage(props: { title: string; destination: string }) {
  return (
    <section className="centered-section">
      <h2>{props.title}</h2>
      <p>You need to sign in to continue.</p>
      <div className="home-actions">
        <a className="btn btn-primary" href={authRedirectHref(props.destination)}>
          Sign In
        </a>
      </div>
    </section>
  );
}

/**
 * App
 * @description The root shell component.
 */
function AppShell() {
  const path = window.location.pathname;

  const { data, loading } = useQuery(ME_QUERY, {
    context: { service: 'auth' },
    fetchPolicy: 'network-only',
  });

  const [logout] = useMutation(LOGOUT_MUTATION, {
    context: { service: 'auth' },
  });

  const me = data?.me ?? null;
  const isAuthed = Boolean(me);
  const isStaff = me?.role === 'staff';
  const isAdvocate = me?.role === 'advocate';

  const handleSignOut = async () => {
    try {
      await logout();
    } finally {
      window.location.href = '/';
    }
  };

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
      if (loading) return <div className="loading">Checking session...</div>;
      if (!isAuthed) return <AuthGateMessage title="Dashboard" destination="/dashboard" />;
      
      if (isStaff) {
        return <IssueDashboard />;
      }
      
      if (isAdvocate) {
        return <AdvocateDashboard />;
      }

      return (
        <section className="centered-section">
          <h2>Access Denied</h2>
          <p>The dashboard is only available to staff and community advocates.</p>
        </section>
      );
    }
    if (path === '/report') {
      if (loading) return <div className="loading">Checking session...</div>;
      if (!isAuthed) return <AuthGateMessage title="Report an Issue" destination="/report" />;
      return (
        <section className="centered-section">
          <h2>Report an Issue</h2>
          <IssueForm />
        </section>
      );
    }
    // Default Home
    return (
      <section className="welcome-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '4rem' }}>
        <h2>Welcome to CityAI</h2>
        <p>Your AI-powered municipal assistant.</p>
        <div className="home-actions" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
          <a
            href={isAuthed ? '/report' : authRedirectHref('/report')}
            className="btn btn-primary"
          >
            Report an Issue
          </a>
          {isStaff && (
            <a href="/dashboard" className="btn btn-secondary">
              Staff Dashboard
            </a>
          )}
          {isAdvocate && (
            <a href="/dashboard" className="btn btn-secondary">
              Advocate Dashboard
            </a>
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>CityAI</h1>
        <nav>
          <a href="/">Home</a>
          <a href={isAuthed ? '/report' : authRedirectHref('/report')}>Report Issue</a>
          {isStaff && <a href="/dashboard">Staff Dashboard</a>}
          {isAdvocate && <a href="/dashboard">Advocate Dashboard</a>}
          {isAuthed ? (
            <button
              type="button"
              onClick={handleSignOut}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                font: 'inherit',
                fontWeight: 500,
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
              }}
            >
              Sign Out
            </button>
          ) : (
            <a href="/login">Sign In</a>
          )}
          <div className="nav-divider"></div>
          <ThemeToggle />
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
        <p>&copy; 2026 Canadian Municipality CityAI Project</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
