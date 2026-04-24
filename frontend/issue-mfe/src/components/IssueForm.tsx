/** frontend/issue-mfe/src/components/IssueForm.tsx
 * @file IssueForm.tsx
 * @description Multi-step form for reporting new municipal issues.
 * Integrates map location selection, photo upload, and Apollo mutations.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - GraphQL
 *   - CREATE_ISSUE_MUTATION
 * - Components
 *   - IssueForm
 * - Exports
 */

import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import PhotoUpload from './PhotoUpload';
import IssueMap from './IssueMap';

/**
 * CREATE_ISSUE_MUTATION
 * @description GraphQL mutation to submit a new issue report.
 */
const CREATE_ISSUE_MUTATION = gql`
  mutation CreateIssue($title: String!, $description: String!, $location: String!, $coordinates: [Float], $photoUrl: String) {
    createIssue(title: $title, description: $description, location: $location, coordinates: $coordinates, photoUrl: $photoUrl) {
      id
      title
      description
      location
      status
      category
    }
  }
`;

const CLASSIFY_AND_SUMMARIZE_MUTATION = gql`
  mutation ClassifyAndSummarize($issueId: ID!, $title: String!, $description: String!, $location: String!) {
    classifyAndSummarize(issueId: $issueId, title: $title, description: $description, location: $location) {
      category
      aiSummary
    }
  }
`;

/**
 * IssueForm
 * @description Renders the issue submission form and handles the creation lifecycle.
 * @returns The rendered issue form.
 */
export function IssueForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
  });
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessingAi, setIsProcessingAi] = useState(false);

  const [classifyAndSummarize] = useMutation(CLASSIFY_AND_SUMMARIZE_MUTATION, {
    context: { service: 'analytics' },
  });

  const [createIssue, { loading, error }] = useMutation(CREATE_ISSUE_MUTATION, {
    context: { service: 'issues' },
    onCompleted: async (data) => {
      const issue = data.createIssue;
      setIsProcessingAi(true);
      try {
        await classifyAndSummarize({
          variables: {
            issueId:     issue.id,
            title:       issue.title,
            description: issue.description,
            location:    issue.location,
          },
        });
      } catch (aiErr) {
        console.warn('AI classification skipped or failed:', aiErr);
      } finally {
        setIsProcessingAi(false);
      }
      setIsSuccess(true);
    },
  });

  const isSubmitting = loading || isProcessingAi;

  /**
   * toBase64
   * @description Helper to convert a File object to a Base64 string for storage/display.
   */
  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleLocationSelect = (coords: [number, number], address: string) => {
    setCoordinates(coords);
    if (!formData.location) {
      setFormData(prev => ({ ...prev, location: address }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    let photoUrl: string | undefined = undefined;

    if (photo) {
      try {
        photoUrl = await toBase64(photo);
      } catch (err) {
        console.error('Photo conversion failed:', err);
      }
    }

    createIssue({
      variables: {
        ...formData,
        coordinates,
        photoUrl,
      },
    });
  };

  if (isSuccess) {
    return (
      <div className="success-view">
        <div className="success-icon">✓</div>
        <h3>Report Submitted!</h3>
        <p>Thank you for helping improve our community. Your report is being reviewed.</p>
        <button onClick={() => setIsSuccess(false)} className="reset-btn">Report Another Issue</button>
        <style>{`
          .success-view { text-align: center; padding: 3rem; background: var(--color-surface); border-radius: 0.5rem; }
          .success-icon { font-size: 3rem; color: var(--color-success); margin-bottom: 1rem; }
          .reset-btn { margin-top: 1.5rem; padding: 0.75rem 1.5rem; background: var(--color-primary); color: white; border: none; border-radius: 0.25rem; cursor: pointer; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="issue-form-container">
      <form onSubmit={handleSubmit} className="issue-form">
        <div className="form-section">
          <label htmlFor="title">Summary of Issue</label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., Pothole on Queen Street"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-section">
          <label htmlFor="description">Details</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Describe the issue in detail..."
            disabled={isSubmitting}
          />
        </div>

        <div className="form-section">
          <label>Location</label>
          <IssueMap onLocationSelect={handleLocationSelect} />
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="Address or neighbourhood"
            className="address-input"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-section">
          <label>Photo (Optional)</label>
          <PhotoUpload onFileSelect={setPhoto} />
        </div>

        {error && <div className="error-msg">{error.message}</div>}

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
        </button>
      </form>

      <style>{`
        .issue-form-container {
          background-color: var(--color-surface);
          border: 1px solid var(--color-divider);
          border-radius: 0.5rem;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .issue-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .form-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        label {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--color-text-primary);
        }
        input, textarea {
          padding: 0.75rem;
          border-radius: 0.375rem;
          border: 1px solid var(--color-input-border);
          background-color: var(--color-input-fill);
          color: var(--color-text-primary);
          font-family: inherit;
        }
        .address-input { margin-top: 0.5rem; }
        .submit-btn {
          background-color: var(--color-primary);
          color: white;
          padding: 1rem;
          border-radius: 0.375rem;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .submit-btn:hover { opacity: 0.9; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .error-msg { color: var(--color-danger); font-size: 0.875rem; }
      `}</style>
    </div>
  );
}

export default IssueForm;
