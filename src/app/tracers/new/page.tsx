'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TracerForm from '@/app/components/TracerForm';
import type { TracerRecord } from '@/app/types/tracer';

export default function NewTracerPage() {
  const router = useRouter();
  const [saveError, setSaveError] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const handleSubmit = async (data: Omit<TracerRecord, 'id'>) => {
    setSaving(true);
    setSaveError('');

    // <- exactly like in your Edit page:
    const base =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') ||
      'http://192.168.1.236:8000';

    try {
      const res = await fetch(`${base}/api/ocr/records/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Create failed: ${res.status} ${text}`);
      }
      router.push('/tracers');
    } catch (e: any) {
      console.error(e);
      setSaveError(e.message || 'Failed to create record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="text-blue-600 hover:underline mb-4"
      >
        ← Back to list
      </button>

      <div className="bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-semibold mb-2">New Tracer Record</h1>
        <p className="text-gray-500 mb-6">Fill out the details below.</p>

        {saveError && (
          <div className="bg-red-100 text-red-700 rounded p-3 mb-4">
            {saveError}
          </div>
        )}

        <TracerForm onSubmit={handleSubmit} disabled={saving} />

        {saving && (
          <p className="text-gray-500 mt-4 italic">Saving… please wait</p>
        )}
      </div>
    </div>
  );
}
