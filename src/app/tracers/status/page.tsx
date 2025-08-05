"use client";

import { useTracers } from "@/app/hooks/useTracers";
import { TracerRecord } from "@/app/types/tracer";
import { useState } from "react";

const BARANGAY_LIST = [
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

export default function TracerStatusPage() {
  const { records, isLoading, error } = useTracers();
  const [statusFilter, setStatusFilter] = useState("all");
  const [barangayFilter, setBarangayFilter] = useState("all");
  const [ownerSearch, setOwnerSearch] = useState("");

  function lastNotice(r: TracerRecord): string {
    if (r.final) return "Final";
    if (r.third) return "3rd";
    if (r.second) return "2nd";
    if (r.first) return "1st";
    return "—";
  }

  function wasSent(r: TracerRecord): boolean {
    return !!(r.first || r.second || r.third || r.final);
  }

  function getCustomStatus(r: TracerRecord): string {
    const remarks = r.remarks?.toLowerCase() || "";
    const hasCompliant = ["complied", "compliant", "paid"].some((k) =>
      remarks.includes(k)
    );
    const hasReturned = remarks.includes("returned");

    if (!wasSent(r)) return "Not Sent";

    // ✅ Received: Must have compliant remark and at least 2nd or Final tracer
    if ((r.second || r.third || r.final) && hasCompliant) {
      return "Received";
    }

    // ⚠️ Returned but no final
    if (hasReturned && !r.final) {
      return "Received but Lacking";
    }

    return "No Response";
  }

  const filtered = records?.filter((r) => {
    const status = getCustomStatus(r);
    const matchesStatus = statusFilter === "all" || status === statusFilter;

    // ✔️ match any address containing the selected barangay (case-insensitive)
    const addr = r.address ?? "";
    const matchesBarangay =
      barangayFilter === "all" ||
      addr.toLowerCase().includes(barangayFilter.toLowerCase());

    const matchesOwner = r.owner
      ?.toLowerCase()
      .includes(ownerSearch.toLowerCase());

    return matchesStatus && matchesBarangay && matchesOwner;
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">📊 Tracer Letter Monitoring</h1>

      {/* 🔘 Status Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          "all",
          "Received",
          "Received but Lacking",
          "No Response",
          "Not Sent",
        ].map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-4 py-2 rounded ${
              statusFilter === f ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 🔍 Search and Dropdown aligned */}
      <div className="flex flex-wrap gap-4 items-end mb-4">
        {/* Owner Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Owner:
          </label>
          <input
            type="text"
            placeholder="Enter owner name..."
            value={ownerSearch}
            onChange={(e) => setOwnerSearch(e.target.value)}
            className="border rounded px-4 py-2 w-64"
          />
        </div>

        {/* Barangay Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Barangay:
          </label>
          <select
            value={barangayFilter}
            onChange={(e) => setBarangayFilter(e.target.value)}
            className="border rounded px-4 py-2 w-64"
          >
            <option value="all">All Barangays</option>
            {BARANGAY_LIST.map((bgy) => (
              <option key={bgy} value={bgy}>
                {bgy}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 📋 Table */}
      {isLoading ? (
        <p>Loading…</p>
      ) : error ? (
        <p className="text-red-500">Error loading data</p>
      ) : (
        <table className="w-full border mt-4 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Establishment</th>
              <th className="p-2 border">Owner</th>
              <th className="p-2 border">Address</th>
              <th className="p-2 border">Last Notice</th>
              <th className="p-2 border">Remarks</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered?.map((r) => {
              const status = getCustomStatus(r);
              return (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{r.no}</td>
                  <td className="p-2 border">{r.establishment}</td>
                  <td className="p-2 border">{r.owner}</td>
                  <td className="p-2 border">{r.address}</td>
                  <td className="p-2 border">{lastNotice(r)}</td>
                  <td className="p-2 border">{r.remarks}</td>
                  <td className="p-2 border font-semibold">
                    {status === "Received" && (
                      <span className="text-green-600">✅ Received</span>
                    )}
                    {status === "Received but Lacking" && (
                      <span className="text-yellow-600">
                        ⚠️ Received but Lacking
                      </span>
                    )}
                    {status === "No Response" && (
                      <span className="text-orange-500">🕒 No Response</span>
                    )}
                    {status === "Not Sent" && (
                      <span className="text-red-600">❌ Not Sent</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
