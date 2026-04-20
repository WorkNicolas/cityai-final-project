/** frontend/analytics-mfe/src/components/Chatbot.tsx
 * @file Chatbot.tsx
 * @description Provides a rich interactive interface for the AI-powered CivicChat assistant.
 * Connects to the LangGraph + Gemini agent via the analytics-service.
 * @author Your Name
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - GraphQL
 *   - CHAT_MUTATION
 * - Components
 *   - Chatbot
 * - Exports
 */

import React, { useState, useRef, useEffect } from 'react';
import { useMutation, gql } from '@apollo/client';

/**
 * CHAT_MUTATION
 * @description Mutation to send a message to the agentic chatbot.
 */
const CHAT_MUTATION = gql`
  mutation Chat($message: String!) {
    chat(message: $message)
  }
`;

/**
 * ChatMessage
 * @description Shape of a message in the chat history.
 */
interface ChatMessage {
  id:      string;
  role:    'user' | 'assistant';
  content: string;
}

/**
 * Chatbot
 * @description Renders the chatbot window and handles the AI conversation.
 * @returns {JSX.Element} The rendered chatbot component.
 */
export function Chatbot(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: "Hello! I'm CivicBot, your AI municipal assistant. How can I help you today?" }
  ]);

  const historyEndRef = useRef<HTMLDivElement>(null);

  const [chat, { loading }] = useMutation(CHAT_MUTATION, {
    onCompleted: (data) => {
      const assistantMsg: ChatMessage = {
        id:      Date.now().toString(),
        role:    'assistant',
        content: data.chat,
      };
      setHistory(prev => [...prev, assistantMsg]);
    },
    onError: () => {
      const errorMsg: ChatMessage = {
        id:      Date.now().toString(),
        role:    'assistant',
        content: "Sorry, I'm having trouble connecting to the system right now.",
      };
      setHistory(prev => [...prev, errorMsg]);
    }
  });

  // Auto-scroll to bottom of chat
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id:      Date.now().toString(),
      role:    'user',
      content: input,
    };

    setHistory(prev => [...prev, userMsg]);
    setInput('');
    chat({ variables: { message: input } });
  };

  return (
    <div className={`chatbot-shell ${isOpen ? 'open' : 'closed'}`}>
      {!isOpen ? (
        <button className="chatbot-launcher" onClick={() => setIsOpen(true)}>
          <span className="icon">💬</span>
          <span className="badge">AI</span>
        </button>
      ) : (
        <div className="chatbot-window">
          <header className="chatbot-header">
            <div className="status-dot"></div>
            <h3>CivicBot Assistant</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)} aria-label="Close chat">×</button>
          </header>

          <div className="chatbot-history">
            {history.map((msg) => (
              <div key={msg.id} className={`message-bubble ${msg.role}`}>
                <div className="bubble-inner">
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message-bubble assistant loading">
                <div className="bubble-inner typing-dots">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
            <div ref={historyEndRef} />
          </div>

          <form className="chatbot-input" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about issues, trends, or safety..."
              disabled={loading}
              autoFocus
            />
            <button type="submit" className="send-btn" disabled={loading || !input.trim()}>
              ➤
            </button>
          </form>
        </div>
      )}

      <style>{`
        .chatbot-shell {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1000;
          font-family: inherit;
        }
        .chatbot-launcher {
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 50%;
          background: var(--color-primary);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: transform 0.2s;
        }
        .chatbot-launcher:hover { transform: scale(1.1); }
        .chatbot-launcher .icon { font-size: 1.5rem; }
        .chatbot-launcher .badge {
          position: absolute;
          top: -0.25rem;
          right: -0.25rem;
          background: var(--color-danger);
          font-size: 0.625rem;
          font-weight: 800;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
        }
        .chatbot-window {
          width: 380px;
          height: 550px;
          background: var(--color-surface);
          border: 1px solid var(--color-divider);
          border-radius: 1rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .chatbot-header {
          background: var(--color-primary);
          color: white;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-success); }
        .chatbot-header h3 { margin: 0; font-size: 0.9375rem; flex: 1; }
        .close-btn { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0; line-height: 1; opacity: 0.7; }
        .close-btn:hover { opacity: 1; }
        .chatbot-history { flex: 1; padding: 1.25rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; background: var(--color-bg); }
        .message-bubble { display: flex; max-width: 85%; }
        .message-bubble.assistant { align-self: flex-start; }
        .message-bubble.user { align-self: flex-end; }
        .bubble-inner {
          padding: 0.75rem 1rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          line-height: 1.4;
          white-space: pre-wrap;
        }
        .assistant .bubble-inner { background: var(--color-surface); color: var(--color-text-primary); border: 1px solid var(--color-divider); border-bottom-left-radius: 0.25rem; }
        .user .bubble-inner { background: var(--color-primary); color: white; border-bottom-right-radius: 0.25rem; }
        .chatbot-input { padding: 1rem; border-top: 1px solid var(--color-divider); background: var(--color-surface); display: flex; gap: 0.75rem; }
        .chatbot-input input {
          flex: 1;
          padding: 0.625rem 1rem;
          border-radius: 2rem;
          border: 1px solid var(--color-input-border);
          background: var(--color-input-fill);
          color: var(--color-text-primary);
          font-size: 0.875rem;
        }
        .chatbot-input input:focus { outline: none; border-color: var(--color-primary); }
        .send-btn { background: var(--color-primary); color: white; border: none; width: 2.25rem; height: 2.25rem; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: opacity 0.2s; }
        .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .typing-dots span { font-weight: 800; animation: typing 1.4s infinite; display: inline-block; }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @media (max-width: 500px) { .chatbot-window { width: calc(100vw - 2rem); height: 80vh; right: 1rem; } }
      `}</style>
    </div>
  );
}

export default Chatbot;
