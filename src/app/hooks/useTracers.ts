// hooks/useTracers.ts
import useSWR from 'swr';
import type { TracerRecord } from '../types/tracer';
import { useEffect } from 'react';

// Base URL for your Django API
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') ||
  'http://192.168.1.236:8000';

/**
 * Generic fetcher for SWR that expects JSON and throws on non-2xx.
 */
async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    mode: 'cors',                        // ← allow cross-origin
    credentials: 'include',              // ← send cookies if you use auth
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    // Try to pull any error message from JSON, else use status
    let msg = `Error ${res.status}`;
    try {
      const body = await res.json();
      msg = body.error || JSON.stringify(body);
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

/**
 * Fetch all tracer records.
 */
export function useTracers() {
  const url = `${API_BASE}/api/ocr/records/`;  // full URL, trailing slash
  const { data, error, mutate } = useSWR<TracerRecord[]>(url, fetcher);
  return {
    records: data,
    isLoading: !error && !data,
    error,
    mutate,
  };
}

/**
 * Fetch a single tracer record by ID.
 */
export function useTracer(id?: number) {
  const url = id != null ? `${API_BASE}/api/ocr/records/${id}/` : null;
  const { data, error } = useSWR<TracerRecord>(url, fetcher);
    // 👉 TEMP: log whatever your API returns
  useEffect(() => {
    if (data) console.log("🔍 raw tracers:", data);
  }, [data]);
  
  return {
    record: data,
    isLoading: !error && !data,
    error,
  };
}
