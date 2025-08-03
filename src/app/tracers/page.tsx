"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTracers } from "../hooks/useTracers";
import TracerTable from "../components/TracerTable";
import {
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";

const BARANGAYS = [
  "Amsipit",
  "Bales",
  "Colon",
  "Daliao",
  "Kabatiol",
  "Kablacan",
  "Kamanga",
  "Kanalo",
  "Lumasal",
  "Lumatil",
  "Malbang",
  "Nomoh",
  "Pananag",
  "Poblacion",
  "Seven Hills",
  "Tinoto",
];

export default function TracerListPage() {
  const { records, isLoading, error, mutate } = useTracers();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const filtered = records?.filter((r) => {
    const matchesSearch = [r.establishment, r.owner, r.business].some((field) =>
      field?.toLowerCase().includes(search.toLowerCase())
    );
    const matchesBarangay =
      !selectedBarangay ||
      r.address?.toLowerCase().includes(selectedBarangay.toLowerCase());
    return matchesSearch && matchesBarangay;
  });

  const handleSelectAll = () => {
    if (!filtered) return;
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((r) => r.id));
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (!confirm("Are you sure you want to delete the selected records?"))
      return;
    try {
      const base =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
        "http://localhost:8000";

      for (const id of selectedIds) {
        const res = await fetch(`${base}/api/ocr/records/${id}/`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error(`Failed to delete ID ${id}`);
      }
      await mutate();
      setSelectedIds([]);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Delete failed");
    }
  };

  const handlePreview = (id: number) => {
    router.push(`/tracers/${id}/preview`);
  };

  const handleGenerate = async (id: number) => {
    try {
      const base =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
        "http://localhost:8000";
      const res = await fetch(`${base}/api/tracers/${id}/generate_report/`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to generate report");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tracer_${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error generating report");
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/tracers/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const base =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
        "http://localhost:8000";
      const res = await fetch(`${base}/api/ocr/records/${id}/`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Failed to delete (status ${res.status})`);
      await mutate();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* HEADER */}
      <div className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          TRACING MONITORING
        </h1>
        <div className="flex space-x-3">
          <Link
            href="/ocr"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Upload OCR
          </Link>
          <Link
            href="/tracers/new"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create New
          </Link>

          <Link href="/tracers/status">
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg">
              📊 Monitoring
            </button>
          </Link>
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <TrashIcon className="w-5 h-5 mr-2" />
              Delete Selected
            </button>
          )}
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 w-full md:w-1/2">
          <div className="relative flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search establishment, owner…"
              className="w-full pl-4 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
              >
                Clear
              </button>
            )}
          </div>
          <select
            value={selectedBarangay}
            onChange={(e) => setSelectedBarangay(e.target.value)}
            className="mt-2 sm:mt-0 block w-full sm:w-48 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Barangays</option>
            {BARANGAYS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LOADING & ERROR */}
      {isLoading && (
        <div className="flex items-center justify-center h-48">
          <p className="text-blue-500 animate-pulse">Loading…</p>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-4">
          <p>Error loading records</p>
        </div>
      )}

      {/* TABLE */}
      {!isLoading && !error && (
        <>
          <TracerTable
            rows={filtered || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPreview={handlePreview}
            onGenerate={handleGenerate}
            selectedIds={selectedIds}
            onSelectOne={handleSelectOne}
            onSelectAll={handleSelectAll}
          />
          {filtered && filtered.length === 0 && (
            <p className="p-4 text-gray-500 text-center">
              No records match your search.
            </p>
          )}
        </>
      )}
    </div>
  );
}
