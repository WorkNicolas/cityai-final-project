/** frontend/issue-mfe/src/components/PhotoUpload.tsx
 * @file PhotoUpload.tsx
 * @description Provides a photo upload widget for municipal issue reports.
 * Includes image preview and file size validation.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Types
 *   - PhotoUploadProps
 * - Components
 *   - PhotoUpload
 * - Exports
 */

import React, { useState, useRef } from 'react';

/**
 * PhotoUploadProps
 * @description Props for the PhotoUpload component.
 */
interface PhotoUploadProps {
  /** onFileSelect - Callback when a file is selected. */
  onFileSelect: (file: File | null) => void;
}

/**
 * PhotoUpload
 * @description Renders a photo selection and preview area.
 * @param {PhotoUploadProps} props - Component props.
 * @returns The rendered photo upload widget.
 */
export function PhotoUpload({ onFileSelect }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        onFileSelect(file);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      onFileSelect(null);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="photo-upload" onClick={() => fileInputRef.current?.click()}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />
      
      {preview ? (
        <div className="preview-container">
          <img src={preview} alt="Issue preview" className="image-preview" />
          <button 
            type="button" 
            className="clear-btn" 
            onClick={handleClear}
            title="Remove photo"
          >
            &times;
          </button>
        </div>
      ) : (
        <div className="upload-placeholder">
          <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <p>Click to upload a photo</p>
          <span className="upload-hint">Max size: 5MB</span>
        </div>
      )}

      <style>{`
        .photo-upload {
          width: 100%;
          min-height: 180px;
          border: 2px dashed var(--color-input-border);
          border-radius: 0.5rem;
          background-color: var(--color-input-fill);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .photo-upload:hover {
          border-color: var(--color-primary);
        }
        .upload-placeholder {
          text-align: center;
          color: var(--color-text-secondary);
        }
        .upload-icon {
          width: 2.5rem;
          height: 2.5rem;
          margin-bottom: 0.5rem;
          opacity: 0.5;
        }
        .upload-hint {
          font-size: 0.75rem;
          color: var(--color-text-disabled);
        }
        .preview-container {
          width: 100%;
          height: 180px;
          position: relative;
        }
        .image-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .clear-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          border: none;
          border-radius: 50%;
          width: 1.5rem;
          height: 1.5rem;
          line-height: 1.5rem;
          text-align: center;
          cursor: pointer;
          font-size: 1.25rem;
          padding: 0;
        }
      `}</style>
    </div>
  );
}

export default PhotoUpload;
