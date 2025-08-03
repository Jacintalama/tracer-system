'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FileUpload from '../components/FileUpload';
import ParsedResults from '../components/ParsedResults';
import { TracerRecord } from '../types/tracer';

export default function OcrPage() {
  const [data, setData] = useState<TracerRecord[]>([]);
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const router = useRouter();

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');

  const normalizeKeys = (row: Record<string, any>) => {
    const fieldMap: Record<string, string> = {
      '1st': 'first',
      '2nd': 'second',
      '3rd': 'third',
      'no': 'no',
      'establishment': 'establishment',
      'owner': 'owner',
      'address': 'address',
      'business': 'business',
      'date': 'date',
      'date2': 'date2',
      'date3': 'date3',
      'datefinal': 'datefinal',
      'final': 'final',
      'remarks': 'remarks',
    };

    return Object.fromEntries(
      Object.entries(row).map(([k, v]) => [
        fieldMap[k.toLowerCase()] || k.toLowerCase(),
        v,
      ])
    );
  };

  const handleSaveAll = async () => {
    if (!data.length) return;
    setSaving(true);
    setError('');

    try {
      for (const row of data) {
        const normalized = normalizeKeys(row);
        console.log('About to POST:', normalized);

        const res = await fetch(`${API_URL}/api/ocr/records/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(normalized),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Save failed: ${res.status} ${text}`);
        }
      }

      console.log('All data posted successfully:', data);
      router.push('/tracers');
    } catch (e: any) {
      setError(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 16 }}>📤 OCR Upload</h1>

      <div style={{ marginBottom: 24 }}>
        <FileUpload
          apiUrl={API_URL}
          onSuccess={(rows: TracerRecord[]) => {
            setData(rows);
            setError('');
          }}
          onError={(msg: string) => {
            setError(msg);
            setData([]);
          }}
        />
      </div>

      {error && (
        <div
          style={{
            background: '#fee',
            color: '#900',
            padding: 12,
            borderRadius: 4,
            marginBottom: 24,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <div
        style={{
          maxHeight: 400,
          overflowY: 'auto',
          border: '1px solid #ddd',
          borderRadius: 4,
          padding: 8,
        }}
      >
        <ParsedResults rows={data} />
      </div>

      {data.length > 0 && (
        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            style={{
              background: saving ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              fontSize: 16,
              borderRadius: 4,
              cursor: saving ? 'default' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Save All to Records'}
          </button>
        </div>
      )}
    </div>
  );
}
