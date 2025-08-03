// components/FileUpload.tsx
'use client';
import React, {
  useState,
  useRef,
  ChangeEvent,
  FormEvent,
  useMemo,
  DragEvent,
  MouseEvent,
} from 'react';
import { TracerRecord } from '../types/tracer';

interface FileUploadProps {
  apiUrl: string;
  onSuccess: (rows: TracerRecord[]) => void;
  onError: (message: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  apiUrl,
  onSuccess,
  onError,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const endpoint = useMemo(() => {
    const base = apiUrl.replace(/\/+$/, '');
    return `${base}/api/ocr/parse-image/`;
  }, [apiUrl]);

  const handleFile = (f: File) => {
    setFile(f);
    onError('');
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };
  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const onContainerClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      inputRef.current?.click();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      onError('Please select a file.');
      return;
    }

    setLoading(true);
    onError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'include',
      });

      if (!res.ok) {
        let msg = `Server ${res.status}`;
        const text = await res.text();
        try {
          const obj = JSON.parse(text);
          msg += obj.error ? `: ${obj.error}` : `: ${text}`;
        } catch {
          msg += `: ${text}`;
        }
        throw new Error(msg);
      }

      // Now returns TracerRecord[] with snake_cased keys!
      const data: TracerRecord[] = await res.json();
      onSuccess(data);

      // Reset
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err: any) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={onContainerClick}
          className={dragActive ? 'drop-zone active' : 'drop-zone'}
        >
          {file ? (
            <strong>{file.name}</strong>
          ) : (
            <>
              <p>Drag & drop your file here</p>
              <p>
                or{' '}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  className="browse-btn"
                >
                  browse
                </button>
              </p>
              <p className="hint">(.xlsx, .xls, image files)</p>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,image/*"
          onChange={handleChange}
          disabled={loading}
          style={{ display: 'none' }}
        />

        <button
          type="submit"
          disabled={!file || loading}
          className="upload-btn"
        >
          {loading ? 'Uploading…' : 'Upload & OCR'}
        </button>
      </form>

      <style jsx>{`
        .drop-zone {
          border: 2px dashed #888;
          border-radius: 6px;
          padding: 40px;
          text-align: center;
          background: transparent;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .drop-zone.active {
          background: #f0f0f0;
          border-color: #555;
        }
        .browse-btn {
          background: none;
          border: none;
          color: #0070f3;
          text-decoration: underline;
          cursor: pointer;
          font-size: 1em;
        }
        .hint {
          font-size: 0.8em;
          color: #666;
        }
        .upload-btn {
          margin-top: 16px;
          background: #0070f3;
          color: white;
          border: none;
          padding: 12px 24px;
          font-size: 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .upload-btn:hover {
          background: #005bb5;
        }
        .upload-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
};

export default FileUpload;
