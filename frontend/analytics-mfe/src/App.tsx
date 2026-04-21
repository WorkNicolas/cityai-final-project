import { ApolloClient, ApolloProvider, createHttpLink, InMemoryCache } from '@apollo/client';
import { IssueDashboard } from './components/IssueDashboard';
import { Chatbot } from './components/Chatbot';
import './App.css';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_ANALYTICS_GRAPHQL_URL ?? '/api/analytics',
  credentials: 'include',
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default function App() {
  return (
    <ApolloProvider client={client}>
      <div className="analytics-mfe-app">
        <IssueDashboard />
        <Chatbot />
      </div>
    </ApolloProvider>
  );
}
